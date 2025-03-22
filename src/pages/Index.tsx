
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { FadeIn, FadeInStagger } from '@/components/animations/FadeIn';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, ShoppingCart, BarChart2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8 max-w-5xl mx-auto">
        <FadeIn className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Pizza Gaza
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-semibold mb-4">
            Enjoy While Helping Gaza
          </p>
          <p className="text-muted-foreground text-base md:text-lg">
            Nikmati pizza berkualitas premium dengan rasa yang khas dan autentik.
            Setiap pembelian Anda berkontribusi pada dukungan untuk Gaza, menyatukan kelezatan dan kepedulian dalam setiap gigitan.
            Kami berkomitmen untuk menyediakan pizza yang lezat serta untuk tujuan kemanusiaan yang mulia.
          </p>
        </FadeIn>

        <FadeInStagger 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          staggerDelay={100}
        >
          <Card className="transition-all hover:shadow-lg hover:scale-105">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Manajemen Stok</CardTitle>
              <CardDescription>
                Kelola inventaris pizza Anda
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-2 flex justify-center">
              <Button 
                onClick={() => navigate('/stock')}
                className="w-full"
              >
                Buka
              </Button>
            </CardFooter>
          </Card>

          <Card className="transition-all hover:shadow-lg hover:scale-105">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 mx-auto">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Proses Penjualan</CardTitle>
              <CardDescription>
                Catat transaksi penjualan baru
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-2 flex justify-center">
              <Button 
                onClick={() => navigate('/sales')}
                className="w-full"
              >
                Buka
              </Button>
            </CardFooter>
          </Card>

          <Card className="transition-all hover:shadow-lg hover:scale-105">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4 mx-auto">
                <BarChart2 className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Laporan & Analisis</CardTitle>
              <CardDescription>
                Lihat data penjualan dan keuntungan
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-2 flex justify-center">
              <Button 
                onClick={() => navigate('/reports')}
                className="w-full"
              >
                Buka
              </Button>
            </CardFooter>
          </Card>
        </FadeInStagger>
      </div>
    </Layout>
  );
};

export default Index;
