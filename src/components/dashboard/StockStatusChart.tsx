
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface StockStatusChartProps {
  stockItems: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const StockStatusChart: React.FC<StockStatusChartProps> = ({ stockItems }) => {
  // Process stock data for pie chart
  const stockData = stockItems
    ? stockItems
        .reduce((acc: any[], item: any) => {
          const existing = acc.find(x => x.name === item.flavor);
          if (existing) {
            existing.value += item.quantity;
          } else {
            acc.push({ name: item.flavor, value: item.quantity });
          }
          return acc;
        }, [])
        .sort((a: any, b: any) => b.value - a.value)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Stok</CardTitle>
        <CardDescription>
          Distribusi stok saat ini
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
              Belum ada data stok
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StockStatusChart;
