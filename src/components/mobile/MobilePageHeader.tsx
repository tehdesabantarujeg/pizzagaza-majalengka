
import React, { ReactNode } from 'react';
import { cn } from '@/utils/animations';
import { FadeIn } from '../animations/FadeIn';

interface MobilePageHeaderProps {
  title: string;
  className?: string;
  actions?: ReactNode;
}

const MobilePageHeader = ({ title, className, actions }: MobilePageHeaderProps) => {
  return (
    <div className={cn("md:hidden sticky top-0 z-10 px-4 py-3 bg-background border-b", className)}>
      <FadeIn>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium">{title}</h1>
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
