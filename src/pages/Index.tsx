
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { FadeIn, FadeInStagger } from '@/components/animations/FadeIn';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Layers, ShoppingBag, ShoppingCart, BarChart2, CircleDollarSign } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8 max-w-6xl">
        <FadeIn className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Sistem Manajemen Stok & Penjualan Pizza
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Kelola inventaris pizza dan transaksi penjualan dengan sistem yang intuitif ini.
            Pantau tingkat stok, proses penjualan, dan visualisasikan kinerja bisnis Anda dengan mudah.
          </p>
        </FadeIn>

        <FadeInStagger 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          staggerDelay={100}
        >
          <Card className="overflow-hidden transition-all hover:shadow-glass-hover">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Manajemen Stok</CardTitle>
              <CardDescription>
                Tambah dan kelola inventaris pizza Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <ChevronRight className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Tambahkan pembelian stok baru</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Lihat tingkat stok saat ini</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Pantau riwayat pembelian</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-2">
              <Button 
                onClick={() => navigate('/stock')}
                className="w-full"
              >
                Kelola Stok
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden transition-all hover:shadow-glass-hover">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Proses Penjualan</CardTitle>
              <CardDescription>
                Proses dan catat penjualan pizza
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <ChevronRight className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Catat transaksi penjualan baru</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Perbarui stok secara otomatis</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Lihat riwayat penjualan</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-2">
              <Button 
                onClick={() => navigate('/sales')}
                className="w-full"
              >
                Proses Penjualan
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden transition-all hover:shadow-glass-hover">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                <BarChart2 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Laporan & Analisis</CardTitle>
              <CardDescription>
                Visualisasikan kinerja bisnis Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <ChevronRight className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Lihat analisis penjualan</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Lacak rasa terlaris</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Pantau pendapatan dan keuntungan</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-2">
              <Button 
                onClick={() => navigate('/reports')}
                className="w-full"
              >
                Lihat Laporan
              </Button>
            </CardFooter>
          </Card>
        </FadeInStagger>

        <FadeIn delay={600} className="mt-16 p-6 rounded-xl bg-secondary border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CircleDollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Hubungkan dengan Supabase</h3>
                <p className="text-sm text-muted-foreground">
                  Aktifkan otentikasi, penyimpanan database, dan pembaruan real-time
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full md:w-auto">
              Siapkan Integrasi
            </Button>
          </div>
        </FadeIn>
      </div>
    </Layout>
  );
};

export default Index;
