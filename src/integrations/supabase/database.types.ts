
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
  purchaseDate: item.purchaseDate,
  costPrice: item.costPrice
});

export const mapBoxStockToDatabase = (item: any): BoxStockInsert => ({
  size: item.size,
  quantity: item.quantity,
  purchaseDate: item.purchaseDate,
  costPrice: item.costPrice
});

export const mapTransactionToDatabase = (item: any): TransactionInsert => ({
  date: item.date,
  pizzaId: item.pizzaId,
  size: item.size,
  flavor: item.flavor,
  quantity: item.quantity, 
  state: item.state,
  includeBox: item.includeBox,
  sellingPrice: item.sellingPrice,
  totalPrice: item.totalPrice,
  customerName: item.customerName,
  notes: item.notes,
  transactionNumber: item.transactionNumber
});

// Additional mapping function for expenses
export const mapExpenseToDatabase = (item: any): ExpenseInsert => ({
  category: item.category,
  date: item.date,
  amount: item.amount,
  description: item.description
});

// Additional mapping function for customers
export const mapCustomerToDatabase = (item: any): CustomerInsert => ({
  name: item.name,
  purchases: item.purchases,
  lastPurchase: item.lastPurchase
});
