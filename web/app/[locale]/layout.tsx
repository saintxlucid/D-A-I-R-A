import type { Metadata } from 'next';
import { ReactNode } from 'react';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'D-A-I-R-A | Connect. Share. Grow.',
  description: 'Social media platform for Egyptian communities',
  keywords: ['social media', 'Egypt', 'community', 'connect', 'share'],
  authors: [{ name: 'D-A-I-R-A Team' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: 'https://d-a-i-r-a.com',
    siteName: 'D-A-I-R-A',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'D-A-I-R-A - Social Platform for Egypt',
      },
    ],
  },
};

interface RootLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar-EG' }];
}

export default function RootLayout({
  children,
  params: { locale },
}: RootLayoutProps) {
  const dir = locale === 'ar-EG' ? 'rtl' : 'ltr';
  const lang = locale === 'ar-EG' ? 'ar' : 'en';

  return (
    <html lang={lang} dir={dir} className={locale === 'ar-EG' ? 'rtl' : 'ltr'}>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#1F2937" />
      </head>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50">
        {children}
      </body>
    </html>
  );
}
