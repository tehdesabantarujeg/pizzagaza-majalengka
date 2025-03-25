
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BoxStock } from '@/utils/types';
import { Separator } from '@/components/ui/separator';

interface BoxAvailabilityBoxProps {
  boxItems: BoxStock[];
}

const BoxAvailabilityBox: React.FC<BoxAvailabilityBoxProps> = ({ boxItems }) => {
  // Sort box items by size
  const sortedBoxItems = [...boxItems].sort((a, b) => a.size > b.size ? 1 : -1);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Ketersediaan Stock Dus</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedBoxItems.length > 0 ? (
          <div className="space-y-2">
            {sortedBoxItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="font-medium">{item.size}</span>
                <Badge variant={item.quantity <= 0 ? "destructive" : item.quantity < 5 ? "outline" : "secondary"}>
                  {item.quantity}
                </Badge>
                <Separator className="my-1" />
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
