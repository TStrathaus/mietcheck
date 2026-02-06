// src/app/payment/cancel/page.tsx
'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function PaymentCancelContent() {
  const searchParams = useSearchParams()
  const service = searchParams.get('service') || 'generate'

  const returnUrl = service === 'analyze' ? '/analyze' : '/generate'
  const serviceName = service === 'analyze' ? 'Anspruchsanalyse' : 'Dokument-Erstellung'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-primary">
            MietCheck.ch
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto">
          <div className="card text-center">
            <div className="text-6xl mb-4">🔙</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Zahlung abgebrochen
            </h1>
            <p className="text-gray-600 mb-6">
              Sie haben den Zahlungsvorgang abgebrochen.
              Ihre Daten wurden nicht gespeichert und es wurden keine Kosten berechnet.
            </p>

            {/* Reassurance */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-blue-800 mb-2">Gut zu wissen:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✓ Es wurden keine Kosten berechnet</li>
                <li>✓ Ihre eingegebenen Daten sind noch vorhanden</li>
                <li>✓ Sie können jederzeit erneut versuchen</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link href={returnUrl} className="btn btn-primary w-full block">
                Zurück zur {serviceName}
              </Link>
              <Link href="/" className="btn btn-outline w-full block">
                Zur Startseite
              </Link>
            </div>

            {/* FAQ */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-left">
              <h3 className="font-semibold mb-3">Häufige Fragen</h3>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-gray-800">
                    Warum sollte ich den Service nutzen?
                  </p>
                  <p className="text-gray-600 mt-1">
                    Mit dem aktuellen Referenzzinssatz von 1.25% haben viele Mieter Anspruch
                    auf eine Mietzinsreduktion. Unser Service erstellt ein rechtssicheres
                    Herabsetzungsbegehren, das Sie direkt an Ihren Vermieter senden können.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-800">
                    Ist die Zahlung sicher?
                  </p>
                  <p className="text-gray-600 mt-1">
                    Ja, wir nutzen Stripe für die Zahlungsabwicklung. Ihre Zahlungsdaten
                    werden verschlüsselt übertragen und nicht auf unseren Servern gespeichert.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-800">
                    Welche Zahlungsmethoden werden akzeptiert?
                  </p>
                  <p className="text-gray-600 mt-1">
                    Sie können mit Kreditkarte (Visa, Mastercard) oder TWINT bezahlen.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Fragen oder Probleme? Kontaktieren Sie uns unter{' '}
              <a href="mailto:support@mietcheck.ch" className="text-primary hover:underline">
                support@mietcheck.ch
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Laden...</p>
      </div>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentCancelContent />
    </Suspense>
  )
}
