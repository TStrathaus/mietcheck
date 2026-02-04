// src/app/layout.tsx (Updated with SEO)
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { OrganizationJsonLd, WebApplicationJsonLd, FAQJsonLd } from '@/components/JsonLd';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = 'https://mietcheck-nine.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MietCheck.ch - Miete senken in 3 Minuten',
    template: '%s | MietCheck.ch',
  },
  description: 'Automatischer Mietminderungs-Service für die Schweiz. Prüfen Sie Ihren Mietvertrag auf Sparpotential und sparen Sie CHF 300-700 pro Jahr durch legale Mietsenkung.',
  keywords: [
    'Miete senken',
    'Mietsenkung Schweiz',
    'Referenzzins',
    'Mietvertrag prüfen',
    'Mietzinsreduktion',
    'Mietrecht Schweiz',
    'Mietsenkung berechnen',
    'VMWG',
    'Mietminderung',
    'Schweizer Mietrecht',
    'Mietzins anpassen',
    'Hypothekarischer Referenzzins',
  ],
  authors: [{ name: 'MietCheck.ch' }],
  creator: 'MietCheck.ch',
  publisher: 'MietCheck.ch',
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
  openGraph: {
    type: 'website',
    locale: 'de_CH',
    url: siteUrl,
    siteName: 'MietCheck.ch',
    title: 'MietCheck.ch - Miete senken in 3 Minuten',
    description: 'Automatischer Mietminderungs-Service für die Schweiz. Prüfen Sie Ihren Mietvertrag auf Sparpotential und sparen Sie CHF 300-700 pro Jahr.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MietCheck.ch - Miete senken in 3 Minuten',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MietCheck.ch - Miete senken in 3 Minuten',
    description: 'Automatischer Mietminderungs-Service für die Schweiz. Sparen Sie CHF 300-700 pro Jahr.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Google Search Console verification (add your code here)
    // google: 'your-verification-code',
  },
  category: 'finance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <OrganizationJsonLd />
        <WebApplicationJsonLd />
        <FAQJsonLd />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
