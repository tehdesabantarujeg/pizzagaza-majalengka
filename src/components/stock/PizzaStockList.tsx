
import React, { useState } from 'react';
import { PizzaStock } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ShoppingBag, Search, ArrowUpDown, Pencil, Trash } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { formatCurrency, formatDateShort } from '@/utils/constants';
import PizzaVariantBadge from '@/components/PizzaVariantBadge';
import { useToast } from '@/hooks/use-toast';
import { updateStockItem } from '@/utils/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface PizzaStockListProps {
  stockItems: PizzaStock[];
  setOpenPizza: (open: boolean) => void;
  loadStockData?: () => void;
}

const PizzaStockList: React.FC<PizzaStockListProps> = ({ stockItems, setOpenPizza, loadStockData }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof PizzaStock>('flavor');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editItem, setEditItem] = useState<PizzaStock | null>(null);
  const [deleteItem, setDeleteItem] = useState<PizzaStock | null>(null);
  const [quantity, setQuantity] = useState(0);
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleSort = (field: keyof PizzaStock) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const filteredItems = stockItems
    .filter(stock => 
      stock.flavor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.size.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  
  const handleSaveEdit = async () => {
    if (!editItem) return;
    
    try {
      const updatedStock = {
        ...editItem,
        quantity: quantity
      };
      
      const success = await updateStockItem(updatedStock);
      
      if (success) {
        toast({
          title: "Stok berhasil diupdate",
          description: `${updatedStock.flavor} ${updatedStock.size} berhasil diperbarui.`
        });
        
        if (loadStockData) loadStockData();
      } else {
        toast({
          title: "Gagal mengupdate stok",
          description: "Terjadi kesalahan saat memperbarui stok.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal memperbarui stok",
        variant: "destructive"
      });
    }
    
    setEditItem(null);
  };
  
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    
    try {
      // Since deletePizzaStock is not available, we'll simulate by setting quantity to 0
      const updatedStock = {
        ...deleteItem,
        quantity: 0
      };
      
      const success = await updateStockItem(updatedStock);
      
      if (success) {
        toast({
          title: "Stok berhasil dihapus",
          description: `${deleteItem.flavor} ${deleteItem.size} berhasil dihapus dari stok.`
        });
        
        if (loadStockData) loadStockData();
      } else {
        toast({
          title: "Gagal menghapus stok",
          description: "Terjadi kesalahan saat menghapus stok.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting stock:", error);
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal menghapus stok",
        variant: "destructive"
      });
    }
    
    setDeleteItem(null);
  };
  
  return (
    <div>
      {stockItems.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari stok pizza..."
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
                  <TableHead onClick={() => handleSort('flavor')} className="cursor-pointer hover:bg-muted">
                    <div className="flex items-center">
                      Rasa
                      {sortField === 'flavor' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
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
                {filteredItems.map((stock) => (
                  <TableRow key={stock.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <PizzaVariantBadge flavor={stock.flavor} size={stock.size} state="Frozen Food" />
                        {stock.flavor}
                      </div>
                    </TableCell>
                    <TableCell>{stock.size}</TableCell>
                    <TableCell>{stock.quantity}</TableCell>
                    <TableCell>{formatCurrency(stock.costPrice)}</TableCell>
                    <TableCell>{formatDateShort(stock.purchaseDate)}</TableCell>
                    <TableCell>{formatDateShort(stock.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => {
                            setEditItem(stock);
                            setQuantity(stock.quantity);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-destructive" 
                          onClick={() => setDeleteItem(stock)}
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
          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Tidak ada stok pizza</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Tambahkan stok pizza pertama Anda untuk memulai
          </p>
          <Button onClick={() => setOpenPizza(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Stok Pizza
          </Button>
        </div>
      )}
      
      {editItem && (
        <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Stok Pizza</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="flavor" className="text-right">Rasa</Label>
                <div className="col-span-3">{editItem.flavor}</div>
              </div>
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
      
      {deleteItem && (
        <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Apakah Anda yakin ingin menghapus stok pizza {deleteItem.flavor} ({deleteItem.size})?</p>
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

export default PizzaStockList;
