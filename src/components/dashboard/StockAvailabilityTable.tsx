
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PizzaStock } from '@/utils/types';
import { AlertTriangle } from 'lucide-react';
import { PIZZA_FLAVORS, PIZZA_SIZES } from '@/utils/constants';
import { Badge } from '@/components/ui/badge';

interface StockAvailabilityTableProps {
  stockItems: PizzaStock[];
  isLoading: boolean;
}

interface StockSummary {
  flavor: string;
  small: number;
  medium: number;
}

const StockAvailabilityTable: React.FC<StockAvailabilityTableProps> = ({ stockItems, isLoading }) => {
  // Summarize stock data by flavor and size
  const summary: StockSummary[] = PIZZA_FLAVORS.map(flavor => ({
    flavor,
    small: 0,
    medium: 0
  }));

  // Populate summary with actual quantities
  stockItems.forEach(item => {
    const flavorIndex = summary.findIndex(s => s.flavor === item.flavor);
    if (flavorIndex !== -1) {
      if (item.size === 'Small') {
        summary[flavorIndex].small += item.quantity;
      } else if (item.size === 'Medium') {
        summary[flavorIndex].medium += item.quantity;
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Ketersediaan Pizza</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rasa</TableHead>
                  <TableHead className="text-center">Small</TableHead>
                  <TableHead className="text-center">Medium</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.map((stock, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{stock.flavor}</TableCell>
                    <TableCell className="text-center">
                      {stock.small === 0 ? (
                        <div className="flex items-center justify-center">
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{stock.small}</span>
                          </Badge>
                        </div>
                      ) : (
                        stock.small
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {stock.medium === 0 ? (
                        <div className="flex items-center justify-center">
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{stock.medium}</span>
                          </Badge>
                        </div>
                      ) : (
                        stock.medium
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockAvailabilityTable;
