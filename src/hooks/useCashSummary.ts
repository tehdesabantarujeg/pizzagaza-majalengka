
import { useQuery } from '@tanstack/react-query';
import { fetchCashSummary } from '@/utils/supabase';
import { useState } from 'react';
import { startOfYear, endOfYear } from 'date-fns';

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

  return {
    cashSummary: summaryData,
    isLoading,
    error,
    dateRange,
    setDateRange,
    refetch
  };
};
