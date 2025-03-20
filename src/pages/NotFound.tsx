
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/animations/FadeIn';
import { Pizza } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <FadeIn className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6 animate-float">
          <Pizza className="h-10 w-10 text-pizza-red" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Ups! Halaman ini telah habis terjual.
        </p>
        
        <Button onClick={() => navigate('/')} className="min-w-[160px]">
          Kembali ke Beranda
        </Button>
      </FadeIn>
    </div>
  );
};

export default NotFound;
