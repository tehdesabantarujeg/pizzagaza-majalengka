
import React from 'react';
import { BoxStock } from '@/utils/types';
import { formatCurrency, formatDateShort } from '@/utils/constants';
import { cn } from '@/utils/animations';
import { Package } from 'lucide-react';

interface BoxStockCardProps {
  stock: BoxStock;
  className?: string;
  onClick?: () => void;
}

const BoxStockCard: React.FC<BoxStockCardProps> = ({ stock, className, onClick }) => {
  return (
    <div 
      className={cn(
        "p-4 rounded-xl bg-white border border-border transition-all duration-200 hover:shadow-glass-hover dark:bg-gray-800 dark:border-gray-700",
        onClick && "cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
        className
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-secondary">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-medium text-base">Dus {stock.size}</h3>
        </div>
        <div className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
          {stock.size}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm mt-4">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">Jumlah</span>
          <span className="font-medium">{stock.quantity} pcs</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">Harga Modal</span>
          <span className="font-medium">{formatCurrency(stock.costPrice)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">Tanggal Pembelian</span>
          <span className="font-medium">{formatDateShort(stock.purchaseDate)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">Terakhir Diperbarui</span>
          <span className="font-medium">{formatDateShort(stock.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default BoxStockCard;
