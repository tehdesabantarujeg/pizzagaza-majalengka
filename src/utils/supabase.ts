
import { createClient } from '@supabase/supabase-js';
import { PizzaStock, BoxStock, Transaction, Customer } from './types';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Konfigurasi tabel Supabase
export const setupSupabaseTables = async () => {
  // Konfigurasi tabel pizza_stock
  const { error: stockError } = await supabase.rpc('create_table_if_not_exists', {
    table_name: 'pizza_stock',
    columns: `
      id uuid primary key default uuid_generate_v4(),
      size text not null,
      flavor text not null,
      quantity integer not null,
      purchase_date timestamp with time zone default now(),
      cost_price integer not null,
      updated_at timestamp with time zone default now()
    `
  });
  
  if (stockError) console.error('Error creating pizza_stock table:', stockError);

  // Konfigurasi tabel box_stock
  const { error: boxStockError } = await supabase.rpc('create_table_if_not_exists', {
    table_name: 'box_stock',
    columns: `
      id uuid primary key default uuid_generate_v4(),
      size text not null,
      quantity integer not null,
      purchase_date timestamp with time zone default now(),
      cost_price integer not null,
      updated_at timestamp with time zone default now()
    `
  });
  
  if (boxStockError) console.error('Error creating box_stock table:', boxStockError);

  // Konfigurasi tabel transactions
  const { error: transactionError } = await supabase.rpc('create_table_if_not_exists', {
    table_name: 'transactions',
    columns: `
      id uuid primary key default uuid_generate_v4(),
      date timestamp with time zone default now(),
      pizza_id uuid references pizza_stock(id),
      size text not null,
      flavor text not null,
      quantity integer not null,
      state text not null,
      include_box boolean default false,
      selling_price integer not null,
      total_price integer not null,
      customer_name text,
      notes text
    `
  });
  
  if (transactionError) console.error('Error creating transactions table:', transactionError);

  // Konfigurasi tabel customers
  const { error: customerError } = await supabase.rpc('create_table_if_not_exists', {
    table_name: 'customers',
    columns: `
      id uuid primary key default uuid_generate_v4(),
      name text not null unique,
      purchases integer default 0,
      last_purchase timestamp with time zone default now()
    `
  });
  
  if (customerError) console.error('Error creating customers table:', customerError);
};

// API Pizza Stock
export const fetchStockItems = async (): Promise<PizzaStock[]> => {
  const { data, error } = await supabase
    .from('pizza_stock')
    .select('*')
    .order('updated_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching stock:', error);
    return [];
  }
  
  return data || [];
};

export const addStockItem = async (stockItem: Omit<PizzaStock, 'id' | 'updatedAt'>): Promise<PizzaStock | null> => {
  const { data, error } = await supabase
    .from('pizza_stock')
    .insert([
      { 
        ...stockItem, 
        updated_at: new Date().toISOString() 
      }
    ])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding stock:', error);
    return null;
  }
  
  return data;
};

export const updateStockItem = async (stockItem: PizzaStock): Promise<boolean> => {
  const { error } = await supabase
    .from('pizza_stock')
    .update({ 
      ...stockItem, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', stockItem.id);
    
  if (error) {
    console.error('Error updating stock:', error);
    return false;
  }
  
  return true;
};

// API Box Stock
export const fetchBoxStock = async (): Promise<BoxStock[]> => {
  const { data, error } = await supabase
    .from('box_stock')
    .select('*')
    .order('updated_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching box stock:', error);
    return [];
  }
  
  return data || [];
};

export const addBoxStock = async (boxStock: Omit<BoxStock, 'id' | 'updatedAt'>): Promise<BoxStock | null> => {
  const { data, error } = await supabase
    .from('box_stock')
    .insert([
      { 
        ...boxStock, 
        updated_at: new Date().toISOString() 
      }
    ])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding box stock:', error);
    return null;
  }
  
  return data;
};

export const updateBoxStock = async (boxStock: BoxStock): Promise<boolean> => {
  const { error } = await supabase
    .from('box_stock')
    .update({ 
      ...boxStock, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', boxStock.id);
    
  if (error) {
    console.error('Error updating box stock:', error);
    return false;
  }
  
  return true;
};

// API Transaksi
export const fetchTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });
    
  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  
  return data || [];
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding transaction:', error);
    return null;
  }
  
  return data;
};

// API Pelanggan
export const fetchCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('last_purchase', { ascending: false });
    
  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  
  return data || [];
};

export const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer | null> => {
  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding customer:', error);
    return null;
  }
  
  return data;
};

export const updateCustomer = async (customer: Customer): Promise<boolean> => {
  const { error } = await supabase
    .from('customers')
    .update(customer)
    .eq('id', customer.id);
    
  if (error) {
    console.error('Error updating customer:', error);
    return false;
  }
  
  return true;
};

// API Laporan
export const fetchSalesReportData = async (startDate: string, endDate: string): Promise<any> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('date, selling_price, total_price, quantity')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });
    
  if (error) {
    console.error('Error fetching report data:', error);
    return [];
  }
  
  return data || [];
};
