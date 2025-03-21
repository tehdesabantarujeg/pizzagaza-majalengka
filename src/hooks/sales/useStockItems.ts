
import { useState, useEffect } from 'react';
import { PizzaStock, BoxStock, PizzaSaleItem } from '@/utils/types';
import { fetchStockItems, updateStockItem, fetchBoxStock, updateBoxStock } from '@/utils/supabase';

export const useStockItems = () => {
  const [stockItems, setStockItems] = useState<PizzaStock[]>([]);
  const [boxItems, setBoxItems] = useState<BoxStock[]>([]);
  const [error, setError] = useState('');
  
  useEffect(() => {
    loadStockData();
  }, []);

  const loadStockData = async () => {
    try {
      const [pizzaStock, boxStock] = await Promise.all([
        fetchStockItems(),
        fetchBoxStock()
      ]);
      
      setStockItems(pizzaStock);
      setBoxItems(boxStock);
    } catch (error) {
      console.error("Error loading stock data:", error);
    }
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

  const updateStockItemQuantity = async (stockItem: PizzaStock): Promise<boolean> => {
    return updateStockItem(stockItem);
  };

  const updateBoxStockQuantity = async (boxStock: BoxStock): Promise<boolean> => {
    return updateBoxStock(boxStock);
  };

  return {
    stockItems,
    boxItems,
    error,
    setError,
    loadStockData,
    isPizzaStockAvailable,
    isBoxStockAvailable,
    updateStockItemQuantity,
    updateBoxStockQuantity
  };
};

export default useStockItems;
