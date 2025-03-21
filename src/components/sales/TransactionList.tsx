
import React from 'react';
import { Transaction } from '@/utils/types';
import { formatCurrency, formatDateShort } from '@/utils/constants';
import { ShoppingCart } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PizzaVariantBadge from '@/components/PizzaVariantBadge';

interface TransactionListProps {
  transactions: Transaction[];
  setOpen: (open: boolean) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, setOpen }) => {
  return (
    <div>
      {transactions.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Varian</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Dus</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDateShort(transaction.date)}</TableCell>
                  <TableCell>{transaction.flavor}</TableCell>
                  <TableCell>
                    <PizzaVariantBadge 
                      size={transaction.size} 
                      flavor={transaction.flavor} 
                      state={transaction.state}
                    />
                  </TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell>{transaction.includeBox ? 'Ya' : 'Tidak'}</TableCell>
                  <TableCell>{transaction.customerName || '-'}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(transaction.totalPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Belum ada penjualan tercatat</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Catat penjualan pertama Anda untuk memulai
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
