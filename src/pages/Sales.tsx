
import React, { useState } from 'react';
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
import { Transaction, PizzaStock } from '@/utils/types';
import { 
  PIZZA_FLAVORS, 
  PIZZA_SIZES, 
  PIZZA_STATES, 
  PRICES, 
  formatCurrency 
} from '@/utils/constants';
import { Plus, AlertCircle, ShoppingCart, Package } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

// Data stok dan transaksi contoh
const mockStockData: PizzaStock[] = [
  {
    id: '1',
    size: 'Small',
    flavor: 'Keju',
    quantity: 15,
    purchaseDate: new Date().toISOString(),
    costPrice: PRICES.COST_SMALL_PIZZA + PRICES.COST_SMALL_BOX,
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    size: 'Medium',
    flavor: 'Pepperoni',
    quantity: 8,
    purchaseDate: new Date().toISOString(),
    costPrice: PRICES.COST_MEDIUM_PIZZA + PRICES.COST_MEDIUM_BOX,
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    size: 'Small',
    flavor: 'Daging Sapi',
    quantity: 12,
    purchaseDate: new Date().toISOString(),
    costPrice: PRICES.COST_SMALL_PIZZA + PRICES.COST_SMALL_BOX,
    updatedAt: new Date().toISOString()
  },
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: new Date().toISOString(),
    pizzaId: '1',
    size: 'Small',
    flavor: 'Keju',
    quantity: 2,
    state: 'Matang',
    includeBox: true,
    sellingPrice: PRICES.SELLING_SMALL_COOKED,
    totalPrice: (PRICES.SELLING_SMALL_COOKED * 2) + (PRICES.COST_SMALL_BOX * 2),
    customerName: 'John Doe'
  },
  {
    id: '2',
    date: new Date(Date.now() - 3600000).toISOString(), // 1 jam yang lalu
    pizzaId: '2',
    size: 'Medium',
    flavor: 'Pepperoni',
    quantity: 1,
    state: 'Mentah',
    includeBox: false,
    sellingPrice: PRICES.SELLING_MEDIUM_RAW,
    totalPrice: PRICES.SELLING_MEDIUM_RAW,
    customerName: 'Jane Smith'
  },
];

const Sales = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [stockItems, setStockItems] = useState<PizzaStock[]>(mockStockData);
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
    return size === 'Small' ? PRICES.COST_SMALL_BOX : PRICES.COST_MEDIUM_BOX;
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

  // Periksa apakah stok tersedia
  const isStockAvailable = () => {
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
    
    setError('');
    return true;
  };

  // Handle pengiriman formulir
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi stok
    if (!isStockAvailable()) {
      return;
    }
    
    // Temukan item stok dan perbarui jumlah
    const updatedStock = stockItems.map(item => {
      if (item.size === newSale.size && item.flavor === newSale.flavor) {
        return {
          ...item,
          quantity: item.quantity - newSale.quantity,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
    
    // Buat transaksi baru
    const boxPrice = calculateBoxPrice(newSale.size, newSale.includeBox);
    const basePrice = calculateSellingPrice(newSale.size, newSale.state);
    const totalPrice = (basePrice * newSale.quantity) + (boxPrice * newSale.quantity);
    
    const newTransaction: Transaction = {
      id: String(Date.now()),
      date: new Date().toISOString(),
      pizzaId: stockItems.find(
        item => item.size === newSale.size && item.flavor === newSale.flavor
      )?.id || '',
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
    
    // Perbarui state
    setStockItems(updatedStock);
    setTransactions([newTransaction, ...transactions]);
    setOpen(false);
    
    // Tampilkan toast sukses
    toast({
      title: "Penjualan berhasil dicatat",
      description: `${newSale.quantity} pizza ${newSale.flavor} ${newSale.size} terjual dengan harga ${formatCurrency(totalPrice)}`,
    });
    
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
            <form onSubmit={handleSubmit}>
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
                        ? `Termasuk dus (${formatCurrency(newSale.size === 'Small' ? PRICES.COST_SMALL_BOX : PRICES.COST_MEDIUM_BOX)})` 
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
                    placeholder="Opsional"
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
                        <span>{formatCurrency(newSale.size === 'Small' ? PRICES.COST_SMALL_BOX : PRICES.COST_MEDIUM_BOX)} / pcs</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium">
                      <span>Total Harga:</span>
                      <span>{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" onClick={() => isStockAvailable()}>
                  Catat Penjualan
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
