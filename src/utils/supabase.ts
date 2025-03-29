import { supabase } from "@/integrations/supabase/client";
import { PizzaStock, BoxStock, Transaction, Expense } from "./types";

// Function to fetch all pizza stock items
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

    // Transform data to match PizzaStock type
    return data?.map(item => ({
      id: item.id,
      size: item.size as 'Small' | 'Medium',
      flavor: item.flavor,
      quantity: item.quantity,
      purchaseDate: item.purchase_date,
      costPrice: item.cost_price,
      updatedAt: item.updated_at
    })) || [];
  } catch (error) {
    console.error("Error fetching pizza stock:", error);
    return [];
  }
};

// Function to fetch all box stock items
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

    // Transform data to match BoxStock type
    return data?.map(item => ({
      id: item.id,
      size: item.size as 'Small' | 'Medium',
      quantity: item.quantity,
      purchaseDate: item.purchase_date,
      costPrice: item.cost_price,
      updatedAt: item.updated_at
    })) || [];
  } catch (error) {
    console.error("Error fetching box stock:", error);
    return [];
  }
};

// Function to fetch dashboard data
export const fetchDashboardData = async () => {
  try {
    // Fetch all necessary data for the dashboard in parallel
    const [stockItemsData, boxStockData, transactionsData, customersData] = await Promise.all([
      fetchStockItems(),
      fetchBoxStock(),
      fetchTransactions(),
      supabase.from('customers').select('*')
    ]);

    return {
      stockItems: stockItemsData,
      boxItems: boxStockData,
      transactions: transactionsData,
      customers: customersData.data || []
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      stockItems: [],
      boxItems: [],
      transactions: [],
      customers: []
    };
  }
};

export const addStockItem = async (newStock: Omit<PizzaStock, 'id' | 'updatedAt'>): Promise<boolean> => {
  try {
    // First, check if we already have this flavor and size in stock
    const { data: existingItems } = await supabase
      .from('pizza_stock')
      .select('*')
      .eq('flavor', newStock.flavor)
      .eq('size', newStock.size);
    
    if (existingItems && existingItems.length > 0) {
      // If exists, update the quantity instead of creating a new record
      const existingItem = existingItems[0];
      const { error } = await supabase
        .from('pizza_stock')
        .update({ 
          quantity: existingItem.quantity + newStock.quantity,
          updatedAt: new Date().toISOString()
        })
        .eq('id', existingItem.id);
      
      return !error;
    } else {
      // If doesn't exist, create a new record
      const { error } = await supabase
        .from('pizza_stock')
        .insert({
          ...newStock,
          updatedAt: new Date().toISOString()
        });
      
      return !error;
    }
  } catch (error) {
    console.error('Error adding stock item:', error);
    return false;
  }
};

export const addMultiplePizzaStock = async (
  pizzaStocks: Omit<PizzaStock, 'id' | 'updatedAt'>[]
): Promise<boolean> => {
  try {
    for (const stock of pizzaStocks) {
      // Check if the stock already exists
      const { data: existingItems } = await supabase
        .from('pizza_stock')
        .select('*')
        .eq('flavor', stock.flavor)
        .eq('size', stock.size);
      
      if (existingItems && existingItems.length > 0) {
        // Update existing stock
        const existingItem = existingItems[0];
        await supabase
          .from('pizza_stock')
          .update({ 
            quantity: existingItem.quantity + stock.quantity,
            updatedAt: new Date().toISOString()
          })
          .eq('id', existingItem.id);
      } else {
        // Create new stock
        await supabase
          .from('pizza_stock')
          .insert({
            ...stock,
            updatedAt: new Date().toISOString()
          });
      }
    }
    return true;
  } catch (error) {
    console.error('Error adding multiple pizza stock:', error);
    return false;
  }
};

export const addBoxStock = async (newStock: Omit<BoxStock, 'id' | 'updatedAt'>): Promise<boolean> => {
  try {
    // First, check if we already have this size in stock
    const { data: existingItems } = await supabase
      .from('box_stock')
      .select('*')
      .eq('size', newStock.size);
    
    if (existingItems && existingItems.length > 0) {
      // If exists, update the quantity instead of creating a new record
      const existingItem = existingItems[0];
      const { error } = await supabase
        .from('box_stock')
        .update({ 
          quantity: existingItem.quantity + newStock.quantity,
          updatedAt: new Date().toISOString()
        })
        .eq('id', existingItem.id);
      
      return !error;
    } else {
      // If doesn't exist, create a new record
      const { error } = await supabase
        .from('box_stock')
        .insert({
          ...newStock,
          updatedAt: new Date().toISOString()
        });
      
      return !error;
    }
  } catch (error) {
    console.error('Error adding box stock:', error);
    return false;
  }
};

