
import { supabase } from './client';
import { BoxStock } from '../types';
import { transformBoxStockFromDB, transformBoxStockToDB } from '../../integrations/supabase/database.types';

export const fetchBoxStock = async () => {
  try {
    const { data, error } = await supabase
      .from('box_stock')
      .select('*')
      .order('size', { ascending: true });
    
    if (error) {
      console.error('Error fetching box stock:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchBoxStock:', error);
    return [];
  }
};

export const updateBoxStock = async (boxStock: BoxStock): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('box_stock')
      .update({ 
        cost_price: boxStock.costPrice,
        quantity: boxStock.quantity 
      })
      .eq('id', boxStock.id);

    if (error) {
      console.error("Error updating box stock:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating box stock:", error);
    return false;
  }
};

export const addBoxStock = async (newStock: Omit<BoxStock, 'id' | 'updatedAt'>): Promise<void> => {
  try {
    console.log('Adding box stock item:', newStock);
    
    const dbData = transformBoxStockToDB(newStock);
    
    console.log('Converted box stock data:', dbData);
    
    const { error } = await supabase
      .from('box_stock')
      .insert([dbData]);

    if (error) {
      console.error("Error adding box stock:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error adding box stock:", error);
    throw error;
  }
};

export const updateBoxStockCostPrice = async (id: string, newPrice: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('box_stock')
      .update({ cost_price: newPrice })
      .eq('id', id);

    if (error) {
      console.error("Error updating box stock cost price:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating box stock cost price:", error);
    return false;
  }
};

export const deleteBoxStock = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('box_stock')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting box stock:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting box stock:", error);
    return false;
  }
};
