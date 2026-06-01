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



export interface CommitResultDto {
  insertedInventory: number;
  updatedInventory: number;
  createdProducts: number;
  skippedCategories: number;
  skipped: number;
  failed: number;
}

export interface UploadResultDto {
  rowCount: number;
  suggestedMapping: Record<string, string>;
  uploadId?: any;
}

export interface PreviewResultDto {
  totalRows: number;
  resumen: {
    nuevosCount: number;
    existentesCount: number;
    erroresCount: number;
  };
  nuevos: any[];
  existentes: any[];
  errores: any[];
}

