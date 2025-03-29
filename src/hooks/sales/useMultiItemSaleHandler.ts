
import { useState } from 'react';
import { PizzaSaleItem } from '@/utils/types';
import { useSaleValidation } from './useSaleValidation';
import { normalizeSaleItem } from './useSaleStateNormalization';
import { createTransaction } from '@/utils/supabase';
import { toast } from '@/hooks/use-toast';

export const useMultiItemSaleHandler = () => {
  const [saleItems, setSaleItems] = useState<PizzaSaleItem[]>([
    { 
      size: 'Small', 
      flavor: '', 
      quantity: 1, 
      state: 'Frozen Food', 
      includeBox: false, 
      sellingPrice: 0, 
      totalPrice: 0 
    }
  ]);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');

  const { validateSaleItems } = useSaleValidation();

  const handleAddItem = () => {
    setSaleItems(prev => [
      ...prev,
      { 
        size: 'Small', 
        flavor: '', 
        quantity: 1, 
        state: 'Frozen Food', 
        includeBox: false, 
        sellingPrice: 0, 
        totalPrice: 0 
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (saleItems.length === 1) return;
    setSaleItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PizzaSaleItem, value: any) => {
    setSaleItems(prev => {
      const updatedItems = [...prev];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
      
      if (field === 'quantity' || field === 'sellingPrice') {
        updatedItems[index].totalPrice = 
          Number(updatedItems[index].quantity) * Number(updatedItems[index].sellingPrice);
      }
      
      return updatedItems;
    });
  };

  const processMultiItemSale = async () => {
    const normalizedItems = saleItems.map(normalizeSaleItem);
    
    if (!validateSaleItems(normalizedItems)) {
      return false;
    }
    
    try {
      const success = await createTransaction(
        normalizedItems, 
        customerName, 
        notes
      );
      
      if (success) {
        // Reset form after successful sale
        setSaleItems([{ 
          size: 'Small', 
          flavor: '', 
          quantity: 1, 
          state: 'Frozen Food', 
          includeBox: false, 
          sellingPrice: 0, 
          totalPrice: 0 
        }]);
        setCustomerName('');
        setNotes('');
        
        toast({
          title: "Berhasil",
          description: "Transaksi berhasil disimpan",
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error processing multi-item sale:", error);
      toast({
        title: "Error",
        description: "Gagal membuat transaksi",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    saleItems,
    customerName,
    notes,
    setCustomerName,
    setNotes,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    processMultiItemSale
  };
};
