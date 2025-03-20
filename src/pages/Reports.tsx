
import React, { useState } from 'react';
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

// Mock data for reports
const salesData = [
  { date: 'Jan 1', sales: 120000, profit: 40000 },
  { date: 'Jan 2', sales: 150000, profit: 50000 },
  { date: 'Jan 3', sales: 180000, profit: 60000 },
  { date: 'Jan 4', sales: 140000, profit: 45000 },
  { date: 'Jan 5', sales: 200000, profit: 70000 },
  { date: 'Jan 6', sales: 220000, profit: 75000 },
  { date: 'Jan 7', sales: 190000, profit: 65000 },
];

const flavorData = [
  { name: 'Cheese', value: 35 },
  { name: 'Pepperoni', value: 25 },
  { name: 'Hawaiian', value: 15 },
  { name: 'Beef', value: 10 },
  { name: 'Mushroom', value: 8 },
  { name: 'Veggie', value: 7 },
];

const sizeData = [
  { name: 'Small', value: 60 },
  { name: 'Medium', value: 40 },
];

const stateData = [
  { name: 'Raw', value: 45 },
  { name: 'Cooked', value: 55 },
];

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
  
  // Calculate summary data
  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const totalProfit = salesData.reduce((sum, item) => sum + item.profit, 0);
  const averageSales = totalSales / salesData.length;
  
  return (
    <Layout>
      <Header 
        title="Reports & Analytics" 
        description="View sales performance and stock analytics"
      />
      
      <div className="container px-4 py-6">
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalSales)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {salesData.length} days of sales
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalProfit)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Profit margin: {Math.round((totalProfit / totalSales) * 100)}%
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Daily Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(averageSales)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {salesData.length} days
                </p>
              </CardContent>
            </Card>
          </div>
        </FadeIn>
        
        <FadeIn delay={100}>
          <Tabs defaultValue="sales" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="sales">Sales Trends</TabsTrigger>
              <TabsTrigger value="distribution">Sales Distribution</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales">
              <Card className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Sales & Profit Trends</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-medium">Time Period:</div>
                      <select 
                        className="text-xs border rounded px-2 py-1"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                  <CardDescription>
                    Overview of sales and profit over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-80">
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
                        <Bar dataKey="sales" name="Sales" fill="#0088FE" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="profit" name="Profit" fill="#00C49F" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="distribution">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>Pizza Flavors</CardTitle>
                    <CardDescription>
                      Distribution by flavor
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
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
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>Pizza Sizes</CardTitle>
                    <CardDescription>
                      Distribution by size
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
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
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>Preparation State</CardTitle>
                    <CardDescription>
                      Raw vs Cooked distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
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
              <CardTitle>Stock Availability</CardTitle>
              <CardDescription>
                Current stock levels for different pizza variants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-medium text-sm">Flavor</th>
                      <th className="text-center p-3 font-medium text-sm">Small</th>
                      <th className="text-center p-3 font-medium text-sm">Medium</th>
                      <th className="text-center p-3 font-medium text-sm">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3">Cheese</td>
                      <td className="p-3 text-center">15</td>
                      <td className="p-3 text-center">8</td>
                      <td className="p-3 text-center font-medium">23</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3">Pepperoni</td>
                      <td className="p-3 text-center">10</td>
                      <td className="p-3 text-center">12</td>
                      <td className="p-3 text-center font-medium">22</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3">Beef</td>
                      <td className="p-3 text-center">8</td>
                      <td className="p-3 text-center">5</td>
                      <td className="p-3 text-center font-medium">13</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3">Hawaiian</td>
                      <td className="p-3 text-center">6</td>
                      <td className="p-3 text-center">9</td>
                      <td className="p-3 text-center font-medium">15</td>
                    </tr>
                    <tr className="border-t bg-muted/50">
                      <td className="p-3 font-medium">Total</td>
                      <td className="p-3 text-center font-medium">39</td>
                      <td className="p-3 text-center font-medium">34</td>
                      <td className="p-3 text-center font-medium">73</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </Layout>
  );
};

export default Reports;
