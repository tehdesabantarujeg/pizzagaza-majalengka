
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDateShort } from '@/utils/constants';
import { TransactionRow } from '@/integrations/supabase/database.types';

interface RecentTransactionsProps {
  transactions: TransactionRow[];
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
                  <TableCell className="font-medium">{formatDateShort(tx.date || '')}</TableCell>
                  <TableCell>{tx.flavor}</TableCell>
                  <TableCell className="text-right">{tx.quantity}</TableCell>
                  <TableCell className="text-right">
                    {/* Ensure amount is a valid number before formatting */}
                    {typeof tx.total_price === 'number' && !isNaN(tx.total_price) 
                      ? formatCurrency(tx.total_price) 
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
