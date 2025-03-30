
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Clock, Heart } from 'lucide-react';
import { FadeIn } from '@/components/animations/FadeIn';

const Home = () => {
  return (
    <Layout>
      <div className="container px-4 py-8">
        <FadeIn className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-pizza-red bg-clip-text text-transparent">
              Pizza Gaza Majalengka
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Setiap pizza yang Anda beli berkontribusi untuk tujuan mulia. Kami tidak hanya menjual pizza, 
              kami membuat perubahan dengan setiap gigitan.
            </p>
            
            <Button asChild size="lg" className="gap-2 px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
              <Link to="/sales">
                <ShoppingCart className="h-5 w-5" />
                Pesan Sekarang
              </Link>
            </Button>
            
            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="flex flex-col items-center p-6 bg-secondary/50 rounded-lg">
                <Star className="h-8 w-8 text-yellow-500 mb-3" />
                <h3 className="font-semibold">Premium Quality</h3>
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Bahan-bahan berkualitas tinggi untuk cita rasa terbaik
                </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-secondary/50 rounded-lg">
                <Clock className="h-8 w-8 text-blue-500 mb-3" />
                <h3 className="font-semibold">Pengiriman Cepat</h3>
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Selalu tepat waktu, panas dan siap disantap
                </p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pizza-red/20 to-transparent rounded-2xl -z-10 blur-2xl"></div>
            <img 
              src="/lovable-uploads/3dd94e4d-6b0c-4e4c-9166-dbfa90a77851.png" 
              alt="Pizza Gaza" 
              className="w-full rounded-2xl shadow-xl"
            />
          </div>
        </FadeIn>
        
        <div className="mt-16 mb-8">
          <FadeIn className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-3 text-primary">Misi Kemanusiaan Kami</h2>
            <div className="h-1 w-24 bg-pizza-red mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Setiap pizza yang Anda beli berkontribusi untuk tujuan mulia kemanusiaan. 
              Kami berkomitmen untuk memberikan dukungan kepada mereka yang membutuhkan, 
              satu pizza pada satu waktu.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Heart className="h-5 w-5 text-pizza-red" />
              <span className="font-medium">Berbagi Kebahagiaan Melalui Pizza</span>
            </div>
          </FadeIn>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-secondary/30 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-3">Kualitas Terbaik</h3>
            <p className="text-muted-foreground">
              Kami hanya menggunakan bahan-bahan berkualitas tinggi untuk memberikan pengalaman pizza terbaik.
            </p>
          </div>
          <div className="bg-secondary/30 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-3">Rasa Autentik</h3>
            <p className="text-muted-foreground">
              Resep khas kami memberikan cita rasa yang tidak dapat ditemukan di tempat lain.
            </p>
          </div>
          <div className="bg-secondary/30 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-3">Dampak Positif</h3>
            <p className="text-muted-foreground">
              Dengan setiap pesanan, Anda turut berkontribusi pada kegiatan sosial dan kemanusiaan.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
