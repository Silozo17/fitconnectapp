import * as React from 'react';
import { cn } from '@/lib/utils';

interface StatCircleGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gapMap = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

const columnMap = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

export function StatCircleGrid({
  children,
  columns = 3,
  gap = 'md',
  className,
}: StatCircleGridProps) {
  return (
    <div 
      className={cn(
        'grid',
        columnMap[columns],
        gapMap[gap],
        className
      )}
    >
      {children}
    </div>
  );
}
