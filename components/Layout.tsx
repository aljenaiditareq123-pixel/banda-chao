'use client';

import { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  showHeader?: boolean;
}

export default function Layout({ children, showFooter = true, showHeader = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-[#111111]">
      {showHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
