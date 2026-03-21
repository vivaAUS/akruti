import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Akruti — Custom 3D Prints",
  description:
    "Handcrafted 3D printed products made to order. Shop fidgets, figurines, keychains, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body suppressHydrationWarning className="antialiased flex flex-col min-h-screen bg-white text-akruti-dark font-body">
        <Toaster position="bottom-right" />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
