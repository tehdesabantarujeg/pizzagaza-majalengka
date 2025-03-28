
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PIZZA_FLAVORS, PRICES, formatCurrency } from '@/utils/constants';
import { PizzaStock } from '@/utils/types';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, Trash } from 'lucide-react';
import PizzaVariantBadge from '@/components/PizzaVariantBadge';

interface MultiPizzaStockFormProps {
  onSubmit: (items: Omit<PizzaStock, 'id' | 'updatedAt'>[]) => Promise<void>;
  onCancel: () => void;
}

const MultiPizzaStockForm: React.FC<MultiPizzaStockFormProps> = ({ onSubmit, onCancel }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<Array<{
    size: 'Small' | 'Medium';
    flavor: string;
    quantity: number;
    costPrice: number;
  }>>([{
    size: 'Small',
    flavor: 'Original',
    quantity: 1,
    costPrice: PRICES.COST_SMALL_PIZZA
  }]);
  
  const handleAddItem = () => {
    setItems([...items, {
      size: 'Small',
      flavor: 'Original',
      quantity: 1,
      costPrice: PRICES.COST_SMALL_PIZZA
    }]);
  };
  
  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      toast({
        title: "Tidak dapat menghapus",
        description: "Minimal harus ada satu item",
        variant: "destructive"
      });
      return;
    }
    
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };
  
  const handleSizeChange = (value: string, index: number) => {
    const size = value as 'Small' | 'Medium';
    const newItems = [...items];
    const newCostPrice = size === 'Small' ? PRICES.COST_SMALL_PIZZA : PRICES.COST_MEDIUM_PIZZA;
    newItems[index] = { ...newItems[index], size, costPrice: newCostPrice };
    setItems(newItems);
  };
  
  const handleFlavorChange = (value: string, index: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], flavor: value };
    setItems(newItems);
  };
  
  const handleQuantityChange = (value: number, index: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], quantity: value };
    setItems(newItems);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (items.some(item => !item.flavor || item.quantity <= 0)) {
      toast({
        title: "Input tidak valid",
        description: "Pastikan semua kolom terisi dengan benar",
        variant: "destructive"
      });
      return;
    }
    
    // Prepare data for submission
    const stockItems = items.map(item => ({
      ...item,
      purchaseDate: new Date().toISOString()
    }));
    
    await onSubmit(stockItems);
  };
  
  return (
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Tambah Stok Pizza (Multiple)</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="space-y-3 border rounded-md p-4 relative">
              <div className="absolute top-2 right-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(index)}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              
              <div className="flex items-center mb-2">
                <PizzaVariantBadge
                  size={item.size}
                  flavor={item.flavor}
                  state="Frozen Food"
                />
                <span className="ml-2 font-medium">Item #{index + 1}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`size-${index}`}>Ukuran</Label>
                  <Select
                    value={item.size}
                    onValueChange={(value) => handleSizeChange(value, index)}
                  >
                    <SelectTrigger id={`size-${index}`}>
                      <SelectValue placeholder="Pilih ukuran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Small">Small</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`flavor-${index}`}>Rasa</Label>
                  <Select
                    value={item.flavor}
                    onValueChange={(value) => handleFlavorChange(value, index)}
                  >
                    <SelectTrigger id={`flavor-${index}`}>
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
                  <Label htmlFor={`quantity-${index}`}>Jumlah</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1, index)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`cost-price-${index}`}>Harga Modal</Label>
                  <Input
                    id={`cost-price-${index}`}
                    value={formatCurrency(item.costPrice)}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
              
              {index < items.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </div>
        
        <Button
          type="button"
          variant="outline"
          onClick={handleAddItem}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Item Baru
        </Button>
        
        <div className="bg-muted p-4 rounded-md">
          <div className="font-medium mb-2">Ringkasan</div>
          <div className="flex justify-between">
            <span>Total Item:</span>
            <span>{items.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Quantity:</span>
            <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total Biaya:</span>
            <span>{formatCurrency(items.reduce((sum, item) => sum + item.costPrice * item.quantity, 0))}</span>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Batal
          </Button>
          <Button type="submit">Simpan</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default MultiPizzaStockForm;
