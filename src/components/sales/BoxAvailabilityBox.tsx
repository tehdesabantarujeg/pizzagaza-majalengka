
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BoxStock } from '@/utils/types';
import { Separator } from '@/components/ui/separator';

interface BoxAvailabilityBoxProps {
  boxItems: BoxStock[];
}

const BoxAvailabilityBox: React.FC<BoxAvailabilityBoxProps> = ({ boxItems }) => {
  // Combine quantities for the same size boxes
  const combinedBoxes: Record<string, number> = {};
  
  boxItems.forEach(item => {
    if (combinedBoxes[item.size]) {
      combinedBoxes[item.size] += item.quantity;
    } else {
      combinedBoxes[item.size] = item.quantity;
    }
  });
  
  // Sort by size
  const sortedSizes = Object.keys(combinedBoxes).sort();

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Ketersediaan Stock Dus</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedSizes.length > 0 ? (
          <div className="space-y-2">
            {sortedSizes.map((size) => (
              <div key={size} className="flex items-center justify-between">
                <span className="font-medium">{size}</span>
                <Badge 
                  variant={combinedBoxes[size] <= 0 ? "destructive" : combinedBoxes[size] < 5 ? "outline" : "secondary"}
                >
                  {combinedBoxes[size]}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-2 text-muted-foreground">
            Tidak ada data stock dus
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BoxAvailabilityBox;
