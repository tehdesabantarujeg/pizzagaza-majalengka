
import { Database } from './types';

export type Tables = Database['public']['Tables'];

// Export table types for easier access
export type PizzaStockRow = Tables['pizza_stock']['Row'];
export type BoxStockRow = Tables['box_stock']['Row'];
export type TransactionRow = Tables['transactions']['Row'];
export type CustomerRow = Tables['customers']['Row'];
export type ExpenseRow = Tables['expenses']['Row'];

// Export insert types
export type PizzaStockInsert = Tables['pizza_stock']['Insert'];
export type BoxStockInsert = Tables['box_stock']['Insert'];
export type TransactionInsert = Tables['transactions']['Insert'];
export type CustomerInsert = Tables['customers']['Insert'];
export type ExpenseInsert = Tables['expenses']['Insert'];

// Export update types
export type PizzaStockUpdate = Tables['pizza_stock']['Update'];
export type BoxStockUpdate = Tables['box_stock']['Update'];
export type TransactionUpdate = Tables['transactions']['Update'];
export type CustomerUpdate = Tables['customers']['Update'];
export type ExpenseUpdate = Tables['expenses']['Update'];

// Mapping for column names
export const columnMapping = {
  // Pizza stock
  pizzaStock: {
    id: 'id',
    size: 'size',
    flavor: 'flavor',
    quantity: 'quantity',
    costPrice: 'cost_price',
    purchaseDate: 'purchase_date',
    updatedAt: 'updated_at'
  },
  // Box stock
  boxStock: {
    id: 'id',
    size: 'size',
    quantity: 'quantity',
    costPrice: 'cost_price',
    purchaseDate: 'purchase_date',
    updatedAt: 'updated_at'
  },
  // Transactions
  transactions: {
    id: 'id',
    date: 'date',
    pizzaId: 'pizza_id',
    size: 'size',
    flavor: 'flavor',
    quantity: 'quantity',
    state: 'state',
    includeBox: 'include_box',
    sellingPrice: 'selling_price',
    totalPrice: 'total_price',
    customerName: 'customer_name',
    notes: 'notes',
    transactionNumber: 'transaction_number'
  }
};
