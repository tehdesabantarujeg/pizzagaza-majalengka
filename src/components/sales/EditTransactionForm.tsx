
import React, { useState, useEffect } from 'react';
import { Transaction, PizzaSaleItem } from '@/utils/types';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/utils/constants';

interface EditTransactionFormProps {
  transaction: Transaction;
  onCancel: () => void;
  onSave: (updatedTransaction: Transaction) => void;
}

const EditTransactionForm: React.FC<EditTransactionFormProps> = ({ 
  transaction, 
  onCancel, 
  onSave 
}) => {
  const [editedTransaction, setEditedTransaction] = useState<Transaction>({...transaction});
  const [quantity, setQuantity] = useState<number>(transaction.quantity);
  const [includeBox, setIncludeBox] = useState<boolean>(transaction.includeBox);
  const [notes, setNotes] = useState<string>(transaction.notes || '');
  const [customerName, setCustomerName] = useState<string>(transaction.customerName || '');

  // Update total price when quantity changes
  useEffect(() => {
    const updatedTotal = editedTransaction.sellingPrice * quantity;
    setEditedTransaction(prev => ({
      ...prev,
      quantity,
      includeBox,
      notes,
      customerName,
      totalPrice: updatedTotal
    }));
  }, [quantity, includeBox, notes, customerName]);

  const handleSave = () => {
    onSave(editedTransaction);
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Edit Transaksi</DialogTitle>
        <DialogDescription>
          Edit detail transaksi #{transaction.transactionNumber}
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="customerName">Nama Pelanggan</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Pelanggan umum"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Produk</Label>
            <div className="py-2 px-3 bg-muted rounded-md">
              {transaction.flavor}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Ukuran</Label>
            <div className="py-2 px-3 bg-muted rounded-md">
              {transaction.size}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Kondisi</Label>
            <div className="py-2 px-3 bg-muted rounded-md">
              {transaction.state}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantity">Jumlah</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Harga per Item</Label>
            <div className="py-2 px-3 bg-muted rounded-md">
              {formatCurrency(transaction.sellingPrice)}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Total Harga</Label>
            <div className="py-2 px-3 bg-muted rounded-md font-medium">
              {formatCurrency(editedTransaction.totalPrice)}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox 
            id="includeBox" 
            checked={includeBox}
            onCheckedChange={(checked) => setIncludeBox(checked as boolean)}
          />
          <Label htmlFor="includeBox" className="cursor-pointer">Termasuk dus</Label>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="notes">Catatan</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tambahkan catatan..."
            rows={3}
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Batal</Button>
        <Button onClick={handleSave}>Simpan Perubahan</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditTransactionForm;
