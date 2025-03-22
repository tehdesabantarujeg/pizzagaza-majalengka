
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from 'lucide-react';
import { PizzaStock, BoxStock } from '@/utils/types';
import { PRICES } from '@/utils/constants';
import { useToast } from '@/hooks/use-toast';
import { fetchStockItems, addStockItem, fetchBoxStock, addBoxStock, setupSupabaseTables } from '@/utils/supabase';
import PizzaStockForm from '@/components/stock/PizzaStockForm';
import BoxStockForm from '@/components/stock/BoxStockForm';
import PizzaStockList from '@/components/stock/PizzaStockList';
import BoxStockList from '@/components/stock/BoxStockList';
import StockStatusChart from '@/components/dashboard/StockStatusChart';
import BoxStockStatusChart from '@/components/dashboard/BoxStockStatusChart';

const StockManagement = () => {
  const { toast } = useToast();
  const [stockItems, setStockItems] = useState<PizzaStock[]>([]);
  const [boxItems, setBoxItems] = useState<BoxStock[]>([]);
  const [openPizza, setOpenPizza] = useState(false);
  const [openBox, setOpenBox] = useState(false);
  const [activeTab, setActiveTab] = useState("pizza");
  
  const [newPizzaStock, setNewPizzaStock] = useState({
    size: 'Small' as 'Small' | 'Medium',
    flavor: 'Original',
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
        flavor: 'Original',
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
            <PizzaStockForm
              newPizzaStock={newPizzaStock}
              setNewPizzaStock={setNewPizzaStock}
              handlePizzaSubmit={handlePizzaSubmit}
              handlePizzaSizeChange={handlePizzaSizeChange}
            />
          </Dialog>
        ) : (
          <Dialog open={openBox} onOpenChange={setOpenBox}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Stok Dus
              </Button>
            </DialogTrigger>
            <BoxStockForm
              newBoxStock={newBoxStock}
              setNewBoxStock={setNewBoxStock}
              handleBoxSubmit={handleBoxSubmit}
              handleBoxSizeChange={handleBoxSizeChange}
            />
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
            <div className="grid grid-cols-1 gap-6">
              <StockStatusChart stockItems={stockItems} />
              <PizzaStockList stockItems={stockItems} setOpenPizza={setOpenPizza} loadStockData={loadStockData} />
            </div>
          </TabsContent>
          
          <TabsContent value="box" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <BoxStockStatusChart boxItems={boxItems} />
              <BoxStockList boxItems={boxItems} setOpenBox={setOpenBox} loadStockData={loadStockData} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default StockManagement;
