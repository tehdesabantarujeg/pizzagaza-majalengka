
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/utils/constants';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus } from 'lucide-react';

interface EditTransactionFormProps {
  transactions: Transaction[];
  onCancel: () => void;
  onSave: (updatedTransactions: Transaction[]) => void;
}

const EditTransactionForm: React.FC<EditTransactionFormProps> = ({ 
  transactions, 
  onCancel, 
  onSave 
}) => {
  // Create a complete copy of the transactions to edit
  const [editedTransactions, setEditedTransactions] = useState<Transaction[]>(
    transactions.map(t => ({...t}))
  );
  
  // Shared fields that should be the same for all items in the transaction
  const [customerName, setCustomerName] = useState<string>(transactions[0]?.customerName || '');
  const [notes, setNotes] = useState<string>(transactions[0]?.notes || '');

  // Update common fields across all transactions
  useEffect(() => {
    setEditedTransactions(prev => 
      prev.map(transaction => ({
        ...transaction,
        customerName,
        notes
      }))
    );
  }, [customerName, notes]);

  // Update a specific transaction's quantity or includeBox
  const handleUpdateTransaction = (index: number, field: 'quantity' | 'includeBox', value: any) => {
    setEditedTransactions(prev => {
      const updated = [...prev];
      
      // Update the specific field
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      
      // Recalculate totalPrice if quantity changes
      if (field === 'quantity') {
        updated[index].totalPrice = updated[index].sellingPrice * value;
      }
      
      return updated;
    });
  };

  // Calculate total price of all items
  const totalPrice = editedTransactions.reduce((sum, t) => sum + t.totalPrice, 0);

  // Save all transaction changes
  const handleSave = () => {
    onSave(editedTransactions);
  };

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Transaksi</DialogTitle>
        <DialogDescription>
          Edit detail transaksi #{transactions[0].transactionNumber}
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

        <div className="space-y-4">
          <h3 className="font-medium text-sm">Daftar Item</h3>
          
          {editedTransactions.map((transaction, index) => (
            <div key={index} className="border rounded-md p-4 space-y-4">
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
                  <Label htmlFor={`quantity-${index}`}>Jumlah</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min={1}
                    value={transaction.quantity}
                    onChange={(e) => handleUpdateTransaction(index, 'quantity', parseInt(e.target.value) || 1)}
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
                    {formatCurrency(transaction.totalPrice)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id={`includeBox-${index}`} 
                  checked={transaction.includeBox}
                  onCheckedChange={(checked) => handleUpdateTransaction(index, 'includeBox', checked as boolean)}
                />
                <Label htmlFor={`includeBox-${index}`} className="cursor-pointer">Termasuk dus</Label>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-2 mt-4">
          <div className="flex justify-between items-center">
            <Label>Total Transaksi</Label>
            <div className="text-xl font-bold">
              {formatCurrency(totalPrice)}
            </div>
          </div>
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
