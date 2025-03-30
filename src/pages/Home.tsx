
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Pizza, ShoppingCart, Star } from 'lucide-react';

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
            
            <div className="flex space-x-4 mb-8">
              <Button asChild size="lg" className="gap-2">
                <Link to="/sales">
                  <ShoppingCart className="h-5 w-5" />
                  Pesan Sekarang
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/menu">
                  <Pizza className="h-5 w-5" />
                  Lihat Menu
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center">
                <Pizza className="h-5 w-5 text-pizza-red mr-2" />
                <span>Rasa Autentik</span>
              </div>
            </div>
          </div>
          
          <div>
            <img 
              src="/lovable-uploads/3dd94e4d-6b0c-4e4c-9166-dbfa90a77851.png" 
              alt="Pizza Gaza" 
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
        
        <div className="mt-12 bg-secondary p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-center">Misi Kami</h2>
          <p className="text-center text-muted-foreground">
            Setiap pizza yang Anda beli berkontribusi untuk tujuan mulia namun kemanusiaan. Kami berkomitmen untuk memberikan dukungan kepada mereka yang membutuhkan, satu pizza pada satu waktu.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Home;

