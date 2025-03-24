
import { useState, useEffect, useCallback } from 'react';
import { Transaction, PizzaSaleItem } from '@/utils/types';
import { 
  addTransaction, 
  fetchTransactions, 
  generateTransactionNumber, 
  updateTransaction, 
  deleteTransaction 
} from '@/utils/supabase';
import { PRICES } from '@/utils/constants';
import { useToast } from '@/hooks/use-toast';
import useStockItems from './sales/useStockItems';

// Split functionality into smaller hooks
import useTransactionForm from './sales/useTransactionForm';
import useTransactionManagement from './sales/useTransactionManagement';

export const useSaleManagement = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [open, setOpen] = useState(false);
  const [isMultiItem, setIsMultiItem] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction[]>([]);
  const { toast } = useToast();
  
  // Get the stock hooks to check inventory
  const {
    stockItems,
    boxItems,
    error: stockError,
    setError: setStockError,
    isPizzaStockAvailable,
    isBoxStockAvailable,
    updateStockItemQuantity,
    updateBoxStockQuantity,
    loadStockData
  } = useStockItems();
  
  // Form state from the extracted hook
  const { 
    newSale, 
    setNewSale, 
    saleItems, 
    setSaleItems, 
    customerName, 
    setCustomerName, 
    notes, 
    setNotes, 
    error, 
    setError,
    sellingPrice,
    totalPrice,
    handleSizeChange,
    handleFlavorChange,
    handleStateChange,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    resetForm
  } = useTransactionForm();
  
  // Transaction management functionality from extracted hook
  const {
    createTransaction,
    updateExistingTransaction,
    handleDeleteTransaction
  } = useTransactionManagement({ 
    setTransactions, 
    toast, 
    setIsLoading, 
    loadTransactions 
  });

  useEffect(() => {
    loadTransactions();
  }, []);
  
  async function loadTransactions() {
    setIsLoading(true);
    try {
      const data = await fetchTransactions();
      // Replace all occurrences of "Mentah" with "Frozen Food"
      const updatedData = data.map(transaction => ({
        ...transaction,
        state: transaction.state === 'Mentah' ? 'Frozen Food' : transaction.state
      }));
      setTransactions(updatedData);
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
  }

  // Check if stock is available for all items in a transaction
  const checkStockAvailability = (items: PizzaSaleItem[]): boolean => {
    for (const item of items) {
      // Check pizza stock
      const pizzaStockResult = isPizzaStockAvailable(item);
      if (!pizzaStockResult) {
        return false;
      }
      
      // Check box stock if needed
      if (item.includeBox) {
        const boxStockResult = isBoxStockAvailable(item);
        if (!boxStockResult) {
          return false;
        }
      }
    }
    
    return true;
  };
  
  // Update stock levels after a successful transaction
  const updateStockLevels = async (items: PizzaSaleItem[]): Promise<boolean> => {
    try {
      for (const item of items) {
        // Update pizza stock
        const pizzaStockResult = isPizzaStockAvailable(item);
        if (pizzaStockResult && typeof pizzaStockResult !== 'boolean') {
          await updateStockItemQuantity(pizzaStockResult);
        }
        
        // Update box stock if needed
        if (item.includeBox) {
          const boxStockResult = isBoxStockAvailable(item);
          if (boxStockResult && typeof boxStockResult !== 'boolean') {
            await updateBoxStockQuantity(boxStockResult);
          }
        }
      }
      
      await loadStockData(); // Refresh stock data
      return true;
    } catch (error) {
      console.error("Error updating stock levels:", error);
      return false;
    }
  };

  const handleSaveOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStockError('');
    
    if (isMultiItem) {
      if (!saleItems.some(item => item.flavor)) {
        setError('Please select at least one pizza flavor');
        return;
      }
      
      // Ensure state is always "Frozen Food" or "Matang"
      const updatedSaleItems = saleItems.map(item => {
        // Convert "Mentah" to "Frozen Food" if needed
        let safeState = item.state;
        if (typeof item.state === 'string' && item.state === 'Mentah') {
          safeState = 'Frozen Food';
        }
        
        return {
          ...item,
          state: safeState
        };
      });
      
      // Check stock availability before proceeding
      if (!checkStockAvailability(updatedSaleItems)) {
        toast({
          title: "Stok Tidak Cukup",
          description: stockError || "Stok pizza atau dus tidak mencukupi",
          variant: "destructive"
        });
        return;
      }
      
      // Create the transaction
      const success = await createTransaction(updatedSaleItems, customerName, notes);
      
      if (success) {
        // Update stock levels
        await updateStockLevels(updatedSaleItems);
        
        // Reset form after successful transaction
        resetForm();
        setOpen(false);
      }
    } else {
      if (!newSale.flavor) {
        setError('Please select a pizza flavor');
        return;
      }
      
      // Convert "Mentah" to "Frozen Food" if needed
      let safeState = newSale.state;
      if (typeof newSale.state === 'string' && newSale.state === 'Mentah') {
        safeState = 'Frozen Food';
      }
      
      const saleItem: PizzaSaleItem = {
        size: newSale.size,
        flavor: newSale.flavor,
        quantity: newSale.quantity,
        state: safeState,
        includeBox: newSale.includeBox,
        sellingPrice,
        totalPrice
      };
      
      // Check stock availability before proceeding
      if (!checkStockAvailability([saleItem])) {
        toast({
          title: "Stok Tidak Cukup",
          description: stockError || "Stok pizza atau dus tidak mencukupi",
          variant: "destructive"
        });
        return;
      }
      
      // Create the transaction
      const success = await createTransaction([saleItem], newSale.customerName, newSale.notes);
      
      if (success) {
        // Update stock levels
        await updateStockLevels([saleItem]);
        
        // Reset form after successful transaction
        setNewSale({
          size: 'Small',
          flavor: '',
          quantity: 1,
          state: 'Frozen Food',
          includeBox: false,
          customerName: '',
          notes: ''
        });
        setOpen(false);
      }
    }
  };

  const handleSavePrint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPrinting(true);
    await handleSaveOnly(e);
    setIsPrinting(false);
  };

  const handleEditTransaction = (transactions: Transaction[]) => {
    // Set the entire transaction group for editing
    setEditingTransaction(transactions);
  };
  
  return {
    transactions,
    isLoading,
    isPrinting,
    loadTransactions,
    createTransaction,
    open,
    setOpen,
    newSale,
    setNewSale,
    saleItems,
    setSaleItems,
    customerName,
    setCustomerName,
    notes,
    setNotes,
    sellingPrice,
    totalPrice,
    error,
    isMultiItem,
    setIsMultiItem,
    handleSizeChange,
    handleFlavorChange,
    handleStateChange,
    handleSaveOnly,
    handleSavePrint,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handleEditTransaction,
    handleDeleteTransaction,
    editingTransaction,
    setEditingTransaction,
    updateExistingTransaction,
    checkStockAvailability,
    updateStockLevels
  };
};

export default useSaleManagement;
