
import React from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { FadeInStagger } from '@/components/animations/FadeIn';
import useDashboardData from '@/hooks/dashboard/useDashboardData';
import SummaryCards from '@/components/dashboard/SummaryCards';
import SalesTrendChart from '@/components/dashboard/SalesTrendChart';
import TopProductsChart from '@/components/dashboard/TopProductsChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import StockStatusChart from '@/components/dashboard/StockStatusChart';

const Dashboard = () => {
  const {
    isLoading,
    timeframe,
    setTimeframe,
    salesTrend,
    topProducts,
    summarySales,
    recentTransactions,
    dashboardData
  } = useDashboardData();

  return (
    <Layout>
      <Header 
        title="Beranda" 
        description="Ringkasan bisnis dan analitik penjualan"
      />
      
      <div className="container px-4 py-6">
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            Memuat data dashboard...
          </div>
        ) : (
          <>
            <FadeInStagger className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <SummaryCards data={summarySales} />
            </FadeInStagger>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
              <div className="col-span-full lg:col-span-4">
                <SalesTrendChart 
                  salesTrend={salesTrend} 
                  timeframe={timeframe} 
                  setTimeframe={setTimeframe} 
                />
              </div>
              
              <div className="col-span-full lg:col-span-3">
                <TopProductsChart topProducts={topProducts} />
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <RecentTransactions transactions={recentTransactions} />
              <StockStatusChart stockItems={dashboardData?.stockItems || []} />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
