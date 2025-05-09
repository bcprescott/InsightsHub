
import type { ReactNode } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader as ShadcnSidebarHeader,
  SidebarInset,
} from '@/components/ui/sidebar';
import { SidebarNav } from './SidebarNav';
import { AppHeader } from './AppHeader';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-muted/40"> {/* Changed flex-col to flex (default flex-row) */}
      <Sidebar variant="sidebar" collapsible="icon" side="left">
        <ShadcnSidebarHeader className="p-4 border-b border-sidebar-border">
          <Logo />
        </ShadcnSidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      {/* Main content column that adapts to sidebar state */}
      <div 
        className={cn(
          "flex flex-1 flex-col sm:gap-4 transition-[padding-left] duration-300 ease-in-out",
          "sm:peer-data-[state=expanded]:pl-[var(--sidebar-width)]", // Padding when sidebar is expanded
          "sm:peer-data-[state=collapsed]:peer-data-[collapsible=icon]:pl-[var(--sidebar-width-icon)]" // Padding when sidebar is collapsed to icon
        )}
      >
        <AppHeader />
        {/* SidebarInset correctly manages background and styling for the main content area relative to the AppHeader */}
        <SidebarInset>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </div>
    </div>
  );
}
