
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip, 
  ResponsiveContainer,
  LabelList
} from 'recharts';

interface StockStatusChartProps {
  stockItems: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const StockStatusChart: React.FC<StockStatusChartProps> = ({ stockItems }) => {
  // Process stock data for bar chart
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
              <BarChart
                data={stockData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  width={110}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} unit`, 'Jumlah']}
                  labelFormatter={(name) => `Rasa: ${name}`}
                />
                <Bar dataKey="value" fill="#8884d8">
                  <LabelList dataKey="value" position="right" />
                </Bar>
              </BarChart>
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
