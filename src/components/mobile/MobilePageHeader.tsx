
import React from 'react';
import { cn } from '@/utils/animations';
import { FadeIn } from '../animations/FadeIn';

interface MobilePageHeaderProps {
  title: string;
  className?: string;
}

const MobilePageHeader = ({ title, className }: MobilePageHeaderProps) => {
  return (
    <div className={cn("md:hidden sticky top-0 z-10 px-4 py-3 flex items-center justify-center border-b bg-background", className)}>
      <FadeIn>
        <h1 className="text-lg font-medium">{title}</h1>
      </FadeIn>
    </div>
  );
};

export default MobilePageHeader;
