import type { APIRoute } from 'astro';

interface LeadPayload {
  nombre: string;
  telefono: string;
  email?: string;
  ciudad: string;
  tipo_proyecto: string;
  metros?: string;
  mensaje?: string;
  acepta_whatsapp: string;
  timestamp: string;
  source: string;
}

function isValidPhone(phone: string): boolean {
  return /^[0-9+\s\-() ]{7,15}$/.test(phone.trim());
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export const POST: APIRoute = async ({ request }) => {
  let data: FormData;

  try {
    data = await request.formData();
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Solicitud inválida.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Honeypot: si tiene contenido, responder exitosamente pero no procesar
  const honeypot = data.get('website')?.toString() ?? '';
  if (honeypot.length > 0) {
    return new Response(
      JSON.stringify({ success: true, message: 'Solicitud recibida.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const nombre = data.get('nombre')?.toString().trim() ?? '';
  const telefono = data.get('telefono')?.toString().trim() ?? '';
  const email = data.get('email')?.toString().trim() ?? '';
  const ciudad = data.get('ciudad')?.toString().trim() ?? '';
  const tipo_proyecto = data.get('tipo_proyecto')?.toString().trim() ?? '';
  const metros = data.get('metros')?.toString().trim() ?? '';
  const mensaje = data.get('mensaje')?.toString().trim() ?? '';
  const acepta_whatsapp = data.get('acepta_whatsapp')?.toString() ?? '';

  // Validaciones de servidor
  const errors: string[] = [];

  if (!nombre || nombre.length < 2) {
    errors.push('Nombre inválido.');
  }
  if (!telefono || !isValidPhone(telefono)) {
    errors.push('Teléfono inválido.');
  }
  if (email && !isValidEmail(email)) {
    errors.push('Email inválido.');
  }
  if (!['Quito', 'Guayaquil', 'Portoviejo', 'Otra'].includes(ciudad)) {
    errors.push('Ciudad inválida.');
  }
  if (!['Cancha deportiva', 'Parque o juegos', 'Jardín residencial', 'Gimnasio', 'Otro'].includes(tipo_proyecto)) {
    errors.push('Tipo de proyecto inválido.');
  }
  if (!acepta_whatsapp) {
    errors.push('Debes aceptar el contacto por WhatsApp.');
  }

  if (errors.length > 0) {
    return new Response(
      JSON.stringify({ success: false, message: errors.join(' ') }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const payload: LeadPayload = {
    nombre,
    telefono,
    ...(email && { email }),
    ciudad,
    tipo_proyecto,
    ...(metros && { metros }),
    ...(mensaje && { mensaje }),
    acepta_whatsapp: 'si',
    timestamp: new Date().toISOString(),
    source: 'astrograss.com.ec',
  };

  // Reenviar al webhook de n8n
  const webhookUrl = import.meta.env.N8N_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const webhookRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!webhookRes.ok) {
        console.error('n8n webhook respondió con error:', webhookRes.status);
      }
    } catch (err) {
      console.error('Error al contactar n8n webhook:', err);
      // No fallamos el endpoint si el webhook falla — el lead ya fue validado
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: '¡Cotización recibida! Te contactaremos en menos de 4 horas.',
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
