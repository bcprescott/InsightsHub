'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lightbulb, Target, BookOpen, Settings, Home } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/trends', label: 'AI Trends', icon: Lightbulb },
  { href: '/strategies', label: 'Strategies', icon: Target },
  { href: '/resources', label: 'Resources', icon: BookOpen },
  // { href: '/settings', label: 'Settings', icon: Settings }, // Optional
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
              tooltip={{ children: item.label, side: 'right', align: 'center' }}
              className={cn(
                "justify-start",
                (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)))
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-sidebar-muted hover:text-sidebar-foreground'
              )}
            >
              <a>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
