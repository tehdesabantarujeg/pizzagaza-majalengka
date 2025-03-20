
import React from 'react';
import { PizzaStock } from '@/utils/types';
import { formatCurrency, formatDateShort } from '@/utils/constants';
import PizzaVariantBadge from './PizzaVariantBadge';
import { cn } from '@/utils/animations';
import { ShoppingBag } from 'lucide-react';

interface StockCardProps {
  stock: PizzaStock;
  className?: string;
  onClick?: () => void;
}

const StockCard: React.FC<StockCardProps> = ({ stock, className, onClick }) => {
  return (
    <div 
      className={cn(
        "p-4 rounded-xl bg-white border border-border transition-all duration-200 hover:shadow-glass-hover",
        onClick && "cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
        className
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-secondary">
            <ShoppingBag className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-medium text-base">{stock.flavor} Pizza</h3>
        </div>
        <PizzaVariantBadge size={stock.size} flavor={stock.flavor} />
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm mt-4">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">Quantity</span>
          <span className="font-medium">{stock.quantity} pcs</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">Cost Price</span>
          <span className="font-medium">{formatCurrency(stock.costPrice)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">Purchase Date</span>
          <span className="font-medium">{formatDateShort(stock.purchaseDate)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">Updated</span>
          <span className="font-medium">{formatDateShort(stock.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
