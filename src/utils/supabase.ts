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
        costPrice: stockItem.costPrice,
        updatedAt: new Date().toISOString()
      })
      .eq('id', stockItem.id);

    return !error;
  } catch (error) {
    console.error('Error updating stock item:', error);
    return false;
  }
};

// Function to update box stock item
export const updateBoxStock = async (boxStock: BoxStock): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('box_stock')
      .update({ 
        quantity: boxStock.quantity,
        costPrice: boxStock.costPrice,
        updatedAt: new Date().toISOString()
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
            .update({ costPrice: newPrice, updatedAt: new Date().toISOString() })
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
            .update({ costPrice: newPrice, updatedAt: new Date().toISOString() })
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
      .select('transactionNumber')
      .like('transactionNumber', `${baseTransactionNumber}%`)
      .order('transactionNumber', { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching last transaction number:", error);
      return baseTransactionNumber + '001';
    }

    if (data && data.length > 0) {
      const lastTransactionNumber = data[0].transactionNumber;
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
export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .insert(transaction);

    return !error;
  } catch (error) {
    console.error('Error adding transaction:', error);
    return false;
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

// Function to add a new expense
export const addExpense = async (expense: Omit<Expense, 'id'>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .insert(expense);

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
