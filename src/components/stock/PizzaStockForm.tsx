
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
import { PIZZA_FLAVORS, PIZZA_SIZES, PRICES, formatCurrency } from '@/utils/constants';

interface PizzaStockFormProps {
  newPizzaStock: {
    size: 'Small' | 'Medium';
    flavor: string;
    quantity: number;
    costPrice: number;
  };
  setNewPizzaStock: React.Dispatch<React.SetStateAction<{
    size: 'Small' | 'Medium';
    flavor: string;
    quantity: number;
    costPrice: number;
  }>>;
  handlePizzaSubmit: (e: React.FormEvent) => Promise<void>;
  handlePizzaSizeChange: (value: string) => void;
}

const PizzaStockForm: React.FC<PizzaStockFormProps> = ({
  newPizzaStock,
  setNewPizzaStock,
  handlePizzaSubmit,
  handlePizzaSizeChange
}) => {
  // Update cost price when size changes
  useEffect(() => {
    if (newPizzaStock.size === 'Small') {
      setNewPizzaStock(prev => ({ ...prev, costPrice: PRICES.COST_SMALL_PIZZA }));
    } else {
      setNewPizzaStock(prev => ({ ...prev, costPrice: PRICES.COST_MEDIUM_PIZZA }));
    }
  }, [newPizzaStock.size]);

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Tambah Stok Pizza</DialogTitle>
        <DialogDescription>
          Masukkan detail stok pizza yang baru dibeli
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handlePizzaSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="size" className="text-right">
              Ukuran
            </Label>
            <Select value={newPizzaStock.size} onValueChange={handlePizzaSizeChange}>
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
            <Label htmlFor="flavor" className="text-right">
              Rasa
            </Label>
            <Select 
              value={newPizzaStock.flavor} 
              onValueChange={(value) => setNewPizzaStock({ ...newPizzaStock, flavor: value })}
            >
              <SelectTrigger id="flavor" className="col-span-3">
                <SelectValue placeholder="Pilih rasa" />
              </SelectTrigger>
              <SelectContent>
                {PIZZA_FLAVORS.map(flavor => (
                  <SelectItem key={flavor} value={flavor}>
                    {flavor}
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
              value={newPizzaStock.quantity}
              onChange={(e) => setNewPizzaStock({ 
                ...newPizzaStock, 
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
              value={newPizzaStock.costPrice}
              onChange={(e) => setNewPizzaStock({ 
                ...newPizzaStock, 
                costPrice: parseInt(e.target.value) || 0
              })}
              className="col-span-3"
            />
            <div className="col-span-4 text-right text-sm text-muted-foreground">
              Default: {formatCurrency(newPizzaStock.size === 'Small' ? PRICES.COST_SMALL_PIZZA : PRICES.COST_MEDIUM_PIZZA)}
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

export default PizzaStockForm;
