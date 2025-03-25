import React, { useState, useEffect } from 'react';
import { format, subDays, startOfMonth, startOfWeek, startOfYear, subMonths, subYears } from 'date-fns';
import { 
  CalendarIcon, 
  ArrowRightIcon, 
  LineChartIcon, 
  BarChartIcon,
  PieChartIcon,
  SearchIcon,
  FilterIcon,
  ArrowUpDown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExpenseCategory } from '@/utils/types';
import { formatCurrency } from '@/utils/constants';

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
  
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  // Handle predefined date ranges
  const handleSetDateRange = (type: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setReportType(type);
    
    const today = new Date();
    let fromDate;
    
    switch (type) {
      case 'weekly':
        fromDate = startOfWeek(today);
        break;
      case 'monthly':
        fromDate = startOfMonth(today);
        break;
      case 'yearly':
        fromDate = startOfYear(today);
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
      
      // Group expenses by category
      const expensesByCategory: Record<string, { category: string, amount: number, count: number }> = {};
      
      expensesData.forEach((expense: any) => {
        if (!expensesByCategory[expense.category]) {
          expensesByCategory[expense.category] = {
            category: expense.category,
            amount: 0,
            count: 0
          };
        }
        
        expensesByCategory[expense.category].amount += expense.amount || 0;
        expensesByCategory[expense.category].count += 1;
      });
      
      const categorizedExpenses = Object.values(expensesByCategory);
      
      return {
        salesData,
        expensesData,
        categorizedExpenses,
        bestSellingProducts,
        totalSales: salesData.reduce((sum: number, item: any) => sum + (item.total_price || 0), 0),
        totalExpenses: expensesData.reduce((sum: number, item: any) => sum + (item.amount || 0), 0),
        totalQuantity: salesData.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
      };
    }
  });

  // Handle DateRange selection and ensure 'to' is set
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from) {
      setDateRange({
        from: range.from,
        to: range.to || range.from // If 'to' is undefined, set it to the same as 'from'
      });
    }
  };

  // Filter and sort expenses by category
  const getFilteredExpenses = () => {
    if (!data?.categorizedExpenses) return [];
    
    const filtered = data.categorizedExpenses.filter((expense: any) => 
      expense.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (sortConfig !== null) {
      filtered.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  };

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  // Calculate total expenses
  const totalExpenses = getFilteredExpenses().reduce((sum, expense: any) => sum + expense.amount, 0);

  return (
    <Layout>
      <Header
        title="Laporan"
        description="Lihat laporan penjualan dan keuangan"
      />
      
      <div className="container px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Tabs defaultValue={reportType} className="w-full sm:w-auto">
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
              <TabsTrigger 
                value="yearly" 
                onClick={() => handleSetDateRange('yearly')}
              >
                Tahunan
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
            
            {/* Enhanced Expense Summary Table with filtering and sorting */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex justify-between items-center">
                  <span>Rekap Pengeluaran Berdasarkan Kategori</span>
                  <div className="flex gap-2 items-center">
                    <div className="relative">
                      <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari kategori..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 h-8 w-[200px]"
                      />
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => requestSort('category')}
                      >
                        <div className="flex items-center gap-1">
                          Kategori
                          <ArrowUpDown size={14} />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-right cursor-pointer hover:bg-accent"
                        onClick={() => requestSort('count')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          Jumlah Transaksi
                          <ArrowUpDown size={14} />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-right cursor-pointer hover:bg-accent"
                        onClick={() => requestSort('amount')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          Total Pengeluaran
                          <ArrowUpDown size={14} />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!isLoading && getFilteredExpenses().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                          Tidak ada data pengeluaran pada periode ini
                        </TableCell>
                      </TableRow>
                    ) : isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="h-4 w-16 bg-muted animate-pulse rounded ml-auto" />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="h-4 w-24 bg-muted animate-pulse rounded ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      getFilteredExpenses().map((expense: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{expense.category}</TableCell>
                          <TableCell className="text-right">{expense.count}</TableCell>
                          <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                        </TableRow>
                      ))
                    )}
                    
                    {/* Grand Total Row */}
                    {!isLoading && getFilteredExpenses().length > 0 && (
                      <TableRow className="border-t-2">
                        <TableCell className="font-bold">Grand Total</TableCell>
                        <TableCell className="text-right font-bold">
                          {getFilteredExpenses().reduce((sum, expense: any) => sum + expense.count, 0)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(totalExpenses)}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* Keep the original expense summary table */}
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
