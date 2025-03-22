
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
  
  // Summary statistics
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
        
        // Fetch all data needed
        const [salesData, transactionsData, stockData] = await Promise.all([
          fetchSalesReportData(fromDate, toDate),
          fetchTransactions(),
          fetchStockSummary()
        ]);
        
        setReportData(salesData);
        setTransactions(transactionsData);
        setStockItems(stockData);
        
        // Process data
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

    // Group by date and sum total_price
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

    // Group by product and sum quantities and revenue
    const groupedByProduct: {[key: string]: {quantity: number, revenue: number}} = {};
    
    data.forEach(sale => {
      const productKey = `${sale.flavor} ${sale.size} ${sale.state}`;
      
      if (!groupedByProduct[productKey]) {
        groupedByProduct[productKey] = { quantity: 0, revenue: 0 };
      }
      
      groupedByProduct[productKey].quantity += sale.quantity || 0;
      groupedByProduct[productKey].revenue += sale.total_price || 0;
    });
    
    // Convert to array and sort by revenue
    const productData = Object.entries(groupedByProduct)
      .map(([name, { quantity, revenue }]) => ({
        name,
        quantity,
        revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5 products
    
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

    // Calculate totals
    const totalRevenue = data.reduce((sum, sale) => sum + (sale.total_price || 0), 0);
    
    // Estimate costs and profit (this is an approximation)
    // In a real app, you'd get the actual cost from the cost_price in your data
    const estimatedCostRatio = 0.6; // 60% of revenue goes to costs (adjust as needed)
    const totalCost = Math.round(totalRevenue * estimatedCostRatio);
    const totalProfit = totalRevenue - totalCost;
    
    // Count unique transactions
    const uniqueTransactionIds = new Set(data.map(sale => sale.id));
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
        {/* Time Period Selector */}
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
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <ReportSummaryCards
            totalRevenue={summaryStats.totalRevenue}
            totalProfit={summaryStats.totalProfit}
            totalCost={summaryStats.totalCost}
            transactionCount={summaryStats.transactionCount}
          />
        </div>
        
        {/* Recent Transactions List */}
        <div className="mb-6">
          <RecentTransactionsList transactions={transactions} />
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Best Selling Products Chart */}
          <BestSellingProductsChart products={bestSellingProducts} isLoading={loading} />
          
          {/* Stock Status Chart */}
          <Card className="col-span-full lg:col-span-6">
            <StockStatusChart stockItems={stockItems} />
          </Card>
          
          {/* Sales Trend Chart */}
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
