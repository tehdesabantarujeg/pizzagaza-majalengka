
import { useState, useEffect } from 'react';
import { PizzaSaleItem } from '@/utils/types';
import { PRICES } from '@/utils/constants';

const useTransactionForm = () => {
  const [newSale, setNewSale] = useState({
    size: 'Small' as 'Small' | 'Medium',
    flavor: '',
    quantity: 1,
    state: 'Frozen Food' as 'Frozen Food' | 'Matang',
    includeBox: false,
    customerName: '',
    notes: ''
  });
  
  const [saleItems, setSaleItems] = useState<PizzaSaleItem[]>([
    { 
      size: 'Small', 
      flavor: '', 
      quantity: 1, 
      state: 'Frozen Food', 
      includeBox: false, 
      sellingPrice: calculateSellingPrice('Small', 'Frozen Food', false), 
      totalPrice: calculateSellingPrice('Small', 'Frozen Food', false) 
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
      // Convert any input value to the expected type
      let stateValue: 'Frozen Food' | 'Matang';
      
      // Handle the specific case conversion
      if (value === 'Mentah') {
        stateValue = 'Frozen Food';
      } else if (value === 'Matang') {
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
        totalPrice: calculateSellingPrice('Small', 'Frozen Food', false) 
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
    
    // Use type-safe comparison
    if (typeof updatedItem.state === 'string') {
      if (updatedItem.state === 'Mentah') {
        safeState = 'Frozen Food';
      } else if (updatedItem.state === 'Matang') {
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
  
  const resetForm = () => {
    setSaleItems([{ 
      size: 'Small', 
      flavor: '', 
      quantity: 1, 
      state: 'Frozen Food', 
      includeBox: false, 
      sellingPrice: calculateSellingPrice('Small', 'Frozen Food', false), 
      totalPrice: calculateSellingPrice('Small', 'Frozen Food', false) 
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
