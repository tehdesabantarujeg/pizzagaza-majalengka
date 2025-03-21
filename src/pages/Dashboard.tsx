
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/utils/constants';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@/components/ui/chart';
import { fetchDashboardData } from '@/utils/supabase';
import { format, subDays, subMonths, subYears, isSameDay, isWithinInterval, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { id } from 'date-fns/locale';
import { FadeIn, FadeInStagger } from '@/components/animations/FadeIn';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingBag, Box, TrendingUp, Users, Calendar, ArrowUpRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [summarySales, setSummarySales] = useState({
    total: 0,
    today: 0,
    week: 0,
    month: 0,
    year: 0,
    transactions: 0,
    customers: 0,
    averageOrder: 0
  });
  
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
        
        // Process data for different visualizations
        processData(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);
  
  useEffect(() => {
    if (dashboardData) {
      updateSalesTrend(dashboardData.transactions);
    }
  }, [timeframe, dashboardData]);

  const processData = (data: any) => {
    if (!data) return;
    
    const { transactions, stockItems, customers } = data;
    
    // Summary calculations
    const today = new Date();
    const todaySales = transactions
      .filter((t: any) => isSameDay(new Date(t.date), today))
      .reduce((sum: number, t: any) => sum + t.total_price, 0);
      
    const weekSales = transactions
      .filter((t: any) => {
        const txDate = new Date(t.date);
        return isWithinInterval(txDate, {
          start: startOfWeek(today, { locale: id }),
          end: endOfWeek(today, { locale: id })
        });
      })
      .reduce((sum: number, t: any) => sum + t.total_price, 0);
      
    const monthSales = transactions
      .filter((t: any) => {
        const txDate = new Date(t.date);
        return isWithinInterval(txDate, {
          start: startOfMonth(today),
          end: endOfMonth(today)
        });
      })
      .reduce((sum: number, t: any) => sum + t.total_price, 0);

    const yearSales = transactions
      .filter((t: any) => {
        const txDate = new Date(t.date);
        return isWithinInterval(txDate, {
          start: startOfYear(today),
          end: endOfYear(today)
        });
      })
      .reduce((sum: number, t: any) => sum + t.total_price, 0);
      
    const totalSales = transactions.reduce((sum: number, t: any) => sum + t.total_price, 0);
    const averageOrder = transactions.length > 0 ? totalSales / transactions.length : 0;
      
    setSummarySales({
      total: totalSales,
      today: todaySales,
      week: weekSales,
      month: monthSales,
      year: yearSales,
      transactions: transactions.length,
      customers: customers.length,
      averageOrder
    });
    
    // Update sales trend initially
    updateSalesTrend(transactions);
    
    // Process top products
    const productSales: {[key: string]: {quantity: number, revenue: number}} = {};
    
    transactions.forEach((t: any) => {
      const key = `${t.flavor} ${t.size} ${t.state}`;
      if (!productSales[key]) {
        productSales[key] = { quantity: 0, revenue: 0 };
      }
      productSales[key].quantity += t.quantity;
      productSales[key].revenue += t.total_price;
    });
    
    const sortedProducts = Object.entries(productSales)
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5 products
      
    setTopProducts(sortedProducts);
  };

  // Update sales trend based on selected timeframe
  const updateSalesTrend = (transactions: any[]) => {
    if (!transactions || transactions.length === 0) {
      setSalesTrend([]);
      return;
    }

    const today = new Date();
    const dateFormat = {
      day: 'HH:mm',
      week: 'dd MMM',
      month: 'dd MMM',
      year: 'MMM'
    }[timeframe];
    
    let interval: {
      start: Date;
      end: Date;
      groupBy: (date: Date) => string;
      periods: number;
    };

    // Configure intervals based on timeframe
    switch(timeframe) {
      case 'day':
        interval = {
          start: startOfDay(today),
          end: endOfDay(today),
          groupBy: (date) => format(date, 'HH:mm', { locale: id }),
          periods: 24 // hours in a day
        };
        break;
      case 'week':
        interval = {
          start: startOfWeek(today, { locale: id }),
          end: endOfWeek(today, { locale: id }),
          groupBy: (date) => format(date, 'EEE', { locale: id }),
          periods: 7 // days in a week
        };
        break;
      case 'month':
        interval = {
          start: startOfMonth(today),
          end: endOfMonth(today),
          groupBy: (date) => format(date, 'dd', { locale: id }),
          periods: 31 // max days in a month
        };
        break;
      case 'year':
        interval = {
          start: startOfYear(today),
          end: endOfYear(today),
          groupBy: (date) => format(date, 'MMM', { locale: id }),
          periods: 12 // months in a year
        };
        break;
      default:
        interval = {
          start: subDays(today, 7),
          end: today,
          groupBy: (date) => format(date, 'dd MMM', { locale: id }),
          periods: 7
        };
    }

    // Filter transactions within the selected interval
    const filteredTransactions = transactions.filter((t: any) => {
      const txDate = new Date(t.date);
      return isWithinInterval(txDate, {
        start: interval.start,
        end: interval.end
      });
    });

    // Group transactions by period
    const groupedSales: {[key: string]: number} = {};
    
    // Initialize all periods
    if (timeframe === 'day') {
      // For day, initialize hours
      for (let i = 0; i < 24; i++) {
        const hour = i < 10 ? `0${i}` : `${i}`;
        groupedSales[`${hour}:00`] = 0;
      }
    } else if (timeframe === 'week') {
      // For week, initialize days
      const daysOfWeek = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
      daysOfWeek.forEach(day => {
        groupedSales[day] = 0;
      });
    } else if (timeframe === 'month') {
      // For month, initialize days
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        groupedSales[i < 10 ? `0${i}` : `${i}`] = 0;
      }
    } else if (timeframe === 'year') {
      // For year, initialize months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      months.forEach(month => {
        groupedSales[month] = 0;
      });
    }

    // Sum sales for each period
    filteredTransactions.forEach((t: any) => {
      const txDate = new Date(t.date);
      const periodKey = interval.groupBy(txDate);
      groupedSales[periodKey] = (groupedSales[periodKey] || 0) + t.total_price;
    });

    // Convert to array for chart
    const trendData = Object.entries(groupedSales)
      .map(([period, amount]) => ({
        period,
        amount
      }));

    // Sort data based on timeframe
    if (timeframe === 'week') {
      const dayOrder = {'Sen': 0, 'Sel': 1, 'Rab': 2, 'Kam': 3, 'Jum': 4, 'Sab': 5, 'Min': 6};
      trendData.sort((a, b) => dayOrder[a.period as keyof typeof dayOrder] - dayOrder[b.period as keyof typeof dayOrder]);
    } else if (timeframe === 'year') {
      const monthOrder = {'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5, 'Jul': 6, 'Agu': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11};
      trendData.sort((a, b) => monthOrder[a.period as keyof typeof monthOrder] - monthOrder[b.period as keyof typeof monthOrder]);
    } else {
      // For day and month, sort numerically
      trendData.sort((a, b) => {
        if (timeframe === 'day') {
          return a.period.localeCompare(b.period);
        } else {
          return parseInt(a.period) - parseInt(b.period);
        }
      });
    }
      
    setSalesTrend(trendData);
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Recent transactions table (last 5)
  const recentTransactions = dashboardData?.transactions
    ?.slice(0, 5)
    ?.map((t: any) => ({
      id: t.id,
      date: format(new Date(t.date), 'dd MMM yyyy, HH:mm', { locale: id }),
      product: `${t.flavor} ${t.size} ${t.state}`,
      quantity: t.quantity,
      amount: t.total_price,
      customer: t.customer_name || 'Pelanggan Umum'
    }));

  // Get title based on timeframe
  const getTimeframeTitle = () => {
    switch(timeframe) {
      case 'day': return 'Hari Ini';
      case 'week': return 'Minggu Ini';
      case 'month': return 'Bulan Ini';
      case 'year': return 'Tahun Ini';
      default: return 'Minggu Ini';
    }
  };
  
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
              <FadeIn>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Penjualan
                    </CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(summarySales.total)}</div>
                    <p className="text-xs text-muted-foreground">
                      {summarySales.transactions} transaksi
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
              
              <FadeIn delay={50}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Hari Ini
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(summarySales.today)}</div>
                    <p className="text-xs text-muted-foreground">
                      {summarySales.month > 0 
                        ? `${((summarySales.today / summarySales.month) * 100).toFixed(1)}% dari bulan ini`
                        : "Belum ada penjualan bulan ini"}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
              
              <FadeIn delay={100}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Bulan Ini
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(summarySales.month)}</div>
                    <p className="text-xs text-muted-foreground">
                      {summarySales.year > 0 
                        ? `${((summarySales.month / summarySales.year) * 100).toFixed(1)}% dari tahun ini`
                        : "Belum ada penjualan tahun ini"}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
              
              <FadeIn delay={150}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Rata-rata Transaksi
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(summarySales.averageOrder)}</div>
                    <p className="text-xs text-muted-foreground">
                      Per transaksi
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
            </FadeInStagger>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
              <FadeIn className="col-span-full lg:col-span-4">
                <Card className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Tren Penjualan</CardTitle>
                      <CardDescription>
                        {getTimeframeTitle()}
                      </CardDescription>
                    </div>
                    <Tabs 
                      value={timeframe} 
                      onValueChange={setTimeframe}
                      className="w-fit"
                    >
                      <TabsList className="grid w-fit grid-cols-4">
                        <TabsTrigger value="day">Hari</TabsTrigger>
                        <TabsTrigger value="week">Minggu</TabsTrigger>
                        <TabsTrigger value="month">Bulan</TabsTrigger>
                        <TabsTrigger value="year">Tahun</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-80">
                      {salesTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={salesTrend}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 30,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="period" />
                            <YAxis tickFormatter={(value) => `Rp${value/1000}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                              type="monotone"
                              dataKey="amount"
                              name="Penjualan"
                              stroke="#0088FE"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          Belum ada data penjualan
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
              
              <FadeIn delay={50} className="col-span-full lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Produk Terlaris</CardTitle>
                    <CardDescription>
                      Berdasarkan pendapatan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      {topProducts.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={topProducts}
                            layout="vertical"
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis type="number" tickFormatter={(value) => `Rp${value/1000}k`} />
                            <YAxis 
                              type="category" 
                              dataKey="name" 
                              width={120}
                              tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                            />
                            <Tooltip />
                            <Bar dataKey="revenue" name="Pendapatan" fill="#0088FE" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          Belum ada data penjualan
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
            
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <FadeIn delay={100}>
                <Card>
                  <CardHeader>
                    <CardTitle>Transaksi Terbaru</CardTitle>
                    <CardDescription>
                      5 transaksi terakhir
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentTransactions && recentTransactions.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Produk</TableHead>
                            <TableHead className="text-right">Jumlah</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentTransactions.map((tx: any) => (
                            <TableRow key={tx.id}>
                              <TableCell className="font-medium">{tx.date}</TableCell>
                              <TableCell>{tx.product}</TableCell>
                              <TableCell className="text-right">{tx.quantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(tx.amount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        Belum ada transaksi
                      </div>
                    )}
                  </CardContent>
                </Card>
              </FadeIn>
              
              <FadeIn delay={150}>
                <Card>
                  <CardHeader>
                    <CardTitle>Status Stok</CardTitle>
                    <CardDescription>
                      Distribusi stok saat ini
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {dashboardData?.stockItems && dashboardData.stockItems.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={dashboardData.stockItems
                                .reduce((acc: any[], item: any) => {
                                  const existing = acc.find(x => x.name === item.flavor);
                                  if (existing) {
                                    existing.value += item.quantity;
                                  } else {
                                    acc.push({ name: item.flavor, value: item.quantity });
                                  }
                                  return acc;
                                }, [])
                                .sort((a: any, b: any) => b.value - a.value)
                              }
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {dashboardData.stockItems.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          Belum ada data stok
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
