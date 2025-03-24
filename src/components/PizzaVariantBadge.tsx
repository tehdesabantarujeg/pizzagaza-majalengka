
import React from 'react';
import { cn } from '@/utils/animations';
import { Pizza } from 'lucide-react';

interface PizzaVariantBadgeProps {
  size: 'Small' | 'Medium';
  flavor: string;
  state?: 'Frozen Food' | 'Matang'; 
  className?: string;
}

const PizzaVariantBadge: React.FC<PizzaVariantBadgeProps> = ({ 
  size, 
  flavor,
  state,
  className 
}) => {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-xs font-medium",
      state === 'Frozen Food' 
        ? "bg-blue-100 text-blue-700" 
        : state === 'Matang'
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-700",
      className
    )}>
      <Pizza className="h-3 w-3" />
      <span>
        {size} {state && `• ${state}`}
      </span>
    </div>
  );
};

export default PizzaVariantBadge;
