import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Sa Đéc Marketing Hub — Đồng Tháp Mekong Local Culture Agency',
    template: '%s | Sa Đéc Marketing Hub',
  },
  description: 'Hệ sinh thái Marketing bản địa Mekong Delta: Agency thực chiến, Owned Media IP House, Academy & Vibe Coding Hub. Khám phá trải nghiệm Mùa Nước Nổi Tràm Chim, Phố Hoa Sa Đéc, Di sản văn hóa trăm năm.',
  keywords: [
    'Sa Đéc Marketing Hub',
    'Đồng Tháp',
    'Mekong Delta',
    'Marketing Agency',
    'Local Culture',
    'Vibe Coding',
    'Mùa nước nổi',
    'Du lịch Tràm Chim',
    'Làng hoa Sa Đéc',
    'Du lịch bản địa'
  ],
  authors: [{ name: 'Sa Đéc Marketing Hub' }],
  creator: 'Sa Đéc Marketing Hub',
  publisher: 'Sa Đéc Marketing Hub',
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  metadataBase: new URL('https://sadecmarketinghub.vn'),
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://sadecmarketinghub.vn',
    siteName: 'Sa Đéc Marketing Hub',
    title: 'Sa Đéc Marketing Hub — Đồng Tháp Mekong Local Culture Agency',
    description: 'Hệ sinh thái Marketing bản địa Mekong Delta: Agency thực chiến, Owned Media IP House, Academy & Vibe Coding Hub.',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Sa Đéc Marketing Hub - Mekong Delta Local Culture Agency',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sa Đéc Marketing Hub',
    description: 'Hệ sinh thái Marketing bản địa Mekong Delta.',
    images: ['/images/og-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body className="min-h-screen antialiased font-sans">
        {children}
      </body>
    </html>
  );
}