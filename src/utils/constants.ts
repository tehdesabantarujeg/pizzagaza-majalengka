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
  SELLING_SMALL_COOKED: 24000,
  SELLING_MEDIUM_RAW: 28000,
  SELLING_MEDIUM_COOKED: 33500,
  
  // Harga jual dus (poin 5)
  SELLING_SMALL_BOX: 1000,
  SELLING_MEDIUM_BOX: 1500
};

// Rasa pizza
export const PIZZA_FLAVORS = [
  'Beef',
  'Blackpepper Sausage',
  'Cheese',
  'Chicken Paprika',
  'Japannese Curry',
  'Mentai',
  'Pepperoni',
  'Salmon Nori',
  'Tuna',
  'Crunky Kiwi',
  'Crunky Mango',
  'Crunky Peach',
  'Cinnamon Almond',
  'Caramel Dates',
  'Mulberry Puree'
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

// Format transaction number - Updated
export const formatTransactionNumber = (transactionCount: number): string => {
  const now = new Date();
  const yearPart = now.getFullYear().toString().substr(2, 2); // YY
  const monthPart = (now.getMonth() + 1).toString().padStart(2, '0'); // MM
  const sequenceNumber = String(transactionCount).padStart(4, '0'); // XXXX
  
  return `GZM-${yearPart}${monthPart}${sequenceNumber}`;
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
  name: 'PIZZA GAZA MAJALENGKA',
  address: 'Jl. Pemuda No. 34 Majalengka',
  motto: 'Enjoy While Helping Gaza',
  instagram: ['@pizza.gaza.majalengka', '@tehdesa.majalengka']
};

// Define expense categories
export const EXPENSE_CATEGORIES = [
  'Belanja Bahan',
  'Gaji Pemilik',
  'Iuran',
  'Maintenance',
  'Marketing',
  'Upah Karyawan',
  'Lainnya'
] as const;

// Fungsi untuk memprint nota - Updated for thermal printer support
export const printReceipt = (transaction: Transaction | Transaction[]): void => {
  const receiptWindow = window.open('', '_blank');
  if (!receiptWindow) return;
  
  // Handle both single transaction and array of transactions
  const transactions = Array.isArray(transaction) ? transaction : [transaction];
  if (transactions.length === 0) return;
  
  // Get customer name and date from the first transaction
  const firstTransaction = transactions[0];
  const customerName = firstTransaction.customerName || 'Umum';
  const date = firstTransaction.date;
  const transactionNumber = firstTransaction.transactionNumber || 'trx-000000';
  
  // Calculate total
  const overallTotal = transactions.reduce((sum, t) => sum + t.totalPrice, 0);
  
  // Generate items list
  const itemsList = transactions.map(t => {
    const boxPrice = t.includeBox 
      ? (t.size === 'Small' ? PRICES.SELLING_SMALL_BOX : PRICES.SELLING_MEDIUM_BOX) 
      : 0;
    
    const boxDisplayText = t.includeBox
      ? `${t.quantity}x${formatCurrency(boxPrice)}=${formatCurrency(boxPrice * t.quantity)}`
      : 'Tidak';
      
    return `
      <div class="item-row">
        <div class="item-name">${t.flavor}</div>
        <div class="item-details">
          <div>${t.size}, ${t.state}, ${t.quantity}pcs</div>
          <div>Dus: ${t.includeBox ? 'Ya' : 'Tidak'}</div>
        </div>
        <div class="item-price">
          <div>${formatCurrency(t.sellingPrice)} x ${t.quantity}</div>
          <div class="subtotal">${formatCurrency(t.totalPrice)}</div>
        </div>
      </div>
    `;
  }).join('<div class="separator"></div>');

  const receiptContent = `
    <html>
      <head>
        <title>Nota Penjualan</title>
        <style>
          body {
            font-family: monospace;
            font-size: 10px;
            max-width: 40mm;
            margin: 0 auto;
            padding: 4px;
          }
          .header {
            text-align: center;
            margin-bottom: 6px;
          }
          .header h1 {
            font-size: 12px;
            margin: 0;
            font-weight: bold;
          }
          .header p {
            margin: 2px 0;
            font-size: 9px;
          }
          .transaction-number {
            text-align: center;
            margin-bottom: 4px;
            font-weight: bold;
            font-size: 9px;
          }
          .separator {
            border-top: 1px dashed #000;
            margin: 4px 0;
          }
          .customer {
            margin-bottom: 4px;
            font-size: 9px;
          }
          .item-row {
            margin-bottom: 4px;
          }
          .item-name {
            font-weight: bold;
          }
          .item-details {
            font-size: 8px;
            margin: 2px 0;
          }
          .item-price {
            display: flex;
            justify-content: space-between;
            font-size: 8px;
          }
          .subtotal {
            font-weight: bold;
          }
          .total {
            font-weight: bold;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 4px 0;
            margin: 4px 0;
            text-align: right;
          }
          .footer {
            text-align: center;
            margin-top: 8px;
            font-size: 8px;
          }
          @media print {
            body {
              width: 40mm;
              margin: 0;
              padding: 0;
            }
            button {
              display: none;
            }
          }
          .print-button {
            display: block;
            margin: 10px auto;
            padding: 6px 10px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${STORE_INFO.name}</h1>
          <p>${STORE_INFO.address}</p>
          <p>${formatReceiptDate(date)}</p>
        </div>
        
        <div class="separator"></div>
        
        <div class="transaction-number">
          <div>${transactionNumber}</div>
        </div>
        
        <div class="customer">
          <div>Pelanggan: ${customerName}</div>
        </div>
        
        <div class="items">
          ${itemsList}
        </div>
        
        <div class="total">
          <div>Total: ${formatCurrency(overallTotal)}</div>
        </div>
        
        <div class="footer">
          <p>Terima kasih telah berbelanja!</p>
          <p>${STORE_INFO.instagram.join(' & ')}</p>
        </div>
        
        <button class="print-button" onclick="window.print(); setTimeout(() => window.close(), 500);">Cetak Nota</button>
      </body>
    </html>
  `;
  
  receiptWindow.document.open();
  receiptWindow.document.write(receiptContent);
  receiptWindow.document.close();
  
  // Automatically trigger print after content is loaded
  receiptWindow.onload = function() {
    setTimeout(() => {
      receiptWindow.print();
      // Close the window after printing (or after 2 seconds if print is cancelled)
      setTimeout(() => {
        if (!receiptWindow.closed) {
          receiptWindow.close();
        }
      }, 2000);
    }, 500);
  };
};
