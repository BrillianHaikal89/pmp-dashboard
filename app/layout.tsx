import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MaintenancePage from "./page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard Rapor Pendidikan — PMP Jawa Barat",
  description: "Dashboard analitik Rapor Pendidikan PMP",
};

const MAINTENANCE_MODE = false;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (MAINTENANCE_MODE) {
    return (
      <html lang="id">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <MaintenancePage />
        </body>
      </html>
    );
  }

  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}