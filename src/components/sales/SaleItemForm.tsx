
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { PIZZA_FLAVORS, PIZZA_SIZES, PIZZA_STATES, PRICES, formatCurrency } from '@/utils/constants';
import { PizzaSaleItem } from '@/utils/types';

interface SaleItemFormProps {
  item: PizzaSaleItem;
  index: number;
  onChange: (item: PizzaSaleItem) => void;
}

const SaleItemForm: React.FC<SaleItemFormProps> = ({ item, index, onChange }) => {
  const handleChange = (field: keyof PizzaSaleItem, value: any) => {
    onChange({ ...item, [field]: value });
  };

  const boxPrice = item.includeBox 
    ? (item.size === 'Small' ? PRICES.SELLING_SMALL_BOX : PRICES.SELLING_MEDIUM_BOX) 
    : 0;

  return (
    <div className="grid grid-cols-6 gap-3">
      <div className="col-span-3">
        <Label htmlFor={`flavor-${index}`} className="mb-1 block">
          Rasa
        </Label>
        <Select 
          value={item.flavor} 
          onValueChange={(value) => handleChange('flavor', value)}
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
      
      <div className="col-span-3">
        <Label htmlFor={`size-${index}`} className="mb-1 block">
          Ukuran
        </Label>
        <Select 
          value={item.size} 
          onValueChange={(value) => handleChange('size', value as 'Small' | 'Medium')}
        >
          <SelectTrigger id={`size-${index}`}>
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
      
      <div className="col-span-2">
        <Label htmlFor={`state-${index}`} className="mb-1 block">
          Kondisi
        </Label>
        <Select 
          value={item.state} 
          onValueChange={(value) => handleChange('state', value as 'Mentah' | 'Matang')}
        >
          <SelectTrigger id={`state-${index}`}>
            <SelectValue placeholder="Pilih kondisi" />
          </SelectTrigger>
          <SelectContent>
            {PIZZA_STATES.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="col-span-2">
        <Label htmlFor={`quantity-${index}`} className="mb-1 block">
          Jumlah
        </Label>
        <Input
          id={`quantity-${index}`}
          type="number"
          min={1}
          value={item.quantity}
          onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
        />
      </div>
      
      <div className="col-span-2">
        <Label className="mb-1 block" htmlFor={`includeBox-${index}`}>
          Tambah Dus
        </Label>
        <div className="flex items-center justify-between space-x-2">
          <Switch
            id={`includeBox-${index}`}
            checked={item.includeBox}
            onCheckedChange={(checked) => handleChange('includeBox', checked)}
          />
          <span className="text-sm text-muted-foreground">
            {boxPrice > 0 ? formatCurrency(boxPrice) : "Tidak"}
          </span>
        </div>
      </div>
      
      <div className="col-span-6 mt-1 text-right">
        <div className="text-sm text-muted-foreground">
          Harga: {formatCurrency(item.sellingPrice)} × {item.quantity} = {formatCurrency(item.totalPrice)}
        </div>
      </div>
    </div>
  );
};

export default SaleItemForm;
