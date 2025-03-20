
import React from 'react';
import { BoxStock } from '@/utils/types';
import BoxStockCard from '@/components/BoxStockCard';
import { FadeInStagger } from '@/components/animations/FadeIn';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';

interface BoxStockListProps {
  boxItems: BoxStock[];
  setOpenBox: (open: boolean) => void;
}

const BoxStockList: React.FC<BoxStockListProps> = ({ boxItems, setOpenBox }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <FadeInStagger staggerDelay={50}>
        {boxItems.length > 0 ? (
          boxItems.map((box) => (
            <BoxStockCard key={box.id} stock={box} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Tidak ada stok dus</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Tambahkan stok dus pertama Anda untuk memulai
            </p>
            <Button onClick={() => setOpenBox(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Stok Dus
            </Button>
          </div>
        )}
      </FadeInStagger>
    </div>
  );
};

export default BoxStockList;
