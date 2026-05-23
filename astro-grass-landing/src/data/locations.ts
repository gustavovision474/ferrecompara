export interface Location {
  id: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  mapUrl: string;
  lat: number;
  lng: number;
}

export const locations: Location[] = [
  {
    id: 'portoviejo',
    city: 'Portoviejo',
    address: 'Av. Reales Tamarindos, interior del Complejo Fútbol Aventura',
    phone: '+593 96 964 3366',
    whatsapp: '593969643366',
    mapUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.647!2d-80.454!3d-1.054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMDMnMTQuNCJTIDgwwrAyNycxNC40Ilc!5e0!3m2!1ses!2sec!4v1000000000000!5m2!1ses!2sec',
    lat: -1.054,
    lng: -80.454,
  },
  {
    id: 'guayaquil',
    city: 'Guayaquil',
    address:
      'Av. Francisco de Orellana, Cdla. Los Vergeles, pasando CC Mall del Norte, al lado del Hotel NP Parque Samanes',
    phone: '+593 99 232 7666',
    whatsapp: '593992327666',
    mapUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.647!2d-79.888!3d-2.157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMsKwMDknMjIuNiJTIDc5wrA1MycxNi44Ilc!5e0!3m2!1ses!2sec!4v1000000000001!5m2!1ses!2sec',
    lat: -2.157,
    lng: -79.888,
  },
  {
    id: 'quito',
    city: 'Quito',
    address:
      'Autopista General Rumiñahui, Sector La Armenia (Puente #8), Calle Lola Quintana y Alfredo Gangotena, junto a Ferretería Ferrearmenia',
    phone: '+593 95 916 2891',
    whatsapp: '593959162891',
    mapUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.647!2d-78.484!3d-0.312!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMTgnNDkuMiJTIDc4wrAyOScwMi40Ilc!5e0!3m2!1ses!2sec!4v1000000000002!5m2!1ses!2sec',
    lat: -0.312,
    lng: -78.484,
  },
];
