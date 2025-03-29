
import { supabase } from './client';
import { PizzaStock } from '../types';
import { transformPizzaStockFromDB, transformPizzaStockToDB } from '../../integrations/supabase/database.types';

export const fetchStockItems = async () => {
  try {
    const { data, error } = await supabase
      .from('pizza_stock')
      .select('*')
      .order('flavor', { ascending: true });
    
    if (error) {
      console.error('Error fetching stock items:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchStockItems:', error);
    return [];
  }
};

export const updateStockItem = async (stockItem: PizzaStock): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pizza_stock')
      .update({ 
        cost_price: stockItem.costPrice,
        quantity: stockItem.quantity 
      })
      .eq('id', stockItem.id);

    if (error) {
      console.error("Error updating stock item:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating stock item:", error);
    return false;
  }
};

export const addStockItem = async (newStock: Omit<PizzaStock, 'id' | 'updatedAt'>): Promise<void> => {
  try {
    console.log('Adding pizza stock item:', newStock);
    
    const dbData = transformPizzaStockToDB(newStock);
    
    console.log('Converted stock data:', dbData);
    
    const { error } = await supabase
      .from('pizza_stock')
      .insert([dbData]);

    if (error) {
      console.error("Error adding stock item:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error adding stock item:", error);
    throw error;
  }
};

export const addMultiplePizzaStock = async (newStocks: Omit<PizzaStock, 'id' | 'updatedAt'>[]): Promise<void> => {
  try {
    console.log('Adding multiple pizza stock items:', newStocks);
    
    const dbData = newStocks.map(transformPizzaStockToDB);
    
    console.log('Converted stock data:', dbData);
    
    const { error } = await supabase
      .from('pizza_stock')
      .insert(dbData);

    if (error) {
      console.error("Error adding multiple pizza stock:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error adding multiple pizza stock:", error);
    throw error;
  }
};

export const updatePizzaStockCostPrice = async (id: string, newPrice: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pizza_stock')
      .update({ cost_price: newPrice })
      .eq('id', id);

    if (error) {
      console.error("Error updating pizza stock cost price:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating pizza stock cost price:", error);
    return false;
  }
};

export const deletePizzaStock = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pizza_stock')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting pizza stock:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting pizza stock:", error);
    return false;
  }
};

export const updatePizzaStock = async (stock: PizzaStock): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pizza_stock')
      .update(stock)
      .eq('id', stock.id);

    if (error) {
      console.error("Error updating pizza stock:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating pizza stock:", error);
    return false;
  }
};
