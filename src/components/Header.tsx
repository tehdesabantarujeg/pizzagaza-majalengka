
import React from 'react';
import { FadeIn } from './animations/FadeIn';
import { cn } from '@/utils/animations';
import MobilePageHeader from './mobile/MobilePageHeader';

interface HeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  verticalTitle?: boolean; // New prop to enable vertical title
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  description, 
  className,
  children,
  verticalTitle = false // Default to false
}) => {
  return (
    <>
      <MobilePageHeader 
        title={title} 
        actions={children}
        verticalTitle={verticalTitle} // Pass through to mobile header
      />
      
      <div className={cn("hidden md:flex flex-col space-y-1.5 px-8 py-6", className)}>
        <div className="flex items-center justify-between">
          <FadeIn>
            <h1 className={cn(
              "text-2xl font-semibold tracking-tight", 
              verticalTitle && "flex flex-col items-start text-[1rem] h-auto space-y-0.5 tracking-widest"
            )}>
              {verticalTitle 
                ? title.split('').map((char, index) => (
                    <span key={index}>{char}</span>
                  ))
                : title
              }
            </h1>
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
