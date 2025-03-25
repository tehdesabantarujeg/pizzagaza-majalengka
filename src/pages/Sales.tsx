import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogTrigger,
  DialogContent
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import SaleForm from '@/components/sales/SaleForm';
import MultiItemSaleForm from '@/components/sales/MultiItemSaleForm';
import TransactionList from '@/components/sales/TransactionList';
import EditTransactionForm from '@/components/sales/EditTransactionForm';
import useSaleManagement from '@/hooks/useSaleManagement';
import { Transaction } from '@/utils/types';

const Sales = () => {
  const {
    transactions,
    open,
    setOpen,
    newSale,
    setNewSale,
    saleItems,
    setSaleItems,
    customerName,
    setCustomerName,
    notes,
    setNotes,
    sellingPrice,
    totalPrice,
    error,
    isMultiItem,
    setIsMultiItem,
    handleSizeChange,
    handleFlavorChange,
    handleStateChange,
    handleSaveOnly,
    handleSavePrint,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handleEditTransaction,
    handleDeleteTransaction,
    editingTransaction,
    setEditingTransaction,
    updateExistingTransactions
  } = useSaleManagement();

  // Handle saving edited transaction
  const handleSaveEditedTransaction = (updatedTransactions: Transaction[]) => {
    // Update all transactions in the group
    updateExistingTransactions(updatedTransactions)
      .then(() => setEditingTransaction([]));
  };

  return (
    <Layout>
      <Header 
        title="Proses Penjualan" 
        description="Catat dan kelola penjualan pizza"
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setIsMultiItem(true); setOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Penjualan Baru
            </Button>
          </DialogTrigger>
          
          {open && (
            isMultiItem ? (
              <MultiItemSaleForm
                saleItems={saleItems}
                setSaleItems={setSaleItems}
                customerName={customerName}
                setCustomerName={setCustomerName}
                notes={notes}
                setNotes={setNotes}
                totalPrice={totalPrice}
                error={error}
                handleSaveOnly={handleSaveOnly}
                handleSavePrint={handleSavePrint}
                handleAddItem={handleAddItem}
                handleRemoveItem={handleRemoveItem}
                handleItemChange={handleItemChange}
              />
            ) : (
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
            )
          )}
        </Dialog>
      </Header>

      <div className="container px-4 py-6">
        <TransactionList 
          transactions={transactions} 
          setOpen={setOpen}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      </div>

      {/* Edit Transaction Dialog */}
      {editingTransaction && editingTransaction.length > 0 && (
        <Dialog open={editingTransaction.length > 0} onOpenChange={(open) => !open && setEditingTransaction([])}>
          <EditTransactionForm
            transactions={editingTransaction}
            onCancel={() => setEditingTransaction([])}
            onSave={handleSaveEditedTransaction}
          />
        </Dialog>
      )}
    </Layout>
  );
};

export default Sales;
