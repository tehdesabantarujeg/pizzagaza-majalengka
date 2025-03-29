import { Transaction, PizzaSaleItem, PizzaStock, BoxStock } from '@/utils/types';
import { 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  fetchStockItems, 
  updateStockItem, 
  fetchBoxStock, 
  updateBoxStock,
  generateTransactionNumber
} from '@/utils/supabase';
import { printReceipt } from '@/utils/constants';
import { transformPizzaStockFromDB, transformBoxStockFromDB } from '@/integrations/supabase/database.types';

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
  
  const updateStockLevels = async (items: PizzaSaleItem[]): Promise<boolean> => {
    try {
      const pizzaStockItems = await fetchStockItems();
      const boxStockItems = await fetchBoxStock();
      
      const transformedPizzaStock = pizzaStockItems.map(transformPizzaStockFromDB);
      const transformedBoxStock = boxStockItems.map(transformBoxStockFromDB);
      
      for (const item of items) {
        const matchingPizzaStock = transformedPizzaStock.find(
          stock => stock.size === item.size && stock.flavor === item.flavor
        );
        
        if (matchingPizzaStock) {
          const updatedStock: PizzaStock = {
            ...matchingPizzaStock,
            quantity: Math.max(0, matchingPizzaStock.quantity - item.quantity)
          };
          
          await updateStockItem(updatedStock);
        }
        
        if (item.includeBox) {
          const matchingBoxStock = transformedBoxStock.find(
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
  
  const getTransactionNumber = async (): Promise<string> => {
    try {
      return await generateTransactionNumber();
    } catch (error) {
      console.error("Error generating transaction number:", error);
      const now = new Date();
      const yearPart = now.getFullYear().toString().substr(2, 2); // YY
      const monthPart = (now.getMonth() + 1).toString().padStart(2, '0'); // MM
      const sequenceNumber = now.getTime().toString().substr(-4); // Last 4 digits of timestamp
      
      return `GZM-${yearPart}${monthPart}${sequenceNumber}`;
    }
  };
  
  const createTransaction = async (items: PizzaSaleItem[], customerName?: string, notes?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const validatedItems = items.map(item => {
        const safeQuantity = typeof item.quantity === 'number' ? item.quantity : parseInt(String(item.quantity)) || 1;
        const safeSellingPrice = typeof item.sellingPrice === 'number' ? item.sellingPrice : parseFloat(String(item.sellingPrice)) || 0;
        const safeTotalPrice = safeSellingPrice * safeQuantity;
        
        return {
          ...item,
          quantity: safeQuantity,
          sellingPrice: safeSellingPrice,
          totalPrice: safeTotalPrice
        };
      });
      
      const transactionNumber = await getTransactionNumber();
      
      const createdTransactions: Transaction[] = [];
      
      for (const item of validatedItems) {
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
        await updateStockLevels(validatedItems);
        printReceipt(createdTransactions);
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

  const updateExistingTransactions = async (updatedTransactions: Transaction[]): Promise<boolean> => {
    try {
      const existingTransactions = updatedTransactions.filter(t => 
        t.id && !t.id.startsWith('temp-') && t.id.trim() !== ''
      );
      
      const newTransactions = updatedTransactions.filter(t => 
        !t.id || t.id.startsWith('temp-') || t.id.trim() === ''
      );
      
      if (existingTransactions.length > 0) {
        await Promise.all(existingTransactions.map(async (transaction) => {
          return updateTransaction(transaction);
        }));
      }
      
      if (newTransactions.length > 0 && updatedTransactions.length > 0) {
        const transactionNumber = updatedTransactions[0].transactionNumber;
        
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
        
        await updateStockLevels(newItems);
        
        for (const transaction of newTransactions) {
          const newTransactionData: Omit<Transaction, 'id'> = {
            date: transaction.date,
            pizzaId: transaction.pizzaId,
            size: transaction.size,
            flavor: transaction.flavor,
            quantity: transaction.quantity,
            state: transaction.state,
            includeBox: transaction.includeBox,
            sellingPrice: transaction.sellingPrice,
            totalPrice: transaction.totalPrice,
            customerName: transaction.customerName,
            notes: transaction.notes,
            transactionNumber: transactionNumber
          };
          
          await addTransaction(newTransactionData);
        }
      }
      
      await loadTransactions();
      
      return true;
    } catch (error) {
      console.error("Error updating transactions:", error);
      return false;
    }
  };

  const handleDeleteTransaction = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteTransaction(id);
      if (success) {
        setTransactions(prev => prev.filter(t => t.id !== id));
      }
      return success;
    } catch (error) {
      console.error("Error deleting transaction:", error);
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
