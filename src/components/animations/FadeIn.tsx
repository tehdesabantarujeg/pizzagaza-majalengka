
import React from 'react';
import { cn } from '@/utils/animations';

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 300,
  direction = 'up'
}) => {
  const directionClasses = {
    up: 'animate-fade-in',
    right: 'animate-fade-in-right',
    left: 'animate-fade-in',
    down: 'animate-fade-in',
    none: 'animate-fade-in'
  };

  const style = {
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`
  };

  return (
    <div className={cn('animate-in', directionClasses[direction], className)} style={style}>
      {children}
    </div>
  );
};

export const FadeInStagger: React.FC<{
  children: React.ReactNode;
  className?: string;
  childClassName?: string;
  staggerDelay?: number;
  initialDelay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}> = ({
  children,
  className = '',
  childClassName = '',
  staggerDelay = 50,
  initialDelay = 0,
  duration = 300,
  direction = 'up'
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return (
            <FadeIn
              className={childClassName}
              delay={initialDelay + index * staggerDelay}
              duration={duration}
              direction={direction}
            >
              {child}
            </FadeIn>
          );
        }
        return child;
      })}
    </div>
  );
};
