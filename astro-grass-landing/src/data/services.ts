export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  examples: string[];
}

export const services: Service[] = [
  {
    id: 'canchas-deportivas',
    title: 'Canchas deportivas',
    description:
      'Instalación profesional de césped sintético para fútbol, fútbol sala, pádel, tenis y golf con productos certificados FIFA-grade.',
    icon: 'lucide:trophy',
    examples: ['Canchas de fútbol 11', 'Fútbol sala', 'Pádel y tenis', 'Putting de golf'],
  },
  {
    id: 'parques-juegos',
    title: 'Parques y juegos',
    description:
      'Espacios públicos y escolares con combinación de césped artificial y pisos de caucho de seguridad certificados para áreas infantiles.',
    icon: 'lucide:trees',
    examples: ['Parques municipales', 'Áreas escolares', 'Juegos infantiles', 'Pisos de caucho'],
  },
  {
    id: 'hogar-jardines',
    title: 'Hogar y jardines',
    description:
      'Transforma tu terraza, patio o área de piscina con césped sintético decorativo que luce verde todo el año, sin riego ni mantenimiento.',
    icon: 'lucide:home',
    examples: ['Terrazas y patios', 'Jardines residenciales', 'Áreas de piscina', 'Paredes verdes'],
  },
  {
    id: 'gimnasios',
    title: 'Gimnasios',
    description:
      'Pisos de caucho de alta resistencia para zonas de pesas, cardio y entrenamiento funcional. Absorción de impacto certificada.',
    icon: 'lucide:dumbbell',
    examples: ['Zona de pesas', 'Área de cardio', 'CrossFit y funcional', 'Crossfit boxes'],
  },
];
