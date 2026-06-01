import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import './index.css';

// Limpiar hash de error de la URL antes de que cargue Supabase GoTrue
if (window.location.hash && window.location.hash.includes('error=')) {
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    alert('Bootstrap Error: ' + err.message);
    console.error(err);
  });
