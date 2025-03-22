
import React, { useState } from 'react';
import { Transaction } from '@/utils/types';
import { formatDateShort, formatCurrency } from '@/utils/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Package, Search, ArrowUpDown, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { reprintTransactionReceipt } from '@/utils/supabase';
import { useToast } from '@/hooks/use-toast';

interface RecentTransactionsListProps {
  transactions: Transaction[];
}

const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Transaction>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  // Handle search input
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle column sorting
  const handleSort = (field: keyof Transaction) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Handle receipt reprint
  const handleReprintReceipt = async (transactionId: string) => {
    try {
      await reprintTransactionReceipt(transactionId);
      toast({
        title: "Mencetak Nota",
        description: "Nota berhasil dicetak ulang",
      });
    } catch (error) {
      console.error("Error reprinting receipt:", error);
      toast({
        title: "Gagal Mencetak Nota",
        description: "Terjadi kesalahan saat mencetak ulang nota",
        variant: "destructive"
      });
    }
  };
  
  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => 
      transaction.flavor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    })
    .slice(0, 10); // Only show 10 most recent transactions

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaksi Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari transaksi..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('transactionNumber')} className="cursor-pointer hover:bg-muted whitespace-nowrap">
                  <div className="flex items-center">
                    ID Transaksi
                    {sortField === 'transactionNumber' && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('date')} className="cursor-pointer hover:bg-muted">
                  <div className="flex items-center">
                    Tanggal
                    {sortField === 'date' && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('customerName')} className="cursor-pointer hover:bg-muted">
                  <div className="flex items-center">
                    Pelanggan
                    {sortField === 'customerName' && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('flavor')} className="cursor-pointer hover:bg-muted">
                  <div className="flex items-center">
                    Produk
                    {sortField === 'flavor' && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('totalPrice')} className="cursor-pointer hover:bg-muted">
                  <div className="flex items-center">
                    Total
                    {sortField === 'totalPrice' && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.transactionNumber || '-'}</TableCell>
                    <TableCell>{formatDateShort(transaction.date)}</TableCell>
                    <TableCell>{transaction.customerName || 'Umum'}</TableCell>
                    <TableCell>
                      {transaction.flavor} ({transaction.size}, {transaction.state})
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(transaction.totalPrice)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReprintReceipt(transaction.id)}
                        title="Cetak Ulang Nota"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    {searchTerm 
                      ? 'Tidak ada transaksi yang sesuai dengan pencarian' 
                      : 'Belum ada transaksi'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactionsList;
