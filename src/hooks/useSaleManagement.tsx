import { useState, useEffect } from 'react';
import { PizzaStock, BoxStock, Transaction } from '@/utils/types';
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
  
  const [newSale, setNewSale] = useState({
    size: 'Small' as 'Small' | 'Medium',
    flavor: 'Original',
    quantity: 1,
    state: 'Mentah' as 'Mentah' | 'Matang',
    includeBox: false,
    customerName: '',
    notes: ''
  });
  
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
    const base = calculateSellingPrice(newSale.size, newSale.state);
    const boxPrice = calculateBoxPrice(newSale.size, newSale.includeBox);
    setSellingPrice(base);
    setTotalPrice((base * newSale.quantity) + (boxPrice * newSale.quantity));
  };

  useEffect(() => {
    updatePrices();
  }, [newSale.size, newSale.state, newSale.quantity, newSale.includeBox]);

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

  // Periksa apakah stok pizza tersedia
  const isPizzaStockAvailable = () => {
    const stockItem = stockItems.find(
      item => item.size === newSale.size && item.flavor === newSale.flavor
    );
    
    if (!stockItem) {
      setError(`Tidak ada stok untuk pizza ${newSale.flavor} ${newSale.size}`);
      return false;
    }
    
    if (stockItem.quantity < newSale.quantity) {
      setError(`Hanya tersisa ${stockItem.quantity} pizza ${newSale.flavor} ${newSale.size} dalam stok`);
      return false;
    }
    
    return stockItem;
  };

  // Periksa apakah stok dus tersedia jika diperlukan
  const isBoxStockAvailable = () => {
    if (!newSale.includeBox) return true;
    
    const boxStock = boxItems.find(
      item => item.size === newSale.size
    );
    
    if (!boxStock) {
      setError(`Tidak ada stok dus ukuran ${newSale.size}`);
      return false;
    }
    
    if (boxStock.quantity < newSale.quantity) {
      setError(`Hanya tersisa ${boxStock.quantity} dus ${newSale.size} dalam stok`);
      return false;
    }
    
    return boxStock;
  };

  // Memvalidasi stok yang tersedia
  const validateStock = () => {
    setError('');
    const pizzaStock = isPizzaStockAvailable();
    const boxStock = isBoxStockAvailable();
    
    if (!pizzaStock || (newSale.includeBox && !boxStock)) {
      return false;
    }
    
    return { pizzaStock, boxStock };
  };

  // Proses penjualan
  const processSale = async (withPrinting = false) => {
    // Validasi stok
    const stockResult = validateStock();
    if (!stockResult) return false;
    
    const { pizzaStock, boxStock } = stockResult as { 
      pizzaStock: PizzaStock, 
      boxStock: BoxStock | true 
    };
    
    // Perbarui stok pizza
    const updatedPizzaStock = {
      ...pizzaStock,
      quantity: pizzaStock.quantity - newSale.quantity
    };
    
    // Perbarui stok dus jika termasuk
    let updatedBoxStock;
    if (newSale.includeBox && boxStock !== true) {
      updatedBoxStock = {
        ...boxStock as BoxStock,
        quantity: (boxStock as BoxStock).quantity - newSale.quantity
      };
    }
    
    // Buat transaksi baru
    const boxPrice = calculateBoxPrice(newSale.size, newSale.includeBox);
    const basePrice = calculateSellingPrice(newSale.size, newSale.state);
    const totalPrice = (basePrice * newSale.quantity) + (boxPrice * newSale.quantity);
    
    const newTransaction: Omit<Transaction, 'id'> = {
      date: new Date().toISOString(),
      pizzaId: pizzaStock.id,
      size: newSale.size,
      flavor: newSale.flavor,
      quantity: newSale.quantity,
      state: newSale.state,
      includeBox: newSale.includeBox,
      sellingPrice: basePrice,
      totalPrice,
      customerName: newSale.customerName || undefined,
      notes: newSale.notes || undefined
    };
    
    try {
      // Simpan perubahan ke database
      await updateStockItem(updatedPizzaStock);
      
      if (newSale.includeBox && updatedBoxStock) {
        await updateBoxStock(updatedBoxStock);
      }
      
      const savedTransaction = await addTransaction(newTransaction);
      
      if (savedTransaction) {
        // Perbarui state lokal
        setStockItems(stockItems.map(item => 
          item.id === pizzaStock.id ? updatedPizzaStock : item
        ));
        
        if (newSale.includeBox && updatedBoxStock) {
          setBoxItems(boxItems.map(item => 
            item.id === (boxStock as BoxStock).id ? updatedBoxStock : item
          ));
        }
        
        setTransactions([savedTransaction, ...transactions]);
        
        // Tampilkan toast sukses
        toast({
          title: "Penjualan berhasil dicatat",
          description: `${newSale.quantity} pizza ${newSale.flavor} ${newSale.size} terjual dengan harga ${formatCurrency(totalPrice)}`,
        });
        
        // Cetak nota jika diminta
        if (withPrinting) {
          printReceipt(savedTransaction);
        }
        
        // Tutup dialog
        setOpen(false);
        
        // Reset formulir
        setNewSale({
          size: 'Small',
          flavor: 'Original',
          quantity: 1,
          state: 'Mentah',
          includeBox: false,
          customerName: '',
          notes: ''
        });
        
        return true;
      }
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

  return {
    transactions,
    stockItems,
    boxItems,
    open,
    setOpen,
    newSale,
    setNewSale,
    sellingPrice,
    totalPrice,
    error,
    handleSizeChange,
    handleFlavorChange,
    handleStateChange,
    handleSaveOnly,
    handleSavePrint
  };
};

export default useSaleManagement;
