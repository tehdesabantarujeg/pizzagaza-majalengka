
import React from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogTrigger
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import SaleForm from '@/components/sales/SaleForm';
import TransactionList from '@/components/sales/TransactionList';
import useSaleManagement from '@/hooks/useSaleManagement';

const Sales = () => {
  const {
    transactions,
    open,
    setOpen,
    newSale,
    setNewSale,
    sellingPrice,
    totalPrice,
    error,
    handleSizeChange,
    handleFlavorChange,
    handleStateChange,
    handleSaveOnly,
    handleSavePrint
  } = useSaleManagement();

  return (
    <Layout>
      <Header 
        title="Proses Penjualan" 
        description="Catat dan kelola penjualan pizza"
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Penjualan Baru
            </Button>
          </DialogTrigger>
          <SaleForm
            newSale={newSale}
            setNewSale={setNewSale}
            sellingPrice={sellingPrice}
            totalPrice={totalPrice}
            error={error}
            handleSaveOnly={handleSaveOnly}
            handleSavePrint={handleSavePrint}
            handleSizeChange={handleSizeChange}
            handleFlavorChange={handleFlavorChange}
            handleStateChange={handleStateChange}
          />
        </Dialog>
      </Header>

      <div className="container px-4 py-6">
        <TransactionList transactions={transactions} setOpen={setOpen} />
      </div>
    </Layout>
  );
};

export default Sales;
