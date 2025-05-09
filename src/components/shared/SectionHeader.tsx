import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  description?: string | ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function SectionHeader({ title, description, className, actions }: SectionHeaderProps) {
  return (
    <div className={cn("mb-6 pb-4 border-b border-border", className)}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">{title}</h1>
        {actions && <div className="ml-4">{actions}</div>}
      </div>
      {description && (
        <div className="mt-1 text-sm text-muted-foreground">
          {description}
        </div>
      )}
    </div>
  );
}
