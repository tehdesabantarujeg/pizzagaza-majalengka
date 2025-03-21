
import { useState, useEffect } from 'react';
import { Transaction } from '@/utils/types';
import { fetchTransactions, addTransaction } from '@/utils/supabase';
import { setupSupabaseTables } from '@/utils/supabase';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
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
