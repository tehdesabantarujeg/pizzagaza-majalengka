
import { useState, useEffect } from 'react';
import { Transaction, PizzaSaleItem } from '@/utils/types';
import { addTransaction, fetchTransactions, generateTransactionNumber } from '@/utils/supabase';
import { formatTransactionNumber, printReceipt } from '@/utils/constants';
import useSaleForm from './sales/useSaleForm';
import { useToast } from '@/hooks/use-toast';

export const useSaleManagement = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    loadTransactions();
  }, []);
  
  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const createTransaction = async (items: PizzaSaleItem[], customerName?: string, notes?: string) => {
    setIsLoading(true);
    try {
      const transactionNumber = await generateTransactionNumber();
      
      // Create an array of transactions, one for each item
      const transactions = await Promise.all(items.map(async (item) => {
        const transaction: Omit<Transaction, 'id'> = {
          date: new Date().toISOString(),
          pizzaId: item.pizzaStockId || '',
          size: item.size,
          flavor: item.flavor,
          quantity: item.quantity,
          state: item.state,
          includeBox: item.includeBox,
          sellingPrice: item.sellingPrice,
          totalPrice: item.totalPrice,
          customerName,
          notes,
          transactionNumber
        };
        
        return addTransaction(transaction);
      }));
      
      // Filter out any null values from failed transactions
      const successfulTransactions = transactions.filter((t): t is Transaction => t !== null);
      
      if (successfulTransactions.length > 0) {
        // Print receipt
        printReceipt(successfulTransactions);
        
        // Reload transactions
        await loadTransactions();
        
        toast({
          title: "Success",
          description: "Transaction completed successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create transaction",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast({
        title: "Error",
        description: "Failed to create transaction",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    transactions,
    isLoading,
    isPrinting,
    loadTransactions,
    createTransaction
  };
};

export default useSaleManagement;
