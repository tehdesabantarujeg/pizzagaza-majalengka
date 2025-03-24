
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

  const handleSaveOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isMultiItem) {
      if (!saleItems.some(item => item.flavor)) {
        setError('Please select at least one pizza flavor');
        return;
      }
      
      // Ensure state is always "Frozen Food" or "Matang"
      const updatedSaleItems = saleItems.map(item => {
        // Check for string type before comparison
        const state = typeof item.state === 'string' && item.state === 'Mentah' ? 'Frozen Food' : item.state;
        return {
          ...item,
          state
        };
      });
      
      await createTransaction(updatedSaleItems, customerName, notes);
      
      resetForm();
      setOpen(false);
    } else {
      if (!newSale.flavor) {
        setError('Please select a pizza flavor');
        return;
      }
      
      // Update state from "Mentah" to "Frozen Food" if needed
      // Check for string type before comparison
      const state = typeof newSale.state === 'string' && newSale.state === 'Mentah' ? 'Frozen Food' : newSale.state;
      
      const saleItem: PizzaSaleItem = {
        size: newSale.size,
        flavor: newSale.flavor,
        quantity: newSale.quantity,
        state: state,
        includeBox: newSale.includeBox,
        sellingPrice,
        totalPrice
      };
      
      await createTransaction([saleItem], newSale.customerName, newSale.notes);
      
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
    updateExistingTransaction
  };
};

export default useSaleManagement;
