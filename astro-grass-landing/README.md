# Astro Grass Landing Page

Landing page de alta conversión para **Astro Grass**, la marca de césped artificial sintético y pisos de caucho de **Astro Global Corp** (Ecuador).

Diseñada para generar leads calificados vía formulario + WhatsApp, segmentados por ciudad (Quito, Guayaquil, Portoviejo) y tipo de proyecto.

## Stack

- **[Astro 5](https://astro.build/)** — SSG, cero JS por defecto
- **[Tailwind CSS v4](https://tailwindcss.com/)** — via `@tailwindcss/vite`
- **[astro-icon](https://github.com/natemoo-re/astro-icon)** + Lucide — iconografía
- **[Bricolage Grotesque + Inter](https://fontsource.org/)** — tipografía vía fontsource (zero requests externos)
- **[class-variance-authority](https://cva.style/)** + `clsx` + `tailwind-merge` — utilidades CSS
- **Sharp** — optimización de imágenes

## Requisitos previos

- Node.js 18+
- pnpm 9+

## Levantar en local

```bash
cp .env.example .env
# Edita .env con tus valores reales

pnpm install
pnpm dev
```

El servidor de desarrollo corre en `http://localhost:4321`.

## Variables de entorno

| Variable | Descripción | Requerida |
|---|---|---|
| `PUBLIC_GA_ID` | ID de Google Analytics 4 (ej. `G-XXXXXXXXXX`) | No |
| `PUBLIC_META_PIXEL_ID` | ID del Meta Pixel | No |
| `N8N_WEBHOOK_URL` | URL del webhook n8n para recibir leads | Recomendada |
| `PUBLIC_WHATSAPP_PORTOVIEJO` | Número WA sede Portoviejo (formato internacional, sin `+`) | Sí |
| `PUBLIC_WHATSAPP_GUAYAQUIL` | Número WA sede Guayaquil | Sí |
| `PUBLIC_WHATSAPP_QUITO` | Número WA sede Quito | Sí |

## Build de producción

```bash
pnpm build
pnpm preview   # previsualización local del build
```

Los archivos estáticos quedan en `dist/`.

## Deploy

### Vercel

```bash
# Instalar adapter (opcional, para SSR futuro)
pnpm add @astrojs/vercel

# O deploy directo desde CLI
npx vercel --prod
```

Descomenta el adapter en `astro.config.mjs` si necesitas funciones serverless (SSR).

### Netlify

```bash
pnpm add @astrojs/netlify
npx netlify deploy --prod --dir=dist
```

## Estructura del proyecto

```
src/
├── layouts/
│   └── BaseLayout.astro       # SEO meta, fuentes, GA, Meta Pixel
├── components/
│   ├── ui/                    # Componentes base (Button, Card, Badge, etc.)
│   ├── sections/              # Secciones de la landing (13 secciones)
│   └── shared/                # SchemaOrg JSON-LD + Analytics
├── data/                      # Datos del negocio (productos, FAQs, sucursales)
├── lib/                       # Utilidades (cn, whatsapp URL builder)
├── pages/
│   ├── index.astro            # La landing completa
│   └── api/lead.ts            # Endpoint POST para formulario → n8n
└── styles/
    └── global.css             # Tailwind + fuentes + custom
```

## Secciones implementadas

1. **Navbar** — sticky con backdrop blur, menú hamburguesa en mobile
2. **Hero** — H1, 2 CTAs (WhatsApp + scroll), trust signals, stat flotante
3. **TrustBar** — certificaciones ISO 9001, ASTM, EURO EN-71, CCC
4. **Services** — 4 servicios con iconos y ejemplos
5. **Products** — 7 modelos de césped con specs, colores y CTA por modelo
6. **Benefits** — 8 ventajas del césped artificial en grid
7. **Process** — 4 pasos de instalación con línea conectora
8. **Gallery** — 6 proyectos realizados en grid asimétrico
9. **Locations** — 3 sucursales con mapa, dirección y WhatsApp directo
10. **FAQ** — 7 preguntas frecuentes en acordeón nativo `<details>`
11. **LeadForm** — formulario con validación, honeypot, estados y WA fallback
12. **Footer** — 3 columnas con redes sociales, links y contacto
13. **WhatsappFloat** — botón flotante fixed con animación de pulso

## Roadmap de mejoras opcionales

- **CMS headless** (Sanity, Storyblok) para gestionar productos y galería sin deploy
- **Multi-idioma** — añadir `astro-i18n` para versión en inglés
- **Galería real** — reemplazar placeholders con fotos reales de proyectos
- **Chat en vivo** — integrar Tawk.to o Crisp como alternativa al WhatsApp float
- **A/B testing** — GrowthBook o PostHog para optimizar CTAs
- **Blog** — ampliar con contenido SEO sobre instalación y mantenimiento
- **Panel de analytics** — conectar n8n a un dashboard de leads (Notion, Airtable)

## Contacto del cliente

- **Email:** astrograssec@hotmail.com
- **Instagram:** @astroglobalcorp
- **Facebook:** facebook.com/AstroGrassEc
