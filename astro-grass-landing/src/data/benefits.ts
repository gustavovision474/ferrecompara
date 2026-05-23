export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const benefits: Benefit[] = [
  {
    id: 'ahorro',
    title: 'Ahorro real',
    description: 'Sin fertilizantes, sin pesticidas, sin cortacésped. El costo de mantenimiento anual es prácticamente cero.',
    icon: 'lucide:piggy-bank',
  },
  {
    id: 'bajo-mantenimiento',
    title: 'Mínimo mantenimiento',
    description: 'No requiere riego diario. Un manguerazo ocasional y un rastrillo para hojas es todo lo que necesita.',
    icon: 'lucide:wrench',
  },
  {
    id: 'resistencia',
    title: 'Alta resistencia',
    description: 'Soporta el uso intensivo, el tránsito constante y las condiciones climáticas extremas sin desgastarse.',
    icon: 'lucide:shield-check',
  },
  {
    id: 'apariencia-natural',
    title: 'Apariencia natural',
    description: 'Las fibras de última generación imitan el césped real con textura y color que engañan a la vista.',
    icon: 'lucide:leaf',
  },
  {
    id: 'salud',
    title: 'Seguro y saludable',
    description: 'No irrita la piel, no produce alergias y cuenta con protección UV anti-decoloración certificada.',
    icon: 'lucide:heart',
  },
  {
    id: 'eco-friendly',
    title: 'Eco-friendly',
    description: 'Sin cortacésped significa cero ruido y cero consumo de combustible. Reduce la huella de carbono de tu espacio.',
    icon: 'lucide:sprout',
  },
  {
    id: 'mascotas',
    title: 'Apto para mascotas',
    description: 'Resistente a tirones y a la orina. Se limpia fácilmente con agua. Tus mascotas lo disfrutarán tanto como tú.',
    icon: 'lucide:paw-print',
  },
  {
    id: 'estetica',
    title: 'Verde todo el año',
    description: 'Sin maleza, sin zonas secas, sin temporadas malas. Siempre verde, siempre perfecto, sin importar la estación.',
    icon: 'lucide:sun',
  },
];
