import type { Metadata } from 'next';
import './globals.css';

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
      <body className="font-sans">{children}</body>
    </html>
  );
}
