
import { Transaction, PizzaSaleItem, PizzaStock, BoxStock } from '@/utils/types';
import { 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  fetchStockItems, 
  updateStockItem, 
  fetchBoxStock, 
  updateBoxStock 
} from '@/utils/supabase';
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
  
  // Helper function to update stock levels after a successful transaction
  const updateStockLevels = async (items: PizzaSaleItem[]): Promise<boolean> => {
    try {
      const pizzaStockItems = await fetchStockItems();
      const boxStockItems = await fetchBoxStock();
      
      for (const item of items) {
        // Update pizza stock
        const matchingPizzaStock = pizzaStockItems.find(
          stock => stock.size === item.size && stock.flavor === item.flavor
        );
        
        if (matchingPizzaStock) {
          const updatedStock: PizzaStock = {
            ...matchingPizzaStock,
            quantity: Math.max(0, matchingPizzaStock.quantity - item.quantity)
          };
          
          await updateStockItem(updatedStock);
        }
        
        // Update box stock if needed
        if (item.includeBox) {
          const matchingBoxStock = boxStockItems.find(
            stock => stock.size === item.size
          );
          
          if (matchingBoxStock) {
            const updatedBoxStock: BoxStock = {
              ...matchingBoxStock,
              quantity: Math.max(0, matchingBoxStock.quantity - item.quantity)
            };
            
            await updateBoxStock(updatedBoxStock);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error updating stock levels:", error);
      return false;
    }
  };
  
  // Generate a transaction number based on current timestamp
  const generateTransactionNumber = (): string => {
    const now = new Date();
    const yearPart = now.getFullYear().toString().substr(2, 2); // YY
    const monthPart = (now.getMonth() + 1).toString().padStart(2, '0'); // MM
    const sequenceNumber = now.getTime().toString().substr(-4); // Last 4 digits of timestamp
    
    return `GZM-${yearPart}${monthPart}${sequenceNumber}`;
  };
  
  const createTransaction = async (items: PizzaSaleItem[], customerName?: string, notes?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const transactionNumber = generateTransactionNumber();
      
      // Create an array to hold the created transactions
      const createdTransactions: Transaction[] = [];
      
      // Process each item and create a transaction
      for (const item of items) {
        // Ensure pizzaId is null if undefined or empty string
        const pizzaId = item.pizzaStockId && item.pizzaStockId.trim() !== '' ? item.pizzaStockId : null;
        
        const transaction: Omit<Transaction, 'id'> = {
          date: item.date || new Date().toISOString(),
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
        
        const savedTransaction = await addTransaction(transaction);
        if (savedTransaction) {
          createdTransactions.push(savedTransaction);
        }
      }
      
      if (createdTransactions.length > 0) {
        // Update stock levels after successful transaction
        await updateStockLevels(items);
        
        // Print receipt
        printReceipt(createdTransactions);
        
        // Reload transactions
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

  // Updated function to handle both existing and new transactions in a group
  const updateExistingTransactions = async (updatedTransactions: Transaction[]): Promise<boolean> => {
    try {
      // Separate existing transactions from new ones
      const existingTransactions = updatedTransactions.filter(t => 
        t.id && !t.id.startsWith('temp-') && t.id.trim() !== ''
      );
      
      const newTransactions = updatedTransactions.filter(t => 
        !t.id || t.id.startsWith('temp-') || t.id.trim() === ''
      );
      
      // First update existing transactions
      if (existingTransactions.length > 0) {
        await Promise.all(existingTransactions.map(async (transaction) => {
          return updateTransaction(transaction);
        }));
      }
      
      // Then create new transactions with the same transaction number
      if (newTransactions.length > 0 && updatedTransactions.length > 0) {
        // Use the transaction number from the existing group
        const transactionNumber = updatedTransactions[0].transactionNumber;
        
        // Convert to PizzaSaleItem for stock update
        const newItems: PizzaSaleItem[] = newTransactions.map(t => ({
          size: t.size,
          flavor: t.flavor,
          quantity: t.quantity,
          state: t.state,
          includeBox: t.includeBox,
          sellingPrice: t.sellingPrice,
          totalPrice: t.totalPrice,
          date: t.date
        }));
        
        // Update stock for new items
        await updateStockLevels(newItems);
        
        await Promise.all(newTransactions.map(async (transaction) => {
          const newTransactionData: Omit<Transaction, 'id'> = {
            date: transaction.date || new Date().toISOString(),
            pizzaId: transaction.pizzaId || null,
            size: transaction.size,
            flavor: transaction.flavor,
            quantity: transaction.quantity,
            state: transaction.state,
            includeBox: transaction.includeBox,
            sellingPrice: transaction.sellingPrice,
            totalPrice: transaction.totalPrice,
            customerName: transaction.customerName,
            notes: transaction.notes,
            transactionNumber
          };
          
          return addTransaction(newTransactionData);
        }));
      }
      
      await loadTransactions();
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil diperbarui",
      });
      return true;
    } catch (error) {
      console.error("Error updating transactions:", error);
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
    updateExistingTransactions,
    handleDeleteTransaction,
    updateStockLevels
  };
};

export default useTransactionManagement;
