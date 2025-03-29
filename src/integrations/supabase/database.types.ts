
import { Database } from './types';
import { PizzaStock, BoxStock, Transaction, Expense } from '@/utils/types';

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

// Transform functions for converting between DB types and app types
export const transformPizzaStockFromDB = (row: PizzaStockRow): PizzaStock => {
  return {
    id: row.id,
    size: row.size as 'Small' | 'Medium',
    flavor: row.flavor,
    quantity: row.quantity,
    costPrice: row.cost_price,
    purchaseDate: row.purchase_date,
    updatedAt: row.updated_at
  };
};

export const transformBoxStockFromDB = (row: BoxStockRow): BoxStock => {
  return {
    id: row.id,
    size: row.size as 'Small' | 'Medium',
    quantity: row.quantity,
    costPrice: row.cost_price,
    purchaseDate: row.purchase_date,
    updatedAt: row.updated_at
  };
};

export const transformTransactionFromDB = (row: TransactionRow): Transaction => {
  return {
    id: row.id,
    date: row.date,
    pizzaId: row.pizza_id,
    size: row.size as 'Small' | 'Medium',
    flavor: row.flavor,
    quantity: row.quantity,
    state: row.state as 'Frozen Food' | 'Matang',
    includeBox: row.include_box,
    sellingPrice: row.selling_price,
    totalPrice: row.total_price,
    customerName: row.customer_name,
    notes: row.notes,
    transactionNumber: row.transaction_number
  };
};

export const transformExpenseFromDB = (row: ExpenseRow): Expense => {
  return {
    id: row.id,
    category: row.category as 'Belanja Bahan' | 'Gaji Pemilik' | 'Iuran' | 'Maintenance' | 'Marketing' | 'Upah Karyawan' | 'Lainnya',
    date: row.date,
    amount: row.amount,
    description: row.description,
    createdAt: row.created_at
  };
};

export const transformCustomerFromDB = (row: CustomerRow) => {
  return {
    id: row.id,
    name: row.name,
    purchases: row.purchases,
    lastPurchase: row.last_purchase
  };
};

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

// Functions to transform from app to DB format
export const transformPizzaStockToDB = (stock: Omit<PizzaStock, 'id' | 'updatedAt'>): PizzaStockInsert => {
  return {
    size: stock.size,
    flavor: stock.flavor,
    quantity: stock.quantity,
    cost_price: stock.costPrice,
    purchase_date: stock.purchaseDate
  };
};

export const transformBoxStockToDB = (stock: Omit<BoxStock, 'id' | 'updatedAt'>): BoxStockInsert => {
  return {
    size: stock.size,
    quantity: stock.quantity,
    cost_price: stock.costPrice,
    purchase_date: stock.purchaseDate
  };
};

export const transformTransactionToDB = (transaction: Omit<Transaction, 'id'>): TransactionInsert => {
  return {
    date: transaction.date,
    pizza_id: transaction.pizzaId,
    size: transaction.size,
    flavor: transaction.flavor,
    quantity: transaction.quantity,
    state: transaction.state,
    include_box: transaction.includeBox,
    selling_price: transaction.sellingPrice,
    total_price: transaction.totalPrice,
    customer_name: transaction.customerName,
    notes: transaction.notes,
    transaction_number: transaction.transactionNumber
  };
};

export const transformExpenseToDB = (expense: Omit<Expense, 'id' | 'createdAt'>): ExpenseInsert => {
  return {
    category: expense.category,
    date: expense.date,
    amount: expense.amount,
    description: expense.description
  };
};
