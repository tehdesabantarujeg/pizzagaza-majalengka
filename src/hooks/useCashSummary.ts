
import { useQuery } from '@tanstack/react-query';
import { fetchCashSummary } from '@/utils/supabase';
import { useState } from 'react';

export interface CashSummaryData {
  income: number;
  expenses: number;
  balance: number;
  transactions: any[];
  expensesList: any[];
}

export const useCashSummary = (initialStartDate?: Date, initialEndDate?: Date) => {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: initialStartDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: initialEndDate || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
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
      
      // Ensure transaction amounts are numbers, not strings
      const transactions = result.transactions || [];
      const processedTransactions = transactions.map(tx => ({
        ...tx,
        totalPrice: typeof tx.totalPrice === 'string' ? parseFloat(tx.totalPrice) : (tx.totalPrice || 0)
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
