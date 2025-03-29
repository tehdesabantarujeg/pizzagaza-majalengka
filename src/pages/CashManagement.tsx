
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCashSummary } from '@/utils/supabase';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/utils/constants';
import CashFlowChart from '@/components/cash/CashFlowChart';
import { ArrowUpCircle, ArrowDownCircle, DollarSign } from 'lucide-react';
import { CashSummary } from '@/utils/types';

interface CashSummaryData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  transactions: any[];
  expenses: any[];
}

const CashManagement = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [dateRange, setDateRange] = useState<{start: Date; end: Date}>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  });

  // Fetch cash summary data
  const { data: cashSummary, isLoading } = useQuery<CashSummaryData>({
    queryKey: ['cashSummary'],
    queryFn: fetchCashSummary
  });

  // Get current month and year
  const currentMonth = format(new Date(), 'MMMM yyyy');

  // Prepare data for the chart
  const chartData = React.useMemo(() => {
    if (!cashSummary) return [];

    // Get a list of all dates in the current month
    const dates = [];
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(new Date(year, month, i));
    }

    // Group transactions and expenses by date
    const transactionsByDate = cashSummary.transactions.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), 'yyyy-MM-dd');
      if (!acc[date]) acc[date] = 0;
      acc[date] += Number(transaction.total_price);
      return acc;
    }, {} as Record<string, number>);

    const expensesByDate = cashSummary.expenses.reduce((acc, expense) => {
      const date = format(new Date(expense.date), 'yyyy-MM-dd');
      if (!acc[date]) acc[date] = 0;
      acc[date] += Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    // Create chart data with correct CashSummary type properties
    return dates.map(date => {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const displayDate = format(date, 'dd MMM');
      const income = transactionsByDate[formattedDate] || 0;
      const expense = expensesByDate[formattedDate] || 0;
      
      return {
        period: displayDate,
        income: income,
        expense: expense,
        balance: income - expense,
      } as CashSummary;
    });
  }, [cashSummary]);

  if (isLoading) {
    return (
      <Layout>
        <Header 
          title="Manajemen Kas" 
          description="Ringkasan keuangan dan laporan arus kas"
        />
        <div className="container py-6">
          <div className="text-center py-10">
            <p>Memuat data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header 
        title="Manajemen Kas" 
        description="Ringkasan keuangan dan laporan arus kas"
      />
      
      <div className="container px-4 py-6">
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Pemasukan</h3>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(cashSummary?.totalIncome || 0)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{currentMonth}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full dark:bg-green-900/20">
                  <ArrowUpCircle className="h-8 w-8 text-green-500 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Pengeluaran</h3>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(cashSummary?.totalExpenses || 0)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{currentMonth}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-full dark:bg-red-900/20">
                  <ArrowDownCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Laba Bersih</h3>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(cashSummary?.netProfit || 0)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{currentMonth}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full dark:bg-blue-900/20">
                  <DollarSign className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Grafik Arus Kas</CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={chartData} isLoading={isLoading} />
          </CardContent>
        </Card>
        
        <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="transactions">Transaksi ({cashSummary?.transactions.length || 0})</TabsTrigger>
            <TabsTrigger value="expenses">Pengeluaran ({cashSummary?.expenses.length || 0})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Keuangan</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Transaksi bulan ini: {cashSummary?.transactions.length || 0}</p>
                <p>Pengeluaran bulan ini: {cashSummary?.expenses.length || 0}</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Transaksi</CardTitle>
              </CardHeader>
              <CardContent>
                {cashSummary?.transactions.length === 0 ? (
                  <p>Tidak ada transaksi di bulan ini</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Tanggal</th>
                          <th className="text-left py-2">No. Transaksi</th>
                          <th className="text-left py-2">Pelanggan</th>
                          <th className="text-left py-2">Produk</th>
                          <th className="text-right py-2">Jumlah</th>
                          <th className="text-right py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cashSummary?.transactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-2">{format(new Date(transaction.date), 'dd MMM yyyy')}</td>
                            <td className="py-2">{transaction.transaction_number}</td>
                            <td className="py-2">{transaction.customer_name || '-'}</td>
                            <td className="py-2">{transaction.flavor} ({transaction.size})</td>
                            <td className="py-2 text-right">{transaction.quantity}x</td>
                            <td className="py-2 text-right">{formatCurrency(transaction.total_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Pengeluaran</CardTitle>
              </CardHeader>
              <CardContent>
                {cashSummary?.expenses.length === 0 ? (
                  <p>Tidak ada pengeluaran di bulan ini</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Tanggal</th>
                          <th className="text-left py-2">Kategori</th>
                          <th className="text-left py-2">Deskripsi</th>
                          <th className="text-right py-2">Jumlah</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cashSummary?.expenses.map((expense) => (
                          <tr key={expense.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-2">{format(new Date(expense.date), 'dd MMM yyyy')}</td>
                            <td className="py-2">{expense.category}</td>
                            <td className="py-2">{expense.description || '-'}</td>
                            <td className="py-2 text-right">{formatCurrency(expense.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CashManagement;
