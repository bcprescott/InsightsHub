import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from '@/components/layout/AppLayout';
import { Suspense } from 'react';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';


const fontSans = FontSans({ 
  subsets: ['latin'],
  variable: '--font-sans', 
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
        <SidebarProvider defaultOpen={true}>
          <AppLayout>
            <Suspense fallback={<LoadingOverlay isLoading={true} message="Generating AI insights... Please wait." />}>
              {children}
            </Suspense>
          </AppLayout>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
