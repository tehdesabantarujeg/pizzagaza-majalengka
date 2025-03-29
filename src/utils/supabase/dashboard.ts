
import { fetchStockItems } from './pizzaStock';
import { fetchBoxStock } from './boxStock';
import { fetchTransactions } from './transactions';
import { fetchExpenses } from './expenses';
import { fetchCustomers } from './customers';
import { transformPizzaStockFromDB, transformBoxStockFromDB, transformTransactionFromDB, transformExpenseFromDB, transformCustomerFromDB } from '../../integrations/supabase/database.types';

export const fetchDashboardData = async () => {
  try {
    const [stockItemsRaw, boxItemsRaw, transactionsRaw, expensesRaw, customersRaw] = await Promise.all([
      fetchStockItems(),
      fetchBoxStock(),
      fetchTransactions(),
      fetchExpenses(),
      fetchCustomers(),
    ]);
    
    const stockItems = stockItemsRaw.map(transformPizzaStockFromDB);
    const boxItems = boxItemsRaw.map(transformBoxStockFromDB);
    const transactions = transactionsRaw.map(transformTransactionFromDB);
    const expenses = expensesRaw.map(transformExpenseFromDB);
    const customers = customersRaw.map(transformCustomerFromDB);
    
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

export const fetchCashSummary = async () => {
  try {
    const [transactions, expenses] = await Promise.all([
      fetchTransactions(),
      fetchExpenses()
    ]);
    
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
