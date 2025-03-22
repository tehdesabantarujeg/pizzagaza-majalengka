
import { useState, useEffect } from 'react';
import { Transaction } from '@/utils/types';
import { fetchTransactions, addTransaction, getTransactionCount } from '@/utils/supabase';
import { setupSupabaseTables } from '@/utils/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { formatTransactionNumber } from '@/utils/constants';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const queryClient = useQueryClient();
  
  // Ambil data transaksi saat komponen dimuat
  useEffect(() => {
    setupSupabaseTables().then(() => {
      loadTransactions();
    });
  }, []);

  const loadTransactions = async () => {
    try {
      const transactionData = await fetchTransactions();
      setTransactions(transactionData);
      // Invalidate dashboard data to ensure it refreshes
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  const addNewTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> => {
    try {
      const savedTransaction = await addTransaction(transaction);
      if (savedTransaction) {
        // Update local state
        setTransactions(prev => [savedTransaction, ...prev]);
        // Invalidate dashboard data to ensure it refreshes
        queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      }
      return savedTransaction;
    } catch (error) {
      console.error("Error adding transaction:", error);
      return null;
    }
  };
  
  // Function to get the next transaction number
  const getNextTransactionNumber = async (): Promise<string> => {
    try {
      const count = await getTransactionCount();
      return formatTransactionNumber(count + 1);
    } catch (error) {
      console.error("Error getting transaction count:", error);
      // Fallback to current timestamp if we can't get the count
      return formatTransactionNumber(Date.now());
    }
  };

  return {
    transactions,
    setTransactions,
    loadTransactions,
    addNewTransaction,
    getNextTransactionNumber
  };
};

export default useTransactions;
