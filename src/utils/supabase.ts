import { createClient } from '@supabase/supabase-js';
import { PizzaStock, BoxStock, Transaction, Customer, Expense, CashSummary, ExpenseCategory } from './types';
import { supabase } from '@/integrations/supabase/client';
import { 
  PizzaStockRow, BoxStockRow, TransactionRow, CustomerRow, ExpenseRow,
  PizzaStockInsert, BoxStockInsert, TransactionInsert, CustomerInsert, ExpenseInsert,
  PizzaStockUpdate, BoxStockUpdate, TransactionUpdate, CustomerUpdate, ExpenseUpdate
} from '@/integrations/supabase/database.types';
import { formatCurrency, formatTransactionNumber } from '@/utils/constants';
import { format } from 'date-fns';

export const setupSupabaseTables = async (): Promise<void> => {
  return Promise.resolve();
};

export const fetchStockItems = async (): Promise<PizzaStock[]> => {
  const { data, error } = await supabase
    .from('pizza_stock')
    .select('*')
    .order('updated_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching stock:', error);
    return [];
  }
  
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
  const dbItem: PizzaStockInsert = {
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
  const dbItem: PizzaStockUpdate = {
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

export const updatePizzaStock = async (stockItem: PizzaStock): Promise<boolean> => {
  return updateStockItem(stockItem);
};

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

export const fetchBoxStock = async (): Promise<BoxStock[]> => {
  const { data, error } = await supabase
    .from('box_stock')
    .select('*')
    .order('updated_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching box stock:', error);
    return [];
  }
  
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
  const dbItem: BoxStockInsert = {
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
  const dbItem: BoxStockUpdate = {
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

export const fetchTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });
    
  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  
  return (data || []).map(item => ({
    id: item.id,
    date: item.date || new Date().toISOString(),
    pizzaId: item.pizza_id || '',
    size: item.size as 'Small' | 'Medium',
    flavor: item.flavor,
    quantity: item.quantity,
    state: item.state === 'Mentah' ? 'Frozen Food' : item.state as 'Frozen Food' | 'Matang',
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
    .select('transaction_number', { count: 'exact', head: true })
    .not('transaction_number', 'is', null)
    .neq('transaction_number', '');
    
  if (error) {
    console.error('Error counting unique transaction numbers:', error);
    return 0;
  }
  
  return count || 0;
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> => {
  // Convert 'Frozen Food' to 'Mentah' for database storage
  const state = transaction.state === 'Frozen Food' ? 'Mentah' : transaction.state;
  
  const dbItem: TransactionInsert = {
    date: transaction.date,
    pizza_id: transaction.pizzaId,
    size: transaction.size,
    flavor: transaction.flavor,
    quantity: transaction.quantity,
    state: state,
    include_box: transaction.includeBox,
    selling_price: transaction.sellingPrice,
    total_price: transaction.totalPrice,
    customer_name: transaction.customerName,
    notes: transaction.notes,
    transaction_number: transaction.transactionNumber
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
  
  return {
    id: data.id,
    date: data.date || new Date().toISOString(),
    pizzaId: data.pizza_id || '',
    size: data.size as 'Small' | 'Medium',
    flavor: data.flavor,
    quantity: data.quantity,
    state: data.state === 'Mentah' ? 'Frozen Food' : data.state as 'Frozen Food' | 'Matang',
    includeBox: data.include_box || false,
    sellingPrice: data.selling_price,
    totalPrice: data.total_price,
    customerName: data.customer_name,
    notes: data.notes,
    transactionNumber: data.transaction_number
  };
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
  
  return true;
};

export const updateTransaction = async (transaction: Transaction): Promise<boolean> => {
  // Convert 'Frozen Food' to 'Mentah' for database storage
  const state = transaction.state === 'Frozen Food' ? 'Mentah' : transaction.state;
  
  const dbItem: TransactionUpdate = {
    date: transaction.date,
    pizza_id: transaction.pizzaId,
    size: transaction.size,
    flavor: transaction.flavor,
    quantity: transaction.quantity,
    state: state,
    include_box: transaction.includeBox,
    selling_price: transaction.sellingPrice,
    total_price: transaction.totalPrice,
    customer_name: transaction.customerName,
    notes: transaction.notes,
    transaction_number: transaction.transactionNumber
  };

  const { error } = await supabase
    .from('transactions')
    .update(dbItem)
    .eq('id', transaction.id);
    
  if (error) {
    console.error('Error updating transaction:', error);
    return false;
  }
  
  return true;
};

export const reprintTransactionReceipt = async (transactionId: string): Promise<void> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single();
    
  if (error || !data) {
    console.error('Error fetching transaction for reprint:', error);
    return;
  }
  
  const transactionNumber = data.transaction_number;
  
  if (!transactionNumber) {
    const transaction = {
      id: data.id,
      date: data.date || new Date().toISOString(),
      pizzaId: data.pizza_id || '',
      size: data.size as 'Small' | 'Medium',
      flavor: data.flavor,
      quantity: data.quantity,
      state: data.state === 'Mentah' ? 'Frozen Food' : data.state as 'Frozen Food' | 'Matang',
      includeBox: data.include_box || false,
      sellingPrice: data.selling_price,
      totalPrice: data.total_price,
      customerName: data.customer_name,
      notes: data.notes,
      transactionNumber: data.transaction_number
    };
    
    import('./constants').then(({ printReceipt }) => {
      printReceipt([transaction]);
    });
    return;
  }
  
  const { data: relatedData, error: relatedError } = await supabase
    .from('transactions')
    .select('*')
    .eq('transaction_number', transactionNumber);
    
  if (relatedError || !relatedData || relatedData.length === 0) {
    console.error('Error fetching related transactions for reprint:', relatedError);
    return;
  }
  
  const transactions = relatedData.map(item => ({
    id: item.id,
    date: item.date || new Date().toISOString(),
    pizzaId: item.pizza_id || '',
    size: item.size as 'Small' | 'Medium',
    flavor: item.flavor,
    quantity: item.quantity,
    state: item.state === 'Mentah' ? 'Frozen Food' : item.state as 'Frozen Food' | 'Matang',
    includeBox: item.include_box || false,
    sellingPrice: item.selling_price,
    totalPrice: item.total_price,
    customerName: item.customer_name,
    notes: item.notes,
    transactionNumber: item.transaction_number
  }));
  
  if (transactions.length > 0) {
    import('./constants').then(({ printReceipt }) => {
      printReceipt(transactions);
    });
  }
};

export const fetchCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('last_purchase', { ascending: false });
    
  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    purchases: item.purchases || 0,
    lastPurchase: item.last_purchase || new Date().toISOString()
  }));
};

export const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer | null> => {
  const dbItem: CustomerInsert = {
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
  
  return {
    id: data.id,
    name: data.name,
    purchases: data.purchases || 0,
    lastPurchase: data.last_purchase || new Date().toISOString()
  };
};

export const updateCustomer = async (customer: Customer): Promise<boolean> => {
  const dbItem: CustomerUpdate = {
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

export const fetchSalesReportData = async (startDate: string, endDate: string): Promise<any> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('date, selling_price, total_price, quantity, flavor, size, state, include_box, transaction_number')
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

export const fetchExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });
    
  if (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
  
  return (data || []).map(item => ({
    id: item.id,
    category: item.category as ExpenseCategory,
    date: item.date || new Date().toISOString(),
    amount: item.amount,
    description: item.description || '',
    createdAt: item.created_at || new Date().toISOString()
  }));
};

export const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense | null> => {
  const dbItem: ExpenseInsert = {
    category: expense.category,
    date: expense.date,
    amount: expense.amount,
    description: expense.description
  };

  const { data, error } = await supabase
    .from('expenses')
    .insert([dbItem])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding expense:', error);
    return null;
  }
  
  return {
    id: data.id,
    category: data.category as ExpenseCategory,
    date: data.date || new Date().toISOString(),
    amount: data.amount,
    description: data.description || '',
    createdAt: data.created_at || new Date().toISOString()
  };
};

export const updateExpense = async (expense: Expense): Promise<boolean> => {
  const dbItem: ExpenseUpdate = {
    category: expense.category,
    date: expense.date,
    amount: expense.amount,
    description: expense.description
  };

  const { error } = await supabase
    .from('expenses')
    .update(dbItem)
    .eq('id', expense.id);
    
  if (error) {
    console.error('Error updating expense:', error);
    return false;
  }
  
  return true;
};

export const deleteExpense = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting expense:', error);
    return false;
  }
  
  return true;
};

