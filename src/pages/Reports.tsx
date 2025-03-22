
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import SalesTrendChart from '@/components/dashboard/SalesTrendChart';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { addDays, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { fetchSalesReportData, fetchTransactions } from '@/utils/supabase';
import RecentTransactionsList from '@/components/reports/RecentTransactionsList';
import { Transaction } from '@/utils/types';

const Reports = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [reportData, setReportData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
    loadTransactions();
  }, [date]);

  const loadReportData = async () => {
    if (date?.from && date?.to) {
      setLoading(true);
      try {
        const fromDate = date.from.toISOString();
        const toDate = date.to.toISOString();
        const data = await fetchSalesReportData(fromDate, toDate);
        setReportData(data);
      } catch (error) {
        console.error("Error loading report data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const loadTransactions = async () => {
    try {
      const transactionsData = await fetchTransactions();
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  return (
    <Layout>
      <Header 
        title="Laporan Penjualan" 
        description="Lihat laporan penjualan dan pendapatan"
      />

      <div className="container px-4 py-6">
        {/* Recent Transactions List */}
        <RecentTransactionsList transactions={transactions} />

        {/* Date Range Picker */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Grafik Tren Penjualan</h2>
          <div className="max-w-sm">
            <DateRangePicker 
              value={date} 
              onChange={setDate} 
            />
          </div>
        </div>
        
        {/* Sales Trend Chart */}
        <div className="grid gap-6">
          <SalesTrendChart data={reportData} loading={loading} />
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
