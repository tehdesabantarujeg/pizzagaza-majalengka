
import React from 'react';
import { BoxStock } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { formatCurrency, formatDateShort } from '@/utils/constants';

interface BoxStockListProps {
  boxItems: BoxStock[];
  setOpenBox: (open: boolean) => void;
}

const BoxStockList: React.FC<BoxStockListProps> = ({ boxItems, setOpenBox }) => {
  return (
    <div>
      {boxItems.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ukuran</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Harga Modal</TableHead>
                <TableHead>Tanggal Beli</TableHead>
                <TableHead>Update Terakhir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boxItems.map((box) => (
                <TableRow key={box.id}>
                  <TableCell className="font-medium">{box.size}</TableCell>
                  <TableCell>{box.quantity}</TableCell>
                  <TableCell>{formatCurrency(box.costPrice)}</TableCell>
                  <TableCell>{formatDateShort(box.purchaseDate)}</TableCell>
                  <TableCell>{formatDateShort(box.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
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
    </div>
  );
};

export default BoxStockList;
