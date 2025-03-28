
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import PizzaStockList from '@/components/stock/PizzaStockList';
import PizzaStockForm from '@/components/stock/PizzaStockForm';
import MultiPizzaStockForm from '@/components/stock/MultiPizzaStockForm';
import BoxStockList from '@/components/stock/BoxStockList';
import BoxStockForm from '@/components/stock/BoxStockForm';
import { 
  fetchStockItems, 
  fetchBoxStock, 
  addStockItem,
  addMultiplePizzaStock,
  addBoxStock 
} from '@/utils/supabase';
import { PizzaStock, BoxStock } from '@/utils/types';
import { PRICES } from '@/utils/constants';
import { useToast } from '@/hooks/use-toast';
import StockAvailabilityTable from '@/components/dashboard/StockAvailabilityTable';

const StockManagement = () => {
  const [isOpenPizzaForm, setIsOpenPizzaForm] = useState(false);
  const [isOpenMultiPizzaForm, setIsOpenMultiPizzaForm] = useState(false);
  const [isOpenBoxForm, setIsOpenBoxForm] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch pizza stocks
  const { 
    data: pizzaStocks = [], 
    isLoading: isLoadingPizzaStocks 
  } = useQuery({
    queryKey: ['pizzaStocks'],
    queryFn: fetchStockItems
  });

  // Fetch box stocks
  const { 
    data: boxStocks = [], 
    isLoading: isLoadingBoxStocks 
  } = useQuery({
    queryKey: ['boxStocks'],
    queryFn: fetchBoxStock
  });

  // Add pizza stock mutation
  const addPizzaStockMutation = useMutation({
    mutationFn: (newStock: Omit<PizzaStock, 'id' | 'updatedAt'>) => addStockItem(newStock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pizzaStocks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      setIsOpenPizzaForm(false);
      toast({
        title: "Stock Ditambahkan",
        description: "Data stok pizza berhasil disimpan",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal Menambahkan Stock",
        description: `Error: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Add multiple pizza stock mutation
  const addMultiplePizzaStockMutation = useMutation({
    mutationFn: (newStocks: Omit<PizzaStock, 'id' | 'updatedAt'>[]) => addMultiplePizzaStock(newStocks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pizzaStocks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      setIsOpenMultiPizzaForm(false);
      toast({
        title: "Stock Ditambahkan",
        description: "Data multiple stok pizza berhasil disimpan",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal Menambahkan Stock",
        description: `Error: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Add box stock mutation
  const addBoxStockMutation = useMutation({
    mutationFn: (newStock: Omit<BoxStock, 'id' | 'updatedAt'>) => addBoxStock(newStock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boxStocks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      setIsOpenBoxForm(false);
      toast({
        title: "Stock Ditambahkan",
        description: "Data stok dus berhasil disimpan",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal Menambahkan Stock",
        description: `Error: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Handle adding a new pizza stock
  const handleAddPizzaStock = async (newStock: Omit<PizzaStock, 'id' | 'updatedAt'>) => {
    addPizzaStockMutation.mutate({
      ...newStock,
      purchaseDate: new Date().toISOString()
    });
  };

  // Handle adding multiple pizza stocks
  const handleAddMultiplePizzaStock = async (newStocks: Array<{
    size: 'Small' | 'Medium';
    flavor: string;
    quantity: number;
    costPrice: number;
  }>) => {
    addMultiplePizzaStockMutation.mutate(
      newStocks.map(stock => ({
        ...stock,
        purchaseDate: new Date().toISOString()
      }))
    );
  };

  // Handle adding a new box stock
  const handleAddBoxStock = async (newStock: Omit<BoxStock, 'id' | 'updatedAt'>) => {
    addBoxStockMutation.mutate({
      ...newStock,
      purchaseDate: new Date().toISOString()
    });
  };

  return (
    <Layout>
      <Header
        title="Manajemen Stok"
        description="Kelola stok pizza dan dus"
      >
        <div className="flex gap-2">
          <Dialog open={isOpenPizzaForm} onOpenChange={setIsOpenPizzaForm}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Tambah Stok Pizza
              </Button>
            </DialogTrigger>
            <PizzaStockForm
              onSave={handleAddPizzaStock}
              onCancel={() => setIsOpenPizzaForm(false)}
              isLoading={addPizzaStockMutation.isPending}
            />
          </Dialog>

          <Dialog open={isOpenMultiPizzaForm} onOpenChange={setIsOpenMultiPizzaForm}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Tambah Stok Pizza (Multiple)
              </Button>
            </DialogTrigger>
            <MultiPizzaStockForm
              onSave={handleAddMultiplePizzaStock}
              onCancel={() => setIsOpenMultiPizzaForm(false)}
              isLoading={addMultiplePizzaStockMutation.isPending}
            />
          </Dialog>

          <Dialog open={isOpenBoxForm} onOpenChange={setIsOpenBoxForm}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PlusIcon className="mr-2 h-4 w-4" />
                Tambah Stok Dus
              </Button>
            </DialogTrigger>
            <BoxStockForm
              newBoxStock={{
                size: 'Small',
                quantity: 1,
                costPrice: PRICES.COST_SMALL_BOX
              }}
              setNewBoxStock={() => {}}
              handleBoxSubmit={async (e) => {
                e.preventDefault();
                await handleAddBoxStock({
                  size: 'Small',
                  quantity: 1,
                  costPrice: PRICES.COST_SMALL_BOX,
                  purchaseDate: new Date().toISOString()
                });
              }}
              handleBoxSizeChange={() => {}}
            />
          </Dialog>
        </div>
      </Header>

      <div className="container px-4 py-6">
        <div className="mb-8">
          <StockAvailabilityTable 
            stockItems={pizzaStocks} 
            isLoading={isLoadingPizzaStocks || isLoadingBoxStocks} 
          />
        </div>

        <Tabs defaultValue="pizza">
          <TabsList className="mb-4">
            <TabsTrigger value="pizza">Stok Pizza</TabsTrigger>
            <TabsTrigger value="box">Stok Dus</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pizza">
            <PizzaStockList 
              data={pizzaStocks} 
              isLoading={isLoadingPizzaStocks} 
            />
          </TabsContent>
          
          <TabsContent value="box">
            <BoxStockList 
              data={boxStocks} 
              isLoading={isLoadingBoxStocks} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default StockManagement;
