
import { useQuery } from '@tanstack/react-query';
import { fetchCashSummary } from '@/utils/supabase';
import { useState } from 'react';
import { startOfYear, endOfYear, format, parseISO } from 'date-fns';

export interface CashSummaryData {
  income: number;
  expenses: number;
  balance: number;
  transactions: any[];
  expensesList: any[];
}

export const useCashSummary = (initialStartDate?: Date, initialEndDate?: Date) => {
  const currentDate = new Date();
  const defaultStartDate = startOfYear(currentDate);
  const defaultEndDate = endOfYear(currentDate);

  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: initialStartDate || defaultStartDate,
    end: initialEndDate || defaultEndDate
  });

  const formatDateForAPI = (date: Date) => {
    return date.toISOString();
  };

  const { data, isLoading, error, refetch } = useQuery<CashSummaryData>({
    queryKey: ['cashSummary', dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: async () => {
      const result = await fetchCashSummary(
        formatDateForAPI(dateRange.start),
        formatDateForAPI(dateRange.end)
      );
      
      // Ensure transactions have valid totalPrice values and necessary fields from sales are mapped correctly
      const transactions = result.transactions || [];
      const processedTransactions = transactions.map(transaction => ({
        ...transaction,
        // Ensure total_price is a valid number
        total_price: typeof transaction.total_price === 'string' 
          ? parseFloat(transaction.total_price) 
          : (isNaN(transaction.total_price) ? 0 : transaction.total_price),
        // Make sure transaction_number is from the transactionNumber property if available
        transaction_number: transaction.transactionNumber || transaction.transaction_number || '-',
        // Make sure customer_name is from the customerName property if available
        customer_name: transaction.customerName || transaction.customer_name || '-'
      }));
      
      return {
        income: result.income || 0,
        expenses: result.expenses || 0,
        balance: result.balance || 0,
        transactions: processedTransactions,
        expensesList: result.expensesList || []
      };
    }
  });

  // Calculate summary data for the view
  const summaryData = {
    totalIncome: data?.income || 0,
    totalExpenses: data?.expenses || 0,
    netProfit: (data?.income || 0) - (data?.expenses || 0),
    transactions: data?.transactions || [],
    expenses: data?.expensesList || []
  };

  // Group transactions and expenses by month for chart display
  const monthlyData = React.useMemo(() => {
    if (!data) return [];

    const monthlyAggregation: Record<string, { income: number; expense: number; balance: number }> = {};
    
    // Process transactions (income)
    (data.transactions || []).forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = format(date, 'yyyy-MM');
      if (!monthlyAggregation[monthKey]) {
        monthlyAggregation[monthKey] = { income: 0, expense: 0, balance: 0 };
      }
      monthlyAggregation[monthKey].income += Number(transaction.total_price || 0);
    });
    
    // Process expenses
    (data.expensesList || []).forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = format(date, 'yyyy-MM');
      if (!monthlyAggregation[monthKey]) {
        monthlyAggregation[monthKey] = { income: 0, expense: 0, balance: 0 };
      }
      monthlyAggregation[monthKey].expense += Number(expense.amount || 0);
    });
    
    // Calculate balance and format for chart
    return Object.entries(monthlyAggregation).map(([monthKey, data]) => {
      const balance = data.income - data.expense;
      const displayDate = format(parseISO(`${monthKey}-01`), 'MMM yyyy');
      
      return {
        period: displayDate,
        income: data.income,
        expense: data.expense,
        balance: balance
      };
    }).sort((a, b) => {
      // Sort by month/year chronologically
      const [aMonth, aYear] = a.period.split(' ');
      const [bMonth, bYear] = b.period.split(' ');
      return new Date(`${aYear} ${aMonth}`).getTime() - new Date(`${bYear} ${bMonth}`).getTime();
    });
  }, [data]);

  // Process top product data
  const topProductsData = React.useMemo(() => {
    if (!data?.transactions || data.transactions.length === 0) return [];
    
    const productSales: Record<string, { value: number, count: number }> = {};
    
    data.transactions.forEach(transaction => {
      const productKey = `${transaction.flavor} (${transaction.size})`;
      if (!productSales[productKey]) {
        productSales[productKey] = { value: 0, count: 0 };
      }
      productSales[productKey].value += Number(transaction.total_price || 0);
      productSales[productKey].count += transaction.quantity || 1;
    });
    
    return Object.entries(productSales)
      .map(([name, { value, count }]) => ({ name, value, count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Limit to top 8 for better visualization
  }, [data]);

  return {
    cashSummary: summaryData,
    isLoading,
    error,
    dateRange,
    setDateRange,
    refetch,
    monthlyData,
    topProductsData
  };
};
