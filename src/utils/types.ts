
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
  updatedAt: string;
}

export interface BoxStock {
  id: string;
  size: 'Small' | 'Medium';
  quantity: number;
  purchaseDate: string;
  costPrice: number;
  updatedAt: string;
}

export interface PizzaSaleItem {
  size: 'Small' | 'Medium';
  flavor: string;
  quantity: number;
  state: 'Mentah' | 'Matang';
  includeBox: boolean;
  sellingPrice: number;
  totalPrice: number;
  pizzaStockId?: string;
  boxStockId?: string;
}

// Tipe data untuk transaksi penjualan
export interface Transaction {
  id: string;
  date: string;
  pizzaId: string;
  size: 'Small' | 'Medium';
  flavor: string;
  quantity: number;
  state: 'Mentah' | 'Matang';
  includeBox: boolean;
  sellingPrice: number;
  totalPrice: number;
  customerName?: string;
  notes?: string;
  transactionNumber?: string;
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

// New type for expense categories
export type ExpenseCategory = 
  | 'Belanja Bahan' 
  | 'Gaji Pemilik' 
  | 'Iuran' 
  | 'Maintenance' 
  | 'Marketing' 
  | 'Upah Karyawan'
  | 'Lainnya';

// New interface for expenses
export interface Expense {
  id: string;
  category: ExpenseCategory;
  date: string;
  amount: number;
  description: string;
  createdAt: string;
}

// New interface for cash summary
export interface CashSummary {
  period: string;
  income: number;
  expense: number;
  balance: number;
}
