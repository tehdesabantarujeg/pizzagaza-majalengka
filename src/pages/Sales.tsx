
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FadeInStagger } from '@/components/animations/FadeIn';
import TransactionCard from '@/components/TransactionCard';
import { Transaction, PizzaStock, BoxStock } from '@/utils/types';
import { 
  PIZZA_FLAVORS, 
  PIZZA_SIZES, 
  PIZZA_STATES, 
  PRICES, 
  formatCurrency,
  printReceipt
} from '@/utils/constants';
import { Plus, AlertCircle, ShoppingCart, Package, Printer, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchStockItems, 
  updateStockItem, 
  fetchBoxStock, 
  updateBoxStock, 
  addTransaction, 
  fetchTransactions 
} from '@/utils/supabase';

const Sales = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stockItems, setStockItems] = useState<PizzaStock[]>([]);
  const [boxItems, setBoxItems] = useState<BoxStock[]>([]);
  const [open, setOpen] = useState(false);
  
  const [newSale, setNewSale] = useState({
    size: 'Small' as 'Small' | 'Medium',
    flavor: PIZZA_FLAVORS[0],
    quantity: 1,
    state: 'Mentah' as 'Mentah' | 'Matang',
    includeBox: false,
    customerName: '',
    notes: ''
  });
  
  const [sellingPrice, setSellingPrice] = useState(PRICES.SELLING_SMALL_RAW);
  const [totalPrice, setTotalPrice] = useState(PRICES.SELLING_SMALL_RAW);
  const [error, setError] = useState('');

  // Ambil data stok dan transaksi saat komponen dimuat
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pizzaStock, boxStock, transactionData] = await Promise.all([
      fetchStockItems(),
      fetchBoxStock(),
      fetchTransactions()
    ]);
    
    setStockItems(pizzaStock);
    setBoxItems(boxStock);
    setTransactions(transactionData);
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

  React.useEffect(() => {
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
          flavor: PIZZA_FLAVORS[0],
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

  return (
    <Layout>
      <Header 
        title="Proses Penjualan" 
        description="Catat dan kelola penjualan pizza"
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Penjualan Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form>
              <DialogHeader>
                <DialogTitle>Catat Penjualan Baru</DialogTitle>
                <DialogDescription>
                  Masukkan detail pizza yang dijual
                </DialogDescription>
              </DialogHeader>
              
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="size" className="text-right">
                    Ukuran
                  </Label>
                  <Select value={newSale.size} onValueChange={handleSizeChange}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih ukuran" />
                    </SelectTrigger>
                    <SelectContent>
                      {PIZZA_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="flavor" className="text-right">
                    Rasa
                  </Label>
                  <Select value={newSale.flavor} onValueChange={handleFlavorChange}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih rasa" />
                    </SelectTrigger>
                    <SelectContent>
                      {PIZZA_FLAVORS.map((flavor) => (
                        <SelectItem key={flavor} value={flavor}>
                          {flavor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="state" className="text-right">
                    Kondisi
                  </Label>
                  <Select value={newSale.state} onValueChange={handleStateChange}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih kondisi" />
                    </SelectTrigger>
                    <SelectContent>
                      {PIZZA_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Jumlah
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={newSale.quantity}
                    onChange={(e) => setNewSale({ 
                      ...newSale, 
                      quantity: parseInt(e.target.value) || 1 
                    })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="includeBox" className="text-right">
                    Tambah Dus
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Switch
                      id="includeBox"
                      checked={newSale.includeBox}
                      onCheckedChange={(checked) => setNewSale({ ...newSale, includeBox: checked })}
                    />
                    <span className="text-sm">
                      {newSale.includeBox 
                        ? `Termasuk dus (${formatCurrency(newSale.size === 'Small' ? PRICES.SELLING_SMALL_BOX : PRICES.SELLING_MEDIUM_BOX)})` 
                        : 'Tanpa dus'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customerName" className="text-right">
                    Pelanggan
                  </Label>
                  <Input
                    id="customerName"
                    value={newSale.customerName}
                    onChange={(e) => setNewSale({ ...newSale, customerName: e.target.value })}
                    placeholder="Nama pelanggan (opsional)"
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Catatan
                  </Label>
                  <Textarea
                    id="notes"
                    value={newSale.notes}
                    onChange={(e) => setNewSale({ ...newSale, notes: e.target.value })}
                    placeholder="Opsional"
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                    Harga
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Harga Satuan:</span>
                      <span>{formatCurrency(sellingPrice)}</span>
                    </div>
                    {newSale.includeBox && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Harga Dus:</span>
                        <span>{formatCurrency(newSale.size === 'Small' ? PRICES.SELLING_SMALL_BOX : PRICES.SELLING_MEDIUM_BOX)} / pcs</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium">
                      <span>Total Harga:</span>
                      <span>{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={handleSaveOnly}>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Saja
                </Button>
                <Button onClick={handleSavePrint} type="submit">
                  <Printer className="mr-2 h-4 w-4" />
                  Simpan & Cetak Nota
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Header>

      <div className="container px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FadeInStagger staggerDelay={50}>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Belum ada penjualan tercatat</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Catat penjualan pertama Anda untuk memulai
                </p>
                <Button onClick={() => setOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Penjualan Baru
                </Button>
              </div>
            )}
          </FadeInStagger>
        </div>
      </div>
    </Layout>
  );
};

export default Sales;
