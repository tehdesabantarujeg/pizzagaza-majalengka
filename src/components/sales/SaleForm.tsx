
import React, { useState } from 'react';
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PizzaSaleItem } from '@/utils/types';
import { formatCurrency, PIZZA_FLAVORS, PIZZA_SIZES, PIZZA_STATES } from '@/utils/constants';
import { CalendarIcon, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface SaleFormProps {
  newSale: PizzaSaleItem & { customerName: string; notes: string; date?: string };
  setNewSale: React.Dispatch<React.SetStateAction<PizzaSaleItem & { customerName: string; notes: string; date?: string }>>;
  sellingPrice: number;
  totalPrice: number;
  error: string;
  handleSaveOnly: (e: React.FormEvent) => Promise<void>;
  handleSavePrint: (e: React.FormEvent) => Promise<void>;
  handleSizeChange: (size: string) => void;
  handleFlavorChange: (flavor: string) => void;
  handleStateChange: (state: string) => void;
  handleDateChange: (date: string, isMultiItem?: boolean) => void;
}

const SaleForm: React.FC<SaleFormProps> = ({
  newSale,
  setNewSale,
  sellingPrice,
  totalPrice,
  error,
  handleSaveOnly,
  handleSavePrint,
  handleSizeChange,
  handleFlavorChange,
  handleStateChange,
  handleDateChange
}) => {
  // Convert ISO date string to Date if it exists
  const [date, setDate] = useState<Date>(
    newSale.date ? new Date(newSale.date) : new Date()
  );

  const onDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      // Update the sale with the new date
      handleDateChange(newDate.toISOString(), false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Penjualan Baru</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSaveOnly} className="space-y-4">
        {error && (
          <div className="bg-destructive/20 p-3 rounded-md flex items-start text-destructive">
            <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm whitespace-pre-line">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="size">Ukuran</Label>
            <Select 
              value={newSale.size} 
              onValueChange={handleSizeChange}
            >
              <SelectTrigger id="size">
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
            <Label htmlFor="flavor">Rasa</Label>
            <Select 
              value={newSale.flavor} 
              onValueChange={handleFlavorChange}
            >
              <SelectTrigger id="flavor">
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
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="state">Kondisi</Label>
            <Select 
              value={newSale.state} 
              onValueChange={handleStateChange}
            >
              <SelectTrigger id="state">
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
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Jumlah</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={newSale.quantity}
              onChange={(e) => setNewSale({...newSale, quantity: parseInt(e.target.value) || 1})}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal Penjualan</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd MMMM yyyy") : "Pilih tanggal"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={onDateChange}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        
          <div className="space-y-2">
            <Label htmlFor="includeBox" className="block mb-2">Termasuk Dus?</Label>
            <div className="flex items-center justify-between">
              <Switch
                id="includeBox"
                checked={newSale.includeBox}
                onCheckedChange={(checked) => setNewSale({...newSale, includeBox: checked})}
              />
              <span className="text-sm text-muted-foreground">
                {newSale.includeBox ? 'Ya' : 'Tidak'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customerName">Nama Pelanggan (Opsional)</Label>
          <Input
            id="customerName"
            value={newSale.customerName}
            onChange={(e) => setNewSale({...newSale, customerName: e.target.value})}
            placeholder="Contoh: Budi"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Catatan (Opsional)</Label>
          <Input
            id="notes"
            value={newSale.notes}
            onChange={(e) => setNewSale({...newSale, notes: e.target.value})}
            placeholder="Tambahkan catatan disini"
          />
        </div>
        
        <div className="py-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Harga Satuan:</span>
            <span>{formatCurrency(sellingPrice)}</span>
          </div>
          <div className="flex justify-between items-center font-medium">
            <span>Total:</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="submit" className="w-full">
            Simpan
          </Button>
          <Button type="button" onClick={handleSavePrint} className="w-full" variant="outline">
            Simpan & Cetak
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default SaleForm;
