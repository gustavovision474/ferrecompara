import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo interceptar peticiones a nuestra API de C#
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  // Buscar el token en el localStorage de forma directa
  const token = findToken();

  if (token) {
    // Limpiamos el token de posibles espacios o comillas extra
    const cleanToken = token.replace(/['"]+/g, '').trim();
    
    console.log('📡 Enviando petición con Token (inicia con):', cleanToken.substring(0, 10) + '...');
    
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${cleanToken}`)
    });
    
    return next(authReq);
  }

  console.warn('⚠️ No se encontró token para:', req.url);
  return next(req);
};

function findToken(): string | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Supabase suele guardar como 'sb-[project-id]-auth-token'
      if (key && (key.includes('auth-token') || key.startsWith('sb-'))) {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            const data = JSON.parse(val);
            return data.access_token || data.token || null;
          } catch {
            // Si no es JSON, quizás es el token plano
            return val;
          }
        }
      }
    }
  } catch (e) {}
  return null;
}
