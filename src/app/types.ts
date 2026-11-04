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

// ==========================================
// WAREHOUSE / ALMACÉN & WMS TYPES
// ==========================================

export type ToolCondition = 'new' | 'good' | 'fair' | 'damaged' | 'maintenance';

export interface Tool {
  id: number;
  name: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  barcode?: string;
  category: string;
  total_quantity: number;
  available_quantity: number;
  location_id?: number | null;
  warehouse_id?: number | null;
  warehouse_name?: string;
  location_name?: string;
  condition: ToolCondition;
  purchase_price?: number | null;
  supplier_id?: number | null;
  supplier_name?: string;
  invoice_number?: string | null;
  purchase_date?: string | null;
  notes?: string;
  image_url?: string | null;
  created_at: string;
  updated_at?: string;
  active_loans_count?: number;
}

export type LoanType = 'lent_to_others' | 'borrowed_by_me';
export type LoanStatus = 'active' | 'returned' | 'overdue';

export interface Loan {
  id: number;
  tool_id: number;
  tool_name: string;
  tool_brand?: string;
  tool_model?: string;
  tool_category?: string;
  tool_image_url?: string | null;
  contact_id: number;
  contact_name: string;
  contact_phone?: string;
  contact_role?: 'experto' | 'cliente' | 'proveedor' | 'empleado';
  contact_relationship?: string;
  loan_type: LoanType;
  quantity: number;
  loan_date: string;
  due_date?: string | null;
  returned_date?: string | null;
  status: LoanStatus;
  destination_location?: string | null; // Obra / Proyecto / Domicilio
  condition_out?: string;
  condition_in?: string;
  notes?: string;
  created_at: string;
}

export interface Location {
  id: number;
  name: string;
  type: 'storage' | 'vehicle' | 'jobsite' | 'shelf' | 'box';
  description?: string;
  warehouse_id?: number | null;
  warehouse_name?: string;
  tools_count?: number;
  total_items?: number;
  available_items?: number;
  created_at?: string;
}

export interface Contact {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  relationship?: string;
  role?: 'experto' | 'cliente' | 'proveedor' | 'empleado';
  notes?: string;
  active_lent_count?: number;
  active_borrowed_count?: number;
  total_loans_history?: number;
  created_at?: string;
}

export interface WarehouseMovement {
  id: number;
  item_name: string;
  item_type: 'tool' | 'consumable';
  action_type: 'loan_out' | 'return' | 'stock_adjust' | 'purchase_in' | 'consumption_out' | 'relocation';
  quantity: number;
  details: string;
  timestamp: string;
}

export interface Warehouse {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  address?: string | null;
  image_url?: string | null;
  notes?: string | null;
  locations_count?: number;
  tools_count?: number;
  consumables_count?: number;
  total_value?: number;
  created_at?: string;
  updated_at?: string;
}

export type ConsumableUnit = 'pz' | 'kg' | 'm' | 'l' | 'caja' | 'rollo' | 'saco' | 'par' | 'tubo' | 'gal' | 'paq';

export interface Consumable {
  id: number;
  name: string;
  category: string;
  unit: ConsumableUnit | string;
  stock_quantity: number;
  min_stock_alert: number;
  unit_cost: number;
  warehouse_id?: number | null;
  warehouse_name?: string;
  location_id?: number | null;
  location_name?: string;
  barcode?: string | null;
  image_url?: string | null;
  notes?: string | null;
  supplier?: string | null;
  invoice_number?: string | null;
  total_stock_value?: number;
  is_low_stock?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type PaymentTerms = 'contado' | 'credito_15' | 'credito_30' | 'credito_60' | 'otro';
export type PaymentStatus = 'paid' | 'pending' | 'credit';

export interface Supplier {
  id: number;
  name: string;
  tax_id?: string | null; // RUC
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  payment_terms?: PaymentTerms | string;
  notes?: string | null;
  purchases_count?: number;
  total_purchased?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Purchase {
  id: number;
  item_type: 'tool' | 'consumable';
  tool_id?: number | null;
  consumable_id?: number | null;
  item_name: string;
  warehouse_id?: number | null;
  warehouse_name?: string;
  quantity: number;
  unit_cost: number;
  subtotal_cost: number;
  tax_rate: number;
  tax_amount: number;
  total_cost: number;
  supplier_id?: number | null;
  supplier_name?: string;
  payment_status: PaymentStatus;
  invoice_number?: string | null;
  invoice_image_url?: string | null;
  purchase_date: string;
  notes?: string | null;
  created_at: string;
}

export interface Consumption {
  id: number;
  consumable_id: number;
  consumable_name: string;
  warehouse_id?: number | null;
  warehouse_name?: string;
  contact_id?: number | null;
  contact_name?: string;
  contact_role?: string;
  quantity: number;
  unit_cost: number;
  total_value: number;
  reason?: string | null; // Ej: Entrega para Obra Portoviejo Centro
  consumption_date: string;
  notes?: string | null;
  created_at: string;
}

export interface WarehouseStats {
  tools: {
    total_distinct_tools: number;
    total_units: number;
    available_units: number;
    lent_units: number;
    maintenance_tools: number;
    total_inventory_value: number;
  };
  consumables: {
    total_distinct: number;
    total_stock_value: number;
    low_stock_count: number;
  };
  loans: {
    active_loans_out: number;
    overdue_loans_out: number;
    active_loans_in: number;
    total_returned_loans: number;
  };
  urgentLoans: Loan[];
  recentMovements: WarehouseMovement[];
  categoriesSummary: { category: string; count: number; total_units: number }[];
}
