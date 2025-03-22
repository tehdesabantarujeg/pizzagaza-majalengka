
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchSalesReportData } from '@/utils/supabase';
import { formatCurrency } from '@/utils/constants';
import { 
  Bar, BarChart, CartesianGrid, Legend, 
  Line, LineChart, Pie, PieChart, Cell, 
  ResponsiveContainer, Tooltip, XAxis, YAxis 
} from 'recharts';
import RecentTransactionsList from '@/components/reports/RecentTransactionsList';
import { fetchTransactions } from '@/utils/supabase';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const startDate = dateRange.from?.toISOString() || '';
  const endDate = dateRange.to?.toISOString() || '';
  
  // Fetch recent transactions for the transactions list
  const transactionsQuery = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions
  });
  
  // Fetch report data based on date range
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reportData', startDate, endDate],
    queryFn: () => fetchSalesReportData(startDate, endDate)
  });
  
  // Calculate basic metrics
  const totalSales = reportData?.reduce((sum, item) => sum + item.total_price, 0) || 0;
  const totalItems = reportData?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  // Group by date for trend chart
  const getTrendChartData = () => {
    if (!reportData) return [];
    
    const dataByDate = reportData.reduce((acc, item) => {
      const date = new Date(item.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, sales: 0, profit: 0, items: 0 };
      }
      acc[date].sales += item.total_price;
      // Estimating profit as 30% of sales for visualization
      acc[date].profit += Math.round(item.total_price * 0.3);
      acc[date].items += item.quantity;
      return acc;
    }, {});
    
    return Object.values(dataByDate);
  };
  
  // Group by flavor for product distribution chart
  const getProductDistributionData = () => {
    if (!reportData) return [];
    
    const dataByFlavor = reportData.reduce((acc, item) => {
      const flavor = item.flavor;
      if (!acc[flavor]) {
        acc[flavor] = { name: flavor, value: 0 };
      }
      acc[flavor].value += item.quantity;
      return acc;
    }, {});
    
    return Object.values(dataByFlavor);
  };
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B', '#54A0FF', '#5ED5A8'];
  
  return (
    <Layout>
      <Header 
        title="Laporan"
        description="Visualisasi tren penjualan dan performa bisnis"
      />
      
      <div className="container px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* Recent Transactions List */}
          {!transactionsQuery.isLoading && (
            <RecentTransactionsList transactions={transactionsQuery.data || []} />
          )}
          
          {/* Report Controls */}
          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sales">Penjualan</TabsTrigger>
                <TabsTrigger value="profit">Keuntungan</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <DateRangePicker 
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Penjualan
                </CardTitle>
                <ChevronUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    formatCurrency(totalSales)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {startDate && endDate ? (
                    `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                  ) : 'Seluruh periode'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Jumlah Item Terjual
                </CardTitle>
                <ChevronUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    totalItems
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pizza
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Keuntungan (Estimasi)
                </CardTitle>
                <ChevronUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    formatCurrency(Math.round(totalSales * 0.3))
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  30% dari total penjualan
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Sales & Profit Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Tren {activeTab === 'sales' ? 'Penjualan' : 'Keuntungan'}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-80">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={getTrendChartData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey={activeTab === 'sales' ? 'sales' : 'profit'} 
                      name={activeTab === 'sales' ? 'Penjualan' : 'Keuntungan'}
                      stroke={activeTab === 'sales' ? "#8884d8" : "#82ca9d"} 
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          {/* Product Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Produk</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-80">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={getProductDistributionData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getProductDistributionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} item`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
