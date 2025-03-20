
export interface Pizza {
  id?: string;
  size: 'Small' | 'Medium';
  flavor: string;
  quantity: number;
  purchaseDate?: string;
  costPrice?: number; // in Rupiah
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

export interface Transaction {
  id: string;
  date: string;
  pizzaId: string;
  size: 'Small' | 'Medium';
  flavor: string;
  quantity: number;
  state: 'Raw' | 'Cooked'; // Mentah or Matang
  sellingPrice: number;
  totalPrice: number;
  customerName?: string;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'cashier';
  name: string;
}

export interface ReportData {
  date: string;
  sales: number;
  profit: number;
}
