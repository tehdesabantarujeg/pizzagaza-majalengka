
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/animations';
import { Home, ShoppingBag, ShoppingCart, DollarSign, LayoutDashboard, Receipt } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const BottomNav = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex justify-around items-center h-16">
        <NavLink 
          to="/" 
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-full py-2",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Home size={20} />
          <span className="text-xs mt-1">Beranda</span>
        </NavLink>
        
        <NavLink 
          to="/sales" 
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-full py-2",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <ShoppingCart size={20} />
          <span className="text-xs mt-1">Penjualan</span>
        </NavLink>
        
        {isAdmin && (
          <NavLink 
            to="/stock" 
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center w-full py-2",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <ShoppingBag size={20} />
            <span className="text-xs mt-1">Stok</span>
          </NavLink>
        )}
        
        {isAdmin && (
          <NavLink 
            to="/expenses" 
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center w-full py-2",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Receipt size={20} />
            <span className="text-xs mt-1">Pengeluaran</span>
          </NavLink>
        )}
        
        {isAdmin && (
          <NavLink 
            to="/cash" 
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center w-full py-2",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <DollarSign size={20} />
            <span className="text-xs mt-1">KasKu</span>
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default BottomNav;
