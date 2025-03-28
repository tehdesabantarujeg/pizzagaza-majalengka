
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface TopProductsChartProps {
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({ topProducts }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produk Terlaris</CardTitle>
        <CardDescription>
          Berdasarkan pendapatan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {topProducts && topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" tickFormatter={(value) => `Rp${value/1000}k`} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120}
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                />
                <Tooltip formatter={(value) => [`Rp${value.toLocaleString('id-ID')}`, 'Pendapatan']} />
                <Bar dataKey="revenue" name="Pendapatan" fill="#0088FE" radius={[0, 4, 4, 0]} />
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

export default TopProductsChart;
