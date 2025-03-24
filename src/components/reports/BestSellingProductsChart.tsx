
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LabelList 
} from 'recharts';
import { formatCurrency } from '@/utils/constants';

interface BestSellingProductsChartProps {
  products: Array<{ name: string; quantity: number; revenue: number }>;
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.dataKey === 'revenue' ? formatCurrency(entry.value) : entry.value + ' pcs'}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BestSellingProductsChart: React.FC<BestSellingProductsChartProps> = ({ products, isLoading }) => {
  return (
    <Card className="col-span-full w-full">
      <CardHeader>
        <CardTitle>Produk Terlaris</CardTitle>
        <CardDescription>
          Lima produk dengan pendapatan tertinggi
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-96">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              Memuat data...
            </div>
          ) : products.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={products}
                layout="vertical"
                margin={{
                  top: 20,
                  right: 30,
                  left: 100,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={true} vertical={false} />
                <XAxis type="number" tickFormatter={(value) => `Rp${value/1000}k`} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="revenue" name="Pendapatan" fill="#0088FE" minPointSize={5}>
                  <LabelList dataKey="quantity" position="right" formatter={(value: number) => `${value} pcs`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              Belum ada data penjualan
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BestSellingProductsChart;
