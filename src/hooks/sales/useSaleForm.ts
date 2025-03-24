
import { useState } from 'react';
import { PizzaSaleItem } from '@/utils/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export interface SaleFormData {
  customerName: string;
  notes: string;
  items: PizzaSaleItem[];
}

export const useSaleForm = () => {
  const [formData, setFormData] = useState<SaleFormData>({
    customerName: '',
    notes: '',
    items: [{ size: 'Small', flavor: '', quantity: 1, state: 'Mentah', includeBox: false, sellingPrice: 0, totalPrice: 0 }]
  });
  
  const queryClient = useQueryClient();
  
  const handleSubmit = async (formData: SaleFormData) => {
    // Process form data and return it
    return {
      customerName: formData.customerName,
      notes: formData.notes,
      items: formData.items
    };
  };

  // Using useMutation with proper type configuration
  const submitMutation = useMutation({
    mutationFn: handleSubmit,
    onSuccess: () => {
      // Reset the form
      setFormData({
        customerName: '',
        notes: '',
        items: [{ size: 'Small', flavor: '', quantity: 1, state: 'Mentah', includeBox: false, sellingPrice: 0, totalPrice: 0 }]
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stockItems'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      
      // Show success message
      toast({
        title: 'Penjualan Berhasil',
        description: 'Data penjualan telah disimpan',
      });
    },
    onError: (error) => {
      console.error('Error submitting sale:', error);
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan data penjualan',
        variant: 'destructive'
      });
    }
  });

  const handleCustomerNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      customerName: value
    }));
  };

  const handleNotesChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      notes: value
    }));
  };

  const handleItemChange = (index: number, field: keyof PizzaSaleItem, value: any) => {
    setFormData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
      
      // Recalculate total price when quantity or selling price changes
      if (field === 'quantity' || field === 'sellingPrice') {
        updatedItems[index].totalPrice = updatedItems[index].quantity * updatedItems[index].sellingPrice;
      }
      
      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { size: 'Small', flavor: '', quantity: 1, state: 'Mentah', includeBox: false, sellingPrice: 0, totalPrice: 0 }
      ]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) return; // Don't remove the last item
    
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  return {
    formData,
    handleCustomerNameChange,
    handleNotesChange,
    handleItemChange,
    addItem,
    removeItem,
    isSubmitting: submitMutation.isPending,
    submitSale: () => submitMutation.mutate(formData)
  };
};

export default useSaleForm;
