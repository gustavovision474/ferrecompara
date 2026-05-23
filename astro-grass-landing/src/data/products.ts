export interface Product {
  id: string;
  name: string;
  colors: string[];
  dimensions: string;
  stitches: string;
  category: 'deportivo' | 'decorativo';
  description: string;
  features?: string[];
}

export const products: Product[] = [
  {
    id: 'ts-eco',
    name: 'TS ECO',
    colors: ['Verde Oliva', 'Verde Lima'],
    dimensions: 'Ancho 2 y 4 m, largo 25 m, pile 50 mm',
    stitches: '13 cosidas / 10 cm',
    category: 'deportivo',
    description: 'Césped deportivo de entrada ideal para canchas de uso moderado. Excelente relación precio-durabilidad.',
    features: ['Pile 50 mm', 'Uso deportivo', 'Resistente al tránsito'],
  },
  {
    id: 'recovery',
    name: 'RECOVERY',
    colors: ['Verde Oliva', 'Verde Lima'],
    dimensions: 'Ancho 2 y 4 m, largo 25 m, pile 50 mm',
    stitches: '13 cosidas / 10 cm',
    category: 'deportivo',
    description: 'Diseñado para recuperar rápidamente su forma original después del uso intensivo en canchas deportivas.',
    features: ['Pile 50 mm', 'Alta recuperación', 'Uso intensivo'],
  },
  {
    id: 'recovery-blue',
    name: 'RECOVERY BLUE',
    colors: ['Azul Claro', 'Azul Oscuro'],
    dimensions: 'Ancho 2 y 4 m, largo 40 m, pile 50 mm',
    stitches: '12 cosidas / 10 cm',
    category: 'deportivo',
    description: 'Versión en tonos azules para canchas que requieren diferenciación visual. Ideal para pádel y tenis.',
    features: ['Pile 50 mm', 'Colores especiales', 'Mayor longitud por rollo'],
  },
  {
    id: 'low-eco-soccer',
    name: 'LOW ECO SOCCER',
    colors: ['Verde estándar'],
    dimensions: 'Pile height 50 mm, Dtex 8800, Gauge 5/8"',
    stitches: '165 stitches rate',
    category: 'deportivo',
    description: 'Solución económica para fútbol con especificaciones técnicas FIFA-grade. Máximo rendimiento al mejor precio.',
    features: ['Dtex 8800', 'Gauge 5/8"', 'Estándar FIFA', 'Económico'],
  },
  {
    id: 'soccer-amarillo',
    name: 'SOCCER AMARILLO',
    colors: ['Amarillo', 'Blanco'],
    dimensions: 'Ancho 2 m, largo 25 m, pile 50 mm',
    stitches: '14 cosidas / 10 cm',
    category: 'deportivo',
    description: 'Césped en colores amarillo y blanco para líneas decorativas, zonas de portería o canchas temáticas.',
    features: ['Pile 50 mm', 'Colores distintivos', 'Alta densidad'],
  },
  {
    id: 'padel-tenis-golf',
    name: 'PÁDEL / TENIS / GOLF',
    colors: ['Varios colores disponibles'],
    dimensions: 'Ancho 2 y 4 m, largo 10 y 20 m',
    stitches: '30 cosidas / 10 cm (el más denso)',
    category: 'deportivo',
    description: 'El modelo más denso del catálogo. Específicamente diseñado para pádel, tenis y putting de golf. Máxima precisión de juego.',
    features: ['30 cosidas/10cm', 'Mayor densidad', 'Múltiples deportes', 'Precisión profesional'],
  },
  {
    id: 'nature-d3',
    name: 'NATURE D3',
    colors: ['Verde Oliva', 'Verde Lima'],
    dimensions: 'Ancho 2 y 4 m, largo 40 m, pile 50 mm',
    stitches: '14 cosidas / 10 cm DTEX',
    category: 'decorativo',
    description: 'El césped decorativo más natural del catálogo. Textura y apariencia idénticas al césped real. Ideal para jardines, terrazas y áreas residenciales.',
    features: ['Pile 50 mm', 'Apariencia ultra-natural', 'Mayor longitud por rollo', 'DTEX premium'],
  },
];
