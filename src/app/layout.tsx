import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google'; // Changed from Geist
import './globals.css';
import { cn } from '@/lib/utils';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from '@/components/layout/AppLayout';

const fontSans = FontSans({ // Changed from Geist
  subsets: ['latin'],
  variable: '--font-sans', // Ensure this matches tailwind.config.ts
});

export const metadata: Metadata = {
  title: 'AI Insights Hub',
  description: 'Actionable weekly intelligence on AI market trends for consulting teams.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <SidebarProvider defaultOpen={true}> {/* Set defaultOpen based on preference */}
          <AppLayout>{children}</AppLayout>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
