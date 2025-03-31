
import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/constants';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/utils/animations';

interface TopProductProps {
  name: string;
  value: number;
  count: number;
}

interface TopProductsChartProps {
  data: TopProductProps[];
  isLoading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="font-medium">{data.name}</p>
        <p>{`Penjualan: ${data.count}x`}</p>
        <p>{`Total: ${formatCurrency(data.value)}`}</p>
      </div>
    );
  }
  return null;
};

const TopProductsChart: React.FC<TopProductsChartProps> = ({ data, isLoading }) => {
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Produk Terlaris</CardTitle>
        </CardHeader>
        <CardContent className={cn(isMobile ? "h-[300px]" : "h-[400px]", "flex items-center justify-center")}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Memuat data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Produk Terlaris</CardTitle>
        </CardHeader>
        <CardContent className={cn(isMobile ? "h-[300px]" : "h-[400px]", "flex items-center justify-center")}>
          <p className="text-center text-gray-500">Belum ada data penjualan</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Produk Terlaris</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn(isMobile ? "h-[300px]" : "h-[400px]")}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={isMobile ? 90 : 120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopProductsChart;
