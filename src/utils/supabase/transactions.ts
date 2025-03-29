
import { supabase } from './client';
import { Transaction } from '../types';
import { transformTransactionFromDB, transformTransactionToDB } from '../../integrations/supabase/database.types';
import { formatTransactionNumber } from '../constants';

export const fetchTransactions = async () => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchTransactions:', error);
    return [];
  }
};

export const deleteTransaction = async (transactionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) {
      console.error("Error deleting transaction:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return false;
  }
};

export const updateTransaction = async (transaction: Transaction): Promise<boolean> => {
  try {
    const dbData = transformTransactionToDB(transaction);
    
    const { error } = await supabase
      .from('transactions')
      .update(dbData)
      .eq('id', transaction.id);

    if (error) {
      console.error("Error updating transaction:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating transaction:", error);
    return false;
  }
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> => {
  try {
    console.log('Adding transaction:', transaction);
    
    const dbData = transformTransactionToDB(transaction);
    
    console.log('Converted transaction data:', dbData);
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([dbData])
      .select('*')
      .single();

    if (error) {
      console.error("Error adding transaction:", error);
      return null;
    }

    return transformTransactionFromDB(data);
  } catch (error) {
    console.error("Error adding transaction:", error);
    return null;
  }
};

export const generateTransactionNumber = async (): Promise<string> => {
  const count = await getTransactionCount();
  return formatTransactionNumber(count + 1);
};

export const getTransactionCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('transactions')
      .select('transaction_number', { count: 'exact', head: true })
      .not('transaction_number', 'is', null);
    
    if (error) {
      console.error('Error getting transaction count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error in getTransactionCount:', error);
    return 0;
  }
};

export const reprintTransactionReceipt = async (transactionId: string): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error || !data) {
      console.error("Error getting transaction for reprint:", error);
      throw new Error("Error getting transaction for reprint");
    }
    
    const transformedTransaction = transformTransactionFromDB(data);
    const transactionNumber = transformedTransaction.transactionNumber;
    
    let transactionsToReprint = [transformedTransaction];
    
    if (transactionNumber) {
      const { data: relatedData, error: relatedError } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_number', transactionNumber);
        
      if (!relatedError && relatedData && relatedData.length > 0) {
        transactionsToReprint = relatedData.map(transformTransactionFromDB);
      }
    }
    
    const { printReceipt } = await import('../constants');
    
    printReceipt(transactionsToReprint);
  } catch (error) {
    console.error("Error reprinting transaction receipt:", error);
    throw error;
  }
};
