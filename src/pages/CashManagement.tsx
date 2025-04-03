import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from 'date-fns';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/utils/constants';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, Search, ArrowUpDown, Calendar } from 'lucide-react';
import { CashSummary } from '@/utils/types';
import { useCashSummary } from '@/hooks/useCashSummary';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const ITEMS_PER_PAGE = 10;

type DateFilterType = 'month' | 'year' | 'custom';

const CashManagement = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>('year');
  
  // Initialize date range with current year instead of month
  const currentDate = new Date();
  const initialStartDate = startOfYear(currentDate);
  const initialEndDate = endOfYear(currentDate);
  
  // Use our custom hook with the enhanced functionality
  const { 
    cashSummary, 
    isLoading, 
    dateRange, 
    setDateRange,
  } = useCashSummary(initialStartDate, initialEndDate);

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

  // Date range state for custom filter
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Handle date filter change
  const handleDateFilterChange = (type: DateFilterType) => {
    setDateFilterType(type);
    
    let start, end;
    
    switch (type) {
      case 'month':
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
        break;
      case 'year':
        start = startOfYear(currentDate);
        end = endOfYear(currentDate);
        break;
      case 'custom':
        // Keep current range when switching to custom
        return;
      default:
        start = startOfYear(currentDate);
        end = endOfYear(currentDate);
    }
    
    setDateRange({ start, end });
  };

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

  // Format date range for display
  const formatDateRange = () => {
    if (dateFilterType === 'month') {
      return format(dateRange.start, 'MMMM yyyy');
    } else if (dateFilterType === 'year') {
      return format(dateRange.start, 'yyyy');
    } else {
      return `${format(dateRange.start, 'dd MMM yyyy')} - ${format(dateRange.end, 'dd MMM yyyy')}`;
    }
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
      
      <div className="container px-4 py-6 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
        {/* Date Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm dark:bg-slate-800">
          <div className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-blue-500" />
            <span className="font-medium">{formatDateRange()}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={dateFilterType} onValueChange={(value) => handleDateFilterChange(value as DateFilterType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Bulanan</SelectItem>
                <SelectItem value="year">Tahunan</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            
            {dateFilterType === 'custom' && (
              <div className="flex gap-2">
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline">{format(dateRange.start, 'dd MMM yyyy')}</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dateRange.start}
                      onSelect={(date) => {
                        if (date) {
                          setDateRange({ start: date, end: dateRange.end });
                          setStartDateOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline">{format(dateRange.end, 'dd MMM yyyy')}</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dateRange.end}
                      onSelect={(date) => {
                        if (date) {
                          setDateRange({ start: dateRange.start, end: date });
                          setEndDateOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Pemasukan</h3>
                  <p className="text-3xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{formatCurrency(cashSummary?.totalIncome || 0)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatDateRange()}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-full dark:bg-emerald-900/20">
                  <ArrowUpCircle className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Pengeluaran</h3>
                  <p className="text-3xl font-bold mt-1 text-rose-600 dark:text-rose-400">{formatCurrency(cashSummary?.totalExpenses || 0)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatDateRange()}</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-full dark:bg-rose-900/20">
                  <ArrowDownCircle className="h-8 w-8 text-rose-500 dark:text-rose-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Laba Bersih</h3>
                  <p className="text-3xl font-bold mt-1 text-blue-600 dark:text-blue-400">{formatCurrency(cashSummary?.netProfit || 0)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatDateRange()}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full dark:bg-blue-900/20">
                  <DollarSign className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab} className="bg-white rounded-lg shadow-md p-4 dark:bg-slate-800">
          <TabsList className="mb-4 bg-gray-100 dark:bg-slate-700">
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="transactions">Transaksi ({cashSummary?.transactions.length || 0})</TabsTrigger>
            <TabsTrigger value="expenses">Pengeluaran ({cashSummary?.expenses.length || 0})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card className="border-none shadow-sm">
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
            <Card className="border-none shadow-sm">
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
            <Card className="border-none shadow-sm">
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
