
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StockAvailabilityTable from '@/components/dashboard/StockAvailabilityTable';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import SummaryCards from '@/components/dashboard/SummaryCards';
import SalesTrendChart from '@/components/dashboard/SalesTrendChart';
import TopProductsChart from '@/components/dashboard/TopProductsChart';
import StockStatusChart from '@/components/dashboard/StockStatusChart';
import BoxStockStatusChart from '@/components/dashboard/BoxStockStatusChart';
import useDashboardData from '@/hooks/dashboard/useDashboardData';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If someone tried to access /dashboard, redirect them to the index page
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  const { salesTrend, topProducts, summarySales, recentTransactions, stockItems, boxItems, isLoading, timeframe } = useDashboardData();

  return (
    <Layout>
      <Header 
        title="Dashboard" 
        description="Overview of your business performance"
      />
      
      <div className="container px-4 py-6">
        <SummaryCards 
          data={summarySales}
          isLoading={isLoading}
        />
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-7 gap-6">
          <div className="md:col-span-4">
            <Tabs defaultValue="sales">
              <TabsList className="mb-4">
                <TabsTrigger value="sales">Tren Penjualan</TabsTrigger>
                <TabsTrigger value="products">Top Produk</TabsTrigger>
              </TabsList>
              <TabsContent value="sales">
                <Card>
                  <CardContent className="pt-4">
                    <SalesTrendChart salesData={salesTrend} isLoading={isLoading} timeframe={timeframe} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="products">
                <Card>
                  <CardContent className="pt-4">
                    <TopProductsChart topProducts={topProducts} isLoading={isLoading} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="md:col-span-3">
            <Tabs defaultValue="pizza">
              <TabsList className="mb-4">
                <TabsTrigger value="pizza">Stok Pizza</TabsTrigger>
                <TabsTrigger value="box">Stok Dus</TabsTrigger>
              </TabsList>
              <TabsContent value="pizza">
                <Card>
                  <CardContent className="pt-4">
                    <StockStatusChart stockItems={stockItems} isLoading={isLoading} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="box">
                <Card>
                  <CardContent className="pt-4">
                    <BoxStockStatusChart boxItems={boxItems} isLoading={isLoading} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-7 gap-6">
          <div className="md:col-span-4">
            <StockAvailabilityTable stockItems={stockItems} isLoading={isLoading} />
          </div>
          
          <div className="md:col-span-3">
            <RecentTransactions transactions={recentTransactions} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
