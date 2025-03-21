
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/utils/constants';
import { Box } from 'lucide-react';
import EditableCostPrice from '@/components/stock/EditableCostPrice';
import { updateBoxStockCostPrice } from '@/utils/supabase';
import { BoxStock } from '@/utils/types';

interface BoxStockCardProps {
  id: string;
  size: string;
  quantity: number;
  costPrice: number;
  purchaseDate: string;
  updated?: string;
}

// Add an overload for accepting a stock object
const BoxStockCard: React.FC<BoxStockCardProps | { stock: BoxStock }> = (props) => {
  // Handle both prop formats
  const stockProps = 'stock' in props ? props.stock : props;
  const { id, size, quantity, costPrice, purchaseDate } = 'stock' in props ? 
    { 
      id: props.stock.id, 
      size: props.stock.size, 
      quantity: props.stock.quantity, 
      costPrice: props.stock.costPrice, 
      purchaseDate: props.stock.purchaseDate,
      updated: props.stock.updatedAt 
    } : props;

  const handleUpdateCostPrice = async (newPrice: number) => {
    await updateBoxStockCostPrice(id, newPrice);
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
        <div className="flex items-center space-x-2">
          <Box className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-xl">Box Pizza</CardTitle>
        </div>
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
          {formatDate(purchaseDate)}
        </div>
        {'updated' in stockProps && stockProps.updated && (
          <div className="text-sm text-muted-foreground">
            Terakhir diperbarui: {formatDate(stockProps.updated)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BoxStockCard;