export const fetchCashSummary = async (period: 'day' | 'week' | 'month' | 'year', startDate: string, endDate: string): Promise<CashSummary[]> => {
  const [salesData, expensesData] = await Promise.all([
    fetchSalesReportData(startDate, endDate),
    fetchExpensesByDateRange(startDate, endDate)
  ]);
  
  const formattedData = formatCashSummaryByPeriod(salesData, expensesData, period);
  
  return formattedData;
};

export const fetchExpensesByDateRange = async (startDate: string, endDate: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('date, amount, category')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });
    
  if (error) {
    console.error('Error fetching expenses by date range:', error);
    return [];
  }
  
  return data || [];
};

export const getCurrentMonthTotalExpenses = async (): Promise<number> => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();

  const { data, error } = await supabase
    .from('expenses')
    .select('amount')
    .gte('date', firstDay)
    .lte('date', lastDay);
    
  if (error) {
    console.error('Error fetching current month expenses:', error);
    return 0;
  }
  
  return (data || []).reduce((sum, item) => sum + item.amount, 0);
};

const formatCashSummaryByPeriod = (salesData: any[], expensesData: any[], period: 'day' | 'week' | 'month' | 'year'): CashSummary[] => {
  const salesByPeriod: {[key: string]: number} = {};
  const expensesByPeriod: {[key: string]: number} = {};
  
  salesData.forEach(sale => {
    const date = new Date(sale.date);
    let formattedDate;
    
    switch(period) {
      case 'day':
        formattedDate = format(date, 'yyyy-MM-dd');
        break;
      case 'week':
        formattedDate = `${format(date, 'yyyy')}-W${format(date, 'ww')}`;
        break;
      case 'month':
        formattedDate = format(date, 'yyyy-MM');
        break;
      case 'year':
        formattedDate = format(date, 'yyyy');
        break;
      default:
        formattedDate = format(date, 'yyyy-MM-dd');
    }
    
    if (!salesByPeriod[formattedDate]) {
      salesByPeriod[formattedDate] = 0;
    }
    salesByPeriod[formattedDate] += sale.total_price || 0;
  });
  
  expensesData.forEach(expense => {
    const date = new Date(expense.date);
    let formattedDate;
    
    switch(period) {
      case 'day':
        formattedDate = format(date, 'yyyy-MM-dd');
        break;
      case 'week':
        formattedDate = `${format(date, 'yyyy')}-W${format(date, 'ww')}`;
        break;
      case 'month':
        formattedDate = format(date, 'yyyy-MM');
        break;
      case 'year':
        formattedDate = format(date, 'yyyy');
        break;
      default:
        formattedDate = format(date, 'yyyy-MM-dd');
    }
    
    if (!expensesByPeriod[formattedDate]) {
      expensesByPeriod[formattedDate] = 0;
    }
    expensesByPeriod[formattedDate] += expense.amount || 0;
  });
  
  const allPeriods = new Set([...Object.keys(salesByPeriod), ...Object.keys(expensesByPeriod)]);
  const result: CashSummary[] = Array.from(allPeriods).map(period => {
    const income = salesByPeriod[period] || 0;
    const expense = expensesByPeriod[period] || 0;
    const balance = income - expense;
    
    let displayPeriod;
    switch(period.length) {
      case 7:
        displayPeriod = format(new Date(period + '-01'), 'MMM yyyy');
        break;
      case 4:
        displayPeriod = period;
        break;
      case 8:
        const [year, week] = period.split('-W');
        displayPeriod = `Week ${week}, ${year}`;
        break;
      default:
        displayPeriod = format(new Date(period), 'dd MMM yyyy');
    }
    
    return {
      period: displayPeriod,
      income,
      expense,
      balance
    };
  }).sort((a, b) => {
    const periodA = Object.keys(salesByPeriod).find(k => 
      format(new Date(k.includes('W') ? k.replace('W', '-') : (k.length === 7 ? k + '-01' : k)), 'MMM yyyy') === a.period
    ) || '';
    const periodB = Object.keys(salesByPeriod).find(k => 
      format(new Date(k.includes('W') ? k.replace('W', '-') : (k.length === 7 ? k + '-01' : k)), 'MMM yyyy') === b.period
    ) || '';
    
    return periodA.localeCompare(periodB);
  });
  
  return result;
};

