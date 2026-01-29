import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MietCheck.ch - Automatische Mietminderung',
  description: 'Spare CHF 300-700 pro Jahr bei deiner Miete durch automatische Benachrichtigung bei Referenzzinssatz-Senkungen',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
