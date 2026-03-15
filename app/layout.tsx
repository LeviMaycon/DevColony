import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevColony",
  description: "Formigas buscando repositórios no GitHub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistMono.variable} antialiased bg-[#0d0d1a]`}>
        {children}
      </body>
    </html>
  );
}