
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PizzaStock } from '@/utils/types';
import { Separator } from '@/components/ui/separator';

interface StockAvailabilityBoxProps {
  stockItems: PizzaStock[];
}

const StockAvailabilityBox: React.FC<StockAvailabilityBoxProps> = ({ stockItems }) => {
  // Group stock items by flavor
  const groupedByFlavor = stockItems.reduce((groups, item) => {
    if (!groups[item.flavor]) {
      groups[item.flavor] = [];
    }
    groups[item.flavor].push(item);
    return groups;
  }, {} as Record<string, PizzaStock[]>);

  // Sort flavors alphabetically
  const sortedFlavors = Object.keys(groupedByFlavor).sort();

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Ketersediaan Stock Pizza</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto">
        {sortedFlavors.length > 0 ? (
          <div className="space-y-3">
            {sortedFlavors.map((flavor) => (
              <div key={flavor} className="space-y-1">
                <h3 className="font-medium">{flavor}</h3>
                <div className="grid grid-cols-2 gap-2 pl-2">
                  {groupedByFlavor[flavor]
                    .sort((a, b) => (a.size > b.size ? 1 : -1))
                    .map((item) => (
                      <div key={`${item.flavor}-${item.size}`} className="flex items-center justify-between">
                        <span className="text-sm">{item.size}</span>
                        <Badge variant={item.quantity <= 0 ? "destructive" : item.quantity < 5 ? "outline" : "secondary"}>
                          {item.quantity}
                        </Badge>
                      </div>
                    ))}
                </div>
                <Separator className="mt-2" />
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
