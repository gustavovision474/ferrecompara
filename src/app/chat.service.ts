import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  contenido: string;
  leido: boolean;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  tienda_id: number;
  cliente_id: string;
  updated_at: string;
  // Relaciones cargadas para mostrar en UI
  cliente?: { nombre_completo?: string; avatar_url?: string };
  tienda?: { nombre?: string; imagen_portada_url?: string };
  ultimo_mensaje?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private supabase = inject(SupabaseService);
  private auth = inject(AuthService);

  // Estado global del chat actual
  activeChatId = signal<string | null>(null);
  messages = signal<ChatMessage[]>([]);
  conversations = signal<ChatConversation[]>([]);
  loading = signal(false);

  private realtimeSubscription: any = null;
  private storeInboxSubscription: any = null;

  // ==========================================
  // PARA CLIENTES: Iniciar o recuperar chat con una tienda
  // ==========================================
  async getOrCreateChatForClient(tiendaId: number): Promise<string | null> {
    const clienteId = this.auth.profile()?.id;
    if (!clienteId) return null;

    const client = this.supabase['supabaseClient'];

    // 1. Buscar si ya existe el chat
    let { data: chat, error } = await client
      .from('chats')
      .select('id')
      .eq('tienda_id', tiendaId)
      .eq('cliente_id', clienteId)
      .maybeSingle();

    if (error) {
      console.error('Error buscando chat:', error);
      return null;
    }

    // 2. Si no existe, crearlo
    if (!chat) {
      const { data: newChat, error: createError } = await client
        .from('chats')
        .insert({ tienda_id: tiendaId, cliente_id: clienteId })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creando chat:', createError);
        return null;
      }
      chat = newChat;
    }

    return chat?.id || null;
  }

  // ==========================================
  // CARGAR MENSAJES Y SUSCRIBIRSE EN TIEMPO REAL
  // ==========================================
  async loadMessagesAndSubscribe(chatId: string) {
    this.loading.set(true);
    this.activeChatId.set(chatId);
    const client = this.supabase['supabaseClient'];

    try {
      // 1. Cargar historial
      const { data, error } = await client
        .from('mensajes')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      this.messages.set(data || []);

      // 2. Desuscribirse de canales anteriores si existen
      if (this.realtimeSubscription) {
        client.removeChannel(this.realtimeSubscription);
      }

      // 3. Suscribirse a nuevos mensajes de este chat específico
      this.realtimeSubscription = client
        .channel(`chat_${chatId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'mensajes',
            filter: `chat_id=eq.${chatId}`
          },
          (payload: any) => {
            console.log('📬 Nuevo mensaje recibido en realtime:', payload.new);
            const newMsg = payload.new as ChatMessage;
            // Solo añadir si no existe ya en la memoria local (evita duplicar el propio mensaje enviado)
            this.messages.update(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        )
        .subscribe();

    } catch (e) {
      console.error('Error cargando mensajes:', e);
    } finally {
      this.loading.set(false);
    }
  }

  // ==========================================
  // ENVIAR MENSAJE
  // ==========================================
  async sendMessage(chatId: string, contenido: string) {
    const senderId = this.auth.profile()?.id;
    if (!senderId || !contenido.trim()) return;

    const client = this.supabase['supabaseClient'];

    // Insertamos y pedimos de vuelta la fila completa para actualización instantánea garantizada
    const { data: newMsg, error } = await client
      .from('mensajes')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        contenido: contenido.trim()
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error enviando mensaje:', error);
      return;
    }

    if (newMsg) {
      // Reflejar localmente al instante (evitando duplicados si llega también por realtime)
      this.messages.update(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg as ChatMessage];
      });

      // Refrescar en silencio el último mensaje en la lista de conversaciones
      const p = this.auth.profile();
      if (p && p.tienda_id) {
        this.reloadConversationsQuietly(p.tienda_id);
      }
    }
  }

  // ==========================================
  // PARA TIENDAS: Cargar todas las conversaciones activas y escuchar nuevos en vivo
  // ==========================================
  async loadStoreConversations(tiendaId: number) {
    const client = this.supabase['supabaseClient'];
    
    // 1. Cargar historial actual
    await this.reloadConversationsQuietly(tiendaId);

    // 2. Suscribirse de forma mágica y espontánea a cualquier nuevo mensaje entrante en el sistema
    if (!this.storeInboxSubscription) {
      this.storeInboxSubscription = client
        .channel('store_inbox_global')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'mensajes' },
          () => {
            console.log('🔄 ¡Mensaje detectado en vivo! Refrescando bandeja de entrada...');
            this.reloadConversationsQuietly(tiendaId);
          }
        )
        .subscribe();
    }
  }

  // Recarga silenciosa sin parpadeos visuales
  private async reloadConversationsQuietly(tiendaId: number) {
    const client = this.supabase['supabaseClient'];
    
    const { data, error } = await client
      .from('chats')
      .select(`
        id, 
        tienda_id, 
        cliente_id, 
        updated_at,
        mensajes ( contenido, created_at )
      `)
      .eq('tienda_id', tiendaId)
      .order('updated_at', { ascending: false });

    if (error || !data) return;

    const convs: ChatConversation[] = [];
    for (const item of data) {
      const { data: profile } = await client
        .from('profiles')
        .select('nombre_completo, avatar_url')
        .eq('id', item.cliente_id)
        .maybeSingle();

      const msgs = item.mensajes || [];
      const ultimo = msgs.length > 0 
        ? msgs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.contenido 
        : 'Sin mensajes aún';

      convs.push({
        id: item.id,
        tienda_id: item.tienda_id,
        cliente_id: item.cliente_id,
        updated_at: item.updated_at,
        cliente: profile || { nombre_completo: 'Cliente Anónimo' },
        ultimo_mensaje: ultimo
      });
    }

    this.conversations.set(convs);
  }

  // Limpieza al cerrar chat
  closeChat() {
    this.activeChatId.set(null);
    this.messages.set([]);
    if (this.realtimeSubscription) {
      const client = this.supabase['supabaseClient'];
      client.removeChannel(this.realtimeSubscription);
      this.realtimeSubscription = null;
    }
  }
}
