
import { supabase } from './client';
import { Expense } from '../types';
import { transformExpenseFromDB, transformExpenseToDB } from '../../integrations/supabase/database.types';

export const fetchExpenses = async () => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchExpenses:', error);
    return [];
  }
};

export const getCurrentMonthTotalExpenses = async () => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const { data, error } = await supabase
      .from('expenses')
      .select('amount')
      .gte('date', startOfMonth.toISOString())
      .lte('date', endOfMonth.toISOString());
    
    if (error) {
      console.error('Error fetching current month expenses:', error);
      throw error;
    }
    
    return data?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
  } catch (error) {
    console.error('Error in getCurrentMonthTotalExpenses:', error);
    return 0;
  }
};

export const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense | null> => {
  try {
    const dbData = transformExpenseToDB(expense);
    
    const { data, error } = await supabase
      .from('expenses')
      .insert([dbData])
      .select('*')
      .single();

    if (error) {
      console.error("Error adding expense:", error);
      return null;
    }

    return transformExpenseFromDB(data);
  } catch (error) {
    console.error("Error adding expense:", error);
    return null;
  }
};

export const updateExpense = async (expense: Expense): Promise<boolean> => {
  try {
    const { createdAt, ...updateData } = expense;
    const dbData = transformExpenseToDB(updateData);
    
    const { error } = await supabase
      .from('expenses')
      .update(dbData)
      .eq('id', expense.id);

    if (error) {
      console.error("Error updating expense:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating expense:", error);
    return false;
  }
};

export const deleteExpense = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting expense:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting expense:", error);
    return false;
  }
};
