
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
  
  const createTransaction = async (items: PizzaSaleItem[], customerName?: string, notes?: string) => {
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
      } else {
        toast({
          title: "Error",
          description: "Gagal membuat transaksi",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast({
        title: "Error",
        description: "Gagal membuat transaksi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateExistingTransaction = async (updatedTransaction: Transaction) => {
    try {
      const success = await updateTransaction(updatedTransaction);
      if (success) {
        await loadTransactions();
        toast({
          title: "Berhasil",
          description: "Transaksi berhasil diperbarui",
        });
      } else {
        toast({
          title: "Error",
          description: "Gagal memperbarui transaksi",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui transaksi",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      const success = await deleteTransaction(transactionId);
      if (success) {
        await loadTransactions();
        toast({
          title: "Berhasil",
          description: "Transaksi berhasil dihapus",
        });
      } else {
        toast({
          title: "Error",
          description: "Gagal menghapus transaksi",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus transaksi",
        variant: "destructive"
      });
    }
  };

  return {
    createTransaction,
    updateExistingTransaction,
    handleDeleteTransaction
  };
};

export default useTransactionManagement;
