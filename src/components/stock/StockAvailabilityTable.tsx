
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PizzaStock } from '@/utils/types';
import { AlertCircle } from 'lucide-react';

interface StockAvailabilityTableProps {
  stockItems: PizzaStock[];
}

const StockAvailabilityTable: React.FC<StockAvailabilityTableProps> = ({ stockItems }) => {
  // Get unique flavors and sizes
  const flavors = Array.from(new Set(stockItems.map(item => item.flavor)));
  const sizes = ['Small', 'Medium'];
  
  // Check if any stock is zero
  const hasZeroStock = stockItems.some(item => item.quantity === 0);
  
  // Create a map for quick access to stock quantities
  const stockMap = new Map<string, number>();
  stockItems.forEach(item => {
    const key = `${item.flavor}-${item.size}`;
    stockMap.set(key, item.quantity);
  });
  
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
                    const key = `${flavor}-${size}`;
                    const quantity = stockMap.get(key) || 0;
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
      </CardContent>
    </Card>
  );
};

export default StockAvailabilityTable;
