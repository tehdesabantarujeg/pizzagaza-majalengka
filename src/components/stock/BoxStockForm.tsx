
import React from 'react';
import { 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { PIZZA_SIZES, PRICES, formatCurrency } from '@/utils/constants';

interface BoxStockFormProps {
  newBoxStock: {
    size: 'Small' | 'Medium';
    quantity: number;
    costPrice: number;
  };
  setNewBoxStock: React.Dispatch<React.SetStateAction<{
    size: 'Small' | 'Medium';
    quantity: number;
    costPrice: number;
  }>>;
  handleBoxSubmit: (e: React.FormEvent) => Promise<void>;
  handleBoxSizeChange: (value: string) => void;
}

const BoxStockForm: React.FC<BoxStockFormProps> = ({ 
  newBoxStock, 
  setNewBoxStock, 
  handleBoxSubmit, 
  handleBoxSizeChange 
}) => {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <form onSubmit={handleBoxSubmit}>
        <DialogHeader>
          <DialogTitle>Tambah Stok Dus Baru</DialogTitle>
          <DialogDescription>
            Masukkan detail stok dus yang akan ditambahkan
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="boxSize" className="text-right">
              Ukuran
            </Label>
            <Select 
              value={newBoxStock.size} 
              onValueChange={handleBoxSizeChange}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih ukuran" />
              </SelectTrigger>
              <SelectContent>
                {PIZZA_SIZES.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="boxQuantity" className="text-right">
              Jumlah
            </Label>
            <Input
              id="boxQuantity"
              type="number"
              min={1}
              value={newBoxStock.quantity}
              onChange={(e) => setNewBoxStock({ ...newBoxStock, quantity: parseInt(e.target.value) || 1 })}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="boxCostPrice" className="text-right">
              Harga Modal
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="boxCostPrice"
                value={newBoxStock.costPrice}
                readOnly
                className="bg-muted"
              />
              <span className="text-sm text-muted-foreground">
                {formatCurrency(newBoxStock.costPrice)}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Tambah Stok</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default BoxStockForm;
