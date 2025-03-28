
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
import { fetchSalesReportData, fetchExpensesByDateRange, fetchTransactions } from '@/utils/supabase';
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

  // Fetch transactions to get accurate counts
  const { data: allTransactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['allTransactions'],
    queryFn: fetchTransactions
  });

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
      
      // Calculate total products sold
      let totalProductsQty = 0;
      
      salesData.forEach((sale: any) => {
        const index = productSales.findIndex(p => p.name === sale.flavor);
        if (index !== -1) {
          productSales[index].quantity += sale.quantity || 0;
          productSales[index].revenue += sale.total_price || 0;
          totalProductsQty += sale.quantity || 0;
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
      
      // Get unique transaction numbers
      const uniqueTransactionNumbers = new Set();
      salesData.forEach((sale: any) => {
        if (sale.transaction_number) {
          uniqueTransactionNumbers.add(sale.transaction_number);
        }
      });
      
      return {
        salesData,
        expensesData,
        categorizedExpenses,
        bestSellingProducts,
        totalSales: salesData.reduce((sum: number, item: any) => sum + (item.total_price || 0), 0),
        totalExpenses: expensesData.reduce((sum: number, item: any) => sum + (item.amount || 0), 0),
        transactionCount: uniqueTransactionNumbers.size,
        totalProductsSold: totalProductsQty
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
            transactionCount={data?.transactionCount || 0}
            totalProductsSold={data?.totalProductsSold || 0}
            isLoading={isLoading}
          />
          
          <div className="grid grid-cols-1 gap-6">
            <BestSellingProductsChart 
              products={data?.bestSellingProducts || []}
              isLoading={isLoading}
            />
            
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
