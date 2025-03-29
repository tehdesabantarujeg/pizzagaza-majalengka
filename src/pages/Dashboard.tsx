
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SummaryCards from '@/components/dashboard/SummaryCards';
import StockStatusChart from '@/components/dashboard/StockStatusChart';
import BoxStockStatusChart from '@/components/dashboard/BoxStockStatusChart';
import SalesTrendChart from '@/components/dashboard/SalesTrendChart';
import TopProductsChart from '@/components/dashboard/TopProductsChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import { useToast } from '@/hooks/use-toast';
import useDashboardData from '@/hooks/dashboard/useDashboardData';
import StockAvailabilityTable from '@/components/dashboard/StockAvailabilityTable';
import { useQuery } from '@tanstack/react-query';
import { fetchBoxStock } from '@/utils/supabase';
import BoxAvailabilityBox from '@/components/sales/BoxAvailabilityBox';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const { toast } = useToast();
  
  const { 
    salesTrend,
    stockItems, 
    recentTransactions, 
    topProducts, 
    isLoading,
    summarySales,
  } = useDashboardData();

  const { 
    data: boxItems = []
  } = useQuery({
    queryKey: ['boxStocks'],
    queryFn: fetchBoxStock
  });

  return (
    <Layout>
      <Header 
        title="Dashboard" 
        description="Ringkasan data pizza shop"
      />
      
      <div className="container px-4 py-6">
        <Tabs
          defaultValue="week"
          className="mb-8"
          onValueChange={(value) => setTimeRange(value as 'week' | 'month' | 'year')}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Ringkasan</h2>
            <TabsList>
              <TabsTrigger value="week">Minggu Ini</TabsTrigger>
              <TabsTrigger value="month">Bulan Ini</TabsTrigger>
              <TabsTrigger value="year">Tahun Ini</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="week" className="mt-6">
            <SummaryCards 
              data={summarySales}
            />
          </TabsContent>
          
          <TabsContent value="month" className="mt-6">
            <SummaryCards 
              data={summarySales}
            />
          </TabsContent>
          
          <TabsContent value="year" className="mt-6">
            <SummaryCards 
              data={summarySales}
            />
          </TabsContent>
        </Tabs>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2">
            <SalesTrendChart salesData={salesTrend} isLoading={isLoading} timeframe={timeRange} />
          </div>
          
          <div className="md:col-span-1">
            <TopProductsChart topProducts={topProducts} />
          </div>
          
          <div className="md:col-span-2">
            <StockAvailabilityTable stockItems={stockItems} isLoading={isLoading} />
          </div>
          
          <div className="md:col-span-1">
            <BoxAvailabilityBox boxItems={boxItems} />
          </div>
          
          <div className="lg:col-span-2">
            <StockStatusChart stockItems={stockItems} />
          </div>
          
          <div className="lg:col-span-1">
            <BoxStockStatusChart boxItems={boxItems} />
          </div>
          
          <div className="md:col-span-3">
            <RecentTransactions transactions={recentTransactions} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
