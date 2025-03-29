
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PizzaStock } from '@/utils/types';
import { AlertCircle } from 'lucide-react';

interface StockAvailabilityTableProps {
  stockItems: PizzaStock[];
  isLoading?: boolean;
}

const StockAvailabilityTable: React.FC<StockAvailabilityTableProps> = ({ stockItems, isLoading = false }) => {
  // Group stock items by size and flavor, combining quantities
  const groupedItems: Record<string, Record<string, number>> = {};
  
  stockItems.forEach(item => {
    if (!groupedItems[item.flavor]) {
      groupedItems[item.flavor] = {};
    }
    
    if (groupedItems[item.flavor][item.size]) {
      groupedItems[item.flavor][item.size] += item.quantity;
    } else {
      groupedItems[item.flavor][item.size] = item.quantity;
    }
  });
  
  // Get unique flavors and sizes
  const flavors = Object.keys(groupedItems).sort();
  const sizes = ['Small', 'Medium'];
  
  // Check if any stock is zero
  const hasZeroStock = Object.values(groupedItems).some(
    flavorSizes => Object.values(flavorSizes).some(quantity => quantity === 0)
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
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-muted-foreground">Memuat data...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rasa</TableHead>
                {sizes.map(size => (
                  <TableHead key={size} className="text-center">{size}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {flavors.length > 0 ? (
                flavors.map(flavor => (
                  <TableRow key={flavor}>
                    <TableCell className="font-medium">{flavor}</TableCell>
                    {sizes.map(size => {
                      const quantity = groupedItems[flavor][size] || 0;
                      return (
                        <TableCell key={size} className="text-center">
                          <Badge 
                            variant={quantity <= 0 ? "destructive" : quantity < 5 ? "outline" : "secondary"} 
                            className="text-xs"
                          >
                            {quantity}
                          </Badge>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={sizes.length + 1} className="text-center py-4 text-muted-foreground">
                    Tidak ada data stock
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default StockAvailabilityTable;
