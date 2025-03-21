
import { useState, useEffect } from 'react';
import { PizzaStock, BoxStock, Transaction, PizzaSaleItem } from '@/utils/types';
import { PRICES, formatCurrency, printReceipt } from '@/utils/constants';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchStockItems, 
  updateStockItem, 
  fetchBoxStock, 
  updateBoxStock, 
  addTransaction, 
  fetchTransactions,
  setupSupabaseTables
} from '@/utils/supabase';

export const useSaleManagement = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stockItems, setStockItems] = useState<PizzaStock[]>([]);
  const [boxItems, setBoxItems] = useState<BoxStock[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [isMultiItem, setIsMultiItem] = useState(true);
  
  // Single item state (legacy)
  const [newSale, setNewSale] = useState({
    size: 'Small' as 'Small' | 'Medium',
    flavor: 'Original',
    quantity: 1,
    state: 'Mentah' as 'Mentah' | 'Matang',
    includeBox: false,
    customerName: '',
    notes: ''
  });
  
  // Multi-item state
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  
  const initialSaleItem = {
    size: 'Small' as 'Small' | 'Medium',
    flavor: 'Original',
    quantity: 1,
    state: 'Mentah' as 'Mentah' | 'Matang',
    includeBox: false,
    sellingPrice: PRICES.SELLING_SMALL_RAW,
    totalPrice: PRICES.SELLING_SMALL_RAW
  };
  
  const [saleItems, setSaleItems] = useState<PizzaSaleItem[]>([initialSaleItem]);
  
  const [sellingPrice, setSellingPrice] = useState(PRICES.SELLING_SMALL_RAW);
  const [totalPrice, setTotalPrice] = useState(PRICES.SELLING_SMALL_RAW);

  // Ambil data stok dan transaksi saat komponen dimuat
  useEffect(() => {
    setupSupabaseTables().then(() => {
      loadData();
    });
  }, []);

  const loadData = async () => {
    try {
      const [pizzaStock, boxStock, transactionData] = await Promise.all([
        fetchStockItems(),
        fetchBoxStock(),
        fetchTransactions()
      ]);
      
      setStockItems(pizzaStock);
      setBoxItems(boxStock);
      setTransactions(transactionData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal memuat data",
        variant: "destructive"
      });
    }
  };

  // Hitung harga jual berdasarkan ukuran dan kondisi
  const calculateSellingPrice = (size: 'Small' | 'Medium', state: 'Mentah' | 'Matang') => {
    if (size === 'Small') {
      return state === 'Mentah' ? PRICES.SELLING_SMALL_RAW : PRICES.SELLING_SMALL_COOKED;
    } else {
      return state === 'Mentah' ? PRICES.SELLING_MEDIUM_RAW : PRICES.SELLING_MEDIUM_COOKED;
    }
  };

  // Hitung harga dus berdasarkan ukuran
  const calculateBoxPrice = (size: 'Small' | 'Medium', includeBox: boolean) => {
    if (!includeBox) return 0;
    return size === 'Small' ? PRICES.SELLING_SMALL_BOX : PRICES.SELLING_MEDIUM_BOX;
  };

  // Perbarui harga saat ukuran, kondisi, atau jumlah berubah
  const updatePrices = () => {
    if (isMultiItem) {
      // For multi-item, update each item's price
      const updatedItems = saleItems.map(item => {
        const basePrice = calculateSellingPrice(item.size, item.state);
        const boxPrice = calculateBoxPrice(item.size, item.includeBox);
        return {
          ...item,
          sellingPrice: basePrice,
          totalPrice: (basePrice * item.quantity) + (boxPrice * item.quantity)
        };
      });
      
      setSaleItems(updatedItems);
      
      // Calculate total price of all items
      const total = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
      setTotalPrice(total);
    } else {
      // Legacy single-item mode
      const base = calculateSellingPrice(newSale.size, newSale.state);
      const boxPrice = calculateBoxPrice(newSale.size, newSale.includeBox);
      setSellingPrice(base);
      setTotalPrice((base * newSale.quantity) + (boxPrice * newSale.quantity));
    }
  };

  useEffect(() => {
    updatePrices();
  }, [newSale.size, newSale.state, newSale.quantity, newSale.includeBox, isMultiItem, saleItems]);

  // Handle perubahan ukuran
  const handleSizeChange = (value: string) => {
    setNewSale({ ...newSale, size: value as 'Small' | 'Medium' });
  };

  // Handle perubahan rasa
  const handleFlavorChange = (value: string) => {
    setNewSale({ ...newSale, flavor: value });
  };

  // Handle perubahan kondisi
  const handleStateChange = (value: string) => {
    setNewSale({ ...newSale, state: value as 'Mentah' | 'Matang' });
  };

  // Handle item changes for multi-item form
  const handleItemChange = (index: number, updatedItem: PizzaSaleItem) => {
    const newItems = [...saleItems];
    // Update item
    newItems[index] = updatedItem;
    
    // Recalculate price
    const basePrice = calculateSellingPrice(updatedItem.size, updatedItem.state);
    const boxPrice = calculateBoxPrice(updatedItem.size, updatedItem.includeBox);
    newItems[index].sellingPrice = basePrice;
    newItems[index].totalPrice = (basePrice * updatedItem.quantity) + (boxPrice * updatedItem.quantity);
    
    setSaleItems(newItems);
  };

  // Add a new item to the multi-item form
  const handleAddItem = () => {
    setSaleItems([...saleItems, initialSaleItem]);
  };

  // Remove an item from the multi-item form
  const handleRemoveItem = (index: number) => {
    if (saleItems.length <= 1) return; // Always keep at least one item
    const newItems = saleItems.filter((_, i) => i !== index);
    setSaleItems(newItems);
  };

  // Periksa apakah stok pizza tersedia
  const isPizzaStockAvailable = (item: PizzaSaleItem) => {
    const stockItem = stockItems.find(
      stock => stock.size === item.size && stock.flavor === item.flavor
    );
    
    if (!stockItem) {
      setError(`Tidak ada stok untuk pizza ${item.flavor} ${item.size}`);
      return false;
    }
    
    if (stockItem.quantity < item.quantity) {
      setError(`Hanya tersisa ${stockItem.quantity} pizza ${item.flavor} ${item.size} dalam stok`);
      return false;
    }
    
    return {
      ...stockItem,
      remainingQuantity: stockItem.quantity - item.quantity
    };
  };

  // Periksa apakah stok dus tersedia jika diperlukan
  const isBoxStockAvailable = (item: PizzaSaleItem) => {
    if (!item.includeBox) return true;
    
    const boxStock = boxItems.find(
      stock => stock.size === item.size
    );
    
    if (!boxStock) {
      setError(`Tidak ada stok dus ukuran ${item.size}`);
      return false;
    }
    
    if (boxStock.quantity < item.quantity) {
      setError(`Hanya tersisa ${boxStock.quantity} dus ${item.size} dalam stok`);
      return false;
    }
    
    return {
      ...boxStock,
      remainingQuantity: boxStock.quantity - item.quantity
    };
  };

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
      // Create transactions for each item (or single item)
      const transactions = [];
      const stockUpdatesPromises = [];
      
      for (const { item, pizzaStock, boxStock } of stockUpdates as any[]) {
        // Update pizza stock
        const updatedPizzaStock = {
          ...pizzaStock,
          quantity: pizzaStock.remainingQuantity
        };
        
        stockUpdatesPromises.push(updateStockItem(updatedPizzaStock));
        
        // Update box stock if needed
        if (item.includeBox && boxStock !== true) {
          const updatedBoxStock = {
            ...boxStock,
            quantity: boxStock.remainingQuantity
          };
          
          stockUpdatesPromises.push(updateBoxStock(updatedBoxStock));
        }
        
        // Create transaction
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
          notes: isMultiItem ? notes : newSale.notes
        };
        
        const savedTransaction = await addTransaction(transaction);
        if (savedTransaction) {
          transactions.push(savedTransaction);
        }
      }
      
      // Apply all stock updates
      await Promise.all(stockUpdatesPromises);
      
      // Update local state
      setTransactions([...transactions, ...transactions]);
      
      // Update stock items in state
      await loadData(); // Reload to get updated stock
      
      // Show success message
      toast({
        title: "Penjualan berhasil dicatat",
        description: `${isMultiItem ? saleItems.length : 1} item terjual dengan total ${formatCurrency(totalPrice)}`,
      });
      
      // Print receipt if requested
      if (withPrinting && transactions.length > 0) {
        // For now, print first transaction only
        // In the future, you could create a combined receipt
        printReceipt(transactions[0]);
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

  // Reset form to initial state
  const resetForm = () => {
    if (isMultiItem) {
      setSaleItems([initialSaleItem]);
      setCustomerName('');
      setNotes('');
    } else {
      setNewSale({
        size: 'Small',
        flavor: 'Original',
        quantity: 1,
        state: 'Mentah',
        includeBox: false,
        customerName: '',
        notes: ''
      });
    }
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
    handleItemChange
  };
};

export default useSaleManagement;
