
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/animations';
import { FadeIn } from './animations/FadeIn';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Pizza, 
  Home,
  LayoutDashboard
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        isActive 
          ? "bg-gray-100 dark:bg-gray-800 text-primary" 
          : "text-muted-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

const Navbar: React.FC = () => {
  return (
    <FadeIn className="flex items-center justify-between px-4 py-3 border-b bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center">
        <NavLink to="/" className="flex items-center gap-2 mr-8">
          <Pizza className="h-6 w-6 text-pizza-red" />
          <span className="font-semibold text-lg">Pizza Gaza Majalengka</span>
        </NavLink>
        
        <nav className="hidden md:flex items-center gap-1">
          <NavItem to="/" icon={<Home className="h-4 w-4" />} label="Beranda" />
          <NavItem to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
          <NavItem to="/stock" icon={<ShoppingBag className="h-4 w-4" />} label="Stok" />
          <NavItem to="/sales" icon={<ShoppingCart className="h-4 w-4" />} label="Penjualan" />
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Peran:</span>
          <span className="text-sm font-medium bg-secondary px-2 py-1 rounded">Admin</span>
        </div>
        
        <button className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shadow-sm">
          <span className="font-medium text-sm">A</span>
        </button>
      </div>
    </FadeIn>
  );
};

export default Navbar;
