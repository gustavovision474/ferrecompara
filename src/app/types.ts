export interface Product {
  id: string;
  name: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  image: string;
  status: 'available' | 'low-stock' | 'out-of-stock';
  tag?: string;
  category: string;
}

export interface UploadResultDto {
  uploadId: string;
  detectedHeaders: string[];
  suggestedMapping: { [field: string]: string };
  rowCount: number;
  requiresMappingConfirmation: boolean;
}

export interface PreviewRowNuevo {
  rowNumber: number;
  sku: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}

export interface PreviewRowExistente {
  rowNumber: number;
  nombre: string;
  productoIdExistente: number;
  yaEnInventario: boolean;
  precioNuevo: number;
  stockNuevo: number;
}

export interface PreviewRowError {
  rowNumber: number;
  motivo: string;
  rawData: { [key: string]: string };
}

export interface PreviewResumen {
  nuevosCount: number;
  existentesCount: number;
  erroresCount: number;
}

export interface PreviewResultDto {
  uploadId: string;
  totalRows: number;
  nuevos: PreviewRowNuevo[];
  existentes: PreviewRowExistente[];
  errores: PreviewRowError[];
  resumen: PreviewResumen;
}

export const MOCK_PRODUCTS: Product[] = [];

export interface CommitResultDto {
  insertedInventory: number;
  updatedInventory: number;
  createdProducts: number;
  skippedCategories: number;
  skipped: number;
  failed: number;
}
