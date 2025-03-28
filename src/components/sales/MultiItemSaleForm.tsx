
import React, { useState, useEffect } from 'react';
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PizzaSaleItem } from '@/utils/types';
import { formatCurrency } from '@/utils/constants';
import { Info, Plus, Trash2, CalendarIcon } from 'lucide-react';
import SaleItemForm from './SaleItemForm';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MultiItemSaleFormProps {
  saleItems: PizzaSaleItem[];
  setSaleItems: React.Dispatch<React.SetStateAction<PizzaSaleItem[]>>;
  customerName: string;
  setCustomerName: React.Dispatch<React.SetStateAction<string>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  totalPrice: number;
  error: string;
  handleSaveOnly: (e: React.FormEvent) => Promise<void>;
  handleSavePrint: (e: React.FormEvent) => Promise<void>;
  handleAddItem: () => void;
  handleRemoveItem: (index: number) => void;
  handleItemChange: (index: number, item: PizzaSaleItem) => void;
  handleDateChange: (date: string, isMultiItem?: boolean) => void;
}

const MultiItemSaleForm: React.FC<MultiItemSaleFormProps> = ({
  saleItems,
  setSaleItems,
  customerName,
  setCustomerName,
  notes,
  setNotes,
  totalPrice,
  error,
  handleSaveOnly,
  handleSavePrint,
  handleAddItem,
  handleRemoveItem,
  handleItemChange,
  handleDateChange
}) => {
  // Find a date from the first sale item or use current date
  const firstItemDate = saleItems[0]?.date ? new Date(saleItems[0].date) : new Date();
  const [date, setDate] = useState<Date>(firstItemDate);

  // Calculate total from all items to ensure it's always accurate
  const calculatedTotal = saleItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const onDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      // Update all sale items with the new date
      handleDateChange(newDate.toISOString(), true);
    }
  };

  return (
    <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Penjualan Baru</DialogTitle>
        <DialogDescription>
          Tambahkan beberapa varian pizza dalam satu transaksi
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSaveOnly} className="space-y-6">
        {error && (
          <div className="bg-destructive/20 p-3 rounded-md flex items-start text-destructive">
            <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm whitespace-pre-line">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Nama Pelanggan (Opsional)</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Contoh: Budi"
            />
          </div>
          
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
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Item Penjualan</h3>
            <Button type="button" onClick={handleAddItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Tambah Item
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {saleItems.map((item, index) => (
              <div key={index} className="relative border rounded-md p-4">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-2 text-destructive"
                  onClick={() => handleRemoveItem(index)}
                  disabled={saleItems.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <SaleItemForm
                  item={item}
                  index={index}
                  onChange={(updatedItem) => handleItemChange(index, updatedItem)}
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Catatan (Opsional)</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tambahkan catatan disini"
          />
        </div>
        
        <Separator />
        
        <div className="py-2">
          <div className="flex justify-between items-center font-medium text-lg">
            <span>Total:</span>
            <span>{formatCurrency(calculatedTotal)}</span>
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

export default MultiItemSaleForm;
