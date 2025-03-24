
import { useState, useEffect } from 'react';
import { PizzaSaleItem } from '@/utils/types';
import { PRICES } from '@/utils/constants';

const useTransactionForm = () => {
  const [newSale, setNewSale] = useState({
    size: 'Small' as 'Small' | 'Medium',
    flavor: '',
    quantity: 1,
    state: 'Mentah' as 'Mentah' | 'Matang',
    includeBox: false,
    customerName: '',
    notes: ''
  });
  
  const [saleItems, setSaleItems] = useState<PizzaSaleItem[]>([
    { 
      size: 'Small', 
      flavor: '', 
      quantity: 1, 
      state: 'Mentah', 
      includeBox: false, 
      sellingPrice: calculateSellingPrice('Small', 'Mentah', false), 
      totalPrice: calculateSellingPrice('Small', 'Mentah', false) 
    }
  ]);
  
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  
  function calculateSellingPrice(size: 'Small' | 'Medium', state: 'Mentah' | 'Matang', includeBox: boolean): number {
    let basePrice = 0;
    
    if (size === 'Small') {
      basePrice = state === 'Mentah' ? PRICES.SELLING_SMALL_RAW : PRICES.SELLING_SMALL_COOKED;
    } else {
      basePrice = state === 'Mentah' ? PRICES.SELLING_MEDIUM_RAW : PRICES.SELLING_MEDIUM_COOKED;
    }
    
    if (includeBox) {
      basePrice += size === 'Small' ? PRICES.SELLING_SMALL_BOX : PRICES.SELLING_MEDIUM_BOX;
    }
    
    return basePrice;
  }
  
  function calculateTotalPrice(sellingPrice: number, quantity: number): number {
    return sellingPrice * quantity;
  }
  
  // Update sellingPrice and totalPrice when newSale state changes
  useEffect(() => {
    setSaleItems(items => items.map((item, index) => {
      const price = calculateSellingPrice(item.size, item.state, item.includeBox);
      return {
        ...item,
        sellingPrice: price,
        totalPrice: price * item.quantity
      };
    }));
  }, [newSale.size, newSale.state, newSale.includeBox, newSale.quantity]);
  
  const sellingPrice = calculateSellingPrice(newSale.size, newSale.state, newSale.includeBox);
  const totalPrice = sellingPrice * newSale.quantity;

  const handleSizeChange = (value: string) => {
    setNewSale(prev => {
      const updatedSale = { ...prev, size: value as 'Small' | 'Medium' };
      return updatedSale;
    });
  };

  const handleFlavorChange = (value: string) => {
    setNewSale(prev => ({ ...prev, flavor: value }));
  };

  const handleStateChange = (value: string) => {
    setNewSale(prev => {
      const updatedSale = { ...prev, state: value as 'Mentah' | 'Matang' };
      return updatedSale;
    });
  };

  const handleAddItem = () => {
    setSaleItems([
      ...saleItems,
      { 
        size: 'Small', 
        flavor: '', 
        quantity: 1, 
        state: 'Mentah', 
        includeBox: false, 
        sellingPrice: calculateSellingPrice('Small', 'Mentah', false), 
        totalPrice: calculateSellingPrice('Small', 'Mentah', false) 
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (saleItems.length > 1) {
      setSaleItems(saleItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, updatedItem: PizzaSaleItem) => {
    const sellingPrice = calculateSellingPrice(
      updatedItem.size, 
      updatedItem.state, 
      updatedItem.includeBox
    );
    
    updatedItem.sellingPrice = sellingPrice;
    updatedItem.totalPrice = sellingPrice * updatedItem.quantity;
    
    const newItems = [...saleItems];
    newItems[index] = updatedItem;
    setSaleItems(newItems);
  };
  
  const resetForm = () => {
    setSaleItems([{ 
      size: 'Small', 
      flavor: '', 
      quantity: 1, 
      state: 'Mentah', 
      includeBox: false, 
      sellingPrice: calculateSellingPrice('Small', 'Mentah', false), 
      totalPrice: calculateSellingPrice('Small', 'Mentah', false) 
    }]);
    setCustomerName('');
    setNotes('');
  };

  return {
    newSale,
    setNewSale,
    saleItems,
    setSaleItems,
    customerName,
    setCustomerName,
    notes,
    setNotes,
    error,
    setError,
    sellingPrice,
    totalPrice,
    calculateSellingPrice,
    calculateTotalPrice,
    handleSizeChange,
    handleFlavorChange,
    handleStateChange,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    resetForm
  };
};

export default useTransactionForm;
