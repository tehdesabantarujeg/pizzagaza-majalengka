
import { useState, useEffect } from 'react';
import { Transaction } from '@/utils/types';
import { fetchTransactions, addTransaction, generateTransactionNumber, deleteTransaction, updateTransaction, getTransactionCount } from '@/utils/supabase';
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

  const addNewTransaction = async (transaction: Omit<Transaction, 'id'>, existingTransactionNumber?: string): Promise<Transaction | null> => {
    try {
      // Use the provided transaction number or generate a new one
      const transactionNumber = existingTransactionNumber || await getNextTransactionNumber();
      
      // Make sure the transaction uses the provided transaction number
      const transactionWithNumber = {
        ...transaction,
        transactionNumber
      };
      
      const savedTransaction = await addTransaction(transactionWithNumber);
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
      // Get the count of unique transaction numbers, not all transactions
      const count = await getTransactionCount();
      return formatTransactionNumber(count + 1);
    } catch (error) {
      console.error("Error getting transaction count:", error);
      // Fallback to current timestamp if we can't get the count
      return formatTransactionNumber(Date.now());
    }
  };

  // Function to delete a transaction
  const deleteTransactionById = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteTransaction(id);
      if (success) {
        // Update local state by removing the deleted transaction
        setTransactions(prev => prev.filter(t => t.id !== id));
        // Invalidate dashboard data
        queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      }
      return success;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      return false;
    }
  };

  // Function to update a transaction
  const updateExistingTransaction = async (transaction: Transaction): Promise<boolean> => {
    try {
      const success = await updateTransaction(transaction);
      if (success) {
        // Update local state
        setTransactions(prev => 
          prev.map(t => t.id === transaction.id ? transaction : t)
        );
        // Invalidate dashboard data
        queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      }
      return success;
    } catch (error) {
      console.error("Error updating transaction:", error);
      return false;
    }
  };

  return {
    transactions,
    setTransactions,
    loadTransactions,
    addNewTransaction,
    getNextTransactionNumber,
    deleteTransactionById,
    updateExistingTransaction
  };
};

export default useTransactions;
