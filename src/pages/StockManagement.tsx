
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StockCard from '@/components/StockCard';
import BoxStockCard from '@/components/BoxStockCard';
import { FadeInStagger } from '@/components/animations/FadeIn';
import { PizzaStock, BoxStock } from '@/utils/types';
import { PIZZA_FLAVORS, PIZZA_SIZES, PRICES, formatCurrency } from '@/utils/constants';
import { Plus, ShoppingBag, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchStockItems, addStockItem, fetchBoxStock, addBoxStock, setupSupabaseTables } from '@/utils/supabase';

const StockManagement = () => {
  const { toast } = useToast();
  const [stockItems, setStockItems] = useState<PizzaStock[]>([]);
  const [boxItems, setBoxItems] = useState<BoxStock[]>([]);
  const [openPizza, setOpenPizza] = useState(false);
  const [openBox, setOpenBox] = useState(false);
  const [activeTab, setActiveTab] = useState("pizza");
  
  const [newPizzaStock, setNewPizzaStock] = useState({
    size: 'Small' as 'Small' | 'Medium',
    flavor: PIZZA_FLAVORS[0],
    quantity: 1,
    costPrice: PRICES.COST_SMALL_PIZZA
  });
  
  const [newBoxStock, setNewBoxStock] = useState({
    size: 'Small' as 'Small' | 'Medium',
    quantity: 1,
    costPrice: PRICES.COST_SMALL_BOX
  });

  // Ambil data stok saat komponen dimuat
  useEffect(() => {
    setupSupabaseTables().then(() => {
      loadStockData();
    });
  }, []);

  const loadStockData = async () => {
    const pizzaStock = await fetchStockItems();
    setStockItems(pizzaStock);
    
    const boxStock = await fetchBoxStock();
    setBoxItems(boxStock);
  };

  // Handle perubahan ukuran pizza
  const handlePizzaSizeChange = (value: string) => {
    const size = value as 'Small' | 'Medium';
    const baseCostPrice = size === 'Small' 
      ? PRICES.COST_SMALL_PIZZA
      : PRICES.COST_MEDIUM_PIZZA;
    
    setNewPizzaStock({ 
      ...newPizzaStock, 
      size, 
      costPrice: baseCostPrice
    });
  };

  // Handle perubahan ukuran dus
  const handleBoxSizeChange = (value: string) => {
    const size = value as 'Small' | 'Medium';
    const costPrice = size === 'Small' 
      ? PRICES.COST_SMALL_BOX
      : PRICES.COST_MEDIUM_BOX;
    
    setNewBoxStock({ 
      ...newBoxStock, 
      size, 
      costPrice
    });
  };

  // Submit form tambah stok pizza
  const handlePizzaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tambahkan stok baru ke Supabase
    const newStockItem = {
      ...newPizzaStock,
      purchaseDate: new Date().toISOString()
    };
    
    const addedStock = await addStockItem(newStockItem);
    
    if (addedStock) {
      setStockItems([addedStock, ...stockItems]);
      setOpenPizza(false);
      
      toast({
        title: "Stok berhasil ditambahkan",
        description: `${newPizzaStock.quantity} pizza ${newPizzaStock.flavor} ${newPizzaStock.size} berhasil ditambahkan ke stok.`,
      });
      
      // Reset form
      setNewPizzaStock({
        size: 'Small',
        flavor: PIZZA_FLAVORS[0],
        quantity: 1,
        costPrice: PRICES.COST_SMALL_PIZZA
      });
    } else {
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal menambahkan stok pizza",
        variant: "destructive"
      });
    }
  };

  // Submit form tambah stok dus
  const handleBoxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tambahkan stok dus baru ke Supabase
    const newBoxItem = {
      ...newBoxStock,
      purchaseDate: new Date().toISOString()
    };
    
    const addedBox = await addBoxStock(newBoxItem);
    
    if (addedBox) {
      setBoxItems([addedBox, ...boxItems]);
      setOpenBox(false);
      
      toast({
        title: "Stok dus berhasil ditambahkan",
        description: `${newBoxStock.quantity} dus ${newBoxStock.size} berhasil ditambahkan ke stok.`,
      });
      
      // Reset form
      setNewBoxStock({
        size: 'Small',
        quantity: 1,
        costPrice: PRICES.COST_SMALL_BOX
      });
    } else {
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal menambahkan stok dus",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <Header 
        title="Manajemen Stok" 
        description="Tambah dan kelola inventori pizza dan dus"
      >
        {activeTab === "pizza" ? (
          <Dialog open={openPizza} onOpenChange={setOpenPizza}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Stok Pizza
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handlePizzaSubmit}>
                <DialogHeader>
                  <DialogTitle>Tambah Stok Pizza Baru</DialogTitle>
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
                      value={newPizzaStock.size} 
                      onValueChange={handlePizzaSizeChange}
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
                      value={newPizzaStock.flavor} 
                      onValueChange={(value) => setNewPizzaStock({ ...newPizzaStock, flavor: value })}
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
                      value={newPizzaStock.quantity}
                      onChange={(e) => setNewPizzaStock({ ...newPizzaStock, quantity: parseInt(e.target.value) || 1 })}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="costPrice" className="text-right">
                      Harga Modal
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="costPrice"
                        value={newPizzaStock.costPrice}
                        readOnly
                        className="bg-muted"
                      />
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(newPizzaStock.costPrice)}
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
        ) : (
          <Dialog open={openBox} onOpenChange={setOpenBox}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Stok Dus
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleBoxSubmit}>
                <DialogHeader>
                  <DialogTitle>Tambah Stok Dus Baru</DialogTitle>
                  <DialogDescription>
                    Masukkan detail stok dus yang akan ditambahkan
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="boxSize" className="text-right">
                      Ukuran
                    </Label>
                    <Select 
                      value={newBoxStock.size} 
                      onValueChange={handleBoxSizeChange}
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
                    <Label htmlFor="boxQuantity" className="text-right">
                      Jumlah
                    </Label>
                    <Input
                      id="boxQuantity"
                      type="number"
                      min={1}
                      value={newBoxStock.quantity}
                      onChange={(e) => setNewBoxStock({ ...newBoxStock, quantity: parseInt(e.target.value) || 1 })}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="boxCostPrice" className="text-right">
                      Harga Modal
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="boxCostPrice"
                        value={newBoxStock.costPrice}
                        readOnly
                        className="bg-muted"
                      />
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(newBoxStock.costPrice)}
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
        )}
      </Header>

      <div className="container px-4 py-6">
        <Tabs defaultValue="pizza" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pizza">Pizza</TabsTrigger>
            <TabsTrigger value="box">Dus</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pizza" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <FadeInStagger staggerDelay={50}>
                {stockItems.length > 0 ? (
                  stockItems.map((stock) => (
                    <StockCard key={stock.id} stock={stock} />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Tidak ada stok pizza</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      Tambahkan stok pizza pertama Anda untuk memulai
                    </p>
                    <Button onClick={() => setOpenPizza(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Stok Pizza
                    </Button>
                  </div>
                )}
              </FadeInStagger>
            </div>
          </TabsContent>
          
          <TabsContent value="box" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <FadeInStagger staggerDelay={50}>
                {boxItems.length > 0 ? (
                  boxItems.map((box) => (
                    <BoxStockCard key={box.id} stock={box} />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Tidak ada stok dus</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      Tambahkan stok dus pertama Anda untuk memulai
                    </p>
                    <Button onClick={() => setOpenBox(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Stok Dus
                    </Button>
                  </div>
                )}
              </FadeInStagger>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default StockManagement;
