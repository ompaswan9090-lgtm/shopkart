import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShopProvider } from "@/store/ShopContext";
import Toast from "@/components/Toast";

export const metadata: Metadata = {
  title: "ShopKart — Online Shopping | Mobiles, Fashion, Electronics",
  description: "Flipkart jaisa online shopping — mobiles, fashion, electronics sabse best price par. Free delivery, COD available.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900 antialiased">
        <ShopProvider>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <Toast />
        </ShopProvider>
      </body>
    </html>
  );
}
