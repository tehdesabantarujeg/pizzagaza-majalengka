
import { PizzaSaleItem, Transaction } from '@/utils/types';

export const normalizeSaleState = (
  item: PizzaSaleItem | Transaction
): 'Frozen Food' | 'Matang' => {
  const stateStr = typeof item.state === 'string' ? item.state.toLowerCase() : '';
  
  switch (stateStr) {
    case 'mentah':
      return 'Frozen Food';
    case 'matang':
      return 'Matang';
    default:
      return 'Frozen Food';
  }
};

export const normalizeSaleItem = (item: PizzaSaleItem): PizzaSaleItem => {
  const safeQuantity = typeof item.quantity === 'number' 
    ? item.quantity 
    : parseInt(String(item.quantity)) || 1;
  
  const safeSellingPrice = typeof item.sellingPrice === 'number' 
    ? item.sellingPrice 
    : parseFloat(String(item.sellingPrice)) || 0;
  
  const safeTotalPrice = safeSellingPrice * safeQuantity;
  
  return {
    ...item,
    state: normalizeSaleState(item),
    quantity: safeQuantity,
    sellingPrice: safeSellingPrice,
    totalPrice: safeTotalPrice
  };
};
