export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export const faqs: FAQ[] = [
  {
    id: 'tipo-suelo',
    question: '¿Qué tipo de suelo se requiere para instalar el césped artificial?',
    answer:
      'No es necesario hormigón. Una buena base de tierra compactada es óptima para la instalación. Nuestro equipo técnico evalúa las condiciones de cada proyecto en la visita previa.',
  },
  {
    id: 'mejor-base',
    question: '¿Cuál es la mejor base para el césped sintético?',
    answer:
      'Grava y arena bien compactada funciona perfectamente, sin necesidad de hormigón. Esta base permite un excelente drenaje del agua y garantiza la durabilidad de la instalación.',
  },
  {
    id: 'mantenimiento',
    question: '¿Qué mantenimiento necesita el césped artificial?',
    answer:
      'Prácticamente nulo. Un manguerazo ocasional para limpiarlo y un rastrillo para retirar las hojas caídas es todo lo que necesitas. Sin riego, sin fertilizantes, sin cortacésped.',
  },
  {
    id: 'mascotas',
    question: '¿Es seguro para mascotas?',
    answer:
      'Sí, completamente. La orina se limpia fácilmente con agua. Los sólidos se recogen igual que en la calle. El césped no se daña con los tirones ni con el juego intenso de las mascotas.',
  },
  {
    id: 'cesped-natural',
    question: 'Tengo césped natural, ¿qué debo hacer antes de instalar el sintético?',
    answer:
      'El proceso es sencillo: aplicar herbicida sobre el césped existente, esperar una semana a que muera completamente, retirarlo, nivelar bien el suelo, y sobre esa base instalar el sintético. Nuestro equipo lo gestiona todo.',
  },
  {
    id: 'costo-m2',
    question: '¿Cuánto cuesta el césped artificial por metro cuadrado?',
    answer:
      'El precio oscila entre $9 y $15 USD por m², dependiendo del modelo seleccionado y el lugar de instalación. Para proyectos grandes obtienes mejor precio por volumen. Contáctanos para una cotización personalizada sin compromiso.',
  },
  {
    id: 'duracion',
    question: '¿Cuánto tiempo dura el césped artificial?',
    answer:
      'Ofrecemos 5 años de garantía por defecto de fábrica y 1 año de garantía técnica de instalación. Con mantenimiento adecuado, el césped fácilmente supera los 10 años de vida útil conservando su aspecto y funcionalidad.',
  },
];
