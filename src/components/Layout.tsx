
import React from 'react';
import { cn } from '@/utils/animations';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import BottomNav from './mobile/BottomNav';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className={cn("pb-16 md:pb-0", className)}>
          {children}
        </SidebarInset>
        <BottomNav />
      </div>
    </SidebarProvider>
  );
};

export default Layout;
