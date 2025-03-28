
import React, { useState } from 'react';
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
  LabelList,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatCurrency } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart2, PieChart as PieChartIcon, TableIcon } from 'lucide-react';

interface BestSellingProductsChartProps {
  products: Array<{ name: string; quantity: number; revenue: number }>;
  isLoading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];

type ChartType = 'bar' | 'pie' | 'table';

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
  const [chartType, setChartType] = useState<ChartType>('bar');
  
  const renderBarChart = () => (
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
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={products}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="revenue"
        >
          {products.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(value as number)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40%]">Nama Produk</TableHead>
          <TableHead className="text-right">Jumlah (pcs)</TableHead>
          <TableHead className="text-right">Pendapatan</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell className="text-right">{product.quantity}</TableCell>
            <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Card className="col-span-full w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <CardTitle>Produk Terlaris</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant={chartType === 'bar' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setChartType('bar')}
            >
              <BarChart2 className="h-4 w-4 mr-1" />
              Bar
            </Button>
            <Button 
              variant={chartType === 'pie' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setChartType('pie')}
            >
              <PieChartIcon className="h-4 w-4 mr-1" />
              Pie
            </Button>
            <Button 
              variant={chartType === 'table' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setChartType('table')}
            >
              <TableIcon className="h-4 w-4 mr-1" />
              Tabel
            </Button>
          </div>
        </div>
        <CardDescription>
          Lima produk dengan pendapatan tertinggi
        </CardDescription>
      </CardHeader>
      <CardContent className={chartType === 'table' ? '' : 'p-0'}>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            Memuat data...
          </div>
        ) : products.length > 0 ? (
          <div className={chartType === 'table' ? '' : 'h-96'}>
            {chartType === 'bar' && renderBarChart()}
            {chartType === 'pie' && renderPieChart()}
            {chartType === 'table' && renderTable()}
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            Belum ada data penjualan
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BestSellingProductsChart;
