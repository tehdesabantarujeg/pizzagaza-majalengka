
import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory } from '@/utils/types';
import { formatCurrency } from '@/utils/constants';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown } from 'lucide-react';

interface ExpenseSummaryTableProps {
  expenses: Expense[];
  isLoading: boolean;
}

type SortField = 'category' | 'amount';
type SortDirection = 'asc' | 'desc';

const ExpenseSummaryTable: React.FC<ExpenseSummaryTableProps> = ({ 
  expenses, 
  isLoading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('amount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Group expenses by category
  const expenseSummary = useMemo(() => {
    const filteredExpenses = expenses.filter(expense => 
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedByCategory: Record<string, { category: ExpenseCategory, total: number, count: number }> = {};

    filteredExpenses.forEach(expense => {
      if (!groupedByCategory[expense.category]) {
        groupedByCategory[expense.category] = {
          category: expense.category as ExpenseCategory,
          total: 0,
          count: 0
        };
      }
      groupedByCategory[expense.category].total += expense.amount;
      groupedByCategory[expense.category].count += 1;
    });

    return Object.values(groupedByCategory);
  }, [expenses, searchTerm]);

  // Sort summary data
  const sortedSummary = useMemo(() => {
    return [...expenseSummary].sort((a, b) => {
      if (sortField === 'category') {
        return sortDirection === 'asc' 
          ? a.category.localeCompare(b.category)
          : b.category.localeCompare(a.category);
      } else { // amount
        return sortDirection === 'asc' 
          ? a.total - b.total 
          : b.total - a.total;
      }
    });
  }, [expenseSummary, sortField, sortDirection]);

  // Calculate grand total
  const grandTotal = useMemo(() => {
    return sortedSummary.reduce((sum, item) => sum + item.total, 0);
  }, [sortedSummary]);

  // Handle sort toggle
  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Rekap Pengeluaran Berdasarkan Kategori</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Cari kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => toggleSort('category')}
                >
                  <div className="flex items-center">
                    Kategori
                    {sortField === 'category' && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-center">Jumlah Transaksi</TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted"
                  onClick={() => toggleSort('amount')}
                >
                  <div className="flex items-center justify-end">
                    Total Pengeluaran
                    {sortField === 'amount' && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : sortedSummary.length > 0 ? (
                <>
                  {sortedSummary.map((item) => (
                    <TableRow key={item.category}>
                      <TableCell className="font-medium">{item.category}</TableCell>
                      <TableCell className="text-center">{item.count}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold">Total Keseluruhan</TableCell>
                    <TableCell className="text-center font-bold">
                      {sortedSummary.reduce((sum, item) => sum + item.count, 0)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(grandTotal)}
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6">
                    {searchTerm ? 'Tidak ada kategori yang ditemukan' : 'Belum ada data pengeluaran'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseSummaryTable;
