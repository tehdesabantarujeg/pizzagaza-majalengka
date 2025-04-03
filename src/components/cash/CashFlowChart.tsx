
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '@/utils/constants';
import { CashSummary } from '@/utils/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface CashFlowChartProps {
  data: CashSummary[];
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-md shadow-md dark:bg-slate-800 dark:border-slate-700">
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

const CashFlowChart: React.FC<CashFlowChartProps> = ({ data, isLoading }) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-center text-gray-500">Belum ada data keuangan</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: isMobile ? 0 : 20,
            bottom: 50,
          }}
          barGap={0}
          barCategoryGap={isMobile ? 5 : 10}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis 
            dataKey="period" 
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <YAxis 
            tickFormatter={(value) => `${value/1000}k`} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <Bar 
            dataKey="income" 
            name="Pendapatan" 
            fill="#22c55e" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="expense" 
            name="Pengeluaran" 
            fill="#ef4444" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="balance" 
            name="Saldo" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CashFlowChart;
