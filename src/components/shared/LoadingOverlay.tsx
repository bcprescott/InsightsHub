import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react'; // Using Loader2 for a spinning effect

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ isLoading, message = "Loading...", className }: LoadingOverlayProps) {
  if (!isLoading) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm",
        className
      )}
      aria-live="assertive"
      role="alert"
    >
      <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
      <p className="text-xl font-semibold text-foreground">{message}</p>
      <p className="text-sm text-muted-foreground">This may take a few moments.</p>
    </div>
  );
}
