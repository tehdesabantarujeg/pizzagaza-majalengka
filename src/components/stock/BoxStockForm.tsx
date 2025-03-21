
import React, { useEffect } from 'react';
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
  // Update cost price when size changes
  useEffect(() => {
    if (newBoxStock.size === 'Small') {
      setNewBoxStock(prev => ({ ...prev, costPrice: PRICES.COST_SMALL_BOX }));
    } else {
      setNewBoxStock(prev => ({ ...prev, costPrice: PRICES.COST_MEDIUM_BOX }));
    }
  }, [newBoxStock.size]);

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Tambah Stok Dus</DialogTitle>
        <DialogDescription>
          Masukkan detail stok dus yang baru dibeli
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleBoxSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="size" className="text-right">
              Ukuran
            </Label>
            <Select value={newBoxStock.size} onValueChange={handleBoxSizeChange}>
              <SelectTrigger id="size" className="col-span-3">
                <SelectValue placeholder="Pilih ukuran" />
              </SelectTrigger>
              <SelectContent>
                {PIZZA_SIZES.map(size => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Jumlah
            </Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={newBoxStock.quantity}
              onChange={(e) => setNewBoxStock({ 
                ...newBoxStock, 
                quantity: parseInt(e.target.value) || 1 
              })}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="costPrice" className="text-right">
              Harga Modal
            </Label>
            <Input
              id="costPrice"
              type="number"
              min={1}
              value={newBoxStock.costPrice}
              onChange={(e) => setNewBoxStock({ 
                ...newBoxStock, 
                costPrice: parseInt(e.target.value) || 0
              })}
              className="col-span-3"
            />
            <div className="col-span-4 text-right text-sm text-muted-foreground">
              Default: {formatCurrency(newBoxStock.size === 'Small' ? PRICES.COST_SMALL_BOX : PRICES.COST_MEDIUM_BOX)}
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
