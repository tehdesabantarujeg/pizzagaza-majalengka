// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wbnpwldfcspeoiwofbiq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndibnB3bGRmY3NwZW9pd29mYmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNTYyMDksImV4cCI6MjA1ODczMjIwOX0.yZ-SSI5m-QKgyBPAMLIpkn13MvGN8HszZN-PDusRh1s";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export const fetchStockItems = async () => {
  try {
    const { data, error } = await supabase
      .from('pizza_stock')
      .select('*')
      .order('flavor', { ascending: true });
    
    if (error) {
      console.error('Error fetching stock items:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchStockItems:', error);
    return [];
  }
};

export const fetchBoxStock = async () => {
  try {
    const { data, error } = await supabase
      .from('box_stock')
      .select('*')
      .order('size', { ascending: true });
    
    if (error) {
      console.error('Error fetching box stock:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchBoxStock:', error);
    return [];
  }
};

export const fetchDashboardData = async () => {
  try {
    // Fetch multiple datasets in parallel
    const [stockItems, boxItems, transactions, expenses, customers] = await Promise.all([
      fetchStockItems(),
      fetchBoxStock(),
      fetchTransactions(),
      fetchExpenses(),
      fetchCustomers(),
    ]);
    
    return {
      stockItems,
      boxItems,
      transactions,
      expenses,
      customers
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      stockItems: [],
      boxItems: [],
      transactions: [],
      expenses: [],
      customers: []
    };
  }
};

export const fetchTransactions = async () => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchTransactions:', error);
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
      console.error('Error fetching expenses:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchExpenses:', error);
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
      console.error('Error fetching customers:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchCustomers:', error);
    return [];
  }
};

export const fetchCashSummary = async () => {
  try {
    const [transactions, expenses] = await Promise.all([
      fetchTransactions(),
      fetchExpenses()
    ]);
    
    // Calculate totals
    const totalIncome = transactions.reduce((sum, t) => sum + Number(t.total_price), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    
    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      transactions,
      expenses
    };
  } catch (error) {
    console.error('Error fetching cash summary:', error);
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      transactions: [],
      expenses: []
    };
  }
};

export const getCurrentMonthTotalExpenses = async () => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const { data, error } = await supabase
      .from('expenses')
      .select('amount')
      .gte('date', startOfMonth.toISOString())
      .lte('date', endOfMonth.toISOString());
    
    if (error) {
      console.error('Error fetching current month expenses:', error);
      throw error;
    }
    
    return data?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
  } catch (error) {
    console.error('Error in getCurrentMonthTotalExpenses:', error);
    return 0;
  }
};

export const updateStockItem = async (stockItem: { id: string; quantity: number }): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pizza_stock')
      .update({ quantity: stockItem.quantity })
      .eq('id', stockItem.id);

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

export const updateBoxStock = async (boxStock: { id: string; quantity: number }): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('box_stock')
      .update({ quantity: boxStock.quantity })
      .eq('id', boxStock.id);

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

export const addStockItem = async (newStock: Omit<PizzaStock, 'id' | 'updatedAt'>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('pizza_stock')
      .insert([newStock]);

    if (error) {
      console.error("Error adding stock item:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error adding stock item:", error);
    throw error;
  }
};

export const addMultiplePizzaStock = async (newStocks: Omit<PizzaStock, 'id' | 'updatedAt'>[]): Promise<void> => {
  try {
    const { error } = await supabase
      .from('pizza_stock')
      .insert(newStocks);

    if (error) {
      console.error("Error adding multiple pizza stock:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error adding multiple pizza stock:", error);
    throw error;
  }
};

export const addBoxStock = async (newStock: Omit<BoxStock, 'id' | 'updatedAt'>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('box_stock')
      .insert([newStock]);

    if (error) {
      console.error("Error adding box stock:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error adding box stock:", error);
    throw error;
  }
};

export const updatePizzaStockCostPrice = async (id: string, newPrice: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pizza_stock')
      .update({ costPrice: newPrice })
      .eq('id', id);

    if (error) {
      console.error("Error updating pizza stock cost price:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating pizza stock cost price:", error);
    return false;
  }
};

export const updateBoxStockCostPrice = async (id: string, newPrice: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('box_stock')
      .update({ costPrice: newPrice })
      .eq('id', id);

    if (error) {
      console.error("Error updating box stock cost price:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating box stock cost price:", error);
    return false;
  }
};

export const deleteTransaction = async (transactionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

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

export const updateTransaction = async (transaction: Transaction): Promise<boolean> => {
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

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'updatedAt'>): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select('id');

    if (error) {
      console.error("Error adding transaction:", error);
      return null;
    }

    // Assuming the insert returns the ID of the new transaction
    return data && data.length > 0 ? data[0].id : null;
  } catch (error) {
    console.error("Error adding transaction:", error);
    return null;
  }
};

import { PizzaStock, BoxStock, Transaction } from '@/utils/types';
