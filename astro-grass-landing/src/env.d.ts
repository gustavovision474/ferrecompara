/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_GA_ID: string;
  readonly PUBLIC_META_PIXEL_ID: string;
  readonly N8N_WEBHOOK_URL: string;
  readonly PUBLIC_WHATSAPP_PORTOVIEJO: string;
  readonly PUBLIC_WHATSAPP_GUAYAQUIL: string;
  readonly PUBLIC_WHATSAPP_QUITO: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
