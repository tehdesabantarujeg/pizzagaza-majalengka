
import { useState, useEffect } from 'react';
import { Transaction } from '@/utils/types';
import { fetchTransactions, addTransaction } from '@/utils/supabase';
import { setupSupabaseTables } from '@/utils/supabase';
import { useQueryClient } from '@tanstack/react-query';

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

  return {
    transactions,
    setTransactions,
    loadTransactions,
    addNewTransaction
  };
};

export default useTransactions;
