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

export const fetchDashboardData = async () => {
  try {
    const stockItemsPromise = fetchStockItems();
    const transactionsPromise = fetchTransactions();
    const customersPromise = fetchCustomers();
    
    const [stockItems, transactions, customers] = await Promise.all([
      stockItemsPromise,
      transactionsPromise,
      customersPromise
    ]);
    
    return {
      stockItems,
      transactions,
      customers
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      stockItems: [],
      transactions: [],
      customers: []
    };
  }
};

export const fetchCashSummary = async (start?: string, end?: string) => {
  try {
    let query = supabase
      .from('transactions')
      .select('*');
    
    if (start) {
      query = query.gte('date', start);
    }
    
    if (end) {
      query = query.lte('date', end);
    }
    
    const { data: transactions, error: transactionsError } = await query;
    
    if (transactionsError) {
      console.error("Error fetching transactions for cash summary:", transactionsError);
      return { 
        income: 0,
        expenses: 0,
        balance: 0,
        transactions: []
      };
    }
    
    let expensesQuery = supabase
      .from('expenses')
      .select('*');
    
    if (start) {
      expensesQuery = expensesQuery.gte('date', start);
    }
    
    if (end) {
      expensesQuery = expensesQuery.lte('date', end);
    }
    
    const { data: expenses, error: expensesError } = await expensesQuery;
    
    if (expensesError) {
      console.error("Error fetching expenses for cash summary:", expensesError);
      return { 
        income: 0,
        expenses: 0,
        balance: 0,
        transactions: []
      };
    }
    
    const income = transactions.reduce((sum, t) => sum + (t.total_price || 0), 0);
    
    const expensesTotal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const balance = income - expensesTotal;
    
    return {
      income,
      expenses: expensesTotal,
      balance,
      transactions,
      expensesList: expenses
    };
  } catch (error) {
    console.error("Error fetching cash summary:", error);
    return { 
      income: 0,
      expenses: 0,
      balance: 0,
      transactions: [],
      expensesList: []
    };
  }
};

export const deleteExpense = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting expense:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting expense:", error);
    return false;
  }
};

export const getCurrentMonthTotalExpenses = async (): Promise<number> => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    
    const { data, error } = await supabase
      .from('expenses')
      .select('amount')
      .gte('date', firstDayOfMonth)
      .lte('date', lastDayOfMonth);

    if (error) {
      console.error("Error fetching current month expenses:", error);
      return 0;
    }
    
    return data.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  } catch (error) {
    console.error("Error fetching current month expenses:", error);
    return 0;
  }
};

export const updatePizzaStockCostPrice = async (id: string, newPrice: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pizza_stock')
      .update({ cost_price: newPrice, updated_at: new Date().toISOString() })
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
      .update({ cost_price: newPrice, updated_at: new Date().toISOString() })
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
