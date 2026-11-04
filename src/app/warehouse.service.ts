import { Injectable, signal, computed } from '@angular/core';
import {
  Tool,
  Consumable,
  Loan,
  Warehouse,
  Location,
  Supplier,
  Purchase,
  Consumption,
  Contact,
  WarehouseMovement,
  WarehouseStats,
  ToolCondition,
  LoanStatus
} from './types';

const STORAGE_KEY = 'ferrecompara_warehouse_v2';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  // Signals principales de datos
  tools = signal<Tool[]>([]);
  consumables = signal<Consumable[]>([]);
  loans = signal<Loan[]>([]);
  warehouses = signal<Warehouse[]>([]);
  locations = signal<Location[]>([]);
  suppliers = signal<Supplier[]>([]);
  purchases = signal<Purchase[]>([]);
  consumptions = signal<Consumption[]>([]);
  contacts = signal<Contact[]>([]);
  movements = signal<WarehouseMovement[]>([]);

  // Estadísticas calculadas reactivamente
  stats = computed<WarehouseStats>(() => {
    const toolList = this.tools();
    const consumableList = this.consumables();
    const loanList = this.loans();

    const totalDistinctTools = toolList.length;
    const totalUnits = toolList.reduce((acc, t) => acc + (t.total_quantity || 0), 0);
    const availableUnits = toolList.reduce((acc, t) => acc + (t.available_quantity || 0), 0);
    const lentUnits = toolList.reduce((acc, t) => acc + (t.active_loans_count || (t.total_quantity - t.available_quantity) || 0), 0);
    const maintenanceTools = toolList.filter(t => t.condition === 'maintenance' || t.condition === 'damaged').length;
    const totalInventoryValue = toolList.reduce((acc, t) => acc + ((t.purchase_price || 0) * (t.total_quantity || 1)), 0);

    const totalConsumableStockValue = consumableList.reduce((acc, c) => acc + ((c.unit_cost || 0) * (c.stock_quantity || 0)), 0);
    const lowStockCount = consumableList.filter(c => c.stock_quantity <= c.min_stock_alert).length;

    const activeLoansOut = loanList.filter(l => l.loan_type === 'lent_to_others' && l.status === 'active').length;
    const overdueLoansOut = loanList.filter(l => l.loan_type === 'lent_to_others' && l.status === 'overdue').length;
    const activeLoansIn = loanList.filter(l => l.loan_type === 'borrowed_by_me' && (l.status === 'active' || l.status === 'overdue')).length;
    const totalReturnedLoans = loanList.filter(l => l.status === 'returned').length;

    // Préstamos urgentes (vencidos o por vencer hoy)
    const urgentLoans = loanList.filter(l => l.status === 'overdue' || (l.status === 'active' && l.due_date && new Date(l.due_date) <= new Date()));

    // Resumen por categorías de herramientas
    const catMap = new Map<string, { count: number; total_units: number }>();
    toolList.forEach(t => {
      const cat = t.category || 'Varios';
      const curr = catMap.get(cat) || { count: 0, total_units: 0 };
      catMap.set(cat, { count: curr.count + 1, total_units: curr.total_units + t.total_quantity });
    });
    const categoriesSummary = Array.from(catMap.entries()).map(([category, val]) => ({
      category,
      count: val.count,
      total_units: val.total_units
    }));

    return {
      tools: {
        total_distinct_tools: totalDistinctTools,
        total_units: totalUnits,
        available_units: availableUnits,
        lent_units: lentUnits,
        maintenance_tools: maintenanceTools,
        total_inventory_value: totalInventoryValue
      },
      consumables: {
        total_distinct: consumableList.length,
        total_stock_value: totalConsumableStockValue,
        low_stock_count: lowStockCount
      },
      loans: {
        active_loans_out: activeLoansOut,
        overdue_loans_out: overdueLoansOut,
        active_loans_in: activeLoansIn,
        total_returned_loans: totalReturnedLoans
      },
      urgentLoans,
      recentMovements: this.movements().slice(0, 10),
      categoriesSummary
    };
  });

  constructor() {
    this.initData();
  }

  private initData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.tools && parsed.tools.length > 0) {
          this.tools.set(parsed.tools);
          this.consumables.set(parsed.consumables || []);
          this.loans.set(parsed.loans || []);
          this.warehouses.set(parsed.warehouses || []);
          this.locations.set(parsed.locations || []);
          this.suppliers.set(parsed.suppliers || []);
          this.purchases.set(parsed.purchases || []);
          this.consumptions.set(parsed.consumptions || []);
          this.contacts.set(parsed.contacts || []);
          this.movements.set(parsed.movements || []);
          return;
        }
      }
    } catch (e) {
      console.warn('Error leyendo almacén de localStorage, usando defaults', e);
    }

    this.cargarDatosDemo();
  }

  private persist() {
    try {
      const payload = {
        tools: this.tools(),
        consumables: this.consumables(),
        loans: this.loans(),
        warehouses: this.warehouses(),
        locations: this.locations(),
        suppliers: this.suppliers(),
        purchases: this.purchases(),
        consumptions: this.consumptions(),
        contacts: this.contacts(),
        movements: this.movements()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Error guardando en localStorage', e);
    }
  }

  // ==========================================
  // OPERACIONES: HERRAMIENTAS
  // ==========================================
  addTool(toolData: Partial<Tool>): Tool {
    const id = Date.now();
    const newTool: Tool = {
      id,
      name: toolData.name || 'Nueva Herramienta',
      brand: toolData.brand || '',
      model: toolData.model || '',
      serial_number: toolData.serial_number || `SN-${id.toString().slice(-6)}`,
      barcode: toolData.barcode || `786${Math.floor(100000000 + Math.random() * 900000000)}`,
      category: toolData.category || 'Herramientas Eléctricas',
      total_quantity: Number(toolData.total_quantity) || 1,
      available_quantity: Number(toolData.available_quantity ?? toolData.total_quantity) || 1,
      location_id: toolData.location_id || null,
      warehouse_id: toolData.warehouse_id || 1,
      warehouse_name: toolData.warehouse_name || this.getWarehouseName(toolData.warehouse_id || 1),
      location_name: toolData.location_name || this.getLocationName(toolData.location_id),
      condition: (toolData.condition as ToolCondition) || 'good',
      purchase_price: Number(toolData.purchase_price) || 0,
      supplier_name: toolData.supplier_name || 'Proveedor General',
      invoice_number: toolData.invoice_number || null,
      purchase_date: toolData.purchase_date || new Date().toISOString().split('T')[0],
      notes: toolData.notes || '',
      image_url: toolData.image_url || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80',
      created_at: new Date().toISOString(),
      active_loans_count: 0
    };

    this.tools.update(list => [newTool, ...list]);
    this.addMovement({
      item_name: newTool.name,
      item_type: 'tool',
      action_type: 'purchase_in',
      quantity: newTool.total_quantity,
      details: `Herramienta registrada en ${newTool.warehouse_name}`
    });
    this.persist();
    return newTool;
  }

  updateTool(id: number, updates: Partial<Tool>) {
    this.tools.update(list => list.map(t => {
      if (t.id === id) {
        return {
          ...t,
          ...updates,
          warehouse_name: updates.warehouse_id ? this.getWarehouseName(updates.warehouse_id) : t.warehouse_name,
          location_name: updates.location_id ? this.getLocationName(updates.location_id) : t.location_name,
          updated_at: new Date().toISOString()
        };
      }
      return t;
    }));
    this.persist();
  }

  deleteTool(id: number) {
    const tool = this.tools().find(t => t.id === id);
    if (!tool) return;
    this.tools.update(list => list.filter(t => t.id !== id));
    this.addMovement({
      item_name: tool.name,
      item_type: 'tool',
      action_type: 'stock_adjust',
      quantity: tool.total_quantity,
      details: `Herramienta eliminada del almacén`
    });
    this.persist();
  }

  adjustToolStock(id: number, delta: number, reason: string = 'Ajuste de inventario') {
    this.tools.update(list => list.map(t => {
      if (t.id === id) {
        const newTotal = Math.max(0, t.total_quantity + delta);
        const newAvail = Math.max(0, t.available_quantity + delta);
        return { ...t, total_quantity: newTotal, available_quantity: newAvail };
      }
      return t;
    }));
    const tool = this.tools().find(t => t.id === id);
    if (tool) {
      this.addMovement({
        item_name: tool.name,
        item_type: 'tool',
        action_type: 'stock_adjust',
        quantity: Math.abs(delta),
        details: `${delta > 0 ? 'Entrada' : 'Salida'} por ajuste: ${reason}`
      });
    }
    this.persist();
  }

  // ==========================================
  // OPERACIONES: CONSUMIBLES & MATERIALES
  // ==========================================
  addConsumable(data: Partial<Consumable>): Consumable {
    const id = Date.now();
    const newConsumable: Consumable = {
      id,
      name: data.name || 'Nuevo Material',
      category: data.category || 'Materiales Básicos',
      unit: data.unit || 'saco',
      stock_quantity: Number(data.stock_quantity) || 0,
      min_stock_alert: Number(data.min_stock_alert) || 10,
      unit_cost: Number(data.unit_cost) || 0,
      warehouse_id: data.warehouse_id || 2,
      warehouse_name: data.warehouse_name || this.getWarehouseName(data.warehouse_id || 2),
      location_id: data.location_id || null,
      location_name: data.location_name || this.getLocationName(data.location_id),
      barcode: data.barcode || `786${Math.floor(100000000 + Math.random() * 900000000)}`,
      image_url: data.image_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=400&q=80',
      notes: data.notes || '',
      supplier: data.supplier || 'Proveedor Directo',
      invoice_number: data.invoice_number || null,
      total_stock_value: (Number(data.stock_quantity) || 0) * (Number(data.unit_cost) || 0),
      is_low_stock: (Number(data.stock_quantity) || 0) <= (Number(data.min_stock_alert) || 10),
      created_at: new Date().toISOString()
    };

    this.consumables.update(list => [newConsumable, ...list]);
    this.addMovement({
      item_name: newConsumable.name,
      item_type: 'consumable',
      action_type: 'purchase_in',
      quantity: newConsumable.stock_quantity,
      details: `Ingreso de material en ${newConsumable.warehouse_name}`
    });
    this.persist();
    return newConsumable;
  }

  updateConsumable(id: number, updates: Partial<Consumable>) {
    this.consumables.update(list => list.map(c => {
      if (c.id === id) {
        const merged = { ...c, ...updates };
        merged.total_stock_value = (merged.stock_quantity || 0) * (merged.unit_cost || 0);
        merged.is_low_stock = merged.stock_quantity <= merged.min_stock_alert;
        if (updates.warehouse_id) merged.warehouse_name = this.getWarehouseName(updates.warehouse_id);
        if (updates.location_id) merged.location_name = this.getLocationName(updates.location_id);
        merged.updated_at = new Date().toISOString();
        return merged;
      }
      return c;
    }));
    this.persist();
  }

  deleteConsumable(id: number) {
    this.consumables.update(list => list.filter(c => c.id !== id));
    this.persist();
  }

  registerConsumption(consumableId: number, quantity: number, contactId?: number, reason?: string) {
    const item = this.consumables().find(c => c.id === consumableId);
    if (!item) return;

    const contact = this.contacts().find(c => c.id === contactId);
    const qty = Math.min(item.stock_quantity, quantity);

    this.updateConsumable(consumableId, {
      stock_quantity: Math.max(0, item.stock_quantity - qty)
    });

    const consumption: Consumption = {
      id: Date.now(),
      consumable_id: consumableId,
      consumable_name: item.name,
      warehouse_id: item.warehouse_id,
      warehouse_name: item.warehouse_name,
      contact_id: contactId || null,
      contact_name: contact ? contact.name : 'Despacho Mostrador',
      contact_role: contact?.role || 'cliente',
      quantity: qty,
      unit_cost: item.unit_cost,
      total_value: qty * item.unit_cost,
      reason: reason || 'Salida para obra',
      consumption_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    this.consumptions.update(list => [consumption, ...list]);
    this.addMovement({
      item_name: item.name,
      item_type: 'consumable',
      action_type: 'consumption_out',
      quantity: qty,
      details: `Despacho a ${consumption.contact_name}: ${reason || 'Obra'}`
    });
    this.persist();
  }

  // ==========================================
  // OPERACIONES: PRÉSTAMOS & ALQUILERES (LOANS)
  // ==========================================
  createLoan(loanData: {
    tool_id: number;
    contact_id: number;
    loan_type: 'lent_to_others' | 'borrowed_by_me';
    quantity: number;
    loan_date: string;
    due_date?: string | null;
    destination_location?: string;
    condition_out?: string;
    notes?: string;
  }): Loan {
    const tool = this.tools().find(t => t.id === loanData.tool_id);
    const contact = this.contacts().find(c => c.id === loanData.contact_id);

    const qty = Number(loanData.quantity) || 1;
    const id = Date.now();

    const newLoan: Loan = {
      id,
      tool_id: loanData.tool_id,
      tool_name: tool ? tool.name : 'Herramienta',
      tool_brand: tool?.brand,
      tool_model: tool?.model,
      tool_category: tool?.category,
      tool_image_url: tool?.image_url,
      contact_id: loanData.contact_id,
      contact_name: contact ? contact.name : 'Contacto',
      contact_phone: contact?.phone,
      contact_role: contact?.role || 'experto',
      contact_relationship: contact?.relationship,
      loan_type: loanData.loan_type,
      quantity: qty,
      loan_date: loanData.loan_date || new Date().toISOString().split('T')[0],
      due_date: loanData.due_date || null,
      returned_date: null,
      status: 'active',
      destination_location: loanData.destination_location || 'Obra en ejecución',
      condition_out: loanData.condition_out || 'good',
      notes: loanData.notes || '',
      created_at: new Date().toISOString()
    };

    // Actualizar disponibilidad de la herramienta si es préstamo de la ferretería
    if (tool && loanData.loan_type === 'lent_to_others') {
      const newAvail = Math.max(0, tool.available_quantity - qty);
      const newActive = (tool.active_loans_count || 0) + 1;
      this.updateTool(tool.id, {
        available_quantity: newAvail,
        active_loans_count: newActive
      });
    }

    // Actualizar historial del contacto
    if (contact) {
      this.contacts.update(list => list.map(c => {
        if (c.id === contact.id) {
          return {
            ...c,
            active_lent_count: (c.active_lent_count || 0) + 1,
            total_loans_history: (c.total_loans_history || 0) + 1
          };
        }
        return c;
      }));
    }

    this.loans.update(list => [newLoan, ...list]);
    this.addMovement({
      item_name: newLoan.tool_name,
      item_type: 'tool',
      action_type: 'loan_out',
      quantity: qty,
      details: `Prestado a ${newLoan.contact_name} (${newLoan.destination_location})`
    });
    this.persist();
    return newLoan;
  }

  returnLoan(loanId: number, data: { condition_in: string; return_notes?: string; target_location_id?: number }) {
    const loan = this.loans().find(l => l.id === loanId);
    if (!loan || loan.status === 'returned') return;

    this.loans.update(list => list.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          status: 'returned',
          returned_date: new Date().toISOString().split('T')[0],
          condition_in: data.condition_in || 'good',
          notes: data.return_notes ? `${l.notes || ''} | Devolución: ${data.return_notes}` : l.notes
        };
      }
      return l;
    }));

    // Reponer stock disponible de la herramienta
    const tool = this.tools().find(t => t.id === loan.tool_id);
    if (tool && loan.loan_type === 'lent_to_others') {
      const newAvail = Math.min(tool.total_quantity, tool.available_quantity + loan.quantity);
      const newActive = Math.max(0, (tool.active_loans_count || 1) - 1);
      const newCondition: ToolCondition = data.condition_in === 'damaged' ? 'damaged' : (data.condition_in === 'maintenance' ? 'maintenance' : tool.condition);
      this.updateTool(tool.id, {
        available_quantity: newAvail,
        active_loans_count: newActive,
        condition: newCondition,
        location_id: data.target_location_id || tool.location_id
      });
    }

    // Actualizar conteo del contacto
    const contact = this.contacts().find(c => c.id === loan.contact_id);
    if (contact) {
      this.contacts.update(list => list.map(c => {
        if (c.id === contact.id) {
          return {
            ...c,
            active_lent_count: Math.max(0, (c.active_lent_count || 1) - 1)
          };
        }
        return c;
      }));
    }

    this.addMovement({
      item_name: loan.tool_name,
      item_type: 'tool',
      action_type: 'return',
      quantity: loan.quantity,
      details: `Retornado por ${loan.contact_name}. Estado: ${data.condition_in}`
    });
    this.persist();
  }

  // ==========================================
  // OPERACIONES: BODEGAS & UBICACIONES
  // ==========================================
  addWarehouse(data: Partial<Warehouse>): Warehouse {
    const id = Date.now();
    const newWh: Warehouse = {
      id,
      name: data.name || 'Nueva Bodega',
      code: data.code || `BOD-${Math.floor(100 + Math.random() * 900)}`,
      description: data.description || '',
      address: data.address || '',
      locations_count: 0,
      tools_count: 0,
      consumables_count: 0,
      total_value: 0,
      created_at: new Date().toISOString()
    };
    this.warehouses.update(list => [...list, newWh]);
    this.persist();
    return newWh;
  }

  updateWarehouse(id: number, data: Partial<Warehouse>) {
    this.warehouses.update(list => list.map(w => w.id === id ? { ...w, ...data, updated_at: new Date().toISOString() } : w));
    this.persist();
  }

  deleteWarehouse(id: number) {
    this.warehouses.update(list => list.filter(w => w.id !== id));
    this.persist();
  }

  addLocation(data: Partial<Location>): Location {
    const id = Date.now();
    const wh = this.warehouses().find(w => w.id === data.warehouse_id);
    const newLoc: Location = {
      id,
      name: data.name || 'Nueva Estantería / Rack',
      type: data.type || 'shelf',
      description: data.description || '',
      warehouse_id: data.warehouse_id || null,
      warehouse_name: wh?.name || 'Bodega Principal',
      tools_count: 0,
      total_items: 0,
      available_items: 0,
      created_at: new Date().toISOString()
    };
    this.locations.update(list => [...list, newLoc]);
    this.persist();
    return newLoc;
  }

  deleteLocation(id: number) {
    this.locations.update(list => list.filter(l => l.id !== id));
    this.persist();
  }

  // ==========================================
  // OPERACIONES: PROVEEDORES & COMPRAS
  // ==========================================
  addSupplier(data: Partial<Supplier>): Supplier {
    const id = Date.now();
    const newSup: Supplier = {
      id,
      name: data.name || 'Nuevo Proveedor',
      tax_id: data.tax_id || '',
      contact_name: data.contact_name || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      payment_terms: data.payment_terms || 'credito_30',
      purchases_count: 0,
      total_purchased: 0,
      created_at: new Date().toISOString()
    };
    this.suppliers.update(list => [newSup, ...list]);
    this.persist();
    return newSup;
  }

  updateSupplier(id: number, data: Partial<Supplier>) {
    this.suppliers.update(list => list.map(s => s.id === id ? { ...s, ...data, updated_at: new Date().toISOString() } : s));
    this.persist();
  }

  deleteSupplier(id: number) {
    this.suppliers.update(list => list.filter(s => s.id !== id));
    this.persist();
  }

  addPurchase(data: Partial<Purchase>): Purchase {
    const id = Date.now();
    const qty = Number(data.quantity) || 1;
    const unitCost = Number(data.unit_cost) || 0;
    const subtotal = qty * unitCost;
    const taxRate = Number(data.tax_rate ?? 15);
    const taxAmount = (subtotal * taxRate) / 100;
    const totalCost = subtotal + taxAmount;

    const newPurchase: Purchase = {
      id,
      item_type: data.item_type || 'consumable',
      tool_id: data.tool_id || null,
      consumable_id: data.consumable_id || null,
      item_name: data.item_name || 'Mercadería ingresada',
      warehouse_id: data.warehouse_id || 1,
      warehouse_name: this.getWarehouseName(data.warehouse_id || 1),
      quantity: qty,
      unit_cost: unitCost,
      subtotal_cost: subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_cost: totalCost,
      supplier_id: data.supplier_id || null,
      supplier_name: data.supplier_name || 'Proveedor General',
      payment_status: data.payment_status || 'paid',
      invoice_number: data.invoice_number || `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
      invoice_image_url: data.invoice_image_url || null,
      purchase_date: data.purchase_date || new Date().toISOString().split('T')[0],
      notes: data.notes || '',
      created_at: new Date().toISOString()
    };

    // Incrementar compras del proveedor
    if (data.supplier_id) {
      this.suppliers.update(list => list.map(s => {
        if (s.id === data.supplier_id) {
          return {
            ...s,
            purchases_count: (s.purchases_count || 0) + 1,
            total_purchased: (s.total_purchased || 0) + totalCost
          };
        }
        return s;
      }));
    }

    // Incrementar stock si coincide con una herramienta o consumible
    if (data.item_type === 'consumable' && data.consumable_id) {
      const item = this.consumables().find(c => c.id === data.consumable_id);
      if (item) {
        this.updateConsumable(item.id, {
          stock_quantity: item.stock_quantity + qty,
          unit_cost: unitCost > 0 ? unitCost : item.unit_cost
        });
      }
    } else if (data.item_type === 'tool' && data.tool_id) {
      const tool = this.tools().find(t => t.id === data.tool_id);
      if (tool) {
        this.updateTool(tool.id, {
          total_quantity: tool.total_quantity + qty,
          available_quantity: tool.available_quantity + qty
        });
      }
    }

    this.purchases.update(list => [newPurchase, ...list]);
    this.addMovement({
      item_name: newPurchase.item_name,
      item_type: newPurchase.item_type,
      action_type: 'purchase_in',
      quantity: qty,
      details: `Factura ${newPurchase.invoice_number} de ${newPurchase.supplier_name} ($${totalCost.toFixed(2)})`
    });
    this.persist();
    return newPurchase;
  }

  // ==========================================
  // OPERACIONES: CONTACTOS
  // ==========================================
  addContact(data: Partial<Contact>): Contact {
    const id = Date.now();
    const newContact: Contact = {
      id,
      name: data.name || 'Nuevo Contacto',
      phone: data.phone || '',
      email: data.email || '',
      role: data.role || 'cliente',
      relationship: data.relationship || '',
      notes: data.notes || '',
      active_lent_count: 0,
      active_borrowed_count: 0,
      total_loans_history: 0,
      created_at: new Date().toISOString()
    };
    this.contacts.update(list => [newContact, ...list]);
    this.persist();
    return newContact;
  }

  // ==========================================
  // HELPERS
  // ==========================================
  private getWarehouseName(id: number): string {
    const w = this.warehouses().find(wh => wh.id === id);
    return w ? w.name : 'Bodega Central';
  }

  private getLocationName(id?: number | null): string {
    if (!id) return 'Sin asignar';
    const l = this.locations().find(loc => loc.id === id);
    return l ? l.name : 'Sin asignar';
  }

  private addMovement(movement: Omit<WarehouseMovement, 'id' | 'timestamp'>) {
    const newMov: WarehouseMovement = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...movement
    };
    this.movements.update(list => [newMov, ...list.slice(0, 49)]);
  }

  // ==========================================
  // CARGA DE DATOS DEMO (REALISTAS PARA FERRECOMPARA)
  // ==========================================
  cargarDatosDemo() {
    const warehouses: Warehouse[] = [
      {
        id: 1,
        name: 'Bodega Central Portoviejo',
        code: 'BOD-CENTRAL',
        description: 'Bodega principal de maquinaria pesada, herramientas y equipos',
        address: 'Av. Universitaria y Calle 3',
        locations_count: 3,
        tools_count: 6,
        consumables_count: 1,
        total_value: 4890,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Patio de Agregados y Metales',
        code: 'PATIO-SUR',
        description: 'Patio de almacenamiento de varillas, cemento y agregados',
        address: 'Vía Manta Km 4.5',
        locations_count: 2,
        tools_count: 0,
        consumables_count: 3,
        total_value: 2850,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Almacén de Acabados & Taller',
        code: 'ALM-TALLER',
        description: 'Taller de servicio técnico, pinturas, grifería y sanitarios',
        address: 'Calle 10 de Agosto y Rocafuerte',
        locations_count: 2,
        tools_count: 2,
        consumables_count: 3,
        total_value: 2340,
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Camioneta Reparto Hino 1',
        code: 'MOVIL-01',
        description: 'Unidad de despacho y entrega de herramientas a pie de obra',
        address: 'Móvil en Ruta Portoviejo-Manta',
        locations_count: 1,
        tools_count: 0,
        consumables_count: 0,
        total_value: 0,
        created_at: new Date().toISOString()
      }
    ];

    const locations: Location[] = [
      { id: 1, name: 'Estante A1 - Rotomartillos y Demolición', type: 'shelf', warehouse_id: 1, warehouse_name: 'Bodega Central Portoviejo', tools_count: 3 },
      { id: 2, name: 'Estante A2 - Soldadura y Generadores', type: 'shelf', warehouse_id: 1, warehouse_name: 'Bodega Central Portoviejo', tools_count: 2 },
      { id: 3, name: 'Rack Pesado R1 - Andamios y Parantes', type: 'shelf', warehouse_id: 1, warehouse_name: 'Bodega Central Portoviejo', tools_count: 1 },
      { id: 4, name: 'Bahía C1 - Cementos y Pegas', type: 'storage', warehouse_id: 2, warehouse_name: 'Patio de Agregados y Metales', tools_count: 0 },
      { id: 5, name: 'Bahía M1 - Varillas y Perfiles', type: 'storage', warehouse_id: 2, warehouse_name: 'Patio de Agregados y Metales', tools_count: 0 },
      { id: 6, name: 'Pasillo P2 - Tuberías PVC y Sanitarios', type: 'shelf', warehouse_id: 3, warehouse_name: 'Almacén de Acabados & Taller', tools_count: 2 },
      { id: 7, name: 'Caja Móvil de Herramientas Camioneta', type: 'vehicle', warehouse_id: 4, warehouse_name: 'Camioneta Reparto Hino 1', tools_count: 0 }
    ];

    const suppliers: Supplier[] = [
      { id: 1, name: 'Holcim Ecuador S.A.', tax_id: '0990004123001', contact_name: 'Ing. Fernando Cevallos', phone: '0984561230', email: 'pedidos@holcim.com.ec', payment_terms: 'credito_30', purchases_count: 12, total_purchased: 14500 },
      { id: 2, name: 'Novacero S.A.', tax_id: '1790123456001', contact_name: 'Lic. Mariana Moreira', phone: '0997894561', email: 'ventasmanabi@novacero.com', payment_terms: 'credito_30', purchases_count: 8, total_purchased: 9800 },
      { id: 3, name: 'DeWalt / Stanley Black & Decker', tax_id: '1791823901001', contact_name: 'Carlos Andrés Vera', phone: '0992345678', email: 'distribuidores@sbdinc.com', payment_terms: 'credito_15', purchases_count: 6, total_purchased: 7600 },
      { id: 4, name: 'Sika Ecuatoriana S.A.', tax_id: '0990876543001', contact_name: 'Arq. Roberto Loor', phone: '0981122334', email: 'asesoriamanabi@ec.sika.com', payment_terms: 'contado', purchases_count: 5, total_purchased: 3400 },
      { id: 5, name: 'Plastigama Wavin Ecuador', tax_id: '0990015678001', contact_name: 'Patricio Solórzano', phone: '0978901234', email: 'ventas@plastigama.com', payment_terms: 'credito_30', purchases_count: 9, total_purchased: 5200 },
      { id: 6, name: 'Pinturas Cóndor S.A.', tax_id: '1790018902001', contact_name: 'Elena Barrezueta', phone: '0986543210', email: 'ventas@condor.com.ec', payment_terms: 'contado', purchases_count: 4, total_purchased: 2900 }
    ];

    const contacts: Contact[] = [
      { id: 1, name: 'Maestro Carlos Mendoza', phone: '0987654321', email: 'carlos.mendoza@gmail.com', role: 'experto', relationship: 'Experto FerreCompara (Albañil & Encofrados)', active_lent_count: 1, total_loans_history: 14 },
      { id: 2, name: 'Maestro Miguel Ángel Zambrano', phone: '0991122334', email: 'miguelelectric@gmail.com', role: 'experto', relationship: 'Experto FerreCompara (Electricista & Soldador)', active_lent_count: 1, total_loans_history: 9 },
      { id: 3, name: 'Ing. Marcos Villavicencio', phone: '0981234567', email: 'marcos.villa@constructora.ec', role: 'cliente', relationship: 'Cliente Frecuente (Constructora MV)', active_lent_count: 1, total_loans_history: 6 },
      { id: 4, name: 'Sr. Jacinto Cedeño', phone: '0998877665', email: 'jacinto.cedeno@outlook.com', role: 'experto', relationship: 'Experto FerreCompara (Plomero & Redes Sanitarias)', active_lent_count: 0, total_loans_history: 8 },
      { id: 5, name: 'Lic. Sofía Macías', phone: '0955443322', email: 'sofia.macias@gmail.com', role: 'cliente', relationship: 'Cliente Particular (Remodelación Domicilio)', active_lent_count: 1, total_loans_history: 2 },
      { id: 6, name: 'Pedro Intriago', phone: '0989012345', email: 'bodega@ferrecompara.com', role: 'empleado', relationship: 'Jefe de Bodega y Despacho', active_lent_count: 0, total_loans_history: 0 }
    ];

    const tools: Tool[] = [
      {
        id: 1,
        name: 'Rotomartillo SDS Max 1500W',
        brand: 'Bosch',
        model: 'GBH 8-45 D',
        serial_number: 'BSH-845-2023-01',
        barcode: 'ROT-BSH-845',
        category: 'Herramientas Eléctricas',
        total_quantity: 3,
        available_quantity: 2,
        condition: 'good',
        purchase_price: 680,
        warehouse_id: 1,
        warehouse_name: 'Bodega Central Portoviejo',
        location_id: 1,
        location_name: 'Estante A1 - Rotomartillos y Demolición',
        supplier_name: 'DeWalt / Stanley Black & Decker',
        invoice_number: 'FAC-001-09823',
        purchase_date: '2026-01-15',
        image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80',
        created_at: '2026-01-15T10:00:00Z',
        active_loans_count: 1
      },
      {
        id: 2,
        name: 'Andamio Tubular Metálico 2x1.5m (Cuerpo)',
        brand: 'Novacero / Nacional',
        model: 'AT-STD-200',
        serial_number: 'AND-2024-001',
        barcode: 'AND-NOV-200',
        category: 'Estructuras y Altura',
        total_quantity: 8,
        available_quantity: 5,
        condition: 'good',
        purchase_price: 130,
        warehouse_id: 1,
        warehouse_name: 'Bodega Central Portoviejo',
        location_id: 3,
        location_name: 'Rack Pesado R1 - Andamios y Parantes',
        supplier_name: 'Novacero S.A.',
        invoice_number: 'FAC-003-88712',
        purchase_date: '2026-02-10',
        image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=400&q=80',
        created_at: '2026-02-10T11:00:00Z',
        active_loans_count: 3
      },
      {
        id: 3,
        name: 'Soldadora Inverter 200A Bi-Voltaje',
        brand: 'Lincoln Electric',
        model: 'PowerCRAFT 200',
        serial_number: 'LNC-200-8841',
        barcode: '7892003456789',
        category: 'Soldadura y Metales',
        total_quantity: 2,
        available_quantity: 1,
        condition: 'new',
        purchase_price: 490,
        warehouse_id: 1,
        warehouse_name: 'Bodega Central Portoviejo',
        location_id: 2,
        location_name: 'Estante A2 - Soldadura y Generadores',
        supplier_name: 'DeWalt / Stanley Black & Decker',
        image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
        created_at: '2026-03-05T09:30:00Z',
        active_loans_count: 1
      },
      {
        id: 4,
        name: 'Generador a Gasolina 5.5 KVA 110/220V',
        brand: 'Honda',
        model: 'EG5000CX',
        serial_number: 'HND-55K-9901',
        barcode: '7863004567112',
        category: 'Generación Eléctrica',
        total_quantity: 2,
        available_quantity: 1,
        condition: 'good',
        purchase_price: 1150,
        warehouse_id: 1,
        warehouse_name: 'Bodega Central Portoviejo',
        location_id: 2,
        location_name: 'Estante A2 - Soldadura y Generadores',
        supplier_name: 'DeWalt / Stanley Black & Decker',
        image_url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=400&q=80',
        created_at: '2026-03-12T14:20:00Z',
        active_loans_count: 1
      },
      {
        id: 5,
        name: 'Sierra Circular 7-1/4" 1800W',
        brand: 'DeWalt',
        model: 'DWE575',
        serial_number: 'DWT-575-4421',
        barcode: '7891234567011',
        category: 'Herramientas Eléctricas',
        total_quantity: 4,
        available_quantity: 4,
        condition: 'new',
        purchase_price: 185,
        warehouse_id: 1,
        warehouse_name: 'Bodega Central Portoviejo',
        location_id: 1,
        location_name: 'Estante A1 - Rotomartillos y Demolición',
        supplier_name: 'DeWalt / Stanley Black & Decker',
        image_url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=400&q=80',
        created_at: '2026-03-20T16:00:00Z',
        active_loans_count: 0
      },
      {
        id: 6,
        name: 'Cortadora Manual de Porcelanato 90cm',
        brand: 'Rubi',
        model: 'Speed-90 Magnet',
        serial_number: 'RUB-90-1102',
        barcode: '7899876543210',
        category: 'Herramientas Manuales',
        total_quantity: 2,
        available_quantity: 1,
        condition: 'fair',
        purchase_price: 240,
        warehouse_id: 3,
        warehouse_name: 'Almacén de Acabados & Taller',
        location_id: 6,
        location_name: 'Pasillo P2 - Tuberías PVC y Sanitarios',
        supplier_name: 'Novacero S.A.',
        image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
        created_at: '2026-04-01T08:15:00Z',
        active_loans_count: 1
      },
      {
        id: 7,
        name: 'Amoladora Angular 9" 2400W Industrial',
        brand: 'Bosch',
        model: 'GWS 24-230',
        serial_number: 'BSH-24-9912',
        barcode: '7861112223334',
        category: 'Herramientas Eléctricas',
        total_quantity: 3,
        available_quantity: 2,
        condition: 'good',
        purchase_price: 215,
        warehouse_id: 1,
        warehouse_name: 'Bodega Central Portoviejo',
        location_id: 1,
        location_name: 'Estante A1 - Rotomartillos y Demolición',
        supplier_name: 'DeWalt / Stanley Black & Decker',
        image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80',
        created_at: '2026-04-10T12:00:00Z',
        active_loans_count: 1
      },
      {
        id: 8,
        name: 'Compresor de Aire 50 Litros 2.5 HP',
        brand: 'Stanley',
        model: 'STAN-50L',
        serial_number: 'STN-50-6677',
        barcode: '7893334445556',
        category: 'Neumática y Pintura',
        total_quantity: 2,
        available_quantity: 2,
        condition: 'good',
        purchase_price: 295,
        warehouse_id: 3,
        warehouse_name: 'Almacén de Acabados & Taller',
        location_id: 6,
        location_name: 'Pasillo P2 - Tuberías PVC y Sanitarios',
        supplier_name: 'DeWalt / Stanley Black & Decker',
        image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
        created_at: '2026-04-18T10:45:00Z',
        active_loans_count: 0
      }
    ];

    const consumables: Consumable[] = [
      {
        id: 1,
        name: 'Cemento Holcim Fuerte Tipo GU 50kg',
        category: 'Materiales Básicos',
        unit: 'saco',
        stock_quantity: 180,
        min_stock_alert: 50,
        unit_cost: 7.50,
        warehouse_id: 2,
        warehouse_name: 'Patio de Agregados y Metales',
        location_id: 4,
        location_name: 'Bahía C1 - Cementos y Pegas',
        barcode: 'CEM-GRIS-50',
        supplier: 'Holcim Ecuador S.A.',
        invoice_number: 'FAC-001-09823',
        total_stock_value: 1350,
        is_low_stock: false,
        notes: 'Proveedor anterior: Ferretería Santa Martha ($7.80/saco) | Último proveedor: Holcim Ecuador S.A. ($7.50/saco)',
        created_at: '2026-01-20T10:00:00Z'
      },
      {
        id: 2,
        name: 'Varilla Corrugada Novacero 12mm x 12m',
        category: 'Aceros y Varillas',
        unit: 'pz',
        stock_quantity: 42,
        min_stock_alert: 50,
        unit_cost: 9.50,
        warehouse_id: 2,
        warehouse_name: 'Patio de Agregados y Metales',
        location_id: 5,
        location_name: 'Bahía M1 - Varillas y Perfiles',
        barcode: 'VAR-12-CORR',
        supplier: 'Novacero S.A.',
        invoice_number: 'FAC-002-45129',
        total_stock_value: 399.00,
        is_low_stock: true,
        notes: 'Proveedor anterior: Disensa Portoviejo ($9.20/pz) | Último proveedor: Novacero S.A. ($9.50/pz)',
        created_at: '2026-02-15T09:00:00Z'
      },
      {
        id: 3,
        name: 'Pega Enchape Blanco Cerámica SikaCeram 25kg',
        category: 'Químicos y Pegas',
        unit: 'saco',
        stock_quantity: 28,
        min_stock_alert: 30,
        unit_cost: 6.20,
        warehouse_id: 2,
        warehouse_name: 'Patio de Agregados y Metales',
        location_id: 4,
        location_name: 'Bahía C1 - Cementos y Pegas',
        barcode: 'SIKA-CERAM-25',
        supplier: 'Sika Ecuatoriana S.A.',
        invoice_number: 'FAC-008-77123',
        total_stock_value: 173.60,
        is_low_stock: true,
        created_at: '2026-03-01T15:00:00Z'
      },
      {
        id: 4,
        name: 'Tubería Sanitaria Plastigama PVC 110mm x 3m',
        category: 'Plomería y Tuberías',
        unit: 'tubo',
        stock_quantity: 65,
        min_stock_alert: 20,
        unit_cost: 8.50,
        warehouse_id: 3,
        warehouse_name: 'Almacén de Acabados & Taller',
        location_id: 6,
        location_name: 'Pasillo P2 - Tuberías PVC y Sanitarios',
        barcode: 'TUB-PVC-110',
        supplier: 'Plastigama Wavin Ecuador',
        invoice_number: 'FAC-007-66512',
        total_stock_value: 552.50,
        is_low_stock: false,
        created_at: '2026-03-10T11:00:00Z'
      },
      {
        id: 5,
        name: 'Disco de Corte Metal DeWalt 4-1/2" x 1/16"',
        category: 'Consumibles Abrasivos',
        unit: 'pz',
        stock_quantity: 120,
        min_stock_alert: 40,
        unit_cost: 1.15,
        warehouse_id: 1,
        warehouse_name: 'Bodega Central Portoviejo',
        location_id: 1,
        location_name: 'Estante A1 - Rotomartillos y Demolición',
        barcode: 'DISC-DWT-45',
        supplier: 'DeWalt / Stanley Black & Decker',
        invoice_number: 'FAC-004-33108',
        total_stock_value: 138.00,
        is_low_stock: false,
        created_at: '2026-03-22T14:30:00Z'
      },
      {
        id: 6,
        name: 'Cable Eléctrico THW 100% Cobre #12 AWG (Rollo 100m)',
        category: 'Electricidad',
        unit: 'rollo',
        stock_quantity: 14,
        min_stock_alert: 15,
        unit_cost: 44.00,
        warehouse_id: 1,
        warehouse_name: 'Bodega Central Portoviejo',
        location_id: 2,
        location_name: 'Estante A2 - Soldadura y Generadores',
        barcode: 'CAB-THW-12',
        supplier: 'Novacero S.A.',
        invoice_number: 'FAC-002-45129',
        total_stock_value: 616.00,
        is_low_stock: true,
        created_at: '2026-04-05T16:00:00Z'
      },
      {
        id: 7,
        name: 'Pintura Látex Lavable Blanca Cóndor 5 Galones',
        category: 'Pinturas y Acabados',
        unit: 'gal',
        stock_quantity: 22,
        min_stock_alert: 10,
        unit_cost: 54.00,
        warehouse_id: 3,
        warehouse_name: 'Almacén de Acabados & Taller',
        location_id: 6,
        location_name: 'Pasillo P2 - Tuberías PVC y Sanitarios',
        barcode: 'PINT-COND-5G',
        supplier: 'Pinturas Cóndor S.A.',
        invoice_number: 'FAC-009-33412',
        total_stock_value: 1188.00,
        is_low_stock: false,
        created_at: '2026-04-12T09:40:00Z'
      }
    ];

    const loans: Loan[] = [
      {
        id: 1,
        tool_id: 1,
        tool_name: 'Rotomartillo SDS Max 1500W',
        tool_brand: 'Bosch',
        tool_category: 'Herramientas Eléctricas',
        contact_id: 1,
        contact_name: 'Maestro Carlos Mendoza',
        contact_phone: '0987654321',
        contact_role: 'experto',
        contact_relationship: 'Experto FerreCompara (Albañil)',
        loan_type: 'lent_to_others',
        quantity: 1,
        loan_date: '2026-11-01',
        due_date: '2026-11-07',
        status: 'active',
        destination_location: 'Obra Edificio Mirador Av. Manabí',
        condition_out: 'good',
        notes: 'Préstamo con broca SDS Max 1 pulg y cincel de punta para demolición de losa.',
        created_at: '2026-11-01T08:00:00Z'
      },
      {
        id: 2,
        tool_id: 3,
        tool_name: 'Soldadora Inverter 200A Bi-Voltaje',
        tool_brand: 'Lincoln Electric',
        tool_category: 'Soldadura y Metales',
        contact_id: 2,
        contact_name: 'Maestro Miguel Ángel Zambrano',
        contact_phone: '0991122334',
        contact_role: 'experto',
        contact_relationship: 'Experto FerreCompara (Soldador)',
        loan_type: 'lent_to_others',
        quantity: 1,
        loan_date: '2026-10-25',
        due_date: '2026-11-02',
        status: 'overdue',
        destination_location: 'Taller Estructuras Metálicas Calle 15',
        condition_out: 'new',
        notes: 'URGENTE: Préstamo fuera de plazo (vencido hace 2 días). Contactar para retorno a bodega.',
        created_at: '2026-10-25T09:30:00Z'
      },
      {
        id: 3,
        tool_id: 2,
        tool_name: 'Andamio Tubular Metálico 2x1.5m (Cuerpo)',
        tool_brand: 'Novacero / Nacional',
        tool_category: 'Estructuras y Altura',
        contact_id: 3,
        contact_name: 'Ing. Marcos Villavicencio',
        contact_phone: '0981234567',
        contact_role: 'cliente',
        contact_relationship: 'Cliente Frecuente (Constructora MV)',
        loan_type: 'lent_to_others',
        quantity: 3,
        loan_date: '2026-11-02',
        due_date: '2026-11-12',
        status: 'active',
        destination_location: 'Condominio Los Olivos Torre B',
        condition_out: 'good',
        notes: 'Alquiler de 3 cuerpos de andamio con diagonales y crucetas de seguridad.',
        created_at: '2026-11-02T11:00:00Z'
      },
      {
        id: 4,
        tool_id: 6,
        tool_name: 'Cortadora Manual de Porcelanato 90cm',
        tool_brand: 'Rubi',
        tool_category: 'Herramientas Manuales',
        contact_id: 5,
        contact_name: 'Lic. Sofía Macías',
        contact_phone: '0955443322',
        contact_role: 'cliente',
        contact_relationship: 'Cliente Particular',
        loan_type: 'lent_to_others',
        quantity: 1,
        loan_date: '2026-11-03',
        due_date: '2026-11-05',
        status: 'active',
        destination_location: 'Calle Los Jazmines Casa #4',
        condition_out: 'good',
        notes: 'Alquiler para remodelación de baño familiar.',
        created_at: '2026-11-03T15:20:00Z'
      },
      {
        id: 5,
        tool_id: 4,
        tool_name: 'Generador a Gasolina 5.5 KVA 110/220V',
        tool_brand: 'Honda',
        tool_category: 'Generación Eléctrica',
        contact_id: 1,
        contact_name: 'Maestro Carlos Mendoza',
        contact_phone: '0987654321',
        contact_role: 'experto',
        contact_relationship: 'Experto FerreCompara',
        loan_type: 'lent_to_others',
        quantity: 1,
        loan_date: '2026-10-15',
        due_date: '2026-10-22',
        returned_date: '2026-10-22',
        status: 'returned',
        destination_location: 'Obra Los Almendros',
        condition_out: 'good',
        condition_in: 'good',
        notes: 'Devuelto en perfecto estado con mantenimiento preventivo realizado.',
        created_at: '2026-10-15T08:00:00Z'
      }
    ];

    const purchases: Purchase[] = [
      {
        id: 1,
        item_type: 'consumable',
        consumable_id: 1,
        item_name: 'Cemento Holcim Fuerte Tipo GU 50kg',
        warehouse_id: 2,
        warehouse_name: 'Patio de Agregados y Metales',
        quantity: 200,
        unit_cost: 7.50,
        subtotal_cost: 1500,
        tax_rate: 15,
        tax_amount: 225,
        total_cost: 1725,
        supplier_id: 1,
        supplier_name: 'Holcim Ecuador S.A.',
        payment_status: 'paid',
        invoice_number: 'FAC-001-09823',
        invoice_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        purchase_date: '2026-10-20',
        created_at: '2026-10-20T10:00:00Z'
      },
      {
        id: 2,
        item_type: 'consumable',
        consumable_id: 2,
        item_name: 'Varilla Corrugada Novacero 12mm x 12m',
        warehouse_id: 2,
        warehouse_name: 'Patio de Agregados y Metales',
        quantity: 100,
        unit_cost: 9.50,
        subtotal_cost: 950,
        tax_rate: 15,
        tax_amount: 142.50,
        total_cost: 1092.50,
        supplier_id: 2,
        supplier_name: 'Novacero S.A.',
        payment_status: 'credit',
        invoice_number: 'FAC-002-45129',
        invoice_image_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
        purchase_date: '2026-10-28',
        created_at: '2026-10-28T14:30:00Z'
      },
      {
        id: 3,
        item_type: 'tool',
        tool_id: 5,
        item_name: 'Sierra Circular 7-1/4" 1800W DeWalt',
        warehouse_id: 1,
        warehouse_name: 'Bodega Central Portoviejo',
        quantity: 4,
        unit_cost: 175.00,
        subtotal_cost: 700,
        tax_rate: 15,
        tax_amount: 105,
        total_cost: 805,
        supplier_id: 3,
        supplier_name: 'DeWalt / Stanley Black & Decker',
        payment_status: 'paid',
        invoice_number: 'FAC-004-33108',
        invoice_image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
        purchase_date: '2026-10-14',
        created_at: '2026-10-14T09:00:00Z'
      },
      {
        id: 4,
        item_type: 'consumable',
        consumable_id: 1,
        item_name: 'Cemento Holcim Fuerte Tipo GU 50kg',
        warehouse_id: 2,
        warehouse_name: 'Patio de Agregados y Metales',
        quantity: 50,
        unit_cost: 7.80,
        subtotal_cost: 390,
        tax_rate: 15,
        tax_amount: 58.50,
        total_cost: 448.50,
        supplier_id: 6,
        supplier_name: 'Ferretería Santa Martha',
        payment_status: 'paid',
        invoice_number: 'FAC-001-00452',
        invoice_image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
        purchase_date: '2026-09-15',
        created_at: '2026-09-15T11:00:00Z'
      },
      {
        id: 5,
        item_type: 'consumable',
        consumable_id: 4,
        item_name: 'Tubería Sanitaria Plastigama PVC 110mm x 3m',
        warehouse_id: 3,
        warehouse_name: 'Almacén de Acabados & Taller',
        quantity: 65,
        unit_cost: 8.50,
        subtotal_cost: 552.50,
        tax_rate: 15,
        tax_amount: 82.88,
        total_cost: 635.38,
        supplier_id: 5,
        supplier_name: 'Plastigama Wavin Ecuador',
        payment_status: 'paid',
        invoice_number: 'FAC-007-66512',
        invoice_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        purchase_date: '2026-10-11',
        created_at: '2026-10-11T16:00:00Z'
      },
      {
        id: 6,
        item_type: 'consumable',
        consumable_id: 3,
        item_name: 'Pega Enchape Blanco Cerámica SikaCeram 25kg',
        warehouse_id: 2,
        warehouse_name: 'Patio de Agregados y Metales',
        quantity: 30,
        unit_cost: 6.20,
        subtotal_cost: 186.00,
        tax_rate: 15,
        tax_amount: 27.90,
        total_cost: 213.90,
        supplier_id: 4,
        supplier_name: 'Sika Ecuatoriana S.A.',
        payment_status: 'paid',
        invoice_number: 'FAC-008-77123',
        invoice_image_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
        purchase_date: '2026-10-05',
        created_at: '2026-10-05T09:30:00Z'
      },
      {
        id: 7,
        item_type: 'tool',
        tool_id: 1,
        item_name: 'Rotomartillo SDS Max 1500W',
        warehouse_id: 1,
        warehouse_name: 'Bodega Central Portoviejo',
        quantity: 3,
        unit_cost: 680.00,
        subtotal_cost: 2040,
        tax_rate: 15,
        tax_amount: 306,
        total_cost: 2346,
        supplier_id: 3,
        supplier_name: 'DeWalt / Stanley Black & Decker',
        payment_status: 'paid',
        invoice_number: 'FAC-001-09823',
        invoice_image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
        purchase_date: '2026-01-15',
        created_at: '2026-01-15T10:00:00Z'
      },
      {
        id: 8,
        item_type: 'tool',
        tool_id: 2,
        item_name: 'Andamio Tubular Metálico 2x1.5m (Cuerpo)',
        warehouse_id: 1,
        warehouse_name: 'Bodega Central Portoviejo',
        quantity: 8,
        unit_cost: 130.00,
        subtotal_cost: 1040,
        tax_rate: 15,
        tax_amount: 156,
        total_cost: 1196,
        supplier_id: 2,
        supplier_name: 'Novacero S.A.',
        payment_status: 'credit',
        invoice_number: 'FAC-003-88712',
        invoice_image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
        purchase_date: '2026-02-10',
        created_at: '2026-02-10T11:00:00Z'
      },
      {
        id: 9,
        item_type: 'consumable',
        consumable_id: 7,
        item_name: 'Pintura Látex Lavable Blanca Cóndor 5 Galones',
        warehouse_id: 3,
        warehouse_name: 'Almacén de Acabados & Taller',
        quantity: 22,
        unit_cost: 54.00,
        subtotal_cost: 1188,
        tax_rate: 15,
        tax_amount: 178.20,
        total_cost: 1366.20,
        supplier_id: 6,
        supplier_name: 'Pinturas Cóndor S.A.',
        payment_status: 'credit',
        invoice_number: 'FAC-009-33412',
        invoice_image_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
        purchase_date: '2026-04-12',
        created_at: '2026-04-12T09:40:00Z'
      }
    ];

    const consumptions: Consumption[] = [
      {
        id: 1,
        consumable_id: 1,
        consumable_name: 'Cemento Holcim Fuerte Tipo GU 50kg',
        warehouse_id: 2,
        warehouse_name: 'Patio de Agregados y Metales',
        contact_id: 1,
        contact_name: 'Maestro Carlos Mendoza',
        contact_role: 'experto',
        quantity: 20,
        unit_cost: 7.80,
        total_value: 156.00,
        reason: 'Despacho directo para fundición losa Edificio Mirador',
        consumption_date: '2026-11-02',
        created_at: '2026-11-02T10:00:00Z'
      }
    ];

    const movements: WarehouseMovement[] = [
      {
        id: 1,
        item_name: 'Rotomartillo SDS Max 1500W Bosch',
        item_type: 'tool',
        action_type: 'loan_out',
        quantity: 1,
        details: 'Prestado a Maestro Carlos Mendoza (Obra Mirador)',
        timestamp: '2026-11-01T08:00:00Z'
      },
      {
        id: 2,
        item_name: 'Andamio Tubular Metálico 2x1.5m',
        item_type: 'tool',
        action_type: 'loan_out',
        quantity: 3,
        details: 'Alquiler a Ing. Marcos Villavicencio (Condominio Los Olivos)',
        timestamp: '2026-11-02T11:00:00Z'
      },
      {
        id: 3,
        item_name: 'Cemento Holcim Fuerte 50kg',
        item_type: 'consumable',
        action_type: 'consumption_out',
        quantity: 20,
        details: 'Salida de material para Maestro Carlos Mendoza',
        timestamp: '2026-11-02T10:00:00Z'
      },
      {
        id: 4,
        item_name: 'Cortadora Manual de Porcelanato Rubi',
        item_type: 'tool',
        action_type: 'loan_out',
        quantity: 1,
        details: 'Alquiler a Lic. Sofía Macías (Remodelación casa)',
        timestamp: '2026-11-03T15:20:00Z'
      }
    ];

    this.warehouses.set(warehouses);
    this.locations.set(locations);
    this.suppliers.set(suppliers);
    this.contacts.set(contacts);
    this.tools.set(tools);
    this.consumables.set(consumables);
    this.loans.set(loans);
    this.purchases.set(purchases);
    this.consumptions.set(consumptions);
    this.movements.set(movements);

    this.persist();
  }
}
