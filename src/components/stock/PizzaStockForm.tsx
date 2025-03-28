
import React, { useState } from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
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
import { 
  PIZZA_FLAVORS, 
  PIZZA_SIZES, 
  PRICES 
} from '@/utils/constants';
import { PizzaStock } from '@/utils/types';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PizzaStockFormProps {
  onSave: (stock: Omit<PizzaStock, 'id' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const PizzaStockForm: React.FC<PizzaStockFormProps> = ({
  onSave,
  onCancel,
  isLoading
}) => {
  const [size, setSize] = useState<'Small' | 'Medium'>('Small');
  const [flavor, setFlavor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [costPrice, setCostPrice] = useState(PRICES.COST_SMALL);
  const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
  const [error, setError] = useState('');

  const handleSizeChange = (value: 'Small' | 'Medium') => {
    setSize(value);
    // Update cost price based on size
    setCostPrice(value === 'Small' ? PRICES.COST_SMALL : PRICES.COST_MEDIUM);
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!flavor) {
      setError('Rasa pizza harus dipilih');
      return;
    }

    if (quantity <= 0) {
      setError('Jumlah harus lebih dari 0');
      return;
    }

    if (costPrice <= 0) {
      setError('Harga modal harus lebih dari 0');
      return;
    }

    try {
      await onSave({
        size,
        flavor,
        quantity,
        costPrice,
        purchaseDate: purchaseDate.toISOString()
      });
    } catch (err) {
      setError('Gagal menyimpan data stok');
    }
  };

  return (
    <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Tambah Stok Pizza</DialogTitle>
        <DialogDescription>
          Tambahkan stok pizza ke inventaris
        </DialogDescription>
      </DialogHeader>
      
      {error && (
        <div className="bg-destructive/20 text-destructive p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="flavor">Rasa Pizza</Label>
            <Select
              value={flavor}
              onValueChange={setFlavor}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih rasa" />
              </SelectTrigger>
              <SelectContent>
                {PIZZA_FLAVORS.map((flav) => (
                  <SelectItem key={flav} value={flav}>{flav}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="size">Ukuran</Label>
            <Select
              value={size}
              onValueChange={(value) => handleSizeChange(value as 'Small' | 'Medium')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih ukuran" />
              </SelectTrigger>
              <SelectContent>
                {PIZZA_SIZES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid gap-4">
          <div>
            <Label htmlFor="quantity">Jumlah</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div>
            <Label htmlFor="costPrice">Harga Modal (Rp)</Label>
            <Input
              id="costPrice"
              type="number"
              min="0"
              value={costPrice}
              onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Default: Rp {size === 'Small' ? PRICES.COST_SMALL.toLocaleString('id-ID') : PRICES.COST_MEDIUM.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <Label>Tanggal Pembelian</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal mt-2",
                  !purchaseDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {purchaseDate ? format(purchaseDate, "dd MMMM yyyy") : "Pilih tanggal"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={purchaseDate}
                onSelect={(date) => date && setPurchaseDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan Data'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default PizzaStockForm;
