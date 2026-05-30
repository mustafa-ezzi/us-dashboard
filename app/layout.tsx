import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { PWAProvider } from "@/components/PWAProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Us Dashboard",
  description: "A private relationship dashboard for two.",
  applicationName: "Us Dashboard",
  appleWebApp: {
    capable: true,
    title: "Us",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#E91E8C",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased text-ink bg-cream min-h-screen">
        <StoreProvider>
          <PWAProvider>
            <AppShell>{children}</AppShell>
          </PWAProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
