import { useState, useEffect, useCallback } from 'react';
import { Transaction, PizzaSaleItem } from '@/utils/types';
import { 
  addTransaction, 
  fetchTransactions, 
  updateTransaction, 
  deleteTransaction 
} from '@/utils/supabase';
import { PRICES } from '@/utils/constants';
import { useToast } from '@/hooks/use-toast';
import useStockItems from './sales/useStockItems';

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
  
  const {
    stockItems,
    boxItems,
    error: stockError,
    setError: setStockError,
    isPizzaStockAvailable,
    isBoxStockAvailable,
    loadStockData,
    getAvailablePizzaFlavors
  } = useStockItems();
  
  const { 
    newSale: formNewSale,
    setNewSale: setFormNewSale,
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
    handleDateChange,
    resetForm
  } = useTransactionForm();
  
  const {
    createTransaction,
    updateExistingTransactions,
    handleDeleteTransaction,
    updateStockLevels
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
      const updatedData = data.map(transaction => {
        let safeState: 'Frozen Food' | 'Matang';
        
        if (typeof transaction.state === 'string') {
          const stateStr = transaction.state.toLowerCase();
          if (stateStr === 'mentah') {
            safeState = 'Frozen Food';
          } else if (stateStr === 'matang') {
            safeState = 'Matang';
          } else {
            safeState = 'Frozen Food';
          }
        } else {
          safeState = 'Frozen Food';
        }
        
        return {
          ...transaction,
          state: safeState
        };
      });
      
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

  const checkStockAvailability = (items: PizzaSaleItem[]): boolean => {
    for (const item of items) {
      const pizzaStockResult = isPizzaStockAvailable(item);
      if (!pizzaStockResult) {
        const availableFlavors = getAvailablePizzaFlavors(item.size);
        if (availableFlavors.length > 0) {
          const message = `Stock Pizza ${item.flavor} ${item.size} 0\nStock Pizza ukuran ${item.size.toLowerCase()} yang tersedia adalah:\n${availableFlavors.join(', ')}`;
          setStockError(message);
        }
        return false;
      }
      
      if (item.includeBox) {
        const boxStockResult = isBoxStockAvailable(item);
        if (!boxStockResult) {
          return false;
        }
      }
    }
    
    return true;
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
      
      const updatedSaleItems = saleItems.map(item => {
        let safeState: 'Frozen Food' | 'Matang';
        
        if (typeof item.state === 'string') {
          const stateStr = item.state.toLowerCase();
          if (stateStr === 'mentah') {
            safeState = 'Frozen Food';
          } else if (stateStr === 'matang') {
            safeState = 'Matang';
          } else {
            safeState = 'Frozen Food';
          }
        } else {
          safeState = 'Frozen Food';
        }
        
        return {
          ...item,
          state: safeState
        };
      });
      
      if (!checkStockAvailability(updatedSaleItems)) {
        toast({
          title: "Stok Tidak Cukup",
          description: stockError || "Stok pizza atau dus tidak mencukupi",
          variant: "destructive"
        });
        return;
      }
      
      const success = await createTransaction(updatedSaleItems, customerName, notes);
      
      if (success) {
        resetForm();
        setOpen(false);
      }
    } else {
      if (!formNewSale.flavor) {
        setError('Please select a pizza flavor');
        return;
      }
      
      let safeState: 'Frozen Food' | 'Matang';
      
      if (typeof formNewSale.state === 'string') {
        const stateStr = formNewSale.state.toLowerCase();
        if (stateStr === 'mentah') {
          safeState = 'Frozen Food';
        } else if (stateStr === 'matang') {
          safeState = 'Matang';
        } else {
          safeState = 'Frozen Food';
        }
      } else {
        safeState = 'Frozen Food';
      }
      
      const saleItem: PizzaSaleItem = {
        size: formNewSale.size,
        flavor: formNewSale.flavor,
        quantity: formNewSale.quantity,
        state: safeState,
        includeBox: formNewSale.includeBox,
        sellingPrice: formNewSale.sellingPrice,
        totalPrice: formNewSale.totalPrice,
        date: formNewSale.date
      };
      
      if (!checkStockAvailability([saleItem])) {
        toast({
          title: "Stok Tidak Cukup",
          description: stockError || "Stok pizza atau dus tidak mencukupi",
          variant: "destructive"
        });
        return;
      }
      
      const success = await createTransaction([saleItem], formNewSale.customerName, formNewSale.notes);
      
      if (success) {
        setFormNewSale({
          size: 'Small',
          flavor: '',
          quantity: 1,
          state: 'Frozen Food',
          includeBox: false,
          sellingPrice: 0,
          totalPrice: 0,
          customerName: '',
          notes: '',
          date: new Date().toISOString()
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
    newSale: formNewSale,
    setNewSale: setFormNewSale,
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
    handleDateChange,
    handleEditTransaction,
    handleDeleteTransaction,
    editingTransaction,
    setEditingTransaction,
    updateExistingTransactions,
    checkStockAvailability
  };
};

export default useSaleManagement;
