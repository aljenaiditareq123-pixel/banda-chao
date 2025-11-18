'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CartProvider } from '@/contexts/CartContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import LanguageDirection from '@/components/LanguageDirection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';

type Language = 'zh' | 'ar' | 'en';

interface ProvidersProps {
  children: React.ReactNode;
  initialLocale?: Language;
  showHeader?: boolean;
  showFooter?: boolean;
  showChatWidget?: boolean;
}

export default function Providers({ 
  children, 
  initialLocale,
  showHeader = true,
  showFooter = true,
  showChatWidget = true 
}: ProvidersProps) {
  return (
    <AuthProvider>
      <LanguageProvider initialLocale={initialLocale}>
        <LanguageDirection />
        <CartProvider>
          <NotificationsProvider>
            <div className="flex flex-col min-h-screen">
              {showHeader && <Header />}
              <main className="flex-1">
                {children}
              </main>
              {showFooter && <Footer />}
            </div>
            {showChatWidget && <ChatWidget />}
          </NotificationsProvider>
        </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

