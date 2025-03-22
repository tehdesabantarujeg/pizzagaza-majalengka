
import { createClient } from '@supabase/supabase-js';
import { PizzaStock, BoxStock, Transaction, Customer } from './types';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatTransactionNumber } from '@/utils/constants';

// Function to setup tables (placeholder since tables are already created in Supabase)
export const setupSupabaseTables = async (): Promise<void> => {
  // Tables are already created via SQL migrations
  return Promise.resolve();
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
  
  // Map database columns to our TypeScript model
  return (data || []).map(item => ({
    id: item.id,
    size: item.size as 'Small' | 'Medium',
    flavor: item.flavor,
    quantity: item.quantity,
    purchaseDate: item.purchase_date || new Date().toISOString(),
    costPrice: item.cost_price,
    updatedAt: item.updated_at || new Date().toISOString()
  }));
};

export const addStockItem = async (stockItem: Omit<PizzaStock, 'id' | 'updatedAt'>): Promise<PizzaStock | null> => {
  // Convert our model to database columns
  const dbItem = {
    size: stockItem.size,
    flavor: stockItem.flavor,
    quantity: stockItem.quantity,
    purchase_date: stockItem.purchaseDate,
    cost_price: stockItem.costPrice,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('pizza_stock')
    .insert([dbItem])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding stock:', error);
    return null;
  }
  
  // Map back from database to our model
  return {
    id: data.id,
    size: data.size as 'Small' | 'Medium',
    flavor: data.flavor,
    quantity: data.quantity,
    purchaseDate: data.purchase_date || new Date().toISOString(),
    costPrice: data.cost_price,
    updatedAt: data.updated_at || new Date().toISOString()
  };
};

export const updateStockItem = async (stockItem: PizzaStock): Promise<boolean> => {
  // Convert our model to database columns
  const dbItem = {
    size: stockItem.size,
    flavor: stockItem.flavor,
    quantity: stockItem.quantity,
    purchase_date: stockItem.purchaseDate,
    cost_price: stockItem.costPrice,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('pizza_stock')
    .update(dbItem)
    .eq('id', stockItem.id);
    
  if (error) {
    console.error('Error updating stock:', error);
    return false;
  }
  
  return true;
};

// Add the missing updatePizzaStock function
export const updatePizzaStock = async (stockItem: PizzaStock): Promise<boolean> => {
  return updateStockItem(stockItem);
};

// Add the missing deletePizzaStock function
export const deletePizzaStock = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('pizza_stock')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting pizza stock:', error);
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
  
  // Map database columns to our TypeScript model
  return (data || []).map(item => ({
    id: item.id,
    size: item.size as 'Small' | 'Medium',
    quantity: item.quantity,
    purchaseDate: item.purchase_date || new Date().toISOString(),
    costPrice: item.cost_price,
    updatedAt: item.updated_at || new Date().toISOString()
  }));
};

export const addBoxStock = async (boxStock: Omit<BoxStock, 'id' | 'updatedAt'>): Promise<BoxStock | null> => {
  // Convert our model to database columns
  const dbItem = {
    size: boxStock.size,
    quantity: boxStock.quantity,
    purchase_date: boxStock.purchaseDate,
    cost_price: boxStock.costPrice,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('box_stock')
    .insert([dbItem])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding box stock:', error);
    return null;
  }
  
  // Map back from database to our model
  return {
    id: data.id,
    size: data.size as 'Small' | 'Medium',
    quantity: data.quantity,
    purchaseDate: data.purchase_date || new Date().toISOString(),
    costPrice: data.cost_price,
    updatedAt: data.updated_at || new Date().toISOString()
  };
};

export const updateBoxStock = async (boxStock: BoxStock): Promise<boolean> => {
  // Convert our model to database columns
  const dbItem = {
    size: boxStock.size,
    quantity: boxStock.quantity,
    purchase_date: boxStock.purchaseDate,
    cost_price: boxStock.costPrice,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('box_stock')
    .update(dbItem)
    .eq('id', boxStock.id);
    
  if (error) {
    console.error('Error updating box stock:', error);
    return false;
  }
  
  return true;
};

// Add the missing deleteBoxStock function
export const deleteBoxStock = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('box_stock')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting box stock:', error);
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
  
  // Map database columns to our TypeScript model
  return (data || []).map(item => ({
    id: item.id,
    date: item.date || new Date().toISOString(),
    pizzaId: item.pizza_id || '',
    size: item.size as 'Small' | 'Medium',
    flavor: item.flavor,
    quantity: item.quantity,
    state: item.state as 'Mentah' | 'Matang',
    includeBox: item.include_box || false,
    sellingPrice: item.selling_price,
    totalPrice: item.total_price,
    customerName: item.customer_name,
    notes: item.notes,
    transactionNumber: item.transaction_number
  }));
};

