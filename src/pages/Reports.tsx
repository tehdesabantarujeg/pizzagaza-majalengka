import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { addDays, subDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { fetchSalesReportData, fetchTransactions, fetchStockSummary } from '@/utils/supabase';
import RecentTransactionsList from '@/components/reports/RecentTransactionsList';
import SalesTrendChart from '@/components/dashboard/SalesTrendChart';
import StockStatusChart from '@/components/dashboard/StockStatusChart';
import BestSellingProductsChart from '@/components/reports/BestSellingProductsChart';
import ReportSummaryCards from '@/components/reports/ReportSummaryCards';
import { Transaction } from '@/utils/types';
import { formatCurrency } from '@/utils/constants';
import { Card } from '@/components/ui/card';

const Reports = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [timeframe, setTimeframe] = useState('week');
  const [reportData, setReportData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesTrend, setSalesTrend] = useState<Array<{ period: string; amount: number }>>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<Array<{ name: string; quantity: number; revenue: number }>>([]);
  
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalCost: 0,
    transactionCount: 0
  });

  useEffect(() => {
    loadData();
  }, [date, timeframe]);

  const loadData = async () => {
    if (date?.from && date?.to) {
      setLoading(true);
      try {
        const fromDate = date.from.toISOString();
        const toDate = date.to.toISOString();
        
        const [salesData, transactionsData, stockData] = await Promise.all([
          fetchSalesReportData(fromDate, toDate),
          fetchTransactions(),
          fetchStockSummary()
        ]);
        
        setReportData(salesData);
        setTransactions(transactionsData);
        setStockItems(stockData);
        
        processSalesTrendData(salesData);
        processBestSellingProducts(salesData);
        calculateSummaryStats(salesData);
      } catch (error) {
        console.error("Error loading report data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const processSalesTrendData = (data: any[]) => {
    if (data.length === 0) {
      setSalesTrend([]);
      return;
    }

    const groupedByDate: {[key: string]: number} = {};
    
    data.forEach(sale => {
      const date = new Date(sale.date);
      let formattedDate;
      
      switch(timeframe) {
        case 'day':
          formattedDate = format(date, 'HH:mm');
          break;
        case 'week':
          formattedDate = format(date, 'EEE');
          break;
        case 'month':
          formattedDate = format(date, 'dd MMM');
          break;
        case 'year':
          formattedDate = format(date, 'MMM');
          break;
        default:
          formattedDate = format(date, 'dd MMM');
      }
      
      if (!groupedByDate[formattedDate]) {
        groupedByDate[formattedDate] = 0;
      }
      groupedByDate[formattedDate] += sale.total_price || 0;
    });
    
    const trendData = Object.entries(groupedByDate).map(([period, amount]) => ({
      period,
      amount
    }));
    
    setSalesTrend(trendData);
  };

  const processBestSellingProducts = (data: any[]) => {
    if (data.length === 0) {
      setBestSellingProducts([]);
      return;
    }

    const groupedByProduct: {[key: string]: {quantity: number, revenue: number}} = {};
    
    data.forEach(sale => {
      const productKey = `${sale.flavor} ${sale.size} ${sale.state}`;
      
      if (!groupedByProduct[productKey]) {
        groupedByProduct[productKey] = { quantity: 0, revenue: 0 };
      }
      
      groupedByProduct[productKey].quantity += sale.quantity || 0;
      groupedByProduct[productKey].revenue += sale.total_price || 0;
    });
    
    const productData = Object.entries(groupedByProduct)
      .map(([name, { quantity, revenue }]) => ({
        name,
        quantity,
        revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    setBestSellingProducts(productData);
  };

  const calculateSummaryStats = (data: any[]) => {
    if (data.length === 0) {
      setSummaryStats({
        totalRevenue: 0,
        totalProfit: 0,
        totalCost: 0,
        transactionCount: 0
      });
      return;
    }

    const totalRevenue = data.reduce((sum, sale) => sum + (sale.total_price || 0), 0);
    
    const estimatedCostRatio = 0.6;
    const totalCost = Math.round(totalRevenue * estimatedCostRatio);
    const totalProfit = totalRevenue - totalCost;
    
    const uniqueTransactionIds = new Set(data.map(sale => sale.transaction_number));
    const transactionCount = uniqueTransactionIds.size;
    
    setSummaryStats({
      totalRevenue,
      totalProfit,
      totalCost,
      transactionCount
    });
  };

  return (
    <Layout>
      <Header 
        title="Laporan Penjualan" 
        description="Lihat laporan penjualan dan pendapatan"
      />

      <div className="container px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Periode</h2>
            <div className="max-w-sm">
              <DateRangePicker 
                value={date} 
                onChange={setDate} 
              />
            </div>
          </div>
          
          <Tabs 
            value={timeframe} 
            onValueChange={setTimeframe}
            className="w-fit"
          >
            <TabsList className="grid w-fit grid-cols-4">
              <TabsTrigger value="day">Harian</TabsTrigger>
              <TabsTrigger value="week">Mingguan</TabsTrigger>
              <TabsTrigger value="month">Bulanan</TabsTrigger>
              <TabsTrigger value="year">Tahunan</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <ReportSummaryCards
            totalRevenue={summaryStats.totalRevenue}
            totalProfit={summaryStats.totalProfit}
            totalCost={summaryStats.totalCost}
            transactionCount={summaryStats.transactionCount}
          />
        </div>
        
        <div className="mb-6">
          <RecentTransactionsList transactions={transactions} />
        </div>
        
        <div className="mb-6">
          <Card className="col-span-full">
            <StockStatusChart stockItems={stockItems} />
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <BestSellingProductsChart products={bestSellingProducts} isLoading={loading} />
          
          <div className="col-span-full">
            <SalesTrendChart 
              salesTrend={salesTrend}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
