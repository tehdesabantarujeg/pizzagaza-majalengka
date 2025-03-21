
import { createClient } from '@supabase/supabase-js';
import { PizzaStock, BoxStock, Transaction, Customer } from './types';
import { supabase } from '@/integrations/supabase/client';

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
    .select('date, selling_price, total_price, quantity, flavor, size, state, include_box')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });
    
  if (error) {
    console.error('Error fetching report data:', error);
    return [];
  }
  
  return data || [];
};

export const fetchStockSummary = async (): Promise<any> => {
  const { data, error } = await supabase
    .from('pizza_stock')
    .select('flavor, size, quantity');
    
  if (error) {
    console.error('Error fetching stock summary:', error);
    return [];
  }
  
  return data || [];
};

export const fetchDashboardData = async (): Promise<any> => {
  const [transactions, stockItems, customers] = await Promise.all([
    fetchTransactions(),
    fetchStockItems(),
    fetchCustomers()
  ]);
  
  return {
    transactions,
    stockItems,
    customers
  };
};
