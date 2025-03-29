
import { PizzaStock, BoxStock, Transaction, Expense } from '@/utils/types';

/**
 * Transforms database snake_case fields to frontend camelCase fields for PizzaStock
 */
export const mapDbToPizzaStock = (dbItem: any): PizzaStock => {
  return {
    id: dbItem.id,
    size: dbItem.size,
    flavor: dbItem.flavor,
    quantity: dbItem.quantity,
    purchaseDate: dbItem.purchase_date,
    costPrice: dbItem.cost_price,
    updatedAt: dbItem.updated_at || dbItem.created_at
  };
};

/**
 * Transforms database snake_case fields to frontend camelCase fields for BoxStock
 */
export const mapDbToBoxStock = (dbItem: any): BoxStock => {
  return {
    id: dbItem.id,
    size: dbItem.size,
    quantity: dbItem.quantity,
    purchaseDate: dbItem.purchase_date,
    costPrice: dbItem.cost_price,
    updatedAt: dbItem.updated_at || dbItem.created_at
  };
};

/**
 * Transforms database snake_case fields to frontend camelCase fields for Transaction
 */
export const mapDbToTransaction = (dbItem: any): Transaction => {
  return {
    id: dbItem.id,
    date: dbItem.date,
    pizzaId: dbItem.pizza_id,
    size: dbItem.size,
    flavor: dbItem.flavor,
    quantity: dbItem.quantity,
    state: dbItem.state as 'Frozen Food' | 'Matang',
    includeBox: dbItem.include_box,
    sellingPrice: dbItem.selling_price,
    totalPrice: dbItem.total_price,
    customerName: dbItem.customer_name,
    notes: dbItem.notes,
    transactionNumber: dbItem.transaction_number
  };
};

/**
 * Transforms database snake_case fields to frontend camelCase fields for Expense
 */
export const mapDbToExpense = (dbItem: any): Expense => {
  return {
    id: dbItem.id,
    category: dbItem.category,
    date: dbItem.date,
    amount: dbItem.amount,
    description: dbItem.description,
    createdAt: dbItem.created_at
  };
};
