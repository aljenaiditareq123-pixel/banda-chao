import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
import EnvCheckInit from '@/components/common/EnvCheckInit'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export const metadata: Metadata = {
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
    <html lang="ar">
      <body>
        <EnvCheckInit />
        <ErrorBoundary>
          <LanguageProvider defaultLanguage="ar">
            {children}
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

