
import React, { useState } from 'react';
import { Transaction } from '@/utils/types';
import { formatDateShort, formatCurrency } from '@/utils/constants';
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
import { reprintTransactionReceipt } from '@/utils/supabase';
import { useToast } from '@/hooks/use-toast';

interface TransactionListProps {
  transactions: Transaction[];
  setOpen?: (open: boolean) => void;
  onEdit?: (transaction: Transaction) => void;
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

  // Handle search input
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle column sorting
  const handleSort = (field: keyof Transaction | 'date') => {
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
  
  // Handle edit transaction
  const handleEdit = (transactions: Transaction[]) => {
    if (onEdit && transactions.length > 0) {
      // Pass the first transaction as representative of the group
      onEdit(transactions[0]);
    }
  };
  
  // Handle delete transaction
  const handleDelete = (transactionId: string) => {
    if (onDelete) {
      // Open confirmation dialog
      setTransactionToDelete(transactionId);
    } else {
      // Default delete behavior if no handler provided
      toast({
        title: "Fitur belum tersedia",
        description: "Fitur hapus transaksi belum diimplementasikan",
        variant: "destructive"
      });
    }
  };

  // Confirm delete transaction
  const confirmDelete = () => {
    if (transactionToDelete && onDelete) {
      onDelete(transactionToDelete);
      setTransactionToDelete(null);
    }
  };

  // Group transactions by transaction number
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
  
  // Filter transactions
  const filteredTransactions = transactions
    .filter(transaction => 
      transaction.flavor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Group filtered transactions by transaction number
  const groupedTransactions = groupTransactionsByNumber(filteredTransactions);
  
  // Sort grouped transactions
  const sortedGroups = [...groupedTransactions].sort((a, b) => {
    // Use the first transaction in each group for sorting
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

  // Format multiple items for display
  const formatMultipleItems = (transactions: Transaction[], field: keyof Transaction) => {
    return transactions.map(t => String(t[field])).join(', ');
  };

  // Calculate total quantities, prices, etc.
  const calculateTotals = (transactions: Transaction[]) => {
    const totalBoxes = transactions.filter(t => t.includeBox).length;
    const totalPrice = transactions.reduce((sum, t) => sum + t.totalPrice, 0);
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
                    <TableCell>{formatMultipleItems(group, 'flavor')}</TableCell>
                    <TableCell>{formatMultipleItems(group, 'size')}</TableCell>
                    <TableCell>{formatMultipleItems(group, 'state')}</TableCell>
                    <TableCell>{group.map(t => t.quantity).join(', ')}</TableCell>
                    <TableCell>{totalBoxes > 0 ? totalBoxes : 'Tidak'}</TableCell>
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
                            // For simplicity, we'll delete the first transaction's ID
                            // In a real app, you might want to delete all transactions in the group
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
      
      {/* Delete Confirmation Dialog */}
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
