export type WhatsAppCity = 'portoviejo' | 'guayaquil' | 'quito';

const NUMBERS: Record<WhatsAppCity, string> = {
  portoviejo: import.meta.env.PUBLIC_WHATSAPP_PORTOVIEJO ?? '593969643366',
  guayaquil: import.meta.env.PUBLIC_WHATSAPP_GUAYAQUIL ?? '593992327666',
  quito: import.meta.env.PUBLIC_WHATSAPP_QUITO ?? '593959162891',
};

export function buildWhatsAppUrl(
  city: WhatsAppCity = 'portoviejo',
  message: string = 'Hola, me interesa información sobre el césped artificial de Astro Grass. ¿Pueden asesorarme?'
): string {
  const number = NUMBERS[city];
  const encoded = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${number}&text=${encoded}`;
}

export function buildProductWhatsAppUrl(productName: string, city: WhatsAppCity = 'portoviejo'): string {
  const message = `Hola, me interesa cotizar el modelo *${productName}* de Astro Grass. ¿Pueden enviarme información y precio por m²?`;
  return buildWhatsAppUrl(city, message);
}

export function buildFormWhatsAppUrl(
  name: string,
  city: string,
  projectType: string,
  sqm?: string
): string {
  const whatsappCity = city.toLowerCase().includes('quito')
    ? 'quito'
    : city.toLowerCase().includes('guayaquil')
    ? 'guayaquil'
    : 'portoviejo';

  const sqmText = sqm ? ` Área aproximada: *${sqm} m²*.` : '';
  const message = `Hola, soy *${name}* y acabo de enviar una solicitud de cotización desde astrograss.com.ec.\n\nCiudad: *${city}*\nTipo de proyecto: *${projectType}*${sqmText}\n\n¿Podrían contactarme para continuar con la cotización?`;
  return buildWhatsAppUrl(whatsappCity, message);
}
