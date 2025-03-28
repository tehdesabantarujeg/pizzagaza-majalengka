
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
import { formatCurrency } from '@/utils/constants';
import { PizzaStock } from '@/utils/types';
import { Plus, Trash2, Info, AlertTriangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface StockItem {
  size: 'Small' | 'Medium';
  flavor: string;
  quantity: number;
  costPrice: number;
}

interface MultiPizzaStockFormProps {
  onSave: (items: StockItem[]) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const MultiPizzaStockForm: React.FC<MultiPizzaStockFormProps> = ({
  onSave,
  onCancel,
  isLoading
}) => {
  const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
  const [items, setItems] = useState<StockItem[]>([{
    size: 'Small',
    flavor: '',
    quantity: 1,
    costPrice: PRICES.COST_SMALL_PIZZA
  }]);
  const [error, setError] = useState('');

  const handleAddItem = () => {
    setItems([...items, {
      size: 'Small',
      flavor: '',
      quantity: 1,
      costPrice: PRICES.COST_SMALL_PIZZA
    }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof StockItem, value: any) => {
    const newItems = [...items];
    
    if (field === 'size') {
      // Update cost price when size changes
      const newSize = value as 'Small' | 'Medium';
      const newCostPrice = newSize === 'Small' ? PRICES.COST_SMALL_PIZZA : PRICES.COST_MEDIUM_PIZZA;
      
      newItems[index] = {
        ...newItems[index],
        [field]: value,
        costPrice: newCostPrice
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
    }
    
    setItems(newItems);
  };

  const handleSubmit = async () => {
    // Validate inputs
    const hasEmptyFlavor = items.some(item => !item.flavor);
    if (hasEmptyFlavor) {
      setError('Semua item harus memiliki rasa (flavor)');
      return;
    }

    try {
      await onSave(items.map(item => ({
        ...item,
        costPrice: Number(item.costPrice),
        quantity: Number(item.quantity)
      })));
    } catch (err) {
      setError('Gagal menyimpan data stok');
    }
  };

  return (
    <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Tambah Stok Pizza (Multiple)</DialogTitle>
        <DialogDescription>
          Tambahkan beberapa varian pizza sekaligus ke stok
        </DialogDescription>
      </DialogHeader>

      {error && (
        <div className="bg-destructive/20 p-3 rounded-md flex items-start text-destructive">
          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="mb-4">
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

      <div className="space-y-4 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Daftar Item</h3>
          <Button type="button" onClick={handleAddItem} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Tambah Item
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {items.map((item, index) => (
            <div key={index} className="border rounded-md p-4 relative">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-2 top-2 text-destructive"
                onClick={() => handleRemoveItem(index)}
                disabled={items.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Rasa</Label>
                  <Select
                    value={item.flavor}
                    onValueChange={(value) => handleItemChange(index, 'flavor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih rasa" />
                    </SelectTrigger>
                    <SelectContent>
                      {PIZZA_FLAVORS.map((flavor) => (
                        <SelectItem key={flavor} value={flavor}>
                          {flavor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ukuran</Label>
                  <Select
                    value={item.size}
                    onValueChange={(value) => handleItemChange(index, 'size', value as 'Small' | 'Medium')}
                  >
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label>Jumlah</Label>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Harga Modal</Label>
                  <Input
                    type="number"
                    min={0}
                    value={item.costPrice}
                    onChange={(e) => handleItemChange(index, 'costPrice', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Default: {formatCurrency(item.size === 'Small' ? PRICES.COST_SMALL_PIZZA : PRICES.COST_MEDIUM_PIZZA)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DialogFooter>
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

export default MultiPizzaStockForm;
