
import React, { useState, useEffect } from 'react';
import { format, subMonths, startOfMonth, startOfWeek, startOfYear, setMonth, getYear, setYear } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  CalendarIcon, 
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
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExpenseCategory } from '@/utils/types';
import { formatCurrency } from '@/utils/constants';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';

// Report components
import ReportSummaryCards from '@/components/reports/ReportSummaryCards';
import BestSellingProductsChart from '@/components/reports/BestSellingProductsChart';
import RecentTransactionsList from '@/components/reports/RecentTransactionsList';
import ExpenseSummaryTable from '@/components/reports/ExpenseSummaryTable';

// Data helpers
import { fetchSalesReportData, fetchExpensesByDateRange, getTransactionCount } from '@/utils/supabase';
import { PIZZA_FLAVORS } from '@/utils/constants';

// Indonesian month names
const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Generate years for the selector (last 5 years)
const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

const Reports = () => {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  
  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  // Handle predefined date ranges
  const handleSetDateRange = (type: 'weekly' | 'monthly' | 'yearly') => {
    setReportType(type);
    
    const today = new Date();
    let fromDate;
    
    switch (type) {
      case 'weekly':
        fromDate = startOfWeek(today);
        break;
      case 'yearly':
        fromDate = startOfYear(setYear(today, parseInt(selectedYear)));
        break;
      case 'monthly':
      default:
        // Set to first day of selected month
        const monthDate = new Date();
        monthDate.setMonth(parseInt(selectedMonth));
        monthDate.setFullYear(parseInt(selectedYear));
        fromDate = startOfMonth(monthDate);
        break;
    }
    
    setDateRange({
      from: fromDate,
      to: today
    });
  };

  // Update date range when month or year changes
  useEffect(() => {
    if (reportType === 'monthly') {
      const monthDate = new Date();
      monthDate.setMonth(parseInt(selectedMonth));
      monthDate.setFullYear(parseInt(selectedYear));
      const fromDate = startOfMonth(monthDate);
      
      setDateRange({
        from: fromDate,
        to: new Date()
      });
    } else if (reportType === 'yearly') {
      const yearDate = new Date();
      yearDate.setFullYear(parseInt(selectedYear));
      const fromDate = startOfYear(yearDate);
      
      setDateRange({
        from: fromDate,
        to: new Date()
      });
    }
  }, [selectedMonth, selectedYear, reportType]);

  // Fetch report data
  const { data, isLoading } = useQuery({
    queryKey: ['reportData', dateRange.from, dateRange.to],
    queryFn: async () => {
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');
      
      const [salesData, expensesData, transactionCount] = await Promise.all([
        fetchSalesReportData(startDate, endDate),
        fetchExpensesByDateRange(startDate, endDate),
        getTransactionCount() // Get unique transaction count
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
        transactionCount: transactionCount, // Use the actual transaction count
      };
    }
  });

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

  useEffect(() => {
    // Set initial date range when component mounts
    handleSetDateRange('monthly');
  }, []);

  return (
    <Layout>
      <Header
        title="Laporan"
        description="Lihat laporan penjualan dan keuangan"
      />
      
      <div className="container px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Tabs defaultValue={reportType} className="w-full">
            <TabsList>
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
            
            <div className="flex mt-4 gap-2">
              {reportType === 'monthly' && (
                <>
                  <Select 
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Pilih Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDONESIAN_MONTHS.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={selectedYear}
                    onValueChange={setSelectedYear}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Pilih Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
              
              {reportType === 'yearly' && (
                <Select 
                  value={selectedYear}
                  onValueChange={setSelectedYear}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </Tabs>
        </div>
        
        <div className="grid gap-6">
          <ReportSummaryCards 
            totalRevenue={data?.totalSales || 0}
            totalCost={data?.totalExpenses || 0}
            totalProfit={(data?.totalSales || 0) - (data?.totalExpenses || 0)}
            transactionCount={data?.transactionCount || 0}
            isLoading={isLoading}
          />
          
          <div className="grid grid-cols-1 gap-6">
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
