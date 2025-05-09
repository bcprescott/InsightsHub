import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
      <BrainCircuit className="h-6 w-6 text-primary" />
      <span>AI Insights Hub</span>
    </Link>
  );
}
