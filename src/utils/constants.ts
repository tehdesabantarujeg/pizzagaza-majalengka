
// Price constants in Rupiah
export const PRICES = {
  // Cost prices
  COST_SMALL_PIZZA: 16000,
  COST_SMALL_BOX: 750,
  COST_MEDIUM_PIZZA: 24000,
  COST_MEDIUM_BOX: 1000,
  
  // Selling prices
  SELLING_SMALL_RAW: 20000,
  SELLING_SMALL_COOKED: 25000,
  SELLING_MEDIUM_RAW: 28000,
  SELLING_MEDIUM_COOKED: 35000
};

// Pizza flavors
export const PIZZA_FLAVORS = [
  'Cheese',
  'Pepperoni',
  'Beef',
  'Mushroom',
  'Chicken',
  'Veggie',
  'Supreme',
  'Hawaiian'
];

// Pizza sizes
export const PIZZA_SIZES = ['Small', 'Medium'] as const;

// Pizza states
export const PIZZA_STATES = ['Raw', 'Cooked'] as const;

// Format currency to Indonesian Rupiah
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Format date to Indonesian format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Format date to short format
export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};