export const generateTransactionNumber = async (): Promise<string> => {
  const now = new Date();
  const yearPart = now.getFullYear().toString().substr(2, 2);
  const monthPart = (now.getMonth() + 1).toString().padStart(2, '0');
  
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
  
  const { count, error } = await supabase
    .from('transactions')
    .select('transaction_number', { count: 'exact', head: true })
    .gte('date', firstDayOfMonth)
    .lte('date', lastDayOfMonth);
    
  if (error) {
    console.error('Error counting monthly transactions:', error);
    return `GZM-${yearPart}${monthPart}0001`;
  }
  
  const sequenceNumber = (count ? count + 1 : 1).toString().padStart(4, '0');
  
  return `GZM-${yearPart}${monthPart}${sequenceNumber}`;
};

export const addMultiplePizzaStock = async (stockItems: Omit<PizzaStock, 'id' | 'updatedAt'>[]): Promise<PizzaStock[] | null> => {
  try {
    const { data, error } = await supabase
      .from('pizza_stock')
      .insert(stockItems.map(item => ({
        size: item.size,
        flavor: item.flavor,
        quantity: item.quantity,
        cost_price: item.costPrice,
        purchase_date: item.purchaseDate,
        updated_at: new Date().toISOString()
      })))
      .select();
    
    if (error) {
      console.error('Error adding multiple pizza stock:', error);
      return null;
    }
    
    // Map data back to our PizzaStock type
    return data.map(item => ({
      id: item.id,
      size: item.size,
      flavor: item.flavor,
      quantity: item.quantity,
      costPrice: item.cost_price,
      purchaseDate: item.purchase_date,
      updatedAt: item.updated_at
    }));
    
  } catch (error) {
    console.error('Error adding multiple pizza stock:', error);
    return null;
  }
};
