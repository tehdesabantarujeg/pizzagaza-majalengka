
import { useState } from 'react';
import { Transaction, PizzaSaleItem } from '@/utils/types';
import { formatCurrency, printReceipt } from '@/utils/constants';
import { useToast } from '@/hooks/use-toast';
import useTransactions from './sales/useTransactions';
import useStockItems from './sales/useStockItems';
import useSaleForm from './sales/useSaleForm';

export const useSaleManagement = () => {
  const { toast } = useToast();
  
  // Use refactored hooks
  const { 
    transactions, 
    loadTransactions, 
    addNewTransaction,
    getNextTransactionNumber,
    deleteTransactionById,
    updateExistingTransaction
  } = useTransactions();
  
  const { 
    stockItems, 
    boxItems, 
    error, 
    setError, 
    isPizzaStockAvailable, 
    isBoxStockAvailable, 
    updateStockItemQuantity, 
    updateBoxStockQuantity, 
    loadStockData 
  } = useStockItems();
  
  const {
    open,
    setOpen,
    isMultiItem,
    setIsMultiItem,
    newSale,
    setNewSale,
    customerName,
    setCustomerName,
    notes,
    setNotes,
    saleItems,
    setSaleItems,
    sellingPrice,
    totalPrice,
    calculateSellingPrice,
    calculateBoxPrice,
    handleSizeChange,
    handleFlavorChange,
    handleStateChange,
    handleItemChange,
    handleAddItem,
    handleRemoveItem,
    resetForm
  } = useSaleForm();

  // Added state for editing transaction
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Memvalidasi stok yang tersedia
  const validateStock = () => {
    setError('');
    
    if (isMultiItem) {
      // Validate each item in the sale
      const stockUpdates = [];
      
      for (let i = 0; i < saleItems.length; i++) {
        const item = saleItems[i];
        const pizzaStock = isPizzaStockAvailable(item);
        const boxStock = isBoxStockAvailable(item);
        
        if (!pizzaStock || (item.includeBox && !boxStock)) {
          return false;
        }
        
        // Track stock updates
        stockUpdates.push({
          item,
          pizzaStock,
          boxStock: item.includeBox ? boxStock : true
        });
      }
      
      return stockUpdates;
    } else {
      // Legacy single-item validation
      const singleItem: PizzaSaleItem = {
        size: newSale.size,
        flavor: newSale.flavor,
        quantity: newSale.quantity,
        state: newSale.state,
        includeBox: newSale.includeBox,
        sellingPrice: sellingPrice,
        totalPrice: totalPrice
      };
      
      const pizzaStock = isPizzaStockAvailable(singleItem);
      const boxStock = isBoxStockAvailable(singleItem);
      
      if (!pizzaStock || (newSale.includeBox && !boxStock)) {
        return false;
      }
      
      return [{
        item: singleItem,
        pizzaStock,
        boxStock: newSale.includeBox ? boxStock : true
      }];
    }
  };

  // Proses penjualan
  const processSale = async (withPrinting = false) => {
    // Validasi stok
    const stockUpdates = validateStock();
    if (!stockUpdates) return false;
    
    try {
      // Get a single transaction number for all items
      const transactionNumber = await getNextTransactionNumber();
      
      // Create transactions for each item (or single item)
      const savedTransactions: Transaction[] = [];
      const stockUpdatesPromises = [];
      
      for (const { item, pizzaStock, boxStock } of stockUpdates as any[]) {
        // Update pizza stock
        const updatedPizzaStock = {
          ...pizzaStock,
          quantity: pizzaStock.remainingQuantity
        };
        
        stockUpdatesPromises.push(updateStockItemQuantity(updatedPizzaStock));
        
        // Update box stock if needed
        if (item.includeBox && boxStock !== true) {
          const updatedBoxStock = {
            ...boxStock,
            quantity: boxStock.remainingQuantity
          };
          
          stockUpdatesPromises.push(updateBoxStockQuantity(updatedBoxStock));
        }
        
        // Create transaction with the same transaction number for all items
        const transaction: Omit<Transaction, 'id'> = {
          date: new Date().toISOString(),
          pizzaId: pizzaStock.id,
          size: item.size,
          flavor: item.flavor,
          quantity: item.quantity,
          state: item.state,
          includeBox: item.includeBox,
          sellingPrice: item.sellingPrice,
          totalPrice: item.totalPrice,
          customerName: isMultiItem ? customerName : newSale.customerName,
          notes: isMultiItem ? notes : newSale.notes,
          transactionNumber: transactionNumber  // Same transaction number for all items
        };
        
        const savedTransaction = await addNewTransaction(transaction, transactionNumber);
        if (savedTransaction) {
          savedTransactions.push(savedTransaction);
        }
      }
      
      // Apply all stock updates
      await Promise.all(stockUpdatesPromises);
      
      // Update stock items in state
      await loadStockData();
      await loadTransactions();
      
      // Show success message
      toast({
        title: "Penjualan berhasil dicatat",
        description: `${isMultiItem ? saleItems.length : 1} item terjual dengan total ${formatCurrency(totalPrice)}`,
      });
      
      // Print receipt if requested
      if (withPrinting && savedTransactions.length > 0) {
        // Print all transactions as one receipt
        printReceipt(savedTransactions);
      }
      
      // Close dialog and reset form
      setOpen(false);
      resetForm();
      
      return true;
    } catch (error) {
      console.error("Error saat memproses penjualan:", error);
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal memproses penjualan",
        variant: "destructive"
      });
    }
    
    return false;
  };

  // Handle simpan saja
  const handleSaveOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    await processSale(false);
  };

  // Handle simpan dan cetak
  const handleSavePrint = async (e: React.FormEvent) => {
    e.preventDefault();
    await processSale(true);
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      const success = await deleteTransactionById(transactionId);
      if (success) {
        toast({
          title: "Transaksi dihapus",
          description: "Transaksi berhasil dihapus dari sistem",
        });
      } else {
        toast({
          title: "Gagal menghapus",
          description: "Terjadi kesalahan saat menghapus transaksi",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal menghapus transaksi",
        variant: "destructive"
      });
    }
  };

  // Function to update a transaction
  const handleUpdateTransaction = async (transaction: Transaction) => {
    try {
      const success = await updateExistingTransaction(transaction);
      if (success) {
        toast({
          title: "Transaksi diperbarui",
          description: "Detail transaksi berhasil diperbarui",
        });
      } else {
        toast({
          title: "Gagal memperbarui",
          description: "Terjadi kesalahan saat memperbarui transaksi",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal memperbarui transaksi",
        variant: "destructive"
      });
    }
  };

  return {
    transactions,
    stockItems,
    boxItems,
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
    updateExistingTransaction: handleUpdateTransaction
  };
};

export default useSaleManagement;
