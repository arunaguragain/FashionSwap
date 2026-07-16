import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ToastProvider from "@/app/(platform)/_components/ToastProvider";
import RootLayoutWrapper from '@/components/RootLayoutWrapper';

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "FashionSwap | Marketplace for Preloved Style",
  description: "Buy, sell, and discover pre-loved fashion in a trusted marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${inter.variable} font-body antialiased`}>
        <AuthProvider>
          <ToastProvider>
            <RootLayoutWrapper>{children}</RootLayoutWrapper>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
