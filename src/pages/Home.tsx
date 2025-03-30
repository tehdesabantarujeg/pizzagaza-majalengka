
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Clock, Award } from 'lucide-react';

const Home = () => {
  return (
    <Layout>
      <div className="container px-4 py-6">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4 text-primary">
              Pizza Gaza <span className="text-pizza-red">Majalengka</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Setiap pizza yang Anda beli berkontribusi untuk tujuan mulia. Kami tidak hanya menjual pizza, kami membuat perubahan.
            </p>
            
            <div className="mb-8">
              <Button asChild size="lg" className="gap-2">
                <Link to="/sales">
                  <ShoppingCart className="h-5 w-5" />
                  Pesan Sekarang
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-secondary/50 p-4 rounded-lg shadow-sm">
                <Star className="h-6 w-6 text-yellow-500 mb-2" />
                <h3 className="font-medium mb-1">Premium Quality</h3>
                <p className="text-sm text-muted-foreground">Bahan berkualitas tinggi untuk cita rasa terbaik</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg shadow-sm">
                <Award className="h-6 w-6 text-pizza-red mb-2" />
                <h3 className="font-medium mb-1">Rasa Autentik</h3>
                <p className="text-sm text-muted-foreground">Resep original yang khas dan tak terlupakan</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg shadow-sm">
                <Clock className="h-6 w-6 text-blue-500 mb-2" />
                <h3 className="font-medium mb-1">Pengiriman Cepat</h3>
                <p className="text-sm text-muted-foreground">Pizza hangat langsung ke tangan Anda</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg shadow-sm">
                <ShoppingCart className="h-6 w-6 text-green-500 mb-2" />
                <h3 className="font-medium mb-1">Kemudahan Pemesanan</h3>
                <p className="text-sm text-muted-foreground">Proses pemesanan yang cepat dan mudah</p>
              </div>
            </div>
          </div>
          
          <div>
            <img 
              src="/lovable-uploads/3dd94e4d-6b0c-4e4c-9166-dbfa90a77851.png" 
              alt="Pizza Gaza" 
              className="w-full rounded-lg shadow-xl"
            />
          </div>
        </div>
        
        <div className="mt-12 bg-gradient-to-r from-secondary to-secondary/70 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-center">Misi Kami</h2>
          <p className="text-center text-muted-foreground max-w-3xl mx-auto">
            Setiap pizza yang Anda beli berkontribusi untuk tujuan mulia kemanusiaan. Kami berkomitmen untuk memberikan dukungan kepada mereka yang membutuhkan, satu pizza pada satu waktu. Dengan membeli produk kami, Anda tidak hanya menikmati pizza lezat, tetapi juga berpartisipasi dalam gerakan kebaikan bersama.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/sales">
                <ShoppingCart className="h-5 w-5" />
                Mulai Berbagi Kebaikan
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
