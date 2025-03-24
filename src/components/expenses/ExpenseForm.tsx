
import React from 'react';
import { useForm } from 'react-hook-form';
import { Expense, ExpenseCategory } from '@/utils/types';
import { EXPENSE_CATEGORIES } from '@/utils/constants';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ExpenseFormProps {
  onSubmit: (expense: any) => void;
  onCancel: () => void;
  initialExpense?: Expense | null;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, onCancel, initialExpense }) => {
  const [date, setDate] = React.useState<Date | undefined>(
    initialExpense ? new Date(initialExpense.date) : new Date()
  );

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      category: initialExpense?.category || '',
      amount: initialExpense?.amount || 0,
      description: initialExpense?.description || '',
    }
  });

  const category = watch('category');

  // Process form submission
  const onFormSubmit = (data: any) => {
    const formattedExpense = {
      ...data,
      date: date?.toISOString() || new Date().toISOString(),
      amount: parseInt(data.amount),
      ...(initialExpense && { id: initialExpense.id, createdAt: initialExpense.createdAt }),
    };
    
    onSubmit(formattedExpense);
  };

  const handleCategoryChange = (value: string) => {
    setValue('category', value as ExpenseCategory);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialExpense ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select 
                defaultValue={category || undefined} 
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">Kategori wajib dipilih</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'dd MMMM yyyy') : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah (Rp)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Jumlah pengeluaran"
              {...register('amount', { required: true, min: 1 })}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">Jumlah wajib diisi dan minimal 1</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi pengeluaran"
              {...register('description')}
              rows={4}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit">
            {initialExpense ? 'Perbarui' : 'Simpan'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ExpenseForm;
