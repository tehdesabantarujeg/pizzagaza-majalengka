
import React, { useState } from 'react';
import { format, subDays, startOfMonth } from 'date-fns';
import { 
  CalendarIcon, 
  ArrowRightIcon, 
  LineChartIcon, 
  BarChartIcon,
  PieChartIcon
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

// Report components
import ReportSummaryCards from '@/components/reports/ReportSummaryCards';
import RevenueVsExpensesChart from '@/components/reports/RevenueVsExpensesChart';
import BestSellingProductsChart from '@/components/reports/BestSellingProductsChart';
import RecentTransactionsList from '@/components/reports/RecentTransactionsList';
import ExpenseSummaryTable from '@/components/reports/ExpenseSummaryTable';

// Data helpers
import { fetchSalesReportData, fetchExpensesByDateRange } from '@/utils/supabase';
import { PIZZA_FLAVORS } from '@/utils/constants';

const Reports = () => {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Fetch report data
  const { data, isLoading } = useQuery({
    queryKey: ['reportData', dateRange.from, dateRange.to],
    queryFn: async () => {
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');
      
      const [salesData, expensesData] = await Promise.all([
        fetchSalesReportData(startDate, endDate),
        fetchExpensesByDateRange(startDate, endDate)
      ]);
      
      // Process sales data for best selling products
      const productSales = PIZZA_FLAVORS.map(flavor => ({
        name: flavor,
        quantity: 0,
        revenue: 0
      }));
      
      salesData.forEach((sale: any) => {
        const index = productSales.findIndex(p => p.name === sale.flavor);
        if (index !== -1) {
          productSales[index].quantity += sale.quantity || 0;
          productSales[index].revenue += sale.total_price || 0;
        }
      });
      
      const bestSellingProducts = [...productSales]
        .filter(p => p.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      return {
        salesData,
        expensesData,
        bestSellingProducts,
        totalSales: salesData.reduce((sum: number, item: any) => sum + (item.total_price || 0), 0),
        totalExpenses: expensesData.reduce((sum: number, item: any) => sum + (item.amount || 0), 0),
        totalQuantity: salesData.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
      };
    }
  });

  const handleSetDateRange = (type: 'daily' | 'weekly' | 'monthly') => {
    setReportType(type);
    
    const today = new Date();
    let fromDate;
    
    switch (type) {
      case 'weekly':
        fromDate = subDays(today, 7);
        break;
      case 'monthly':
        fromDate = startOfMonth(today);
        break;
      case 'daily':
      default:
        fromDate = subDays(today, 1);
        break;
    }
    
    setDateRange({
      from: fromDate,
      to: today
    });
  };

  // Handle DateRange selection and ensure 'to' is set
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from) {
      setDateRange({
        from: range.from,
        to: range.to || range.from // If 'to' is undefined, set it to the same as 'from'
      });
    }
  };

  return (
    <Layout>
      <Header
        title="Laporan"
        description="Lihat laporan penjualan dan keuangan"
      />
      
      <div className="container px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Tabs defaultValue="daily" className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger 
                value="daily" 
                onClick={() => handleSetDateRange('daily')}
              >
                Harian
              </TabsTrigger>
              <TabsTrigger 
                value="weekly" 
                onClick={() => handleSetDateRange('weekly')}
              >
                Mingguan
              </TabsTrigger>
              <TabsTrigger 
                value="monthly" 
                onClick={() => handleSetDateRange('monthly')}
              >
                Bulanan
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal w-[240px]"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd MMM yyyy")} -{" "}
                        {format(dateRange.to, "dd MMM yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "dd MMM yyyy")
                    )
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to
                  }}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="grid gap-6">
          <ReportSummaryCards 
            totalRevenue={data?.totalSales || 0}
            totalCost={data?.totalExpenses || 0}
            totalProfit={(data?.totalSales || 0) - (data?.totalExpenses || 0)}
            transactionCount={data?.totalQuantity || 0}
            isLoading={isLoading}
          />
          
          <div className="grid grid-cols-1 gap-6">
            <RevenueVsExpensesChart 
              data={
                data ? [
                  {
                    period: format(dateRange.from, "dd MMM yyyy") + 
                            (dateRange.from.toDateString() !== dateRange.to.toDateString() 
                              ? " - " + format(dateRange.to, "dd MMM yyyy") 
                              : ""),
                    revenue: data.totalSales || 0,
                    expenses: data.totalExpenses || 0,
                    profit: (data.totalSales || 0) - (data.totalExpenses || 0)
                  }
                ] : []
              }
              isLoading={isLoading}
            />
            
            <BestSellingProductsChart 
              products={data?.bestSellingProducts || []}
              isLoading={isLoading}
            />
            
            {/* Add Expense Summary Table */}
            <ExpenseSummaryTable 
              expenses={data?.expensesData || []}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
