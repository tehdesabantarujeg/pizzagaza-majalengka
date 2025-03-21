
import { Transaction } from './types';

// Konstanta harga dalam Rupiah
export const PRICES = {
  // Harga modal
  COST_SMALL_PIZZA: 16000,
  COST_MEDIUM_PIZZA: 24000,
  COST_SMALL_BOX: 750,
  COST_MEDIUM_BOX: 1000,
  
  // Harga jual
  SELLING_SMALL_RAW: 20000,
  SELLING_SMALL_COOKED: 25000,
  SELLING_MEDIUM_RAW: 28000,
  SELLING_MEDIUM_COOKED: 35000,
  
  // Harga jual dus (poin 5)
  SELLING_SMALL_BOX: 1000,
  SELLING_MEDIUM_BOX: 1500
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

// Format tanggal dan waktu untuk nota
export const formatReceiptDate = (dateString: string): string => {
  const date = new Date(dateString);
  const time = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const day = date.toLocaleDateString('id-ID', {
    weekday: 'long',
  });
  
  const dateFormatted = date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '/');
  
  return `${time}, ${day} ${dateFormatted}`;
};

// Data pengguna untuk login
export const USERS = [
  {
    id: '1',
    username: 'Admin',
    password: 'zenasava',
    role: 'admin',
    name: 'Administrator',
    email: 'admin@kasirpizza.com'
  },
  {
    id: '2',
    username: 'Kasir',
    password: 'tehdesa',
    role: 'kasir',
    name: 'Kasir',
    email: 'kasir@kasirpizza.com'
  }
];

// Alamat toko
export const STORE_INFO = {
  name: 'Pizza Gaza Majalengka',
  address: 'Jl. Pemuda No. 34 Majalengka',
  instagram: ['@pizza.gaza.majalengka', '@tehdesa.majalengka']
};

// Fungsi untuk memprint nota
export const printReceipt = (transaction: Transaction) => {
  const receiptWindow = window.open('', '_blank');
  if (!receiptWindow) return;
  
  const boxPrice = transaction.includeBox 
    ? (transaction.size === 'Small' ? PRICES.SELLING_SMALL_BOX : PRICES.SELLING_MEDIUM_BOX) 
    : 0;
  
  const boxDisplay = transaction.includeBox
    ? `${transaction.quantity}x${formatCurrency(boxPrice)} = ${formatCurrency(boxPrice * transaction.quantity)}`
    : 'Tidak';

  const receiptContent = `
    <html>
      <head>
        <title>Nota Penjualan</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 300px;
            margin: 0 auto;
          }
          h1 {
            font-size: 16px;
            text-align: center;
            margin-bottom: 10px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
          }
          .date-time {
            text-align: right;
            font-size: 11px;
            margin-bottom: 5px;
          }
          .info {
            margin-bottom: 15px;
          }
          .info div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .total {
            font-weight: bold;
            border-top: 1px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
          }
          @media print {
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${STORE_INFO.name.toUpperCase()}</h1>
          <div>${STORE_INFO.address}</div>
          <div class="date-time">${formatReceiptDate(transaction.date)}</div>
        </div>
        
        <div class="info">
          <div><span>Pelanggan:</span> <span>${transaction.customerName || 'Umum'}</span></div>
          <div><span>Pizza:</span> <span>${transaction.flavor}</span></div>
          <div><span>Ukuran:</span> <span>${transaction.size}</span></div>
          <div><span>Kondisi:</span> <span>${transaction.state}</span></div>
          <div><span>Jumlah:</span> <span>${transaction.quantity}</span></div>
          <div><span>Dus:</span> <span>${boxDisplay}</span></div>
          <div><span>Harga Satuan:</span> <span>${formatCurrency(transaction.sellingPrice)}</span></div>
        </div>
        
        <div class="total">
          <div><span>Total:</span> <span>${formatCurrency(transaction.totalPrice)}</span></div>
        </div>
        
        <div class="footer">
          <p>Terima kasih telah berbelanja!</p>
          <p>Follow kami di Instagram:</p>
          <p>${STORE_INFO.instagram.join(' dan ')}</p>
        </div>
        
        <button onclick="window.print(); window.close();" style="margin-top: 20px; padding: 10px;">Cetak Nota</button>
      </body>
    </html>
  `;
  
  receiptWindow.document.open();
  receiptWindow.document.write(receiptContent);
  receiptWindow.document.close();
};
