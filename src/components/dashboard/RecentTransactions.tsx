
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDateShort } from '@/utils/constants';

interface RecentTransaction {
  id: string;
  date: string;
  product: string;
  quantity: number;
  amount: number;
  customer: string;
}

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaksi Terbaru</CardTitle>
        <CardDescription>
          5 transaksi terakhir
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions && transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{formatDateShort(tx.date)}</TableCell>
                  <TableCell>{tx.product}</TableCell>
                  <TableCell className="text-right">{tx.quantity}</TableCell>
                  <TableCell className="text-right">
                    {/* Ensure amount is a valid number before formatting */}
                    {typeof tx.amount === 'number' && !isNaN(tx.amount) 
                      ? formatCurrency(tx.amount) 
                      : formatCurrency(0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Belum ada transaksi
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
