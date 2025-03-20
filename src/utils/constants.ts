
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

// Fungsi untuk memprint nota
export const printReceipt = (transaction: Transaction) => {
  const receiptWindow = window.open('', '_blank');
  if (!receiptWindow) return;

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
          <h1>KASIR PIZZA</h1>
          <div>Nota Penjualan</div>
          <div>${formatDate(transaction.date)}</div>
        </div>
        
        <div class="info">
          <div><span>Customer:</span> <span>${transaction.customerName || 'Umum'}</span></div>
          <div><span>Pizza:</span> <span>${transaction.flavor}</span></div>
          <div><span>Ukuran:</span> <span>${transaction.size}</span></div>
          <div><span>Kondisi:</span> <span>${transaction.state}</span></div>
          <div><span>Jumlah:</span> <span>${transaction.quantity}</span></div>
          <div><span>Dus:</span> <span>${transaction.includeBox ? 'Ya' : 'Tidak'}</span></div>
          <div><span>Harga Satuan:</span> <span>${formatCurrency(transaction.sellingPrice)}</span></div>
        </div>
        
        <div class="total">
          <div><span>Total:</span> <span>${formatCurrency(transaction.totalPrice)}</span></div>
        </div>
        
        <div class="footer">
          <p>Terima kasih telah berbelanja!</p>
        </div>
        
        <button onclick="window.print(); window.close();" style="margin-top: 20px; padding: 10px;">Print Nota</button>
      </body>
    </html>
  `;
  
  receiptWindow.document.open();
  receiptWindow.document.write(receiptContent);
  receiptWindow.document.close();
};
