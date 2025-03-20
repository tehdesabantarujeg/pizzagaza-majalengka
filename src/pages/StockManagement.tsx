
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
import { Switch } from '@/components/ui/switch';
import StockCard from '@/components/StockCard';
import { FadeInStagger } from '@/components/animations/FadeIn';
import { PizzaStock } from '@/utils/types';
import { PIZZA_FLAVORS, PIZZA_SIZES, PRICES, formatCurrency } from '@/utils/constants';
import { Plus, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for now, will replace with Supabase data
const mockStockData: PizzaStock[] = [
  {
    id: '1',
    size: 'Small',
    flavor: 'Keju',
    quantity: 15,
    purchaseDate: new Date().toISOString(),
    costPrice: PRICES.COST_SMALL_PIZZA,
    updatedAt: new Date().toISOString(),
    includeBox: false
  },
  {
    id: '2',
    size: 'Medium',
    flavor: 'Pepperoni',
    quantity: 8,
    purchaseDate: new Date().toISOString(),
    costPrice: PRICES.COST_MEDIUM_PIZZA,
    updatedAt: new Date().toISOString(),
    includeBox: false
  },
  {
    id: '3',
    size: 'Small',
    flavor: 'Daging Sapi',
    quantity: 12,
    purchaseDate: new Date().toISOString(),
    costPrice: PRICES.COST_SMALL_PIZZA,
    updatedAt: new Date().toISOString(),
    includeBox: true
  },
  {
    id: '4',
    size: 'Medium',
    flavor: 'Hawaiian',
    quantity: 5,
    purchaseDate: new Date().toISOString(),
    costPrice: PRICES.COST_MEDIUM_PIZZA,
    updatedAt: new Date().toISOString(),
    includeBox: true
  },
];

const StockManagement = () => {
  const { toast } = useToast();
  const [stockItems, setStockItems] = useState<PizzaStock[]>(mockStockData);
  const [open, setOpen] = useState(false);
  const [newStock, setNewStock] = useState({
    size: 'Small' as 'Small' | 'Medium',
    flavor: PIZZA_FLAVORS[0],
    quantity: 1,
    includeBox: false,
    costPrice: PRICES.COST_SMALL_PIZZA
  });

  const handleSizeChange = (value: string) => {
    const size = value as 'Small' | 'Medium';
    const baseCostPrice = size === 'Small' 
      ? PRICES.COST_SMALL_PIZZA
      : PRICES.COST_MEDIUM_PIZZA;
      
    const boxPrice = newStock.includeBox 
      ? (size === 'Small' ? PRICES.COST_SMALL_BOX : PRICES.COST_MEDIUM_BOX)
      : 0;
    
    setNewStock({ 
      ...newStock, 
      size, 
      costPrice: baseCostPrice + boxPrice
    });
  };

  const handleIncludeBoxChange = (checked: boolean) => {
    const boxPrice = checked 
      ? (newStock.size === 'Small' ? PRICES.COST_SMALL_BOX : PRICES.COST_MEDIUM_BOX)
      : 0;
      
    const baseCostPrice = newStock.size === 'Small' 
      ? PRICES.COST_SMALL_PIZZA
      : PRICES.COST_MEDIUM_PIZZA;
      
    setNewStock({ 
      ...newStock, 
      includeBox: checked,
      costPrice: baseCostPrice + boxPrice
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For now, just add to local state
    // In real app, we would save to Supabase
    const newStockItem: PizzaStock = {
      id: String(Date.now()),
      ...newStock,
      purchaseDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setStockItems([newStockItem, ...stockItems]);
    setOpen(false);
    
    toast({
      title: "Stok berhasil ditambahkan",
      description: `${newStock.quantity} pizza ${newStock.flavor} ${newStock.size} berhasil ditambahkan ke stok.`,
    });
    
    // Reset form
    setNewStock({
      size: 'Small',
      flavor: PIZZA_FLAVORS[0],
      quantity: 1,
      includeBox: false,
      costPrice: PRICES.COST_SMALL_PIZZA
    });
  };

  return (
    <Layout>
      <Header 
        title="Manajemen Stok" 
        description="Tambah dan kelola inventori pizza"
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Stok
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Tambah Stok Baru</DialogTitle>
                <DialogDescription>
                  Masukkan detail stok pizza yang akan ditambahkan
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="size" className="text-right">
                    Ukuran
                  </Label>
                  <Select 
                    value={newStock.size} 
                    onValueChange={handleSizeChange}
                  >
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
                  <Select 
                    value={newStock.flavor} 
                    onValueChange={(value) => setNewStock({ ...newStock, flavor: value })}
                  >
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
                  <Label htmlFor="quantity" className="text-right">
                    Jumlah
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={newStock.quantity}
                    onChange={(e) => setNewStock({ ...newStock, quantity: parseInt(e.target.value) || 1 })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="includeBox" className="text-right">
                    Termasuk Dus
                  </Label>
                  <div className="flex items-center gap-2 col-span-3">
                    <Switch
                      id="includeBox"
                      checked={newStock.includeBox}
                      onCheckedChange={handleIncludeBoxChange}
                    />
                    <span className="text-sm text-muted-foreground">
                      {newStock.includeBox 
                        ? `Ya (+${formatCurrency(newStock.size === 'Small' ? PRICES.COST_SMALL_BOX : PRICES.COST_MEDIUM_BOX)})` 
                        : 'Tidak'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="costPrice" className="text-right">
                    Harga Modal
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Input
                      id="costPrice"
                      value={newStock.costPrice}
                      readOnly
                      className="bg-muted"
                    />
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(newStock.costPrice)}
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Tambah Stok</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Header>

      <div className="container px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <FadeInStagger staggerDelay={50}>
            {stockItems.length > 0 ? (
              stockItems.map((stock) => (
                <StockCard key={stock.id} stock={stock} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Tidak ada stok</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Tambahkan stok pertama Anda untuk memulai
                </p>
                <Button onClick={() => setOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Stok
                </Button>
              </div>
            )}
          </FadeInStagger>
        </div>
      </div>
    </Layout>
  );
};

export default StockManagement;
