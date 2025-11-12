import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import InstallPWA from "@/components/InstallPWA";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import ChatWidget from "@/components/ChatWidget";
import DevPanel from "@/components/DevPanel";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Banda Chao - 社交电商平台",
  description: "Banda Chao - 结合社交媒体与电子商务的平台，面向中国年轻工作者",
  manifest: "/manifest.json",
  themeColor: "#dc2626",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Banda Chao",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased bg-gray-50">
        <ErrorBoundary>
          <LanguageProvider>
            <CartProvider>
              <AuthProvider>
                <Header />
                <main>{children}</main>
                <ChatWidget />
                <ChatWidget />
                <DevPanel />
                <InstallPWA />
                <ServiceWorkerRegistration />
              </AuthProvider>
            </CartProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
