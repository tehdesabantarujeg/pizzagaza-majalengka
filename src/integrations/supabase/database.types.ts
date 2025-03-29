
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

// Define mapping for frontend types to database types
export const mapPizzaStockToDatabase = (item: any): PizzaStockInsert => ({
  size: item.size,
  flavor: item.flavor,
  quantity: item.quantity,
  purchase_date: item.purchaseDate,
  cost_price: item.costPrice
});

export const mapBoxStockToDatabase = (item: any): BoxStockInsert => ({
  size: item.size,
  quantity: item.quantity,
  purchase_date: item.purchaseDate,
  cost_price: item.costPrice
});

export const mapTransactionToDatabase = (item: any): TransactionInsert => ({
  date: item.date,
  pizza_id: item.pizzaId,
  size: item.size,
  flavor: item.flavor,
  quantity: item.quantity, 
  state: item.state,
  include_box: item.includeBox,
  selling_price: item.sellingPrice,
  total_price: item.totalPrice,
  customer_name: item.customerName,
  notes: item.notes,
  transaction_number: item.transactionNumber
});
