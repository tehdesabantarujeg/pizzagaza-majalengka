
import { supabase } from './client';
import { transformCustomerFromDB } from '../../integrations/supabase/database.types';

export const fetchCustomers = async () => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchCustomers:', error);
    return [];
  }
};
