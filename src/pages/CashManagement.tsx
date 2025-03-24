
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCashSummary } from '@/utils/supabase';
import { subDays, format, addDays } from 'date-fns';
import { CashSummary } from '@/utils/types';
import { formatCurrency } from '@/utils/constants';
import { DateRange } from 'react-day-picker';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Download } from 'lucide-react';
import CashFlowChart from '@/components/cash/CashFlowChart';
import { useIsMobile } from '@/hooks/use-mobile';

const CashManagement = () => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const isMobile = useIsMobile();

  // Total values
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);

  // Fetch cash summary data
  const { data: cashData = [], isLoading } = useQuery({
    queryKey: ['cashSummary', timeframe, date],
    queryFn: async () => {
      if (!date?.from || !date?.to) return [];
      return fetchCashSummary(
        timeframe, 
        date.from.toISOString(), 
        date.to.toISOString()
      );
    },
    enabled: !!date?.from && !!date?.to
  });

  // Filter data based on search term
  const filteredData = cashData.filter(item => 
    item.period.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  useEffect(() => {
    if (cashData.length > 0) {
      setTotalIncome(cashData.reduce((sum, item) => sum + item.income, 0));
      setTotalExpense(cashData.reduce((sum, item) => sum + item.expense, 0));
      setTotalBalance(cashData.reduce((sum, item) => sum + item.balance, 0));
    } else {
      setTotalIncome(0);
      setTotalExpense(0);
      setTotalBalance(0);
    }
  }, [cashData]);

  // Export to CSV
  const exportToCSV = () => {
    if (cashData.length === 0) return;

    const headers = ['Periode', 'Pendapatan', 'Pengeluaran', 'Saldo'];
    const csvContent = [
      headers.join(','),
      ...cashData.map(item => [
        item.period,
        item.income,
        item.expense,
        item.balance
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `KasKu_${timeframe}_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTimeframeTitle = () => {
    switch(timeframe) {
      case 'day': return 'Harian';
      case 'week': return 'Mingguan';
      case 'month': return 'Bulanan';
      case 'year': return 'Tahunan';
      default: return 'Bulanan';
    }
  };

  return (
    <Layout>
      <Header 
        title="KasKu" 
        description="Manajemen kas dan aliran dana"
      />

      <div className="container px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <h2 className="text-xl font-semibold">Periode</h2>
            <div className="w-full md:max-w-sm">
              <DateRangePicker 
                value={date} 
                onChange={setDate} 
              />
            </div>
          </div>
          
          <Tabs 
            value={timeframe} 
            onValueChange={(v) => setTimeframe(v as any)}
            className="w-full md:w-fit"
          >
            <TabsList className="grid w-full md:w-fit grid-cols-4">
              <TabsTrigger value="day">Harian</TabsTrigger>
              <TabsTrigger value="week">Mingguan</TabsTrigger>
              <TabsTrigger value="month">Bulanan</TabsTrigger>
              <TabsTrigger value="year">Tahunan</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Pendapatan</CardDescription>
              <CardTitle className="text-green-600">{formatCurrency(totalIncome)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Pengeluaran</CardDescription>
              <CardTitle className="text-red-600">{formatCurrency(totalExpense)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Sisa Kas</CardDescription>
              <CardTitle className={totalBalance >= 0 ? "text-blue-600" : "text-red-600"}>
                {formatCurrency(totalBalance)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="mb-6">
          <Card className="col-span-full lg:col-span-12 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Grafik Aliran Kas</CardTitle>
                <CardDescription>
                  {getTimeframeTitle()}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportToCSV} disabled={cashData.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-80">
                <CashFlowChart data={cashData} isLoading={isLoading} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tabel Kas {getTimeframeTitle()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Cari berdasarkan periode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Periode</TableHead>
                      <TableHead className="text-right">Pendapatan</TableHead>
                      <TableHead className="text-right">Pengeluaran</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6">
                          Memuat data...
                        </TableCell>
                      </TableRow>
                    ) : filteredData.length > 0 ? (
                      filteredData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.period}</TableCell>
                          <TableCell className="text-right text-green-600">
                            {formatCurrency(item.income)}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {formatCurrency(item.expense)}
                          </TableCell>
                          <TableCell 
                            className={`text-right font-medium ${
                              item.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                            }`}
                          >
                            {formatCurrency(item.balance)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6">
                          {searchTerm ? 'Tidak ada data yang ditemukan' : 'Belum ada data kas'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CashManagement;