export const getTransactionCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('Error counting transactions:', error);
    return 0;
  }
  
  return count || 0;
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> => {
  // Get current transaction count for generating transaction number
  const count = await getTransactionCount();
  const transactionNumber = formatTransactionNumber(count + 1);
  
  // Convert our model to database columns
  const dbItem = {
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
    transaction_number: transactionNumber
  };

  const { data, error } = await supabase
    .from('transactions')
    .insert([dbItem])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding transaction:', error);
    return null;
  }
  
  // Map back from database to our model
  return {
    id: data.id,
    date: data.date || new Date().toISOString(),
    pizzaId: data.pizza_id || '',
    size: data.size as 'Small' | 'Medium',
    flavor: data.flavor,
    quantity: data.quantity,
    state: data.state as 'Mentah' | 'Matang',
    includeBox: data.include_box || false,
    sellingPrice: data.selling_price,
    totalPrice: data.total_price,
    customerName: data.customer_name,
    notes: data.notes,
    transactionNumber: data.transaction_number
  };
};

// Function to reprint a transaction receipt
export const reprintTransactionReceipt = async (transactionId: string): Promise<void> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId);
    
  if (error || !data || data.length === 0) {
    console.error('Error fetching transaction for reprint:', error);
    return;
  }
  
  // Map database columns to our TypeScript model
  const transactions = data.map(item => ({
    id: item.id,
    date: item.date || new Date().toISOString(),
    pizzaId: item.pizza_id || '',
    size: item.size as 'Small' | 'Medium',
    flavor: item.flavor,
    quantity: item.quantity,
    state: item.state as 'Mentah' | 'Matang',
    includeBox: item.include_box || false,
    sellingPrice: item.selling_price,
    totalPrice: item.total_price,
    customerName: item.customer_name,
    notes: item.notes,
    transactionNumber: item.transaction_number
  }));
  
  // Print the receipt
  if (transactions.length > 0) {
    import('./constants').then(({ printReceipt }) => {
      printReceipt(transactions);
    });
  }
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
  
  // Map database columns to our TypeScript model
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    purchases: item.purchases || 0,
    lastPurchase: item.last_purchase || new Date().toISOString()
  }));
};

export const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer | null> => {
  // Convert our model to database columns
  const dbItem = {
    name: customer.name,
    purchases: customer.purchases,
    last_purchase: customer.lastPurchase
  };

  const { data, error } = await supabase
    .from('customers')
    .insert([dbItem])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding customer:', error);
    return null;
  }
  
  // Map back from database to our model
  return {
    id: data.id,
    name: data.name,
    purchases: data.purchases || 0,
    lastPurchase: data.last_purchase || new Date().toISOString()
  };
};

export const updateCustomer = async (customer: Customer): Promise<boolean> => {
  // Convert our model to database columns
  const dbItem = {
    name: customer.name,
    purchases: customer.purchases,
    last_purchase: customer.lastPurchase
  };

  const { error } = await supabase
    .from('customers')
    .update(dbItem)
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

export const fetchStockSummary = async (): Promise<any[]> => {
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

// Add the new functions to update cost price for pizza and box stock
export const updatePizzaStockCostPrice = async (id: string, costPrice: number): Promise<void> => {
  const { error } = await supabase
    .from('pizza_stock')
    .update({ cost_price: costPrice })
    .eq('id', id);
    
  if (error) {
    console.error('Error updating pizza stock cost price:', error);
    throw error;
  }
};

export const updateBoxStockCostPrice = async (id: string, costPrice: number): Promise<void> => {
  const { error } = await supabase
    .from('box_stock')
    .update({ cost_price: costPrice })
    .eq('id', id);
    
  if (error) {
    console.error('Error updating box stock cost price:', error);
    throw error;
  }
};
