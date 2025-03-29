import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
}

if (!supabaseKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined');
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export const fetchStockItems = async () => {
  try {
    const { data, error } = await supabase
      .from('pizza_stock')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching stock items:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching stock items:", error);
    return [];
  }
};

export const fetchBoxStock = async () => {
  try {
    const { data, error } = await supabase
      .from('box_stock')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching box stock:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching box stock:", error);
    return [];
  }
};

export const fetchTransactions = async () => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

export const fetchExpenses = async () => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error("Error fetching expenses:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
};

export const fetchCustomers = async () => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching customers:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
};

export const addTransaction = async (transaction: any): Promise<any> => {
  try {
    // Map transaction to database schema
    const { mapTransactionToDatabase } = await import('@/integrations/supabase/database.types');
    const dbTransaction = mapTransactionToDatabase(transaction);
    
    const { data, error } = await supabase
      .from('transactions')
      .insert(dbTransaction)
      .select()
      .single();
    
    if (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }
};

export const updateTransaction = async (transaction: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .update(transaction)
      .eq('id', transaction.id);

    if (error) {
      console.error("Error updating transaction:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating transaction:", error);
    return false;
  }
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting transaction:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return false;
  }
};

export const addStockItem = async (item: any): Promise<boolean> => {
  try {
    // Map stock item to database schema
    const { mapPizzaStockToDatabase } = await import('@/integrations/supabase/database.types');
    const dbItem = mapPizzaStockToDatabase(item);
    
    const { error } = await supabase
      .from('pizza_stock')
      .insert(dbItem);
    
    if (error) {
      console.error("Error adding stock item:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error adding stock item:", error);
    return false;
  }
};

export const updateStockItem = async (item: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pizza_stock')
      .update(item)
      .eq('id', item.id);

    if (error) {
      console.error("Error updating stock item:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating stock item:", error);
    return false;
  }
};

export const addMultiplePizzaStock = async (items: any[]): Promise<boolean> => {
  try {
    // Map each item to database schema
    const { mapPizzaStockToDatabase } = await import('@/integrations/supabase/database.types');
    const dbItems = items.map(item => mapPizzaStockToDatabase(item));
    
    const { error } = await supabase
      .from('pizza_stock')
      .insert(dbItems);
    
    if (error) {
      console.error("Error adding multiple pizza stock:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error adding multiple pizza stock:", error);
    return false;
  }
};

export const addBoxStock = async (item: any): Promise<boolean> => {
  try {
    // Map box stock to database schema
    const { mapBoxStockToDatabase } = await import('@/integrations/supabase/database.types');
    const dbItem = mapBoxStockToDatabase(item);
    
    const { error } = await supabase
      .from('box_stock')
      .insert(dbItem);
    
    if (error) {
      console.error("Error adding box stock:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error adding box stock:", error);
    return false;
  }
};

export const updateBoxStock = async (item: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('box_stock')
      .update(item)
      .eq('id', item.id);

    if (error) {
      console.error("Error updating box stock:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating box stock:", error);
    return false;
  }
};

export const addCustomer = async (customer: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('customers')
      .insert(customer);

    if (error) {
      console.error("Error adding customer:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error adding customer:", error);
    return false;
  }
};

export const updateCustomer = async (customer: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', customer.id);

    if (error) {
      console.error("Error updating customer:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating customer:", error);
    return false;
  }
};

export const addExpense = async (expense: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .insert(expense);

    if (error) {
      console.error("Error adding expense:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error adding expense:", error);
    return false;
  }
};

export const updateExpense = async (expense: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', expense.id);

    if (error) {
      console.error("Error updating expense:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating expense:", error);
    return false;
  }
};
