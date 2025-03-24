
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
  Line,
  ComposedChart
} from 'recharts';
import { formatCurrency } from '@/utils/constants';
import { useIsMobile } from '@/hooks/use-mobile';

interface RevenueVsExpensesChartProps {
  data: Array<{ period: string; revenue: number; expenses: number; profit: number }>;
  isLoading: boolean;
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

const RevenueVsExpensesChart: React.FC<RevenueVsExpensesChartProps> = ({ data, isLoading }) => {
  const isMobile = useIsMobile();

  return (
    <Card className="col-span-full w-full">
      <CardHeader>
        <CardTitle>Pendapatan vs Pengeluaran</CardTitle>
        <CardDescription>
          Perbandingan pendapatan, pengeluaran, dan keuntungan
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-96">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              Memuat data...
            </div>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 50,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="period" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tickFormatter={(value) => `Rp${value/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="revenue" name="Pendapatan" fill="#22c55e" stackId="a" />
                <Bar dataKey="expenses" name="Pengeluaran" fill="#ef4444" stackId="a" />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Keuntungan Bersih"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              Belum ada data untuk ditampilkan
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueVsExpensesChart;