// Function to update pizza stock item
export const updateStockItem = async (stockItem: PizzaStock): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pizza_stock')
      .update({ 
        quantity: stockItem.quantity,
        cost_price: stockItem.costPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', stockItem.id);

    return !error;
  } catch (error) {
    console.error('Error updating stock item:', error);
    return false;
  }
};

// Export updateStockItem as updatePizzaStock for backward compatibility
export const updatePizzaStock = updateStockItem;

// Function to update box stock item
export const updateBoxStock = async (boxStock: BoxStock): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('box_stock')
      .update({ 
        quantity: boxStock.quantity,
        cost_price: boxStock.costPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', boxStock.id);

    return !error;
  } catch (error) {
    console.error('Error updating box stock:', error);
    return false;
  }
};

// Function to delete pizza stock item
export const deletePizzaStock = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pizza_stock')
      .delete()
      .eq('id', id);

    return !error;
  } catch (error) {
    console.error('Error deleting pizza stock:', error);
    return false;
  }
};

// Function to delete box stock item
export const deleteBoxStock = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('box_stock')
      .delete()
      .eq('id', id);

    return !error;
  } catch (error) {
    console.error('Error deleting box stock:', error);
    return false;
  }
};

// Function to update pizza stock cost price
export const updatePizzaStockCostPrice = async (id: string, newPrice: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pizza_stock')
      .update({ 
        cost_price: newPrice, 
        updated_at: new Date().toISOString() 
      })
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

// Function to update box stock cost price
export const updateBoxStockCostPrice = async (id: string, newPrice: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('box_stock')
      .update({ 
        cost_price: newPrice, 
        updated_at: new Date().toISOString() 
      })
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

// Function to generate a new transaction number
export const generateTransactionNumber = async (): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const baseTransactionNumber = `PJ${year}${month}${day}`;

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('transaction_number')
      .like('transaction_number', `${baseTransactionNumber}%`)
      .order('transaction_number', { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching last transaction number:", error);
      return baseTransactionNumber + '001';
    }

    if (data && data.length > 0) {
      const lastTransactionNumber = data[0].transaction_number;
      const lastSequence = parseInt(lastTransactionNumber.slice(-3), 10);
      const newSequence = String(lastSequence + 1).padStart(3, '0');
      return baseTransactionNumber + newSequence;
    } else {
      return baseTransactionNumber + '001';
    }
  } catch (error) {
    console.error("Error generating transaction number:", error);
    return baseTransactionNumber + '001';
  }
};

// Function to add a new transaction
export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select('*')
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      return null;
    }

    // Transform data to match Transaction type
    return data ? {
      id: data.id,
      date: data.date,
      pizzaId: data.pizza_id,
      size: data.size as 'Small' | 'Medium',
      flavor: data.flavor,
      quantity: data.quantity,
      state: data.state as 'Frozen Food' | 'Matang',
      includeBox: data.include_box,
      sellingPrice: data.selling_price,
      totalPrice: data.total_price,
      customerName: data.customer_name,
      notes: data.notes,
      transactionNumber: data.transaction_number
    } : null;
  } catch (error) {
    console.error('Error adding transaction:', error);
    return null;
  }
};

// Function to fetch all transactions
export const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }

    // Transform data to match Transaction type
    return data?.map(item => ({
      id: item.id,
      date: item.date,
      pizzaId: item.pizza_id,
      size: item.size as 'Small' | 'Medium',
      flavor: item.flavor,
      quantity: item.quantity,
      state: item.state as 'Frozen Food' | 'Matang',
      includeBox: item.include_box,
      sellingPrice: item.selling_price,
      totalPrice: item.total_price,
      customerName: item.customer_name,
      notes: item.notes,
      transactionNumber: item.transaction_number
    })) || [];
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

// Function to update an existing transaction
export const updateTransaction = async (transaction: Transaction): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .update(transaction)
      .eq('id', transaction.id);

    return !error;
  } catch (error) {
    console.error('Error updating transaction:', error);
    return false;
  }
};

