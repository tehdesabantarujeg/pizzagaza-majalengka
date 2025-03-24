import { useState, useEffect } from 'react';
import { Transaction, PizzaSaleItem } from '@/utils/types';
import { addTransaction, fetchTransactions, generateTransactionNumber, updateTransaction, deleteTransaction } from '@/utils/supabase';
import { formatTransactionNumber, printReceipt, PRICES } from '@/utils/constants';
import useSaleForm from './sales/useSaleForm';
import { useToast } from '@/hooks/use-toast';
import useStockItems from './sales/useStockItems';

export const useSaleManagement = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [open, setOpen] = useState(false);
  const [isMultiItem, setIsMultiItem] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();
  
  const [newSale, setNewSale] = useState({
    size: 'Small' as 'Small' | 'Medium',
    flavor: '',
    quantity: 1,
    state: 'Mentah' as 'Mentah' | 'Matang',
    includeBox: false,
    customerName: '',
    notes: ''
  });
  
  const [saleItems, setSaleItems] = useState<PizzaSaleItem[]>([
    { 
      size: 'Small', 
      flavor: '', 
      quantity: 1, 
      state: 'Mentah', 
      includeBox: false, 
      sellingPrice: 0, 
      totalPrice: 0 
    }
  ]);
  
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  
  const { stockItems, isPizzaStockAvailable, isBoxStockAvailable, updateStockItemQuantity, updateBoxStockQuantity } = useStockItems();
  
  useEffect(() => {
    loadTransactions();
  }, []);
  
  const calculateSellingPrice = (size: 'Small' | 'Medium', state: 'Mentah' | 'Matang', includeBox: boolean): number => {
    let basePrice = 0;
    
    if (size === 'Small') {
      basePrice = state === 'Mentah' ? PRICES.SELLING_SMALL_RAW : PRICES.SELLING_SMALL_COOKED;
    } else {
      basePrice = state === 'Mentah' ? PRICES.SELLING_MEDIUM_RAW : PRICES.SELLING_MEDIUM_COOKED;
    }
    
    if (includeBox) {
      basePrice += size === 'Small' ? PRICES.SELLING_SMALL_BOX : PRICES.SELLING_MEDIUM_BOX;
    }
    
    return basePrice;
  };
  
  const calculateTotalPrice = (sellingPrice: number, quantity: number): number => {
    return sellingPrice * quantity;
  };
  
  useEffect(() => {
    const sellingPrice = calculateSellingPrice(newSale.size, newSale.state, newSale.includeBox);
    const totalPrice = calculateTotalPrice(sellingPrice, newSale.quantity);
    
    setSaleItems(items => items.map((item, index) => {
      const price = calculateSellingPrice(item.size, item.state, item.includeBox);
      return {
        ...item,
        sellingPrice: price,
        totalPrice: price * item.quantity
      };
    }));
  }, [newSale.size, newSale.state, newSale.includeBox, newSale.quantity]);
  
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
      
      const transactions = await Promise.all(items.map(async (item) => {
        const pizzaId = item.pizzaStockId && item.pizzaStockId.trim() !== '' ? item.pizzaStockId : null;
        
        const transaction: Omit<Transaction, 'id'> = {
          date: new Date().toISOString(),
          pizzaId: pizzaId || null,
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

  const handleSizeChange = (value: string) => {
    setNewSale(prev => {
      const updatedSale = { ...prev, size: value as 'Small' | 'Medium' };
      const sellingPrice = calculateSellingPrice(updatedSale.size, updatedSale.state, updatedSale.includeBox);
      return updatedSale;
    });
  };

  const handleFlavorChange = (value: string) => {
    setNewSale(prev => ({ ...prev, flavor: value }));
  };

  const handleStateChange = (value: string) => {
    setNewSale(prev => {
      const updatedSale = { ...prev, state: value as 'Mentah' | 'Matang' };
      const sellingPrice = calculateSellingPrice(updatedSale.size, updatedSale.state, updatedSale.includeBox);
      return updatedSale;
    });
  };

  const sellingPrice = calculateSellingPrice(newSale.size, newSale.state, newSale.includeBox);
  
  const totalPrice = sellingPrice * newSale.quantity;

  const handleAddItem = () => {
    setSaleItems([
      ...saleItems,
      { 
        size: 'Small', 
        flavor: '', 
        quantity: 1, 
        state: 'Mentah', 
        includeBox: false, 
        sellingPrice: calculateSellingPrice('Small', 'Mentah', false), 
        totalPrice: calculateSellingPrice('Small', 'Mentah', false) 
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (saleItems.length > 1) {
      setSaleItems(saleItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, updatedItem: PizzaSaleItem) => {
    const sellingPrice = calculateSellingPrice(
      updatedItem.size, 
      updatedItem.state, 
      updatedItem.includeBox
    );
    
    updatedItem.sellingPrice = sellingPrice;
    updatedItem.totalPrice = sellingPrice * updatedItem.quantity;
    
    const newItems = [...saleItems];
    newItems[index] = updatedItem;
    setSaleItems(newItems);
  };

  const handleSaveOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isMultiItem) {
      if (!saleItems.some(item => item.flavor)) {
        setError('Please select at least one pizza flavor');
        return;
      }
      
      await createTransaction(saleItems, customerName, notes);
      
      setSaleItems([{ 
        size: 'Small', 
        flavor: '', 
        quantity: 1, 
        state: 'Mentah', 
        includeBox: false, 
        sellingPrice: calculateSellingPrice('Small', 'Mentah', false), 
        totalPrice: calculateSellingPrice('Small', 'Mentah', false) 
      }]);
      setCustomerName('');
      setNotes('');
      setOpen(false);
    } else {
      if (!newSale.flavor) {
        setError('Please select a pizza flavor');
        return;
      }
      
      const saleItem: PizzaSaleItem = {
        size: newSale.size,
        flavor: newSale.flavor,
        quantity: newSale.quantity,
        state: newSale.state,
        includeBox: newSale.includeBox,
        sellingPrice,
        totalPrice
      };
      
      await createTransaction([saleItem], newSale.customerName, newSale.notes);
      
      setNewSale({
        size: 'Small',
        flavor: '',
        quantity: 1,
        state: 'Mentah',
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

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      const success = await deleteTransaction(transactionId);
      if (success) {
        await loadTransactions();
        toast({
          title: "Success",
          description: "Transaction deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete transaction",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive"
      });
    }
  };

  const updateExistingTransaction = async (updatedTransaction: Transaction) => {
    try {
      const success = await updateTransaction(updatedTransaction);
      if (success) {
        await loadTransactions();
        toast({
          title: "Success",
          description: "Transaction updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update transaction",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive"
      });
    }
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
