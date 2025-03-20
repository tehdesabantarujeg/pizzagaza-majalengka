
import React from 'react';
import { FadeInStagger } from '@/components/animations/FadeIn';
import TransactionCard from '@/components/TransactionCard';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart } from 'lucide-react';
import { Transaction } from '@/utils/types';

interface TransactionListProps {
  transactions: Transaction[];
  setOpen: (open: boolean) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, setOpen }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <FadeInStagger staggerDelay={50}>
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Belum ada penjualan tercatat</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Catat penjualan pertama Anda untuk memulai
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Penjualan Baru
            </Button>
          </div>
        )}
      </FadeInStagger>
    </div>
  );
};

export default TransactionList;
