
import { Transaction, PizzaSaleItem } from '@/utils/types';
import { addTransaction, updateTransaction, deleteTransaction, generateTransactionNumber } from '@/utils/supabase';
import { printReceipt } from '@/utils/constants';

interface UseTransactionManagementProps {
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  toast: any;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loadTransactions: () => Promise<void>;
}

const useTransactionManagement = ({ 
  setTransactions, 
  toast, 
  setIsLoading,
  loadTransactions
}: UseTransactionManagementProps) => {
  
  const createTransaction = async (items: PizzaSaleItem[], customerName?: string, notes?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const transactionNumber = await generateTransactionNumber();
      
      const transactions = await Promise.all(items.map(async (item) => {
        // Ensure pizzaId is null if undefined or empty string
        const pizzaId = item.pizzaStockId && item.pizzaStockId.trim() !== '' ? item.pizzaStockId : null;
        
        const transaction: Omit<Transaction, 'id'> = {
          date: new Date().toISOString(),
          pizzaId: pizzaId,
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
      
      const successfulTransactions = transactions.filter((t): t is Transaction => t !== null);
      
      if (successfulTransactions.length > 0) {
        printReceipt(successfulTransactions);
        await loadTransactions();
        toast({
          title: "Berhasil",
          description: "Transaksi berhasil disimpan",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Gagal membuat transaksi",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast({
        title: "Error",
        description: "Gagal membuat transaksi",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExistingTransaction = async (updatedTransaction: Transaction): Promise<boolean> => {
    try {
      const success = await updateTransaction(updatedTransaction);
      if (success) {
        await loadTransactions();
        toast({
          title: "Berhasil",
          description: "Transaksi berhasil diperbarui",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Gagal memperbarui transaksi",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui transaksi",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleDeleteTransaction = async (transactionId: string): Promise<boolean> => {
    try {
      const success = await deleteTransaction(transactionId);
      if (success) {
        await loadTransactions();
        toast({
          title: "Berhasil",
          description: "Transaksi berhasil dihapus",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Gagal menghapus transaksi",
          variant: "destructive"
        });
        return false;
      }
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
    createTransaction,
    updateExistingTransaction,
    handleDeleteTransaction
  };
};

export default useTransactionManagement;
