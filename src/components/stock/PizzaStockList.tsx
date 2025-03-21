
import React from 'react';
import { PizzaStock } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingBag } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { formatCurrency, formatDateShort } from '@/utils/constants';
import PizzaVariantBadge from '@/components/PizzaVariantBadge';

interface PizzaStockListProps {
  stockItems: PizzaStock[];
  setOpenPizza: (open: boolean) => void;
}

const PizzaStockList: React.FC<PizzaStockListProps> = ({ stockItems, setOpenPizza }) => {
  return (
    <div>
      {stockItems.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rasa</TableHead>
                <TableHead>Ukuran</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Harga Modal</TableHead>
                <TableHead>Tanggal Beli</TableHead>
                <TableHead>Update Terakhir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockItems.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <PizzaVariantBadge flavor={stock.flavor} size={stock.size} state="Mentah" />
                      {stock.flavor}
                    </div>
                  </TableCell>
                  <TableCell>{stock.size}</TableCell>
                  <TableCell>{stock.quantity}</TableCell>
                  <TableCell>{formatCurrency(stock.costPrice)}</TableCell>
                  <TableCell>{formatDateShort(stock.purchaseDate)}</TableCell>
                  <TableCell>{formatDateShort(stock.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
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
    </div>
  );
};

export default PizzaStockList;
