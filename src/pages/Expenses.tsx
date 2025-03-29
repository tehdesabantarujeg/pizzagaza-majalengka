
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchExpenses, 
  addExpense, 
  updateExpense, 
  deleteExpense, 
  getCurrentMonthTotalExpenses 
} from '@/utils/supabase';
import { format } from 'date-fns';
import { Expense, ExpenseCategory } from '@/utils/types';
import { EXPENSE_CATEGORIES } from '@/utils/constants';
import { formatCurrency } from '@/utils/constants';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import ExpenseList from '@/components/expenses/ExpenseList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownCircle } from 'lucide-react';

const Expenses = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch expenses
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: fetchExpenses
  });

  // Fetch current month total expenses
  const { data: currentMonthTotal = 0, isLoading: isLoadingTotal } = useQuery({
    queryKey: ['currentMonthExpenses'],
    queryFn: getCurrentMonthTotalExpenses
  });

  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: (expense: Omit<Expense, 'id' | 'createdAt'>) => {
      return addExpense(expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['currentMonthExpenses'] });
      toast({
        title: 'Pengeluaran berhasil ditambahkan',
        description: 'Data pengeluaran telah disimpan',
      });
      setShowForm(false);
    },
    onError: (error) => {
      toast({
        title: 'Gagal menambahkan pengeluaran',
        description: 'Terjadi kesalahan saat menyimpan data',
        variant: 'destructive',
      });
      console.error('Error adding expense:', error);
    }
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: (expense: Expense) => {
      return updateExpense(expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['currentMonthExpenses'] });
      toast({
        title: 'Pengeluaran berhasil diperbarui',
        description: 'Data pengeluaran telah diperbarui',
      });
      setShowForm(false);
      setEditingExpense(null);
    },
    onError: (error) => {
      toast({
        title: 'Gagal memperbarui pengeluaran',
        description: 'Terjadi kesalahan saat memperbarui data',
        variant: 'destructive',
      });
      console.error('Error updating expense:', error);
    }
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => {
      return deleteExpense(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['currentMonthExpenses'] });
      toast({
        title: 'Pengeluaran berhasil dihapus',
        description: 'Data pengeluaran telah dihapus',
      });
    },
    onError: (error) => {
      toast({
        title: 'Gagal menghapus pengeluaran',
        description: 'Terjadi kesalahan saat menghapus data',
        variant: 'destructive',
      });
      console.error('Error deleting expense:', error);
    }
  });

  const handleAddExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    addExpenseMutation.mutate(expense);
  };

  const handleUpdateExpense = (expense: Expense) => {
    updateExpenseMutation.mutate(expense);
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpenseMutation.mutate(id);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  // Get current month name
  const currentMonth = format(new Date(), 'MMMM yyyy');

  return (
    <Layout>
      <Header 
        title="Pengeluaran" 
        description="Kelola pengeluaran dan biaya operasional"
      />

      <div className="container px-4 py-6">
        <div className="mb-6">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Pengeluaran Bulan Ini</h3>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(Number(currentMonthTotal))}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{currentMonth}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-full dark:bg-red-900/20">
                  <ArrowDownCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Daftar Pengeluaran</h2>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                Tambah Pengeluaran
              </Button>
            )}
          </div>
        </div>

        {showForm && (
          <div className="mb-6">
            <ExpenseForm 
              onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
              onCancel={handleCancelForm}
              initialExpense={editingExpense}
            />
          </div>
        )}

        <ExpenseList 
          expenses={expenses}
          isLoading={isLoading}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
        />
      </div>
    </Layout>
  );
};

export default Expenses;
