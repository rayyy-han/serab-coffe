import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Serab Coffee - Management System",
  description: "Aplikasi POS & Manajemen Serab Coffee",
  icons: {
    icon: "/serab-logo.svg",
    shortcut: "/serab-logo.svg",
    apple: "/serab-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

