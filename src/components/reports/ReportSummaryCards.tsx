
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/constants';
import { Wallet, TrendingUp, CircleDollarSign, Receipt } from 'lucide-react';

interface ReportSummaryCardsProps {
  totalRevenue: number;
  totalProfit: number;
  totalCost: number;
  transactionCount: number;
  isLoading?: boolean;
}

const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({
  totalRevenue,
  totalProfit,
  totalCost,
  transactionCount,
  isLoading = false
}) => {
  const items = [
    {
      title: 'Total Pendapatan',
      value: formatCurrency(totalRevenue),
      icon: <Wallet className="h-5 w-5 text-blue-500" />,
      className: 'bg-blue-50'
    },
    {
      title: 'Total Keuntungan',
      value: formatCurrency(totalProfit),
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      className: 'bg-green-50'
    },
    {
      title: 'Total Modal',
      value: formatCurrency(totalCost),
      icon: <CircleDollarSign className="h-5 w-5 text-purple-500" />,
      className: 'bg-purple-50'
    },
    {
      title: 'Jumlah Transaksi',
      value: transactionCount.toString(),
      icon: <Receipt className="h-5 w-5 text-amber-500" />,
      className: 'bg-amber-50'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-1"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                <h4 className="text-2xl font-bold mt-1">{item.value}</h4>
              </div>
              <div className={`p-2 rounded-full ${item.className}`}>
                {item.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReportSummaryCards;
