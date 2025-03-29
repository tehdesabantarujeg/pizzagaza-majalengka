
import { useState, useEffect } from 'react';
import { PizzaStock, BoxStock, PizzaSaleItem } from '@/utils/types';
import { fetchStockItems, updateStockItem, fetchBoxStock, updateBoxStock } from '@/utils/supabase';
import { transformPizzaStockFromDB, transformBoxStockFromDB } from '@/integrations/supabase/database.types';

export const useStockItems = () => {
  const [stockItems, setStockItems] = useState<PizzaStock[]>([]);
  const [boxItems, setBoxItems] = useState<BoxStock[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadStockData();
  }, []);

  const loadStockData = async () => {
    setLoading(true);
    try {
      const [pizzaStockData, boxStockData] = await Promise.all([
        fetchStockItems(),
        fetchBoxStock()
      ]);
      
      // Transform data from DB format to app format
      const transformedPizzaStock = pizzaStockData.map(transformPizzaStockFromDB);
      const transformedBoxStock = boxStockData.map(transformBoxStockFromDB);
      
      setStockItems(transformedPizzaStock);
      setBoxItems(transformedBoxStock);
    } catch (error) {
      console.error("Error loading stock data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get available pizza flavors for a given size
  const getAvailablePizzaFlavors = (size: 'Small' | 'Medium'): string[] => {
    return stockItems
      .filter(item => item.size === size && item.quantity > 0)
      .map(item => item.flavor);
  };

  // Periksa apakah stok pizza tersedia
  const isPizzaStockAvailable = (item: PizzaSaleItem) => {
    const stockItem = stockItems.find(
      stock => stock.size === item.size && stock.flavor === item.flavor
    );
    
    if (!stockItem) {
      // Get available flavors for this size
      const availableFlavors = getAvailablePizzaFlavors(item.size);
      
      // Create a message with available flavors
      if (availableFlavors.length > 0) {
        const message = `Stock Pizza ${item.flavor} ${item.size} 0\nStock Pizza ukuran ${item.size.toLowerCase()} yang tersedia adalah:\n${availableFlavors.join(', ')}`;
        setError(message);
      } else {
        setError(`Tidak ada stok untuk pizza ${item.flavor} ${item.size}`);
      }
      return false;
    }
    
    if (stockItem.quantity < item.quantity) {
      // Get available flavors for this size as alternatives
      const availableFlavors = getAvailablePizzaFlavors(item.size);
      
      if (availableFlavors.length > 0) {
        const message = `Hanya tersisa ${stockItem.quantity} pizza ${item.flavor} ${item.size} dalam stok\nStock Pizza ukuran ${item.size.toLowerCase()} yang tersedia adalah:\n${availableFlavors.join(', ')}`;
        setError(message);
      } else {
        setError(`Hanya tersisa ${stockItem.quantity} pizza ${item.flavor} ${item.size} dalam stok`);
      }
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

  // Update stock levels after a transaction
  const updateStockItemQuantity = async (stockItem: PizzaStock): Promise<boolean> => {
    try {
      const result = await updateStockItem(stockItem);
      if (result) {
        // Update local state
        setStockItems(prev => 
          prev.map(item => 
            item.id === stockItem.id ? stockItem : item
          )
        );
      }
      return result;
    } catch (error) {
      console.error("Error updating pizza stock:", error);
      return false;
    }
  };

  const updateBoxStockQuantity = async (boxStock: BoxStock): Promise<boolean> => {
    try {
      const result = await updateBoxStock(boxStock);
      if (result) {
        // Update local state
        setBoxItems(prev => 
          prev.map(item => 
            item.id === boxStock.id ? boxStock : item
          )
        );
      }
      return result;
    } catch (error) {
      console.error("Error updating box stock:", error);
      return false;
    }
  };

  return {
    stockItems,
    boxItems,
    loading,
    error,
    setError,
    loadStockData,
    isPizzaStockAvailable,
    isBoxStockAvailable,
    updateStockItemQuantity,
    updateBoxStockQuantity,
    getAvailablePizzaFlavors
  };
};

export default useStockItems;
