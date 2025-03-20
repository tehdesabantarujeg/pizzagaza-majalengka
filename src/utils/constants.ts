
// Konstanta harga dalam Rupiah
export const PRICES = {
  // Harga modal
  COST_SMALL_PIZZA: 16000,
  COST_SMALL_BOX: 750,
  COST_MEDIUM_PIZZA: 24000,
  COST_MEDIUM_BOX: 1000,
  
  // Harga jual
  SELLING_SMALL_RAW: 20000,
  SELLING_SMALL_COOKED: 25000,
  SELLING_MEDIUM_RAW: 28000,
  SELLING_MEDIUM_COOKED: 35000
};

// Rasa pizza
export const PIZZA_FLAVORS = [
  'Keju',
  'Pepperoni',
  'Daging Sapi',
  'Jamur',
  'Ayam',
  'Sayuran',
  'Supreme',
  'Hawaiian'
];

// Ukuran pizza
export const PIZZA_SIZES = ['Small', 'Medium'] as const;

// Kondisi pizza
export const PIZZA_STATES = ['Mentah', 'Matang'] as const;

// Format mata uang ke Rupiah Indonesia
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Format tanggal ke format Indonesia
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Format tanggal ke format pendek
export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};
