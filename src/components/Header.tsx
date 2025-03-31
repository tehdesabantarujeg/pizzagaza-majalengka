
import React from 'react';
import { FadeIn } from './animations/FadeIn';
import { cn } from '@/utils/animations';
import MobilePageHeader from './mobile/MobilePageHeader';

interface HeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  description, 
  className,
  children 
}) => {
  return (
    <>
      <MobilePageHeader 
        title={title} 
        actions={children}
      />
      
      <div className={cn("hidden md:flex flex-col space-y-1.5 px-8 py-6", className)}>
        <div className="flex items-center justify-between">
          <FadeIn>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </FadeIn>
          
          {children && (
            <FadeIn delay={100}>
              <div className="flex items-center space-x-2">
                {children}
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
