
import { useState, useEffect } from 'react';
import { Transaction } from '@/utils/types';
import { 
  fetchTransactions, 
  addTransaction, 
  deleteTransaction, 
  updateTransaction
} from '@/utils/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { formatTransactionNumber } from '@/utils/constants';
import { transformTransactionFromDB } from '@/integrations/supabase/database.types';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const queryClient = useQueryClient();
  
  // Load transactions when component mounts
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const transactionData = await fetchTransactions();
      // Transform the data from DB format to app format
      const transformedTransactions = transactionData.map(transformTransactionFromDB);
      setTransactions(transformedTransactions);
      // Invalidate dashboard data to ensure it refreshes
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  // Generate a transaction number based on current timestamp
  const getNextTransactionNumber = (): string => {
    const now = new Date();
    const yearPart = now.getFullYear().toString().substr(2, 2); // YY
    const monthPart = (now.getMonth() + 1).toString().padStart(2, '0'); // MM
    const sequenceNumber = now.getTime().toString().substr(-4); // Last 4 digits of timestamp
    
    return `GZM-${yearPart}${monthPart}${sequenceNumber}`;
  };

  const addNewTransaction = async (transaction: Omit<Transaction, 'id'>, existingTransactionNumber?: string): Promise<Transaction | null> => {
    try {
      // Use the provided transaction number or generate a new one
      const transactionNumber = existingTransactionNumber || getNextTransactionNumber();
      
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
        return savedTransaction;
      }
      return null;
    } catch (error) {
      console.error("Error adding transaction:", error);
      return null;
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
