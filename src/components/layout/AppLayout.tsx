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

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar variant="sidebar" collapsible="icon" side="left">
        <ShadcnSidebarHeader className="p-4 border-b border-sidebar-border">
          <Logo />
        </ShadcnSidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <div className="flex flex-col sm:gap-4 sm:pl-14 group-data-[collapsible=icon]:sm:pl-[calc(var(--sidebar-width-icon)_+_1rem)] md:group-data-[collapsible=icon]:sm:pl-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))] transition-[padding-left] duration-200 ease-linear">
        <AppHeader />
        <SidebarInset>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </div>
    </div>
  );
}
