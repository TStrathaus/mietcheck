// src/app/layout.tsx (Updated)
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MietCheck.ch - Miete senken in 3 Minuten',
  description: 'Automatischer Mietminderungs-Service für die Schweiz. Sparen Sie CHF 300-700 pro Jahr.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
