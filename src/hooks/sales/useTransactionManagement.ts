import { Transaction, PizzaSaleItem, PizzaStock, BoxStock, TransactionInsert } from '@/utils/types';
import { 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  fetchStockItems, 
  updateStockItem, 
  fetchBoxStock, 
  updateBoxStock,
  fetchTransactionCount
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
        // Get all matching pizza stock items with the same flavor and size
        const matchingPizzaStocks = pizzaStockItems.filter(
          stock => stock.size === item.size && stock.flavor === item.flavor
        ).sort((a, b) => {
          // Sort by purchase date (oldest first to use FIFO method)
          // In our data mapper, database purchase_date is mapped to purchaseDate in TypeScript
          return new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
        });
        
        if (matchingPizzaStocks.length > 0) {
          console.log(`Found ${matchingPizzaStocks.length} matching stock entries for ${item.flavor} ${item.size}`);
          
          // Keep track of how much quantity to reduce
          let remainingQuantityToReduce = item.quantity;
          
          // Iterate through each matching stock and reduce quantity as needed
          for (const stockItem of matchingPizzaStocks) {
            if (remainingQuantityToReduce <= 0) break;
            
            const quantityToReduceFromThisItem = Math.min(stockItem.quantity, remainingQuantityToReduce);
            console.log(`Reducing pizza stock ID ${stockItem.id}: ${stockItem.flavor} ${stockItem.size} from ${stockItem.quantity} by ${quantityToReduceFromThisItem}`);
            
            // Create a new stock object without costPrice
            const updatedStock: PizzaStock = {
              ...stockItem,
              quantity: Math.max(0, stockItem.quantity - quantityToReduceFromThisItem)
            };
            
            // Make sure we're using the correct property name
            delete (updatedStock as any).costPrice;
            
            const updateResult = await updateStockItem(updatedStock);
            console.log(`Stock update result for ID ${updatedStock.id}: ${updateResult ? 'Success' : 'Failed'}`);
            
            // Reduce the remaining quantity to be deducted
            remainingQuantityToReduce -= quantityToReduceFromThisItem;
          }
        } else {
          console.log(`No matching pizza stock found for: ${item.flavor} ${item.size}`);
        }
        
        // Update box stock if needed
        if (item.includeBox) {
          const matchingBoxStock = boxStockItems.find(
            stock => stock.size === item.size
          );
          
          if (matchingBoxStock) {
            console.log(`Reducing box stock: ${matchingBoxStock.size} from ${matchingBoxStock.quantity} by ${item.quantity}`);
            
            // Create a new box stock object without costPrice
            const updatedBoxStock: BoxStock = {
              ...matchingBoxStock,
              quantity: Math.max(0, matchingBoxStock.quantity - item.quantity)
            };
            
            // Make sure we're using the correct property name
            delete (updatedBoxStock as any).costPrice;
            
            const updateBoxResult = await updateBoxStock(updatedBoxStock);
            console.log(`Box update result: ${updateBoxResult ? 'Success' : 'Failed'}`);
          } else {
            console.log(`No matching box stock found for size: ${item.size}`);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error updating stock levels:", error);
      return false;
    }
  };
  
  // Generate a transaction number based on the format GZM-yymmxxxx
  const generateTransactionNumber = async (): Promise<string> => {
    const now = new Date();
    const yearPart = now.getFullYear().toString().substr(2, 2); // YY
    const monthPart = (now.getMonth() + 1).toString().padStart(2, '0'); // MM
    
    // Get the current transaction count from the database
    const transactionCount = await fetchTransactionCount();
    const sequenceNumber = String(transactionCount + 1).padStart(4, '0'); // XXXX with leading zeros
    
    return `GZM-${yearPart}${monthPart}${sequenceNumber}`;
  };
  
  const createTransaction = async (items: PizzaSaleItem[], customerName?: string, notes?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Validate all items to make sure they have proper data types
      const validatedItems = items.map(item => {
        // Ensure numeric properties are valid numbers
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
      
      // Generate transaction number with the new format
      const transactionNumber = await generateTransactionNumber();
      
      // Create an array to hold the created transactions
      const createdTransactions: Transaction[] = [];
      
      // Process each item and create a transaction
      for (const item of validatedItems) {
        // Ensure pizzaId is null if undefined or empty string
        const pizzaId = item.pizzaStockId && item.pizzaStockId.trim() !== '' ? item.pizzaStockId : null;
        
        const transaction: TransactionInsert = {
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
        const stockUpdateResult = await updateStockLevels(validatedItems);
        console.log(`Stock update after transaction: ${stockUpdateResult ? 'Success' : 'Failed'}`);
        
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
        const stockUpdateResult = await updateStockLevels(newItems);
        console.log(`Stock update for new items in edited transaction: ${stockUpdateResult ? 'Success' : 'Failed'}`);
        
        await Promise.all(newTransactions.map(async (transaction) => {
          const newTransactionData: TransactionInsert = {
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
