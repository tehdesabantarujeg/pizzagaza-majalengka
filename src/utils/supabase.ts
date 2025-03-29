import { createClient } from '@supabase/supabase-js';
import { mapDbToPizzaStock, mapDbToBoxStock, mapDbToTransaction, mapDbToExpense } from './dataMappers';
import { PizzaStock, BoxStock, Transaction, Expense } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetches all pizza stock items from the database.
 */
export const fetchStockItems = async (): Promise<PizzaStock[]> => {
  try {
    const { data, error } = await supabase
      .from('pizza_stock')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching pizza stock:", error);
      return [];
    }
    
    return data.map(mapDbToPizzaStock);
  } catch (error) {
    console.error("Error fetching pizza stock:", error);
    return [];
  }
};

/**
 * Fetches all box stock items from the database.
 */
export const fetchBoxStock = async (): Promise<BoxStock[]> => {
  try {
    const { data, error } = await supabase
      .from('box_stock')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching box stock:", error);
      return [];
    }
    
    return data.map(mapDbToBoxStock);
  } catch (error) {
    console.error("Error fetching box stock:", error);
    return [];
  }
};

/**
 * Fetches all transactions from the database.
 */
export const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
    
    return data.map(mapDbToTransaction);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

/**
 * Fetches all expenses from the database.
 */
export const fetchExpenses = async (): Promise<Expense[]> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error("Error fetching expenses:", error);
      return [];
    }
    
    return data.map(mapDbToExpense);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
};

/**
 * Fetches dashboard data including transactions, stock items, and customers.
 */
export const fetchDashboardData = async () => {
  try {
    const [
      { data: transactions, error: transactionsError },
      { data: stockItems, error: stockItemsError },
      { data: customers, error: customersError }
    ] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false }),
      supabase
        .from('pizza_stock')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('users')
        .select('*')
    ]);
    
    if (transactionsError) console.error("Error fetching transactions:", transactionsError);
    if (stockItemsError) console.error("Error fetching stock items:", stockItemsError);
    if (customersError) console.error("Error fetching customers:", customersError);
    
    return {
      transactions: transactions ? transactions.map(mapDbToTransaction) : [],
      stockItems: stockItems ? stockItems.map(mapDbToPizzaStock) : [],
      customers: customers || []
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      transactions: [],
      stockItems: [],
      customers: []
    };
  }
};

/**
 * Inserts a new pizza stock item into the database.
 * @param stockItem The stock item to add.
 */
export const addStockItem = async (stockItem: Omit<PizzaStock, 'id' | 'updatedAt'>): Promise<PizzaStock | null> => {
  try {
    const { data, error } = await supabase
      .from('pizza_stock')
      .insert([stockItem])
      .select('*')
      .single();
    
    if (error) {
      console.error("Error adding pizza stock:", error);
      return null;
    }
    
    return mapDbToPizzaStock(data);
  } catch (error) {
    console.error("Error adding pizza stock:", error);
    return null;
  }
};

/**
 * Inserts multiple pizza stock items into the database.
 * @param stocks The array of stock items to add.
 */
export const addMultiplePizzaStock = async (stocks: Omit<PizzaStock, 'id' | 'updatedAt'>[]): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('pizza_stock')
      .insert(stocks);
    
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

/**
 * Updates an existing pizza stock item in the database.
 * @param stockItem The stock item to update.
 */
export const updateStockItem = async (stockItem: PizzaStock): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('pizza_stock')
      .update(stockItem)
      .eq('id', stockItem.id);
    
    if (error) {
      console.error("Error updating pizza stock:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating pizza stock:", error);
    return false;
  }
};

/**
 * Adds a new box stock item to the database.
 * @param stockItem The box stock item to add.
 */
export const addBoxStock = async (stockItem: Omit<BoxStock, 'id' | 'updatedAt'>): Promise<BoxStock | null> => {
  try {
    const { data, error } = await supabase
      .from('box_stock')
      .insert([stockItem])
      .select('*')
      .single();
    
    if (error) {
      console.error("Error adding box stock:", error);
      return null;
    }
    
    return mapDbToBoxStock(data);
  } catch (error) {
    console.error("Error adding box stock:", error);
    return null;
  }
};

/**
 * Updates an existing box stock item in the database.
 * @param stockItem The box stock item to update.
 */
export const updateBoxStock = async (stockItem: BoxStock): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('box_stock')
      .update(stockItem)
      .eq('id', stockItem.id);
    
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

/**
 * Adds a new transaction to the database.
 * @param transaction The transaction to add.
 */
export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select('*')
      .single();
    
    if (error) {
      console.error("Error adding transaction:", error);
      return null;
    }
    
    return mapDbToTransaction(data);
  } catch (error) {
    console.error("Error adding transaction:", error);
    return null;
  }
};

/**
 * Updates an existing transaction in the database.
 * @param transaction The transaction to update.
 */
export const updateTransaction = async (transaction: Transaction): Promise<boolean> => {
  try {
    const { data, error } = await supabase
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

/**
 * Deletes a transaction from the database.
 * @param transactionId The ID of the transaction to delete.
 */
export const deleteTransaction = async (transactionId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
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

/**
 * Adds a new expense to the database.
 * @param expense The expense to add.
 */
export const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense | null> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select('*')
      .single();
    
    if (error) {
      console.error("Error adding expense:", error);
      return null;
    }
    
    return mapDbToExpense(data);
  } catch (error) {
    console.error("Error adding expense:", error);
    return null;
  }
};

/**
 * Updates an existing expense in the database.
 */
export const updateExpense = async (expense: Expense): Promise<boolean> => {
  try {
    const { data, error } = await supabase
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

/**
 * Deletes an expense from the database.
 * @param expenseId The ID of the expense to delete.
 */
export const deleteExpense = async (expenseId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);
    
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

// Function to fetch the count of transactions for generating transaction number
export const fetchTransactionCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error("Error fetching transaction count:", error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error("Error fetching transaction count:", error);
    return 0;
  }
};
