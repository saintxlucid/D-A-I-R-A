import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'DAIRA - Social Media Platform',
  description: 'Connect, share, and engage with DAIRA',
  manifest: '/manifest.json',
  themeColor: '#0D7490',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DAIRA',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
