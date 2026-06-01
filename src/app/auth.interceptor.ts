import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environments/environment';
import { SupabaseService } from './supabase.service';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo interceptar peticiones a nuestra API de C#
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const supabaseService = inject(SupabaseService);
  const client = supabaseService.getClient();

  // Obtener la sesión activa de Supabase. getSession() refresca el token automáticamente si ha expirado
  return from(client.auth.getSession()).pipe(
    switchMap(({ data: { session } }) => {
      const token = session?.access_token;

      if (token) {
        const cleanToken = token.replace(/['"]+/g, '').trim();
        
        console.log('📡 Enviando petición con Token Fresco (inicia con):', cleanToken.substring(0, 10) + '...');
        
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${cleanToken}`)
        });
        
        return next(authReq);
      }

      console.warn('⚠️ No se encontró token activo en la sesión para:', req.url);
      return next(req);
    })
  );
};
