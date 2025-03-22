
import React, { useState } from 'react';
import { BoxStock } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Package, Search, ArrowUpDown, Pencil, Trash } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { formatCurrency, formatDateShort } from '@/utils/constants';
import { useToast } from '@/hooks/use-toast';
import { deleteBoxStock, updateBoxStock } from '@/utils/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface BoxStockListProps {
  boxItems: BoxStock[];
  setOpenBox: (open: boolean) => void;
  loadStockData?: () => void;
}

const BoxStockList: React.FC<BoxStockListProps> = ({ boxItems, setOpenBox, loadStockData }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof BoxStock>('size');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editItem, setEditItem] = useState<BoxStock | null>(null);
  const [deleteItem, setDeleteItem] = useState<BoxStock | null>(null);
  const [quantity, setQuantity] = useState(0);
  
  // Handle search input
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle column sorting
  const handleSort = (field: keyof BoxStock) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Filter and sort boxItems
  const filteredItems = boxItems
    .filter(box => box.size.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  
  // Handle edit quantity save
  const handleSaveEdit = async () => {
    if (!editItem) return;
    
    try {
      const updatedStock = {
        ...editItem,
        quantity: quantity
      };
      
      const success = await updateBoxStock(updatedStock);
      
      if (success) {
        toast({
          title: "Stok dus berhasil diupdate",
          description: `Dus ${updatedStock.size} berhasil diperbarui.`
        });
        
        // Refresh stock data
        if (loadStockData) loadStockData();
      } else {
        toast({
          title: "Gagal mengupdate stok dus",
          description: "Terjadi kesalahan saat memperbarui stok dus.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating box stock:", error);
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal memperbarui stok dus",
        variant: "destructive"
      });
    }
    
    setEditItem(null);
  };
  
  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    
    try {
      const success = await deleteBoxStock(deleteItem.id);
      
      if (success) {
        toast({
          title: "Stok dus berhasil dihapus",
          description: `Dus ${deleteItem.size} berhasil dihapus dari stok.`
        });
        
        // Refresh stock data
        if (loadStockData) loadStockData();
      } else {
        toast({
          title: "Gagal menghapus stok dus",
          description: "Terjadi kesalahan saat menghapus stok dus.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting box stock:", error);
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal menghapus stok dus",
        variant: "destructive"
      });
    }
    
    setDeleteItem(null);
  };
  
  return (
    <div>
      {boxItems.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari stok dus..."
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
                  <TableHead onClick={() => handleSort('size')} className="cursor-pointer hover:bg-muted">
                    <div className="flex items-center">
                      Ukuran
                      {sortField === 'size' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('quantity')} className="cursor-pointer hover:bg-muted">
                    <div className="flex items-center">
                      Jumlah
                      {sortField === 'quantity' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('costPrice')} className="cursor-pointer hover:bg-muted">
                    <div className="flex items-center">
                      Harga Modal
                      {sortField === 'costPrice' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('purchaseDate')} className="cursor-pointer hover:bg-muted">
                    <div className="flex items-center">
                      Tanggal Beli
                      {sortField === 'purchaseDate' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Update Terakhir</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((box) => (
                  <TableRow key={box.id}>
                    <TableCell className="font-medium">{box.size}</TableCell>
                    <TableCell>{box.quantity}</TableCell>
                    <TableCell>{formatCurrency(box.costPrice)}</TableCell>
                    <TableCell>{formatDateShort(box.purchaseDate)}</TableCell>
                    <TableCell>{formatDateShort(box.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => {
                            setEditItem(box);
                            setQuantity(box.quantity);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-destructive" 
                          onClick={() => setDeleteItem(box)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Tidak ada stok dus</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Tambahkan stok dus pertama Anda untuk memulai
          </p>
          <Button onClick={() => setOpenBox(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Stok Dus
          </Button>
        </div>
      )}
      
      {/* Edit Dialog */}
      {editItem && (
        <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Stok Dus</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="size" className="text-right">Ukuran</Label>
                <div className="col-span-3">{editItem.size}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">Jumlah</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="col-span-3"
                  min="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditItem(null)}>Batal</Button>
              <Button onClick={handleSaveEdit}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      {deleteItem && (
        <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Apakah Anda yakin ingin menghapus stok dus {deleteItem.size}?</p>
              <p className="text-sm text-muted-foreground mt-2">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteItem(null)}>Batal</Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>Hapus</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BoxStockList;
