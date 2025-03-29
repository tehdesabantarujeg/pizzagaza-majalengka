import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/utils/constants';
import EditableCostPrice from '@/components/stock/EditableCostPrice';
import { updatePizzaStockCostPrice } from '@/utils/supabase';
import { PizzaStock } from '@/utils/types';

interface StockCardProps {
  id: string;
  flavor: string;
  size: string;
  quantity: number;
  costPrice: number;
  purchaseDate: string;
  updated?: string;
}

const StockCard: React.FC<StockCardProps | { stock: PizzaStock }> = (props) => {
  const stockProps = 'stock' in props ? props.stock : props;
  const { id, flavor, size, quantity, costPrice, purchaseDate } = stockProps;
  const updated = 'stock' in props ? props.stock.updatedAt : props.updated;

  const handleUpdateCostPrice = async (newPrice: number) => {
    await updatePizzaStockCostPrice(id, newPrice);
  };

  return (
    <Card className="relative shadow-sm">
      <Badge 
        variant={quantity > 0 ? "default" : "destructive"}
        className="absolute top-2 right-2"
      >
        Stok: {quantity}
      </Badge>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{flavor}</CardTitle>
        <CardDescription>Ukuran: {size}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-2 pt-0">
        <div className="text-sm">
          <span className="font-medium">Harga Modal:</span>{' '}
          <EditableCostPrice 
            initialValue={costPrice} 
            onUpdate={handleUpdateCostPrice}
          />
        </div>
        <div className="text-sm">
          <span className="font-medium">Tanggal Pembelian:</span>{' '}
          {formatDate(purchaseDate || '')}
        </div>
        {updated && (
          <div className="text-sm text-muted-foreground">
            Terakhir diperbarui: {formatDate(updated)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockCard;
