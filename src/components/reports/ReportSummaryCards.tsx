
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/constants';
import { Wallet, TrendingUp, CircleDollarSign, Receipt } from 'lucide-react';

interface ReportSummaryCardsProps {
  totalRevenue: number;
  totalProfit: number;
  totalCost: number;
  transactionCount: number;
}

const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({
  totalRevenue,
  totalProfit,
  totalCost,
  transactionCount
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

  return (
    <>
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
    </>
  );
};

export default ReportSummaryCards;