// Function to delete a transaction
export const deleteTransaction = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    return !error;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
};

// Function to fetch all expenses
export const fetchExpenses = async (): Promise<Expense[]> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching expenses:", error);
      return [];
    }

    // Transform data to match Expense type
    return data?.map(item => ({
      id: item.id,
      category: item.category as any,
      date: item.date,
      amount: item.amount,
      description: item.description || '',
      createdAt: item.created_at
    })) || [];
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
};

// Function to get the total expenses for the current month
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
    
    // Sum up the amounts
    return data?.reduce((total, expense) => total + Number(expense.amount), 0) || 0;
  } catch (error) {
    console.error("Error calculating current month expenses:", error);
    return 0;
  }
};

// Function to add a new expense
export const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .insert({
        ...expense,
        created_at: new Date().toISOString()
      });

    return !error;
  } catch (error) {
    console.error('Error adding expense:', error);
    return false;
  }
};

// Function to update an existing expense
export const updateExpense = async (expense: Expense): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', expense.id);

    return !error;
  } catch (error) {
    console.error('Error updating expense:', error);
    return false;
  }
};

// Function to delete an expense
export const deleteExpense = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    return !error;
  } catch (error) {
    console.error('Error deleting expense:', error);
    return false;
  }
};

// Function to get transaction count for generating sequential transaction numbers
export const getTransactionCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('transactions')
      .select('transaction_number', { count: 'exact', head: true });
    
    if (error) {
      console.error("Error getting transaction count:", error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error("Error getting transaction count:", error);
    return 0;
  }
};

// Function to reprint a transaction receipt
export const reprintTransactionReceipt = async (transactionId: string): Promise<boolean> => {
  try {
    // First, fetch the transaction details
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    
    if (error || !data) {
      console.error("Error fetching transaction for receipt:", error);
      return false;
    }
    
    // Fetch all related transactions with the same transaction number
    const transactionNumber = data.transaction_number;
    const { data: relatedTransactions, error: relatedError } = await supabase
      .from('transactions')
      .select('*')
      .eq('transaction_number', transactionNumber);
    
    if (relatedError) {
      console.error("Error fetching related transactions:", relatedError);
      return false;
    }
    
    // Transform the data to match the Transaction type
    const transactions: Transaction[] = (relatedTransactions || []).map(item => ({
      id: item.id,
      date: item.date,
      pizzaId: item.pizza_id,
      size: item.size as 'Small' | 'Medium',
      flavor: item.flavor,
      quantity: item.quantity,
      state: item.state as 'Frozen Food' | 'Matang',
      includeBox: item.include_box,
      sellingPrice: item.selling_price,
      totalPrice: item.total_price,
      customerName: item.customer_name,
      notes: item.notes,
      transactionNumber: item.transaction_number
    }));
    
    // Call print function (imported from utils/constants.ts)
    const { printReceipt } = await import('./constants');
    await printReceipt(transactions);
    
    return true;
  } catch (error) {
    console.error("Error reprinting transaction receipt:", error);
    return false;
  }
};

// Function for setting up initial Supabase tables if needed
export const setupSupabaseTables = async (): Promise<boolean> => {
  // This function would typically create tables if they don't exist
  // For now, it's just a placeholder that returns true
  return true;
};

// Function to fetch cash summary for the cash management page
export const fetchCashSummary = async () => {
  try {
    // Get current month transactions
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    
    const [transactions, expenses] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .gte('date', firstDayOfMonth)
        .lte('date', lastDayOfMonth),
      supabase
        .from('expenses')
        .select('*')
        .gte('date', firstDayOfMonth)
        .lte('date', lastDayOfMonth)
    ]);
    
    const totalIncome = (transactions.data || []).reduce((sum, transaction) => 
      sum + Number(transaction.total_price), 0);
    
    const totalExpenses = (expenses.data || []).reduce((sum, expense) => 
      sum + Number(expense.amount), 0);
    
    const netProfit = totalIncome - totalExpenses;
    
    return {
      totalIncome,
      totalExpenses,
      netProfit,
      transactions: transactions.data || [],
      expenses: expenses.data || []
    };
  } catch (error) {
    console.error("Error fetching cash summary:", error);
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      transactions: [],
      expenses: []
    };
  }
};
