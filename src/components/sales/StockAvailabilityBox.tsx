
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
  // Group stock items by size and flavor, combining quantities
  const groupedBySize: Record<string, Record<string, number>> = {};
  
  // Process all stock items and combine quantities for the same size and flavor
  stockItems.forEach(item => {
    if (!groupedBySize[item.size]) {
      groupedBySize[item.size] = {};
    }
    
    // Add to existing quantity or initialize new
    if (groupedBySize[item.size][item.flavor]) {
      groupedBySize[item.size][item.flavor] += item.quantity;
    } else {
      groupedBySize[item.size][item.flavor] = item.quantity;
    }
  });

  // Check if any stock is zero
  const hasZeroStock = Object.values(groupedBySize).some(
    sizeGroup => Object.values(sizeGroup).some(quantity => quantity === 0)
  );

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
            {Object.entries(groupedBySize).map(([size, flavors]) => (
              <div key={size} className="border rounded-md p-3">
                <h3 className="font-medium text-sm border-b pb-1 mb-2">{size}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(flavors).map(([flavor, quantity]) => (
                    <div key={`${flavor}-${size}`} className="flex items-center justify-between">
                      <span className="text-xs">{flavor}</span>
                      <Badge 
                        variant={quantity <= 0 ? "destructive" : quantity < 5 ? "outline" : "secondary"} 
                        className="text-xs"
                      >
                        {quantity}
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
