
import { useState, useEffect } from 'react';
import { fetchDashboardData } from '@/utils/supabase';
import { format, subDays, subMonths, subYears, isSameDay, isWithinInterval, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { id } from 'date-fns/locale';
import { PizzaStock, BoxStock, Transaction } from '@/utils/types';

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<PizzaStock[]>([]);
  const [boxItems, setBoxItems] = useState<BoxStock[]>([]);
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
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  useEffect(() => {
    if (dashboardData) {
      updateSalesTrend(dashboardData.transactions);
    }
  }, [timeframe, dashboardData]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDashboardData();
      setDashboardData(data);
      
      // Set stockItems from dashboardData
      if (data && data.pizzaStockItems) {
        setStockItems(data.pizzaStockItems);
      }
      
      // Set boxItems from dashboardData
      if (data && data.boxStockItems) {
        setBoxItems(data.boxStockItems);
      }
      
      // Process data for different visualizations
      processData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processData = (data: any) => {
    if (!data) return;
    
    const { transactions, customers } = data;
    
    // Check if transactions exist and have valid price data
    const validTransactions = transactions.filter((t: any) => 
      t && typeof t.total_price === 'number' && !isNaN(t.total_price)
    );
    
    // Summary calculations
    const today = new Date();
    const todaySales = validTransactions
      .filter((t: any) => isSameDay(new Date(t.date), today))
      .reduce((sum: number, t: any) => sum + (t.total_price || 0), 0);
      
    const weekSales = validTransactions
      .filter((t: any) => {
        const txDate = new Date(t.date);
        return isWithinInterval(txDate, {
          start: startOfWeek(today, { locale: id }),
          end: endOfWeek(today, { locale: id })
        });
      })
      .reduce((sum: number, t: any) => sum + (t.total_price || 0), 0);
      
    const monthSales = validTransactions
      .filter((t: any) => {
        const txDate = new Date(t.date);
        return isWithinInterval(txDate, {
          start: startOfMonth(today),
          end: endOfMonth(today)
        });
      })
      .reduce((sum: number, t: any) => sum + (t.total_price || 0), 0);

    const yearSales = validTransactions
      .filter((t: any) => {
        const txDate = new Date(t.date);
        return isWithinInterval(txDate, {
          start: startOfYear(today),
          end: endOfYear(today)
        });
      })
      .reduce((sum: number, t: any) => sum + (t.total_price || 0), 0);
      
    const totalSales = validTransactions.reduce((sum: number, t: any) => sum + (t.total_price || 0), 0);
    const averageOrder = validTransactions.length > 0 ? totalSales / validTransactions.length : 0;
      
    setSummarySales({
      total: totalSales,
      today: todaySales,
      week: weekSales,
      month: monthSales,
      year: yearSales,
      transactions: validTransactions.length,
      customers: customers?.length || 0,
      averageOrder
    });
    
    // Update sales trend initially
    updateSalesTrend(validTransactions);
    
    // Process top products
    const productSales: {[key: string]: {quantity: number, revenue: number}} = {};
    
    validTransactions.forEach((t: any) => {
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

    // Map db transactions to app model
    const mappedTransactions = validTransactions
      .slice(0, 5)
      .map((t: any) => ({
        id: t.id,
        date: t.date,
        flavor: t.flavor,
        size: t.size,
        state: t.state,
        quantity: t.quantity,
        includeBox: t.include_box,
        sellingPrice: t.selling_price,
        totalPrice: t.total_price,
        customerName: t.customer_name || 'Pelanggan Umum',
        notes: t.notes,
        transactionNumber: t.transaction_number,
        createdAt: t.created_at
      }));

    setRecentTransactions(mappedTransactions);
  };

  // Update sales trend based on selected timeframe
  const updateSalesTrend = (transactions: any[]) => {
    if (!transactions || transactions.length === 0) {
      setSalesTrend([]);
      return;
    }

    // Filter for valid transactions
    const validTransactions = transactions.filter((t: any) => 
      t && typeof t.total_price === 'number' && !isNaN(t.total_price)
    );

    if (validTransactions.length === 0) {
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
    const filteredTransactions = validTransactions.filter((t: any) => {
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
      groupedSales[periodKey] = (groupedSales[periodKey] || 0) + (t.total_price || 0);
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
      trendData.sort((a, b) => {
        return (dayOrder[a.period as keyof typeof dayOrder] || 0) - (dayOrder[b.period as keyof typeof dayOrder] || 0);
      });
    } else if (timeframe === 'year') {
      const monthOrder = {'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5, 'Jul': 6, 'Agu': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11};
      trendData.sort((a, b) => {
        return (monthOrder[a.period as keyof typeof monthOrder] || 0) - (monthOrder[b.period as keyof typeof monthOrder] || 0);
      });
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

  return {
    dashboardData,
    isLoading,
    timeframe,
    setTimeframe,
    salesTrend,
    topProducts,
    summarySales,
    recentTransactions,
    stockItems,
    boxItems,
    loadDashboardData
  };
};

export default useDashboardData;
