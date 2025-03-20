
import React from 'react';
import Navbar from './Navbar';
import { cn } from '@/utils/animations';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className={cn("flex-1", className)}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
