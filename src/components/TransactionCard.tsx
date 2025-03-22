
import React from 'react';
import { Transaction } from '@/utils/types';
import { formatCurrency, formatDateShort } from '@/utils/constants';
import PizzaVariantBadge from './PizzaVariantBadge';
import { cn } from '@/utils/animations';
import { ShoppingCart, Package } from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
  className?: string;
  onClick?: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ 
  transaction, 
  className,
  onClick
}) => {
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
            <ShoppingCart className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-base">
              {transaction.quantity}x {transaction.flavor}
            </h3>
            <p className="text-xs text-muted-foreground">
              {formatDateShort(transaction.date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {transaction.includeBox && (
            <div className="p-1 rounded-full bg-orange-100">
              <Package className="h-3 w-3 text-orange-600" />
            </div>
          )}
          <PizzaVariantBadge 
            size={transaction.size} 
            flavor={transaction.flavor} 
            state={transaction.state}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mt-4">
        {transaction.transactionNumber && (
          <div className="flex flex-col col-span-2 mb-2">
            <span className="text-muted-foreground text-xs">ID Transaksi</span>
            <span className="font-medium">{transaction.transactionNumber}</span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">Harga Per Item</span>
          <span className="font-medium">{formatCurrency(transaction.sellingPrice)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">Total</span>
          <span className="font-medium">{formatCurrency(transaction.totalPrice)}</span>
        </div>
        {transaction.customerName && (
          <div className="flex flex-col col-span-2">
            <span className="text-muted-foreground text-xs">Pelanggan</span>
            <span className="font-medium">{transaction.customerName}</span>
          </div>
        )}
        {transaction.notes && (
          <div className="flex flex-col col-span-2">
            <span className="text-muted-foreground text-xs">Catatan</span>
            <span className="font-medium">{transaction.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionCard;
