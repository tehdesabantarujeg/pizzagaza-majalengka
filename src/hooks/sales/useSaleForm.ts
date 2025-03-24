import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addTransaction, updatePizzaStock, updateBoxStock, generateTransactionNumber } from '@/utils/supabase';
import { PizzaSaleItem } from '@/utils/types';
import { useToast } from '@/components/ui/use-toast';

interface SaleFormData {
  customerName: string;
  notes: string;
  items: PizzaSaleItem[];
}

export const useSaleForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: createSaleMutation, isLoading: isCreatingSale } = useMutation(
    async (formData: SaleFormData) => {
      const { customerName, notes, items } = formData;

      // Calculate the total price for the entire transaction
      const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

      // Create individual transaction entries for each item
      const transactionPromises = items.map(async (item) => {
        return addTransaction({
          date: new Date().toISOString(),
          pizzaId: item.pizzaStockId || '',
          size: item.size,
          flavor: item.flavor,
          quantity: item.quantity,
          state: item.state,
          includeBox: item.includeBox,
          sellingPrice: item.sellingPrice,
          totalPrice: item.totalPrice,
          customerName: customerName,
          notes: notes,
          transactionNumber: '' // Assign transaction number later
        });
      });

      const transactions = await Promise.all(transactionPromises);

      // Check if all transactions were successful
      const successfulTransactions = transactions.every(transaction => transaction !== null);

      if (!successfulTransactions) {
        throw new Error('Failed to create one or more transactions');
      }

      return { customerName, notes, items };
    },
    {
      onSuccess: async (data) => {
        const { customerName, notes, items } = data;

        try {
          // Use the new transaction number format
          const transactionNumber = await generateTransactionNumber();
          
          // Update the transaction number for each transaction
          const updatePromises = items.map(async (item) => {
            const transaction = await addTransaction({
              date: new Date().toISOString(),
              pizzaId: item.pizzaStockId || '',
              size: item.size,
              flavor: item.flavor,
              quantity: item.quantity,
              state: item.state,
              includeBox: item.includeBox,
              sellingPrice: item.sellingPrice,
              totalPrice: item.totalPrice,
              customerName: customerName,
              notes: notes,
              transactionNumber: transactionNumber // Assign transaction number
            });
            return transaction;
          });

          await Promise.all(updatePromises);

          // Update stock quantities
          const stockUpdatePromises = items.map(async (item) => {
            if (item.pizzaStockId) {
              // Optimistically update the stock item
              queryClient.setQueryData(['stockItems'], (old: any) => {
                if (!old) return old;
                const updatedStockItems = old.map((stockItem: any) => {
                  if (stockItem.id === item.pizzaStockId) {
                    return { ...stockItem, quantity: stockItem.quantity - item.quantity };
                  }
                  return stockItem;
                });
                return updatedStockItems;
              });

              // Call the updatePizzaStock function
              return updatePizzaStock({
                id: item.pizzaStockId,
                size: item.size,
                flavor: item.flavor,
                quantity: item.quantity,
                purchaseDate: new Date().toISOString(),
                costPrice: 0,
                updatedAt: new Date().toISOString()
              });
            }
            return Promise.resolve(true);
          });

          await Promise.all(stockUpdatePromises);

          // Update box stock quantities
          const boxStockUpdatePromises = items.map(async (item) => {
            if (item.includeBox && item.boxStockId) {
              // Optimistically update the box stock item
              queryClient.setQueryData(['boxStock'], (old: any) => {
                if (!old) return old;
                const updatedBoxStock = old.map((boxStockItem: any) => {
                  if (boxStockItem.id === item.boxStockId) {
                    return { ...boxStockItem, quantity: boxStockItem.quantity - item.quantity };
                  }
                  return boxStockItem;
                });
                return updatedBoxStock;
              });

              // Call the updateBoxStock function
              return updateBoxStock({
                id: item.boxStockId,
                size: item.size,
                quantity: item.quantity,
                purchaseDate: new Date().toISOString(),
                costPrice: 0,
                updatedAt: new Date().toISOString()
              });
            }
            return Promise.resolve(true);
          });

          await Promise.all(boxStockUpdatePromises);

          // Invalidate queries to update data
          await queryClient.invalidateQueries(['transactions']);
          await queryClient.invalidateQueries(['stockItems']);
          await queryClient.invalidateQueries(['boxStock']);

          toast({
            title: 'Penjualan Berhasil!',
            description: 'Transaksi telah berhasil disimpan.',
          });

          setIsDialogOpen(false);
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Gagal Membuat Penjualan',
            description: error.message || 'Terjadi kesalahan saat menyimpan transaksi.',
          });
        }
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Gagal Membuat Penjualan',
          description: error.message || 'Terjadi kesalahan saat menyimpan transaksi.',
        });
      },
    }
  );

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  return {
    createSale: createSaleMutation,
    isCreatingSale,
    isDialogOpen,
    openDialog,
    closeDialog,
  };
};
