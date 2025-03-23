
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/utils/constants';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

interface SalesTrendChartProps {
  salesTrend: Array<{ period: string; amount: number }>;
  timeframe: string;
  setTimeframe: (value: string) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${formatCurrency(entry.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ 
  salesTrend, 
  timeframe, 
  setTimeframe 
}) => {
  // Get title based on timeframe
  const getTimeframeTitle = () => {
    switch(timeframe) {
      case 'day': return 'Hari Ini';
      case 'week': return 'Minggu Ini';
      case 'month': return 'Bulan Ini';
      case 'year': return 'Tahun Ini';
      default: return 'Minggu Ini';
    }
  };

  return (
    <Card className="col-span-full lg:col-span-12 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tren Penjualan</CardTitle>
          <CardDescription>
            {getTimeframeTitle()}
          </CardDescription>
        </div>
        <Tabs 
          value={timeframe} 
          onValueChange={setTimeframe}
          className="w-fit"
        >
          <TabsList className="grid w-fit grid-cols-4">
            <TabsTrigger value="day">Hari</TabsTrigger>
            <TabsTrigger value="week">Minggu</TabsTrigger>
            <TabsTrigger value="month">Bulan</TabsTrigger>
            <TabsTrigger value="year">Tahun</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-80">
          {salesTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesTrend}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(value) => `Rp${value/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="Penjualan"
                  stroke="#0088FE"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
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

export default SalesTrendChart;
