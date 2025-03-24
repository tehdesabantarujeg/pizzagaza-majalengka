
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Bar,
  BarChart,
  ComposedChart,
  Area
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

const CashFlowChart: React.FC<CashFlowChartProps> = ({ data, isLoading }) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        Memuat data...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        Belum ada data keuangan
      </div>
    );
  }

  // Use a composed chart for desktop and line chart for mobile
  return (
    <ResponsiveContainer width="100%" height="100%">
      {isMobile ? (
        <LineChart
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
            tick={{ fontSize: 12 }}
          />
          <YAxis tickFormatter={(value) => `Rp${value/1000}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="income" 
            name="Pendapatan" 
            stroke="#22c55e" 
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="expense" 
            name="Pengeluaran" 
            stroke="#ef4444" 
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="balance" 
            name="Saldo" 
            stroke="#3b82f6" 
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        </LineChart>
      ) : (
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
          <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `Rp${value/1000}k`} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `Rp${value/1000}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            yAxisId="left" 
            dataKey="income" 
            name="Pendapatan" 
            fill="#22c55e" 
            barSize={20}
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            yAxisId="left" 
            dataKey="expense" 
            name="Pengeluaran" 
            fill="#ef4444" 
            barSize={20}
            radius={[2, 2, 0, 0]}
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="balance" 
            name="Saldo" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </ComposedChart>
      )}
    </ResponsiveContainer>
  );
};

export default CashFlowChart;
