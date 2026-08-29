import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Playfair_Display,
  Readex_Pro,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { CartProvider } from "@/lib/cart-context";
import { LanguageProvider } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/Cart";
import SectionNav from "@/components/SectionNav";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairSerif = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const readexPro = Readex_Pro({
  variable: "--font-readex-pro",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Origin & Oak — Specialty Coffee Roasters | أوريجن آند أوك",
  description:
    "Single-origin specialty coffee roasters & craft cafe. Small-batch artisan roast, interactive barista drink lab, and freshly baked pastries.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairSerif.variable} ${readexPro.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <LanguageProvider>
          <ThemeProvider>
            <CartProvider>
              <Navbar />
              <CartDrawer />
              <SectionNav />
              <main className="flex-1 pt-16">{children}</main>
              <Footer />
            </CartProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
