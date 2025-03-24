
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Printer, Save } from 'lucide-react';
import { PIZZA_FLAVORS, PIZZA_SIZES, PIZZA_STATES, PRICES, formatCurrency } from '@/utils/constants';

interface SaleFormProps {
  newSale: {
    size: 'Small' | 'Medium';
    flavor: string;
    quantity: number;
    state: 'Frozen Food' | 'Matang'; // Updated from 'Mentah' to 'Frozen Food'
    includeBox: boolean;
    customerName: string;
    notes: string;
  };
  setNewSale: React.Dispatch<React.SetStateAction<{
    size: 'Small' | 'Medium';
    flavor: string;
    quantity: number;
    state: 'Frozen Food' | 'Matang'; // Updated from 'Mentah' to 'Frozen Food'
    includeBox: boolean;
    customerName: string;
    notes: string;
  }>>;
  sellingPrice: number;
  totalPrice: number;
  error: string;
  handleSaveOnly: (e: React.FormEvent) => Promise<void>;
  handleSavePrint: (e: React.FormEvent) => Promise<void>;
  handleSizeChange: (value: string) => void;
  handleFlavorChange: (value: string) => void;
  handleStateChange: (value: string) => void;
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
  handleStateChange
}) => {
  return (
    <DialogContent className="sm:max-w-[500px]">
      <form>
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
            <Label htmlFor="size" className="text-right">
              Ukuran
            </Label>
            <Select value={newSale.size} onValueChange={handleSizeChange}>
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
            <Label htmlFor="flavor" className="text-right">
              Rasa
            </Label>
            <Select value={newSale.flavor} onValueChange={handleFlavorChange}>
              <SelectTrigger className="col-span-3">
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
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="state" className="text-right">
              Kondisi
            </Label>
            <Select value={newSale.state} onValueChange={handleStateChange}>
              <SelectTrigger className="col-span-3">
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
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Jumlah
            </Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={newSale.quantity}
              onChange={(e) => setNewSale({ 
                ...newSale, 
                quantity: parseInt(e.target.value) || 1 
              })}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="includeBox" className="text-right">
              Tambah Dus
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Switch
                id="includeBox"
                checked={newSale.includeBox}
                onCheckedChange={(checked) => setNewSale({ ...newSale, includeBox: checked })}
              />
              <span className="text-sm">
                {newSale.includeBox 
                  ? `Termasuk dus (${formatCurrency(newSale.size === 'Small' ? PRICES.SELLING_SMALL_BOX : PRICES.SELLING_MEDIUM_BOX)})` 
                  : 'Tanpa dus'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customerName" className="text-right">
              Pelanggan
            </Label>
            <Input
              id="customerName"
              value={newSale.customerName}
              onChange={(e) => setNewSale({ ...newSale, customerName: e.target.value })}
              placeholder="Nama pelanggan (opsional)"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Catatan
            </Label>
            <Textarea
              id="notes"
              value={newSale.notes}
              onChange={(e) => setNewSale({ ...newSale, notes: e.target.value })}
              placeholder="Opsional"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Harga
            </Label>
            <div className="col-span-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Harga Satuan:</span>
                <span>{formatCurrency(sellingPrice)}</span>
              </div>
              {newSale.includeBox && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Harga Dus:</span>
                  <span>{formatCurrency(newSale.size === 'Small' ? PRICES.SELLING_SMALL_BOX : PRICES.SELLING_MEDIUM_BOX)} / pcs</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>Total Harga:</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleSaveOnly}>
            <Save className="mr-2 h-4 w-4" />
            Simpan Saja
          </Button>
          <Button onClick={handleSavePrint} type="submit">
            <Printer className="mr-2 h-4 w-4" />
            Simpan & Cetak Nota
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default SaleForm;
