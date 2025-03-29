
import { useState, useEffect } from 'react';
import { Transaction, PizzaSaleItem } from '@/utils/types';
import { 
  fetchTransactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction 
} from '@/utils/supabase';
import { transformTransactionFromDB } from '@/integrations/supabase/database.types';
import { useToast } from '@/hooks/use-toast';
import { useMultiItemSaleHandler } from './sales/useMultiItemSaleHandler';
import { useSaleValidation } from './sales/useSaleValidation';
import { normalizeSaleItem } from './sales/useSaleStateNormalization';

export const useSaleManagement = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction[]>([]);
  
  const { toast } = useToast();
  const { validateSaleItems } = useSaleValidation();
  const multiItemSaleHandler = useMultiItemSaleHandler();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTransactions();
      const transformedData = data.map(transformTransactionFromDB);
      setTransactions(transformedData);
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

  const createSingleTransaction = async (newSale: PizzaSaleItem) => {
    const normalizedItem = normalizeSaleItem(newSale);
    
    if (!validateSaleItems([normalizedItem])) {
      return false;
    }
    
    try {
      const success = await addTransaction({
        ...normalizedItem,
        date: new Date().toISOString(),
        customerName: newSale.customerName || '',
        notes: newSale.notes || ''
      });
      
      if (success) {
        await loadTransactions();
        toast({
          title: "Berhasil",
          description: "Transaksi berhasil disimpan",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast({
        title: "Error",
        description: "Gagal membuat transaksi",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleEditTransaction = (transactions: Transaction[]) => {
    setEditingTransaction(transactions);
  };

  const handleDeleteTransaction = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteTransaction(id);
      if (success) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        toast({
          title: "Berhasil",
          description: "Transaksi berhasil dihapus",
        });
      }
      return success;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus transaksi",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    transactions,
    isLoading,
    loadTransactions,
    open,
    setOpen,
    editingTransaction,
    setEditingTransaction,
    handleEditTransaction,
    handleDeleteTransaction,
    createSingleTransaction,
    ...multiItemSaleHandler
  };
};

export default useSaleManagement;
