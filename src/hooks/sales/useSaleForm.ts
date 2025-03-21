
import { useState, useEffect } from 'react';
import { PizzaSaleItem } from '@/utils/types';
import { PRICES } from '@/utils/constants';

export const useSaleForm = () => {
  const [open, setOpen] = useState(false);
  const [isMultiItem, setIsMultiItem] = useState(true);
  
  // Single item state (legacy)
  const [newSale, setNewSale] = useState({
    size: 'Small' as 'Small' | 'Medium',
    flavor: 'Original',
    quantity: 1,
    state: 'Mentah' as 'Mentah' | 'Matang',
    includeBox: false,
    customerName: '',
    notes: ''
  });
  
  // Multi-item state
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  
  const initialSaleItem = {
    size: 'Small' as 'Small' | 'Medium',
    flavor: 'Original',
    quantity: 1,
    state: 'Mentah' as 'Mentah' | 'Matang',
    includeBox: false,
    sellingPrice: PRICES.SELLING_SMALL_RAW,
    totalPrice: PRICES.SELLING_SMALL_RAW
  };
  
  const [saleItems, setSaleItems] = useState<PizzaSaleItem[]>([initialSaleItem]);
  
  const [sellingPrice, setSellingPrice] = useState(PRICES.SELLING_SMALL_RAW);
  const [totalPrice, setTotalPrice] = useState(PRICES.SELLING_SMALL_RAW);

  // Hitung harga jual berdasarkan ukuran dan kondisi
  const calculateSellingPrice = (size: 'Small' | 'Medium', state: 'Mentah' | 'Matang') => {
    if (size === 'Small') {
      return state === 'Mentah' ? PRICES.SELLING_SMALL_RAW : PRICES.SELLING_SMALL_COOKED;
    } else {
      return state === 'Mentah' ? PRICES.SELLING_MEDIUM_RAW : PRICES.SELLING_MEDIUM_COOKED;
    }
  };

  // Hitung harga dus berdasarkan ukuran
  const calculateBoxPrice = (size: 'Small' | 'Medium', includeBox: boolean) => {
    if (!includeBox) return 0;
    return size === 'Small' ? PRICES.SELLING_SMALL_BOX : PRICES.SELLING_MEDIUM_BOX;
  };

  // Perbarui harga saat ukuran, kondisi, atau jumlah berubah
  const updatePrices = () => {
    if (isMultiItem) {
      // For multi-item, update each item's price
      const updatedItems = saleItems.map(item => {
        const basePrice = calculateSellingPrice(item.size, item.state);
        const boxPrice = calculateBoxPrice(item.size, item.includeBox);
        return {
          ...item,
          sellingPrice: basePrice,
          totalPrice: (basePrice * item.quantity) + (boxPrice * item.quantity)
        };
      });
      
      setSaleItems(updatedItems);
      
      // Calculate total price of all items
      const total = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
      setTotalPrice(total);
    } else {
      // Legacy single-item mode
      const base = calculateSellingPrice(newSale.size, newSale.state);
      const boxPrice = calculateBoxPrice(newSale.size, newSale.includeBox);
      setSellingPrice(base);
      setTotalPrice((base * newSale.quantity) + (boxPrice * newSale.quantity));
    }
  };

  useEffect(() => {
    updatePrices();
  }, [newSale.size, newSale.state, newSale.quantity, newSale.includeBox, isMultiItem, saleItems]);

  // Handle perubahan ukuran
  const handleSizeChange = (value: string) => {
    setNewSale({ ...newSale, size: value as 'Small' | 'Medium' });
  };

  // Handle perubahan rasa
  const handleFlavorChange = (value: string) => {
    setNewSale({ ...newSale, flavor: value });
  };

  // Handle perubahan kondisi
  const handleStateChange = (value: string) => {
    setNewSale({ ...newSale, state: value as 'Mentah' | 'Matang' });
  };

  // Handle item changes for multi-item form
  const handleItemChange = (index: number, updatedItem: PizzaSaleItem) => {
    const newItems = [...saleItems];
    // Update item
    newItems[index] = updatedItem;
    
    // Recalculate price
    const basePrice = calculateSellingPrice(updatedItem.size, updatedItem.state);
    const boxPrice = calculateBoxPrice(updatedItem.size, updatedItem.includeBox);
    newItems[index].sellingPrice = basePrice;
    newItems[index].totalPrice = (basePrice * updatedItem.quantity) + (boxPrice * updatedItem.quantity);
    
    setSaleItems(newItems);
  };

  // Add a new item to the multi-item form
  const handleAddItem = () => {
    setSaleItems([...saleItems, initialSaleItem]);
  };

  // Remove an item from the multi-item form
  const handleRemoveItem = (index: number) => {
    if (saleItems.length <= 1) return; // Always keep at least one item
    const newItems = saleItems.filter((_, i) => i !== index);
    setSaleItems(newItems);
  };

  // Reset form to initial state
  const resetForm = () => {
    if (isMultiItem) {
      setSaleItems([initialSaleItem]);
      setCustomerName('');
      setNotes('');
    } else {
      setNewSale({
        size: 'Small',
        flavor: 'Original',
        quantity: 1,
        state: 'Mentah',
        includeBox: false,
        customerName: '',
        notes: ''
      });
    }
  };

  return {
    open,
    setOpen,
    isMultiItem,
    setIsMultiItem,
    newSale,
    setNewSale,
    customerName,
    setCustomerName,
    notes,
    setNotes,
    saleItems,
    setSaleItems,
    sellingPrice,
    totalPrice,
    calculateSellingPrice,
    calculateBoxPrice,
    handleSizeChange,
    handleFlavorChange,
    handleStateChange,
    handleItemChange,
    handleAddItem,
    handleRemoveItem,
    resetForm
  };
};

export default useSaleForm;
