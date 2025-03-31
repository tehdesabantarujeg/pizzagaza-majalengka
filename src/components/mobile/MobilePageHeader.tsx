
import React, { ReactNode } from 'react';
import { cn } from '@/utils/animations';
import { FadeIn } from '../animations/FadeIn';

interface MobilePageHeaderProps {
  title: string;
  className?: string;
  actions?: ReactNode;
  verticalTitle?: boolean; // New prop to enable vertical title
}

const MobilePageHeader = ({ 
  title, 
  className, 
  actions,
  verticalTitle = false // Default to false
}: MobilePageHeaderProps) => {
  return (
    <div className={cn("md:hidden sticky top-0 z-10 px-4 py-3 bg-background border-b", className)}>
      <FadeIn>
        <div className="flex items-center justify-between">
          <h1 className={cn(
            "text-lg font-medium", 
            verticalTitle && "flex flex-col items-start text-[0.95rem] h-auto space-y-0.5 tracking-widest"
          )}>
            {verticalTitle 
              ? title.split('').map((char, index) => (
                  <span key={index}>{char}</span>
                ))
              : title
            }
          </h1>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
};

export default MobilePageHeader;
