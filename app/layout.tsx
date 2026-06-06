import type { Metadata } from "next";
import "./globals.css";
import { PortalProvider } from "@/context/PortalContext";

export const metadata: Metadata = {
  title: "VendorBridge - Smart Procurement Portal",
  description: "Modern Bento-style Vendor and Procurement Management Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <PortalProvider>{children}</PortalProvider>
      </body>
    </html>
  );
}
