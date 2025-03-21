
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/constants';
import { FadeIn } from '@/components/animations/FadeIn';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { fetchSalesReportData, fetchStockSummary } from '@/utils/supabase';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

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

const PieChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="font-medium text-sm">{`${payload[0].name}: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

const Reports = () => {
  const [period, setPeriod] = useState('daily');
  const [salesData, setSalesData] = useState<any[]>([]);
  const [flavorData, setFlavorData] = useState<any[]>([]);
  const [sizeData, setSizeData] = useState<any[]>([]);
  const [stateData, setStateData] = useState<any[]>([]);
  const [stockSummary, setStockSummary] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Set date range based on period
        const endDate = new Date();
        let startDate = new Date();
        
        if (period === 'daily') {
          startDate.setDate(startDate.getDate() - 7); // last 7 days
        } else if (period === 'weekly') {
          startDate.setMonth(startDate.getMonth() - 1); // last month
        } else {
          startDate.setMonth(startDate.getMonth() - 6); // last 6 months
        }
        
        const salesData = await fetchSalesReportData(
          startDate.toISOString(),
          endDate.toISOString()
        );
        
        // Process sales data
        const processedSalesData = processReportData(salesData, period);
        setSalesData(processedSalesData);
        
        // Process distribution data
        const { flavorDistribution, sizeDistribution, stateDistribution } = processDistributionData(salesData);
        setFlavorData(flavorDistribution);
        setSizeData(sizeDistribution);
        setStateData(stateDistribution);
        
        // Fetch stock summary
        const stockData = await fetchStockSummary();
        setStockSummary(processStockSummary(stockData));
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [period]);
  
  // Process report data based on period
  const processReportData = (data: any[], period: string) => {
    if (!data || data.length === 0) return [];
    
    const groupedData: { [key: string]: { sales: number, profit: number } } = {};
    
    data.forEach((item) => {
      let dateKey;
      const itemDate = new Date(item.date);
      
      if (period === 'daily') {
        dateKey = format(itemDate, 'dd MMM', { locale: id });
      } else if (period === 'weekly') {
        dateKey = `Minggu ${format(itemDate, 'w', { locale: id })}`;
      } else {
        dateKey = format(itemDate, 'MMM yyyy', { locale: id });
      }
      
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = { sales: 0, profit: 0 };
      }
      
      groupedData[dateKey].sales += item.total_price;
      // Assume profit is 30% of selling price
      groupedData[dateKey].profit += item.total_price * 0.3;
    });
    
    return Object.entries(groupedData).map(([date, values]) => ({
      date,
      sales: values.sales,
      profit: Math.round(values.profit)
    }));
  };
  
  // Process distribution data
  const processDistributionData = (data: any[]) => {
    if (!data || data.length === 0) {
      return {
        flavorDistribution: [{ name: 'Tidak ada data', value: 100 }],
        sizeDistribution: [{ name: 'Tidak ada data', value: 100 }],
        stateDistribution: [{ name: 'Tidak ada data', value: 100 }]
      };
    }
    
    // Flavor distribution
    const flavorCounts: { [key: string]: number } = {};
    const sizeCounts: { [key: string]: number } = {};
    const stateCounts: { [key: string]: number } = {};
    
    data.forEach((item) => {
      // Count flavors
      if (!flavorCounts[item.flavor]) flavorCounts[item.flavor] = 0;
      flavorCounts[item.flavor] += item.quantity;
      
      // Count sizes
      if (!sizeCounts[item.size]) sizeCounts[item.size] = 0;
      sizeCounts[item.size] += item.quantity;
      
      // Count states (Mentah/Matang)
      if (!stateCounts[item.state]) stateCounts[item.state] = 0;
      stateCounts[item.state] += item.quantity;
    });
    
    // Convert to percentage
    const totalFlavors = Object.values(flavorCounts).reduce((sum, count) => sum + count, 0);
    const totalSizes = Object.values(sizeCounts).reduce((sum, count) => sum + count, 0);
    const totalStates = Object.values(stateCounts).reduce((sum, count) => sum + count, 0);
    
    const flavorDistribution = Object.entries(flavorCounts).map(([name, value]) => ({
      name,
      value: Math.round((value / totalFlavors) * 100)
    }));
    
    const sizeDistribution = Object.entries(sizeCounts).map(([name, value]) => ({
      name,
      value: Math.round((value / totalSizes) * 100)
    }));
    
    const stateDistribution = Object.entries(stateCounts).map(([name, value]) => ({
      name,
      value: Math.round((value / totalStates) * 100)
    }));
    
    return { flavorDistribution, sizeDistribution, stateDistribution };
  };
  
  // Process stock summary
  const processStockSummary = (data: any[]) => {
    if (!data || data.length === 0) return [];
    
    const stockSummary: { [key: string]: { [key: string]: number } } = {};
    
    data.forEach((item) => {
      if (!stockSummary[item.flavor]) {
        stockSummary[item.flavor] = { Small: 0, Medium: 0 };
      }
      
      stockSummary[item.flavor][item.size] += item.quantity;
    });
    
    return stockSummary;
  };
  
  // Calculate summary data
  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const totalProfit = salesData.reduce((sum, item) => sum + item.profit, 0);
  const averageSales = salesData.length > 0 ? totalSales / salesData.length : 0;
  
  return (
    <Layout>
      <Header 
        title="Laporan & Analitik" 
        description="Lihat performa penjualan dan analitik stok"
      />
      
      <div className="container px-4 py-6">
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Penjualan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalSales)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Dari {salesData.length} periode penjualan
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Keuntungan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalProfit)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Margin keuntungan: {totalSales > 0 ? Math.round((totalProfit / totalSales) * 100) : 0}%
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Rata-rata Penjualan Harian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(averageSales)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Berdasarkan {salesData.length} periode
                </p>
              </CardContent>
            </Card>
          </div>
        </FadeIn>
        
        <FadeIn delay={100}>
          <Tabs defaultValue="sales" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="sales">Tren Penjualan</TabsTrigger>
              <TabsTrigger value="distribution">Distribusi Penjualan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales">
              <Card className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Tren Penjualan & Keuntungan</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-medium">Periode:</div>
                      <select 
                        className="text-xs border rounded px-2 py-1"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                      >
                        <option value="daily">Harian</option>
                        <option value="weekly">Mingguan</option>
                        <option value="monthly">Bulanan</option>
                      </select>
                    </div>
                  </div>
                  <CardDescription>
                    Ikhtisar penjualan dan keuntungan dari waktu ke waktu
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-80">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">Memuat data...</div>
                    ) : salesData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={salesData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 30,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="date" />
                          <YAxis 
                            tickFormatter={(value) => `Rp${value/1000}k`}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="sales" name="Penjualan" fill="#0088FE" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="profit" name="Keuntungan" fill="#00C49F" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">Tidak ada data penjualan ditemukan</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="distribution">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>Varian Pizza</CardTitle>
                    <CardDescription>
                      Distribusi berdasarkan rasa
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      {isLoading ? (
                        <div className="h-full flex items-center justify-center">Memuat data...</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={flavorData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                return percent > 0.05 ? (
                                  <text
                                    x={x}
                                    y={y}
                                    fill="white"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="text-xs font-medium"
                                  >
                                    {`${(percent * 100).toFixed(0)}%`}
                                  </text>
                                ) : null;
                              }}
                              outerRadius={80}
                              dataKey="value"
                            >
                              {flavorData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<PieChartTooltip />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>Ukuran Pizza</CardTitle>
                    <CardDescription>
                      Distribusi berdasarkan ukuran
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      {isLoading ? (
                        <div className="h-full flex items-center justify-center">Memuat data...</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={sizeData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                return (
                                  <text
                                    x={x}
                                    y={y}
                                    fill="white"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="text-xs font-medium"
                                  >
                                    {`${(percent * 100).toFixed(0)}%`}
                                  </text>
                                );
                              }}
                              outerRadius={80}
                              dataKey="value"
                            >
                              {sizeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<PieChartTooltip />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>Kondisi Penyajian</CardTitle>
                    <CardDescription>
                      Distribusi Mentah vs Matang
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      {isLoading ? (
                        <div className="h-full flex items-center justify-center">Memuat data...</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stateData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                return (
                                  <text
                                    x={x}
                                    y={y}
                                    fill="white"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="text-xs font-medium"
                                  >
                                    {`${(percent * 100).toFixed(0)}%`}
                                  </text>
                                );
                              }}
                              outerRadius={80}
                              dataKey="value"
                            >
                              <Cell fill="#0088FE" />
                              <Cell fill="#FF8042" />
                            </Pie>
                            <Tooltip content={<PieChartTooltip />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </FadeIn>
        
        <FadeIn delay={200}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ketersediaan Stok</CardTitle>
              <CardDescription>
                Level stok saat ini untuk berbagai varian pizza
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-40 flex items-center justify-center">Memuat data...</div>
              ) : Object.keys(stockSummary).length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-medium text-sm">Rasa</th>
                        <th className="text-center p-3 font-medium text-sm">Small</th>
                        <th className="text-center p-3 font-medium text-sm">Medium</th>
                        <th className="text-center p-3 font-medium text-sm">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stockSummary).map(([flavor, sizes], index) => {
                        const smallQty = sizes.Small || 0;
                        const mediumQty = sizes.Medium || 0;
                        const total = smallQty + mediumQty;
                        
                        return (
                          <tr key={index} className="border-t">
                            <td className="p-3">{flavor}</td>
                            <td className="p-3 text-center">{smallQty}</td>
                            <td className="p-3 text-center">{mediumQty}</td>
                            <td className="p-3 text-center font-medium">{total}</td>
                          </tr>
                        );
                      })}
                      <tr className="border-t bg-muted/50">
                        <td className="p-3 font-medium">Total</td>
                        <td className="p-3 text-center font-medium">
                          {Object.values(stockSummary).reduce((sum, sizes) => sum + (sizes.Small || 0), 0)}
                        </td>
                        <td className="p-3 text-center font-medium">
                          {Object.values(stockSummary).reduce((sum, sizes) => sum + (sizes.Medium || 0), 0)}
                        </td>
                        <td className="p-3 text-center font-medium">
                          {Object.values(stockSummary).reduce((sum, sizes) => sum + (sizes.Small || 0) + (sizes.Medium || 0), 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  Tidak ada data stok yang tersedia
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </Layout>
  );
};

export default Reports;
