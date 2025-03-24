
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
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Plus, Trash, Printer, Save } from 'lucide-react';
import { formatCurrency } from '@/utils/constants';
import { PizzaSaleItem } from '@/utils/types';
import SaleItemForm from './SaleItemForm';

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
  handleItemChange
}) => {
  // Calculate total price from all items
  const calculatedTotalPrice = saleItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSavePrint}>
        <DialogHeader>
          <DialogTitle>Catat Penjualan Baru</DialogTitle>
          <DialogDescription>
            Masukkan detail pizza yang dijual
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customerName" className="text-right">
              Pelanggan
            </Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nama pelanggan (opsional)"
              className="col-span-3"
            />
          </div>
          
          <div className="border rounded-md p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Daftar Item</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddItem}
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah Item
              </Button>
            </div>
            
            {saleItems.map((item, index) => (
              <div key={index} className="border-t pt-4 first:border-t-0 first:pt-0 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-0 text-destructive"
                  onClick={() => handleRemoveItem(index)}
                  disabled={saleItems.length === 1}
                >
                  <Trash className="h-4 w-4" />
                </Button>
                <SaleItemForm
                  item={item}
                  index={index}
                  onChange={(updatedItem) => handleItemChange(index, updatedItem)}
                />
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">
              Catatan
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opsional"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4 mt-2">
            <Label className="text-right">
              Total
            </Label>
            <div className="col-span-3 text-xl font-bold">
              {formatCurrency(calculatedTotalPrice)}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" type="button" onClick={handleSaveOnly}>
            <Save className="mr-2 h-4 w-4" />
            Simpan Saja
          </Button>
          <Button type="submit">
            <Printer className="mr-2 h-4 w-4" />
            Simpan & Cetak Nota
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default MultiItemSaleForm;
