
import React from 'react';
import { cn } from '@/utils/animations';

interface PizzaVariantBadgeProps {
  size: 'Small' | 'Medium';
  flavor: string;
  state?: 'Raw' | 'Cooked';
  className?: string;
}

export const PizzaVariantBadge: React.FC<PizzaVariantBadgeProps> = ({
  size,
  flavor,
  state,
  className
}) => {
  const getFlavorColor = (flavor: string) => {
    const flavors: Record<string, string> = {
      'Cheese': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Pepperoni': 'bg-red-100 text-red-800 border-red-200',
      'Beef': 'bg-orange-100 text-orange-800 border-orange-200',
      'Mushroom': 'bg-neutral-100 text-neutral-800 border-neutral-200',
      'Chicken': 'bg-amber-100 text-amber-800 border-amber-200',
      'Veggie': 'bg-green-100 text-green-800 border-green-200',
      'Supreme': 'bg-purple-100 text-purple-800 border-purple-200',
      'Hawaiian': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return flavors[flavor] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  const getSizeColor = (size: 'Small' | 'Medium') => {
    return size === 'Small' 
      ? 'bg-teal-100 text-teal-800 border-teal-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };
  
  const getStateColor = (state?: 'Raw' | 'Cooked') => {
    if (!state) return '';
    return state === 'Raw' 
      ? 'bg-slate-100 text-slate-800 border-slate-200' 
      : 'bg-rose-100 text-rose-800 border-rose-200';
  };

  return (
    <div className="flex flex-wrap gap-2">
      <span className={cn(
        "px-2.5 py-0.5 text-xs font-medium rounded-full border",
        getSizeColor(size),
        className
      )}>
        {size}
      </span>
      
      <span className={cn(
        "px-2.5 py-0.5 text-xs font-medium rounded-full border",
        getFlavorColor(flavor),
        className
      )}>
        {flavor}
      </span>
      
      {state && (
        <span className={cn(
          "px-2.5 py-0.5 text-xs font-medium rounded-full border",
          getStateColor(state),
          className
        )}>
          {state}
        </span>
      )}
    </div>
  );
};

export default PizzaVariantBadge;
