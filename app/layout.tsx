import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'

export const metadata: Metadata = {
  title: 'Banda Chao - Social E-commerce Platform',
  description: 'A global social-commerce platform connecting independent artisans worldwide with buyers. Support for Arabic, English, and Chinese.',
  keywords: ['handmade', 'artisans', 'e-commerce', 'social commerce', 'crafts', 'Banda Chao'],
  authors: [{ name: 'Tariq Al-Junaidi' }],
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>
        <LanguageProvider defaultLanguage="zh">
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}

