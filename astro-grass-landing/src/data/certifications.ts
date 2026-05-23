export interface Certification {
  id: string;
  name: string;
  description: string;
  origin: string;
}

export const certifications: Certification[] = [
  {
    id: 'iso-9001',
    name: 'ISO 9001',
    description: 'Gestión de calidad internacional',
    origin: 'Internacional',
  },
  {
    id: 'astm',
    name: 'ASTM F963-08',
    description: 'Estándar de seguridad de productos',
    origin: 'Estados Unidos',
  },
  {
    id: 'euro-en71',
    name: 'EURO EN-71',
    description: 'Norma de seguridad europea',
    origin: 'Europa',
  },
  {
    id: 'ccc',
    name: 'CCC',
    description: 'Certificación de conformidad China',
    origin: 'China',
  },
];
