import React, { useState } from 'react';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/utils/constants';
import CashFlowChart from '@/components/cash/CashFlowChart';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, Search, ArrowUpDown } from 'lucide-react';
import { CashSummary } from '@/utils/types';
import { useCashSummary } from '@/hooks/useCashSummary';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ITEMS_PER_PAGE = 10;

const CashManagement = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Use our custom hook
  const { cashSummary, isLoading, dateRange, setDateRange } = useCashSummary();

  // Pagination state
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [expensesPage, setExpensesPage] = useState(1);
  
  // Search state
  const [transactionsSearch, setTransactionsSearch] = useState('');
  const [expensesSearch, setExpensesSearch] = useState('');
  
  // Sort state
  const [transactionsSort, setTransactionsSort] = useState<{ field: string, direction: 'asc' | 'desc' }>({ 
    field: 'date', direction: 'desc' 
  });
  const [expensesSort, setExpensesSort] = useState<{ field: string, direction: 'asc' | 'desc' }>({ 
    field: 'date', direction: 'desc' 
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

  // Filter and sort transactions
  const filteredTransactions = cashSummary?.transactions.filter(transaction => {
    const searchLower = transactionsSearch.toLowerCase();
    return (
      transaction.transaction_number?.toLowerCase().includes(searchLower) ||
      transaction.customer_name?.toLowerCase().includes(searchLower) ||
      transaction.flavor.toLowerCase().includes(searchLower) ||
      transaction.size.toLowerCase().includes(searchLower)
    );
  }) || [];

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const { field, direction } = transactionsSort;
    
    if (field === 'date') {
      return direction === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    
    if (field === 'total_price') {
      return direction === 'asc' 
        ? Number(a.total_price) - Number(b.total_price) 
        : Number(b.total_price) - Number(a.total_price);
    }
    
    // Default string comparison
    const aValue = String(a[field as keyof typeof a] || '');
    const bValue = String(b[field as keyof typeof b] || '');
    
    return direction === 'asc' 
      ? aValue.localeCompare(bValue) 
      : bValue.localeCompare(aValue);
  });

  // Paginate transactions
  const paginatedTransactions = sortedTransactions.slice(
    (transactionsPage - 1) * ITEMS_PER_PAGE, 
    transactionsPage * ITEMS_PER_PAGE
  );
  
  const transactionPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);

  // Filter and sort expenses
  const filteredExpenses = cashSummary?.expenses.filter(expense => {
    const searchLower = expensesSearch.toLowerCase();
    return (
      expense.category.toLowerCase().includes(searchLower) ||
      expense.description?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    const { field, direction } = expensesSort;
    
    if (field === 'date') {
      return direction === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    
    if (field === 'amount') {
      return direction === 'asc' 
        ? Number(a.amount) - Number(b.amount) 
        : Number(b.amount) - Number(a.amount);
    }
    
    // Default string comparison
    const aValue = String(a[field as keyof typeof a] || '');
    const bValue = String(b[field as keyof typeof b] || '');
    
    return direction === 'asc' 
      ? aValue.localeCompare(bValue) 
      : bValue.localeCompare(aValue);
  });

  // Paginate expenses
  const paginatedExpenses = sortedExpenses.slice(
    (expensesPage - 1) * ITEMS_PER_PAGE, 
    expensesPage * ITEMS_PER_PAGE
  );
  
  const expensePages = Math.ceil(sortedExpenses.length / ITEMS_PER_PAGE);

  // Handle sorting
  const handleTransactionsSort = (field: string) => {
    setTransactionsSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleExpensesSort = (field: string) => {
    setExpensesSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
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
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari transaksi..."
                      className="pl-8"
                      value={transactionsSearch}
                      onChange={(e) => setTransactionsSearch(e.target.value)}
                    />
                  </div>
                </div>
                
                {filteredTransactions.length === 0 ? (
                  <p>Tidak ada transaksi di bulan ini</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => handleTransactionsSort('date')}
                          >
                            <div className="flex items-center">
                              Tanggal
                              {transactionsSort.field === 'date' && (
                                <ArrowUpDown className={`ml-1 h-4 w-4 ${transactionsSort.direction === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => handleTransactionsSort('transaction_number')}
                          >
                            <div className="flex items-center">
                              ID Transaksi
                              {transactionsSort.field === 'transaction_number' && (
                                <ArrowUpDown className={`ml-1 h-4 w-4 ${transactionsSort.direction === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => handleTransactionsSort('customer_name')}
                          >
                            <div className="flex items-center">
                              Pelanggan
                              {transactionsSort.field === 'customer_name' && (
                                <ArrowUpDown className={`ml-1 h-4 w-4 ${transactionsSort.direction === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => handleTransactionsSort('flavor')}
                          >
                            <div className="flex items-center">
                              Produk
                              {transactionsSort.field === 'flavor' && (
                                <ArrowUpDown className={`ml-1 h-4 w-4 ${transactionsSort.direction === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </TableHead>
                          <TableHead>Jumlah</TableHead>
                          <TableHead 
                            className="text-right cursor-pointer hover:bg-muted"
                            onClick={() => handleTransactionsSort('total_price')}
                          >
                            <div className="flex items-center justify-end">
                              Total
                              {transactionsSort.field === 'total_price' && (
                                <ArrowUpDown className={`ml-1 h-4 w-4 ${transactionsSort.direction === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedTransactions.map((transaction) => (
                          <TableRow key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <TableCell>{format(new Date(transaction.date), 'dd MMM yyyy')}</TableCell>
                            <TableCell>{transaction.transaction_number || '-'}</TableCell>
                            <TableCell>{transaction.customer_name || '-'}</TableCell>
                            <TableCell>{transaction.flavor} ({transaction.size})</TableCell>
                            <TableCell>{transaction.quantity}x</TableCell>
                            <TableCell className="text-right">{formatCurrency(Number(transaction.total_price))}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {transactionPages > 1 && (
                      <Pagination className="mt-4">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setTransactionsPage(p => Math.max(1, p - 1))}
                              className={transactionsPage === 1 ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: Math.min(5, transactionPages) }, (_, i) => {
                            let pageNum;
                            
                            if (transactionPages <= 5) {
                              // Show all pages if 5 or fewer
                              pageNum = i + 1;
                            } else if (transactionsPage <= 3) {
                              // Near the start
                              pageNum = i + 1;
                            } else if (transactionsPage >= transactionPages - 2) {
                              // Near the end
                              pageNum = transactionPages - 4 + i;
                            } else {
                              // In the middle
                              pageNum = transactionsPage - 2 + i;
                            }
                            
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink 
                                  isActive={pageNum === transactionsPage}
                                  onClick={() => setTransactionsPage(pageNum)}
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setTransactionsPage(p => Math.min(transactionPages, p + 1))}
                              className={transactionsPage === transactionPages ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
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
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari pengeluaran..."
                      className="pl-8"
                      value={expensesSearch}
                      onChange={(e) => setExpensesSearch(e.target.value)}
                    />
                  </div>
                </div>
                
                {filteredExpenses.length === 0 ? (
                  <p>Tidak ada pengeluaran di bulan ini</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => handleExpensesSort('date')}
                          >
                            <div className="flex items-center">
                              Tanggal
                              {expensesSort.field === 'date' && (
                                <ArrowUpDown className={`ml-1 h-4 w-4 ${expensesSort.direction === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => handleExpensesSort('category')}
                          >
                            <div className="flex items-center">
                              Kategori
                              {expensesSort.field === 'category' && (
                                <ArrowUpDown className={`ml-1 h-4 w-4 ${expensesSort.direction === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => handleExpensesSort('description')}
                          >
                            <div className="flex items-center">
                              Deskripsi
                              {expensesSort.field === 'description' && (
                                <ArrowUpDown className={`ml-1 h-4 w-4 ${expensesSort.direction === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="text-right cursor-pointer hover:bg-muted"
                            onClick={() => handleExpensesSort('amount')}
                          >
                            <div className="flex items-center justify-end">
                              Jumlah
                              {expensesSort.field === 'amount' && (
                                <ArrowUpDown className={`ml-1 h-4 w-4 ${expensesSort.direction === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedExpenses.map((expense) => (
                          <TableRow key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <TableCell>{format(new Date(expense.date), 'dd MMM yyyy')}</TableCell>
                            <TableCell>{expense.category}</TableCell>
                            <TableCell>{expense.description || '-'}</TableCell>
                            <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {expensePages > 1 && (
                      <Pagination className="mt-4">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setExpensesPage(p => Math.max(1, p - 1))}
                              className={expensesPage === 1 ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: Math.min(5, expensePages) }, (_, i) => {
                            let pageNum;
                            
                            if (expensePages <= 5) {
                              // Show all pages if 5 or fewer
                              pageNum = i + 1;
                            } else if (expensesPage <= 3) {
                              // Near the start
                              pageNum = i + 1;
                            } else if (expensesPage >= expensePages - 2) {
                              // Near the end
                              pageNum = expensePages - 4 + i;
                            } else {
                              // In the middle
                              pageNum = expensesPage - 2 + i;
                            }
                            
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink 
                                  isActive={pageNum === expensesPage}
                                  onClick={() => setExpensesPage(pageNum)}
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setExpensesPage(p => Math.min(expensePages, p + 1))}
                              className={expensesPage === expensePages ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
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
