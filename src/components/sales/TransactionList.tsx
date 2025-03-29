
import React, { useState } from 'react';
import { Transaction } from '@/utils/types';
import { formatDateShort, formatCurrency, printReceipt } from '@/utils/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import PizzaVariantBadge from '@/components/PizzaVariantBadge';
import { Package, Search, ArrowUpDown, Printer, Edit, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransactionListProps {
  transactions: Transaction[];
  setOpen?: (open: boolean) => void;
  onEdit?: (transaction: Transaction[]) => void;
  onDelete?: (transactionId: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  setOpen,
  onEdit,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Transaction | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleSort = (field: keyof Transaction | 'date') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const handleReprintReceipt = async (transactionId: string) => {
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      
      if (!transaction) {
        throw new Error("Transaction not found");
      }
      
      const transactionNumber = transaction.transactionNumber;
      
      let transactionsToReprint = [transaction];
      
      if (transactionNumber) {
        transactionsToReprint = transactions.filter(t => t.transactionNumber === transactionNumber);
      }
      
      printReceipt(transactionsToReprint);
      
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
  
  const handleEdit = (transactionGroup: Transaction[]) => {
    if (onEdit && transactionGroup.length > 0) {
      onEdit(transactionGroup);
    }
  };
  
  const handleDelete = (transactionId: string) => {
    if (onDelete) {
      setTransactionToDelete(transactionId);
    } else {
      toast({
        title: "Fitur belum tersedia",
        description: "Fitur hapus transaksi belum diimplementasikan",
        variant: "destructive"
      });
    }
  };

  const confirmDelete = () => {
    if (transactionToDelete && onDelete) {
      onDelete(transactionToDelete);
      setTransactionToDelete(null);
    }
  };

  const groupTransactionsByNumber = (transactions: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};
    
    transactions.forEach(transaction => {
      const key = transaction.transactionNumber || transaction.id;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(transaction);
    });
    
    return Object.values(groups);
  };
  
  const filteredTransactions = transactions
    .filter(transaction => 
      transaction.flavor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const groupedTransactions = groupTransactionsByNumber(filteredTransactions);
  
  const sortedGroups = [...groupedTransactions].sort((a, b) => {
    const transA = a[0];
    const transB = b[0];
    
    if (sortField === 'date') {
      const dateA = new Date(transA.date);
      const dateB = new Date(transB.date);
      return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    }
    
    if (transA[sortField] < transB[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (transA[sortField] > transB[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const formatMultipleItemsWithLineBreaks = (transactions: Transaction[], field: keyof Transaction) => {
    return transactions.map(t => String(t[field])).join('\n');
  };

  const calculateTotals = (transactions: Transaction[]) => {
    const totalBoxes = transactions.reduce((sum, t) => sum + (t.includeBox ? t.quantity : 0), 0);
    
    // Fix for NaN: Ensure totalPrice is a valid number before adding
    const totalPrice = transactions.reduce((sum, t) => {
      // Convert to number if it's a string or validate if it's NaN
      const price = typeof t.totalPrice === 'string' ? parseFloat(t.totalPrice) : t.totalPrice;
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    
    return { totalBoxes, totalPrice };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-72">
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
              <TableHead>Produk</TableHead>
              <TableHead>Ukuran</TableHead>
              <TableHead>Kondisi</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Dus</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedGroups.length > 0 ? (
              sortedGroups.map((group) => {
                const { totalBoxes, totalPrice } = calculateTotals(group);
                return (
                  <TableRow key={group[0].transactionNumber || group[0].id}>
                    <TableCell className="font-medium">{group[0].transactionNumber || '-'}</TableCell>
                    <TableCell>{formatDateShort(group[0].date)}</TableCell>
                    <TableCell>{group[0].customerName || 'Umum'}</TableCell>
                    <TableCell className="whitespace-pre-line">{formatMultipleItemsWithLineBreaks(group, 'flavor')}</TableCell>
                    <TableCell className="whitespace-pre-line">{formatMultipleItemsWithLineBreaks(group, 'size')}</TableCell>
                    <TableCell className="whitespace-pre-line">{formatMultipleItemsWithLineBreaks(group, 'state')}</TableCell>
                    <TableCell className="whitespace-pre-line">{group.map(t => t.quantity).join('\n')}</TableCell>
                    <TableCell className="whitespace-pre-line">
                      {group.map(t => t.includeBox ? t.quantity : 'Tidak').join('\n')}
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(totalPrice)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReprintReceipt(group[0].id)}
                          title="Cetak Ulang Nota"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(group)}
                          title="Edit Transaksi"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            handleDelete(group[0].id);
                          }}
                          title="Hapus Transaksi"
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-6">
                  {searchTerm 
                    ? 'Tidak ada transaksi yang sesuai dengan pencarian' 
                    : 'Belum ada transaksi'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TransactionList;
