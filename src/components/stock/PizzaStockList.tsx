
import React from 'react';
import { PizzaStock } from '@/utils/types';
import StockCard from '@/components/StockCard';
import { FadeInStagger } from '@/components/animations/FadeIn';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingBag } from 'lucide-react';

interface PizzaStockListProps {
  stockItems: PizzaStock[];
  setOpenPizza: (open: boolean) => void;
}

const PizzaStockList: React.FC<PizzaStockListProps> = ({ stockItems, setOpenPizza }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <FadeInStagger staggerDelay={50}>
        {stockItems.length > 0 ? (
          stockItems.map((stock) => (
            <StockCard key={stock.id} stock={stock} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Tidak ada stok pizza</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Tambahkan stok pizza pertama Anda untuk memulai
            </p>
            <Button onClick={() => setOpenPizza(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Stok Pizza
            </Button>
          </div>
        )}
      </FadeInStagger>
    </div>
  );
};

export default PizzaStockList;
