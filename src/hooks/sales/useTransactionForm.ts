
import { useState, useEffect } from 'react';
import { PizzaSaleItem } from '@/utils/types';
import { PRICES } from '@/utils/constants';

const useTransactionForm = () => {
  const [newSale, setNewSale] = useState<PizzaSaleItem & { customerName: string; notes: string; date?: string }>({
    size: 'Small',
    flavor: '',
    quantity: 1,
    state: 'Frozen Food',
    includeBox: false,
    sellingPrice: 0,
    totalPrice: 0,
    customerName: '',
    notes: '',
    date: new Date().toISOString() // Default to today
  });
  
  const [saleItems, setSaleItems] = useState<PizzaSaleItem[]>([
    { 
      size: 'Small', 
      flavor: '', 
      quantity: 1, 
      state: 'Frozen Food', 
      includeBox: false, 
      sellingPrice: calculateSellingPrice('Small', 'Frozen Food', false), 
      totalPrice: calculateSellingPrice('Small', 'Frozen Food', false),
      date: new Date().toISOString() 
    }
  ]);
  
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  
  function calculateSellingPrice(size: 'Small' | 'Medium', state: 'Frozen Food' | 'Matang', includeBox: boolean): number {
    let basePrice = 0;
    
    if (size === 'Small') {
      basePrice = state === 'Frozen Food' ? PRICES.SELLING_SMALL_RAW : PRICES.SELLING_SMALL_COOKED;
    } else {
      basePrice = state === 'Frozen Food' ? PRICES.SELLING_MEDIUM_RAW : PRICES.SELLING_MEDIUM_COOKED;
    }
    
    if (includeBox) {
      basePrice += size === 'Small' ? PRICES.SELLING_SMALL_BOX : PRICES.SELLING_MEDIUM_BOX;
    }
    
    return basePrice;
  }
  
  function calculateTotalPrice(sellingPrice: number, quantity: number): number {
    return sellingPrice * quantity;
  }
  
  useEffect(() => {
    const price = calculateSellingPrice(newSale.size, newSale.state, newSale.includeBox);
    setNewSale(prev => ({
      ...prev,
      sellingPrice: price,
      totalPrice: price * prev.quantity
    }));
  }, [newSale.size, newSale.state, newSale.includeBox, newSale.quantity]);
  
  useEffect(() => {
    setSaleItems(items => items.map((item, index) => {
      const price = calculateSellingPrice(item.size, item.state, item.includeBox);
      return {
        ...item,
        sellingPrice: price,
        totalPrice: price * item.quantity
      };
    }));
  }, []);
  
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
      // Convert any input value to the expected type
      let stateValue: 'Frozen Food' | 'Matang';
      
      // Handle the specific case using string toLowerCase comparison 
      // instead of direct type comparison
      if (value && typeof value === 'string' && value.toLowerCase() === 'mentah') {
        stateValue = 'Frozen Food';
      } else if (value && typeof value === 'string' && value.toLowerCase() === 'matang') {
        stateValue = 'Matang';
      } else {
        // Default fallback, but should be either 'Frozen Food' or 'Matang'
        stateValue = 'Frozen Food';
      }
      
      return { ...prev, state: stateValue };
    });
  };

  const handleAddItem = () => {
    setSaleItems([
      ...saleItems,
      { 
        size: 'Small', 
        flavor: '', 
        quantity: 1, 
        state: 'Frozen Food', 
        includeBox: false, 
        sellingPrice: calculateSellingPrice('Small', 'Frozen Food', false), 
        totalPrice: calculateSellingPrice('Small', 'Frozen Food', false),
        date: new Date().toISOString()
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (saleItems.length > 1) {
      setSaleItems(saleItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, updatedItem: PizzaSaleItem) => {
    // Ensure state is always one of the allowed values
    let safeState: 'Frozen Food' | 'Matang';
    
    // Use string comparison instead of type comparison
    if (typeof updatedItem.state === 'string') {
      const stateStr = updatedItem.state.toLowerCase();
      if (stateStr === 'mentah') {
        safeState = 'Frozen Food';
      } else if (stateStr === 'matang') {
        safeState = 'Matang';
      } else {
        // Default to 'Frozen Food' if it's neither
        safeState = 'Frozen Food';
      }
    } else {
      // Default fallback
      safeState = 'Frozen Food';
    }
    
    const sellingPrice = calculateSellingPrice(
      updatedItem.size, 
      safeState, 
      updatedItem.includeBox
    );
    
    const newItems = [...saleItems];
    newItems[index] = {
      ...updatedItem,
      state: safeState,
      sellingPrice: sellingPrice,
      totalPrice: sellingPrice * updatedItem.quantity
    };
    
    setSaleItems(newItems);
  };

  const handleDateChange = (date: string, isMultiItem: boolean = false) => {
    if (isMultiItem) {
      // Update all items with the new date
      setSaleItems(prev => prev.map(item => ({
        ...item,
        date
      })));
    } else {
      // Update just the single sale
      setNewSale(prev => ({
        ...prev,
        date
      }));
    }
  };
  
  const resetForm = () => {
    setSaleItems([{ 
      size: 'Small', 
      flavor: '', 
      quantity: 1, 
      state: 'Frozen Food', 
      includeBox: false, 
      sellingPrice: calculateSellingPrice('Small', 'Frozen Food', false), 
      totalPrice: calculateSellingPrice('Small', 'Frozen Food', false),
      date: new Date().toISOString()
    }]);
    setCustomerName('');
    setNotes('');
    setNewSale({
      size: 'Small',
      flavor: '',
      quantity: 1,
      state: 'Frozen Food',
      includeBox: false,
      sellingPrice: 0,
      totalPrice: 0,
      customerName: '',
      notes: '',
      date: new Date().toISOString()
    });
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
    handleDateChange,
    resetForm
  };
};

export default useTransactionForm;
