import type { ReactNode } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface DashboardSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  viewAllLink?: string;
  isLoading?: boolean;
  className?: string;
}

export function DashboardSection({
  title,
  icon,
  children,
  viewAllLink,
  isLoading = false,
  className,
}: DashboardSectionProps) {
  return (
    <Card className={`flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </CardTitle>
          {viewAllLink && (
            <Button variant="ghost" size="sm" asChild className="text-xs text-primary hover:text-primary/80">
              <Link href={viewAllLink}>
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
