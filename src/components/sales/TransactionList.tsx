
import React from 'react';
import { Transaction } from '@/utils/types';
import { formatDateShort, formatCurrency } from '@/utils/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PizzaVariantBadge from '@/components/PizzaVariantBadge';
import { Package } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  setOpen?: (open: boolean) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, setOpen }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Pelanggan</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead>Ukuran</TableHead>
            <TableHead>Kondisi</TableHead>
            <TableHead>Jumlah</TableHead>
            <TableHead>Dus</TableHead>
            <TableHead>Harga</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDateShort(transaction.date)}</TableCell>
                <TableCell>{transaction.customerName || 'Umum'}</TableCell>
                <TableCell>{transaction.flavor}</TableCell>
                <TableCell>{transaction.size}</TableCell>
                <TableCell>{transaction.state}</TableCell>
                <TableCell>{transaction.quantity}</TableCell>
                <TableCell>
                  {transaction.includeBox ? (
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-orange-600" />
                      <span>Ya</span>
                    </div>
                  ) : (
                    'Tidak'
                  )}
                </TableCell>
                <TableCell>{formatCurrency(transaction.sellingPrice)}</TableCell>
                <TableCell className="font-medium">{formatCurrency(transaction.totalPrice)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6">
                Belum ada transaksi
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionList;
