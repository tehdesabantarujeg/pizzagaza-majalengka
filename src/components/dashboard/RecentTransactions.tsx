
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDateShort } from '@/utils/constants';
import { Transaction } from '@/utils/types';

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, isLoading = false }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaksi Terbaru</CardTitle>
        <CardDescription>
          5 transaksi terakhir
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoading && transactions && transactions.length > 0 ? (
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
                  <TableCell className="font-medium">{formatDateShort(tx.date || '')}</TableCell>
                  <TableCell>{tx.flavor}</TableCell>
                  <TableCell className="text-right">{tx.quantity}</TableCell>
                  <TableCell className="text-right">
                    {/* Ensure amount is a valid number before formatting */}
                    {typeof tx.totalPrice === 'number' && !isNaN(tx.totalPrice) 
                      ? formatCurrency(tx.totalPrice) 
                      : formatCurrency(0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              "Belum ada transaksi"
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
