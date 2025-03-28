import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { BoxStock } from '@/utils/types';

interface BoxStockStatusChartProps {
  boxItems: BoxStock[];
}

const COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28'];

const BoxStockStatusChart: React.FC<BoxStockStatusChartProps> = ({ boxItems }) => {
  // Process stock data for pie chart
  const stockData = boxItems
    ? boxItems
        .reduce((acc: any[], item: any) => {
          const existing = acc.find(x => x.name === item.size);
          if (existing) {
            existing.value += item.quantity;
          } else {
            acc.push({ name: item.size, value: item.quantity });
          }
          return acc;
        }, [])
        .sort((a: any, b: any) => b.value - a.value)
    : [];

  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Stok Dus</CardTitle>
        <CardDescription>
          Distribusi stok dus saat ini
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {stockData && stockData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stockData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              Belum ada data stok dus
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BoxStockStatusChart;
