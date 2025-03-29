export interface Pizza {
  id?: string;
  size: 'Small' | 'Medium';
  flavor: string;
  quantity: number;
  purchaseDate?: string;
  costPrice?: number; // dalam Rupiah
}

export interface PizzaStock {
  id: string;
  size: 'Small' | 'Medium';
  flavor: string;
  quantity: number;
  purchaseDate: string;
  costPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface BoxStock {
  id: string;
  size: 'Small' | 'Medium';
  quantity: number;
  purchaseDate: string;
  costPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface PizzaSaleItem {
  size: 'Small' | 'Medium';
  flavor: string;
  quantity: number;
  state: 'Frozen Food' | 'Matang';
  includeBox: boolean;
  sellingPrice: number;
  totalPrice: number;
  pizzaStockId?: string;
  date?: string; // Date field for the transaction
}

export interface Transaction {
  id: string;
  date: string;
  pizzaId?: string | null;
  size: 'Small' | 'Medium';
  flavor: string;
  quantity: number;
  state: 'Frozen Food' | 'Matang';
  includeBox: boolean;
  sellingPrice: number;
  totalPrice: number;
  customerName?: string;
  notes?: string;
  transactionNumber?: string;
  createdAt: string;
}

export interface MultiItemTransaction {
  id: string;
  date: string;
  items: PizzaSaleItem[];
  totalPrice: number;
  customerName?: string;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'kasir';
  name: string;
  username: string;
  password: string;
}

export interface Customer {
  id: string;
  name: string;
  purchases: number;
  lastPurchase: string;
}

export interface ReportData {
  date: string;
  sales: number;
  profit: number;
}

export type ExpenseCategory = 
  | 'Belanja Bahan' 
  | 'Gaji Pemilik' 
  | 'Iuran' 
  | 'Maintenance' 
  | 'Marketing' 
  | 'Upah Karyawan'
  | 'Lainnya';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  date: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface CashSummary {
  period: string;
  income: number;
  expense: number;
  balance: number;
}

export type Database = {
  public: {
    Tables: {
      pizza_stock: {
        Row: PizzaStock;
        Insert: Omit<PizzaStock, 'id' | 'updatedAt'>;
        Update: Partial<PizzaStock>;
      };
      box_stock: {
        Row: BoxStock;
        Insert: Omit<BoxStock, 'id' | 'updatedAt'>;
        Update: Partial<BoxStock>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id'>;
        Update: Partial<Transaction>;
      };
      expenses: {
        Row: Expense;
        Insert: Omit<Expense, 'id' | 'createdAt'>;
        Update: Partial<Expense>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'id'>;
        Update: Partial<Customer>;
      };
    };
  };
};
