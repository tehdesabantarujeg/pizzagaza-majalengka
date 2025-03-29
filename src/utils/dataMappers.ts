
import { PizzaStock, BoxStock, Transaction, Expense } from './types';

/**
 * Maps database pizza stock item to application model
 */
export const mapDbToPizzaStock = (dbItem: any): PizzaStock => {
  return {
    id: dbItem.id,
    flavor: dbItem.flavor,
    size: dbItem.size,
    quantity: dbItem.quantity,
    purchaseDate: dbItem.purchase_date,
    costPrice: dbItem.cost_price,
    createdAt: dbItem.created_at,
    updatedAt: dbItem.updated_at
  };
};

/**
 * Maps database box stock item to application model
 */
export const mapDbToBoxStock = (dbItem: any): BoxStock => {
  return {
    id: dbItem.id,
    size: dbItem.size,
    quantity: dbItem.quantity,
    purchaseDate: dbItem.purchase_date,
    costPrice: dbItem.cost_price,
    createdAt: dbItem.created_at,
    updatedAt: dbItem.updated_at
  };
};

/**
 * Maps database transaction to application model
 */
export const mapDbToTransaction = (dbItem: any): Transaction => {
  return {
    id: dbItem.id,
    date: dbItem.date,
    pizzaId: dbItem.pizza_id,
    size: dbItem.size,
    flavor: dbItem.flavor,
    quantity: dbItem.quantity,
    state: dbItem.state,
    includeBox: dbItem.include_box,
    sellingPrice: dbItem.selling_price,
    totalPrice: dbItem.total_price,
    customerName: dbItem.customer_name,
    notes: dbItem.notes,
    transactionNumber: dbItem.transaction_number,
    createdAt: dbItem.created_at
  };
};

/**
 * Maps database expense to application model
 */
export const mapDbToExpense = (dbItem: any): Expense => {
  return {
    id: dbItem.id,
    date: dbItem.date,
    category: dbItem.category,
    amount: dbItem.amount,
    description: dbItem.description,
    createdAt: dbItem.created_at
  };
};
