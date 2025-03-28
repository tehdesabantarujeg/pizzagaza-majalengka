
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PizzaStock } from '@/utils/types';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';

interface StockAvailabilityBoxProps {
  stockItems: PizzaStock[];
}

const StockAvailabilityBox: React.FC<StockAvailabilityBoxProps> = ({ stockItems }) => {
  // Group stock items by size
  const groupedBySize = stockItems.reduce((groups, item) => {
    if (!groups[item.size]) {
      groups[item.size] = [];
    }
    groups[item.size].push(item);
    return groups;
  }, {} as Record<string, PizzaStock[]>);

  const hasZeroStock = stockItems.some(item => item.quantity === 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Rekap Stok Pizza Menurut Ukuran</span>
          {hasZeroStock && (
            <div className="flex items-center text-amber-500 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>Ada stok varian yang habis</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedBySize).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedBySize).map(([size, items]) => (
              <div key={size} className="border rounded-md p-3">
                <h3 className="font-medium text-sm border-b pb-1 mb-2">{size}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {items.map((item) => (
                    <div key={`${item.flavor}-${item.size}`} className="flex items-center justify-between">
                      <span className="text-xs">{item.flavor}</span>
                      <Badge 
                        variant={item.quantity <= 0 ? "destructive" : item.quantity < 5 ? "outline" : "secondary"} 
                        className="text-xs"
                      >
                        {item.quantity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Tidak ada data stock
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockAvailabilityBox;
