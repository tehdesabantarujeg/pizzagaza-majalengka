
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  Pizza, 
  ShoppingBag, 
  ShoppingCart, 
  LogOut, 
  Moon, 
  Sun, 
  User, 
  Home, 
  DollarSign, 
  Wallet,
  Receipt
} from 'lucide-react';

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="py-4">
        <div className="flex items-center justify-center">
          <Pizza className="h-8 w-8 text-pizza-red" />
          <span className="ml-2 text-lg font-semibold">Pizza Gaza Majalengka</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Beranda">
                  <NavLink to="/">
                    <Home className="h-5 w-5" />
                    <span>Beranda</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Penjualan">
                  <NavLink to="/sales">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Penjualan</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {user?.role === 'admin' && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Manajemen Stok">
                    <NavLink to="/stock">
                      <ShoppingBag className="h-5 w-5" />
                      <span>Manajemen Stok</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {user?.role === 'admin' && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Pengeluaran">
                    <NavLink to="/expenses">
                      <Receipt className="h-5 w-5" />
                      <span>Pengeluaran</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {user?.role === 'admin' && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="KasKu">
                    <NavLink to="/cash">
                      <Wallet className="h-5 w-5" />
                      <span>KasKu</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="flex flex-col space-y-2">
          <SidebarSeparator />
          
          <div className="flex items-center px-3 py-2">
            <User className="h-5 w-5 mr-2" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="flex items-center justify-center"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span className="ml-2">{theme === 'light' ? 'Gelap' : 'Terang'}</span>
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="flex items-center justify-center"
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
