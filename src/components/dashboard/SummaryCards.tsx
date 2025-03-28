
import React from 'react';
import { formatCurrency } from '@/utils/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Calendar, TrendingUp, Users } from 'lucide-react';
import { FadeIn } from '@/components/animations/FadeIn';

interface SummaryData {
  total: number;
  today: number;
  month: number;
  year: number;
  transactions: number;
  customers: number;
  averageOrder: number;
}

interface SummaryCardsProps {
  data: SummaryData;
  isLoading?: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <>
        {[...Array(4)].map((_, index) => (
          <FadeIn key={index} delay={index * 50}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded-full w-4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </>
    );
  }
  
  return (
    <>
      <FadeIn>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Penjualan
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.total || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {data.transactions} transaksi
            </p>
          </CardContent>
        </Card>
      </FadeIn>
      
      <FadeIn delay={50}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hari Ini
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.today || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {data.month > 0 
                ? `${(((data.today || 0) / data.month) * 100).toFixed(1)}% dari bulan ini`
                : "Belum ada penjualan bulan ini"}
            </p>
          </CardContent>
        </Card>
      </FadeIn>
      
      <FadeIn delay={100}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bulan Ini
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.month || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {data.year > 0 
                ? `${(((data.month || 0) / data.year) * 100).toFixed(1)}% dari tahun ini`
                : "Belum ada penjualan tahun ini"}
            </p>
          </CardContent>
        </Card>
      </FadeIn>
      
      <FadeIn delay={150}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rata-rata Transaksi
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.averageOrder || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Per transaksi
            </p>
          </CardContent>
        </Card>
      </FadeIn>
    </>
  );
};

export default SummaryCards;
