
import React, { useState } from 'react';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/constants';
import CashFlowChart from '@/components/cash/CashFlowChart';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { CashSummary } from '@/utils/types';
import { useCashSummary } from '@/hooks/useCashSummary';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableCaption 
} from '@/components/ui/table';

const ITEMS_PER_PAGE = 10;

const CashManagement = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  // Use our custom hook
  const { cashSummary, isLoading, dateRange, setDateRange } = useCashSummary();

  // Get current month and year
  const currentMonth = format(new Date(), 'MMMM yyyy');

  // Filter and sort transactions based on search query and sort configuration
  const filteredTransactions = React.useMemo(() => {
    if (!cashSummary?.transactions) return [];
    
    return cashSummary.transactions
      .filter(transaction => {
        const searchLower = searchQuery.toLowerCase();
        const transactionNumber = transaction.transaction_number || '';
        const customerName = transaction.customer_name || '';
        const flavor = transaction.flavor || '';
        const size = transaction.size || '';
        
        return (
          transactionNumber.toLowerCase().includes(searchLower) ||
          customerName.toLowerCase().includes(searchLower) ||
          flavor.toLowerCase().includes(searchLower) ||
          size.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        if (!sortConfig) return 0;
        
        const { key, direction } = sortConfig;
        const aValue = a[key as keyof typeof a];
        const bValue = b[key as keyof typeof b];
        
        if (key === 'date') {
          return direction === 'asc' 
            ? new Date(aValue).getTime() - new Date(bValue).getTime()
            : new Date(bValue).getTime() - new Date(aValue).getTime();
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        return 0;
      });
  }, [cashSummary?.transactions, searchQuery, sortConfig]);

  // Filter and sort expenses
  const filteredExpenses = React.useMemo(() => {
    if (!cashSummary?.expenses) return [];
    
    return cashSummary.expenses
      .filter(expense => {
        const searchLower = searchQuery.toLowerCase();
        const category = expense.category || '';
        const description = expense.description || '';
        
        return (
          category.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        if (!sortConfig) return 0;
        
        const { key, direction } = sortConfig;
        const aValue = a[key as keyof typeof a];
        const bValue = b[key as keyof typeof b];
        
        if (key === 'date') {
          return direction === 'asc' 
            ? new Date(aValue).getTime() - new Date(bValue).getTime()
            : new Date(bValue).getTime() - new Date(aValue).getTime();
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        return 0;
      });
  }, [cashSummary?.expenses, searchQuery, sortConfig]);

  // Get current page items
  const getCurrentPageItems = (items: any[]) => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Handle pagination
  const totalPages = (items: any[]) => Math.ceil(items.length / ITEMS_PER_PAGE);
  
  // Generate pagination buttons
  const generatePaginationButtons = (items: any[]) => {
    const pages = totalPages(items);
    const buttons = [];
    
    for (let i = 1; i <= pages; i++) {
      buttons.push(
        <Button 
          key={i} 
          variant={currentPage === i ? "default" : "outline"} 
          size="sm"
          onClick={() => setCurrentPage(i)}
          className="w-8 h-8 p-0"
        >
          {i}
        </Button>
      );
    }
    
    return buttons;
  };
  
  // Handle sorting
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

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

  // Render sort icon
  const renderSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1" /> 
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

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
          <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 shadow-md">
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
          
          <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 shadow-md">
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
          
          <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 shadow-md">
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
              <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <CardTitle>Daftar Transaksi</CardTitle>
                <div className="flex w-full sm:max-w-sm">
                  <Input
                    placeholder="Cari transaksi..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                    className="mr-2"
                  />
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredTransactions.length === 0 ? (
                  <p>Tidak ada transaksi di bulan ini</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                            <div className="flex items-center">
                              Tanggal
                              {renderSortIcon('date')}
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('transaction_number')}>
                            <div className="flex items-center">
                              No. Transaksi
                              {renderSortIcon('transaction_number')}
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('customer_name')}>
                            <div className="flex items-center">
                              Pelanggan
                              {renderSortIcon('customer_name')}
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('flavor')}>
                            <div className="flex items-center">
                              Produk
                              {renderSortIcon('flavor')}
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer text-right" onClick={() => handleSort('quantity')}>
                            <div className="flex items-center justify-end">
                              Jumlah
                              {renderSortIcon('quantity')}
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer text-right" onClick={() => handleSort('total_price')}>
                            <div className="flex items-center justify-end">
                              Total
                              {renderSortIcon('total_price')}
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getCurrentPageItems(filteredTransactions).map((transaction) => (
                          <TableRow key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <TableCell>{format(new Date(transaction.date), 'dd MMM yyyy')}</TableCell>
                            <TableCell>{transaction.transaction_number}</TableCell>
                            <TableCell>{transaction.customer_name || '-'}</TableCell>
                            <TableCell>{transaction.flavor} ({transaction.size})</TableCell>
                            <TableCell className="text-right">{transaction.quantity}x</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(Number(transaction.total_price) || Number(transaction.selling_price) * Number(transaction.quantity))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {/* Pagination */}
                    {filteredTransactions.length > ITEMS_PER_PAGE && (
                      <div className="flex justify-center items-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        
                        {generatePaginationButtons(filteredTransactions)}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages(filteredTransactions)))}
                          disabled={currentPage === totalPages(filteredTransactions)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="expenses">
            <Card>
              <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <CardTitle>Daftar Pengeluaran</CardTitle>
                <div className="flex w-full sm:max-w-sm">
                  <Input
                    placeholder="Cari pengeluaran..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                    className="mr-2"
                  />
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredExpenses.length === 0 ? (
                  <p>Tidak ada pengeluaran di bulan ini</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                            <div className="flex items-center">
                              Tanggal
                              {renderSortIcon('date')}
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('category')}>
                            <div className="flex items-center">
                              Kategori
                              {renderSortIcon('category')}
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('description')}>
                            <div className="flex items-center">
                              Deskripsi
                              {renderSortIcon('description')}
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer text-right" onClick={() => handleSort('amount')}>
                            <div className="flex items-center justify-end">
                              Jumlah
                              {renderSortIcon('amount')}
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getCurrentPageItems(filteredExpenses).map((expense) => (
                          <TableRow key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <TableCell>{format(new Date(expense.date), 'dd MMM yyyy')}</TableCell>
                            <TableCell>{expense.category}</TableCell>
                            <TableCell>{expense.description || '-'}</TableCell>
                            <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {/* Pagination */}
                    {filteredExpenses.length > ITEMS_PER_PAGE && (
                      <div className="flex justify-center items-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        
                        {generatePaginationButtons(filteredExpenses)}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages(filteredExpenses)))}
                          disabled={currentPage === totalPages(filteredExpenses)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
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
