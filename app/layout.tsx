import type { Metadata } from 'next'
import './globals.css'
import { Suspense } from 'react'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import ClientRootWrapper from '@/components/layout/ClientRootWrapper'
import ClientLanguageProvider from '@/components/providers/ClientLanguageProvider'

// Get base URL for metadataBase
const metadataBaseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
                        'https://banda-chao-frontend.onrender.com';

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: 'Banda Chao - Social E-commerce Platform',
  description: 'A global social-commerce platform connecting independent artisans worldwide with buyers. Support for Arabic, English, and Chinese.',
  keywords: ['handmade', 'artisans', 'e-commerce', 'social commerce', 'crafts', 'Banda Chao'],
  authors: [{ name: 'Tareq Aljenaidi' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Banda Chao',
  },
  openGraph: {
    title: 'Banda Chao - Social E-commerce Platform',
    description: 'A global social-commerce platform connecting independent artisans worldwide with buyers',
    type: 'website',
    locale: 'en_US',
    siteName: 'Banda Chao',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Banda Chao',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Banda Chao - Social E-commerce Platform',
    description: 'A global social-commerce platform connecting independent artisans worldwide with buyers',
    images: ['/og-image.png'],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <html lang="ar" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <ErrorBoundary>
          {/* LanguageProvider is now client-only to prevent hydration mismatches */}
          <ClientLanguageProvider defaultLanguage="ar">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              {children}
            </Suspense>
            {/* Client-only interactive components (ChatWidget, VirtualHost) */}
            <ClientRootWrapper />
          </ClientLanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

