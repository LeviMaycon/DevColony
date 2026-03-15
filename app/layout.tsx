import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
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
      <body className={`${geist.variable} antialiased bg-[#0d0d1a]`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}