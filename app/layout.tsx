import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import InstallPWA from "@/components/InstallPWA";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import DevPanel from "@/components/DevPanel";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
  title: "Banda Chao - 社交电商平台",
  description: "Banda Chao - 结合社交媒体与电子商务的平台，面向中国年轻工作者",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Banda Chao",
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
    <html lang="ar" dir="rtl" suppressHydrationWarning>
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
