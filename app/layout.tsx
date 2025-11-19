import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import InstallPWA from "@/components/InstallPWA";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import DevPanel from "@/components/DevPanel";
import Analytics from "@/components/Analytics";

const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://banda-chao-frontend.onrender.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Banda Chao - 社交电商平台",
    template: "%s | Banda Chao",
  },
  description: "Banda Chao - 结合社交媒体与电子商务的平台，面向中国年轻工作者",
  keywords: ["social commerce", "e-commerce", "makers", "handmade", "artisans", "社交电商", "手工艺", "创作者"],
  authors: [{ name: "Banda Chao Team" }],
  creator: "Banda Chao",
  publisher: "Banda Chao",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Banda Chao",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["ar_SA", "en_US"],
    url: baseUrl,
    siteName: "Banda Chao",
    title: "Banda Chao - 社交电商平台",
    description: "Banda Chao - 结合社交媒体与电子商务的平台，面向中国年轻工作者",
  },
  twitter: {
    card: "summary_large_image",
    title: "Banda Chao - 社交电商平台",
    description: "Banda Chao - 结合社交媒体与电子商务的平台",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#dc2626",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased bg-gray-50" suppressHydrationWarning>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        {children}
        <DevPanel />
        <InstallPWA />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
