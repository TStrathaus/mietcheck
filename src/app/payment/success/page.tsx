// src/app/payment/success/page.tsx
'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface PaymentData {
  verified: boolean
  session?: {
    id: string
    customerEmail: string
    amountTotal: number
    metadata: Record<string, string>
    paymentStatus: string
  }
  error?: string
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const service = searchParams.get('service') || 'generate'

  const [loading, setLoading] = useState(true)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [generating, setGenerating] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Verify payment on mount
  useEffect(() => {
    if (!sessionId) {
      setError('Keine Session-ID gefunden')
      setLoading(false)
      return
    }

    async function verifyPayment() {
      try {
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        const data = await response.json()
        setPaymentData(data)

        if (data.verified && service === 'generate') {
          // Auto-generate PDF after successful payment
          await generatePDF(data.session?.metadata)
        }
      } catch (err) {
        setError('Fehler bei der Zahlungsverifizierung')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [sessionId, service])

  async function generatePDF(metadata: Record<string, string> | undefined) {
    if (!metadata) return

    setGenerating(true)
    try {
      // Reconstruct form data from metadata
      const formData = {
        email: metadata.email || '',
        tenantName: metadata.tenantName || '',
        tenantAddress: metadata.tenantAddress || '',
        tenantCity: metadata.tenantCity || '',
        propertyAddress: metadata.propertyAddress || '',
        netRent: metadata.netRent || '',
        newRent: metadata.newRent || '',
        monthlyReduction: metadata.monthlyReduction || '',
        referenceRate: metadata.referenceRate || '',
        contractDate: metadata.contractDate || '',
        landlordName: metadata.landlordName || '',
        landlordAddress: metadata.landlordAddress || '',
        landlordCity: metadata.landlordCity || '',
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('PDF generation failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch (err) {
      console.error('PDF generation error:', err)
      setError('PDF konnte nicht generiert werden. Bitte kontaktieren Sie den Support.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Zahlung wird verifiziert...</p>
        </div>
      </div>
    )
  }

  if (error || !paymentData?.verified) {
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
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Zahlung konnte nicht verifiziert werden
              </h1>
              <p className="text-gray-600 mb-6">
                {error || paymentData?.error || 'Die Zahlung wurde nicht abgeschlossen.'}
              </p>
              <div className="space-y-3">
                <Link href="/generate" className="btn btn-primary w-full">
                  Zurück zur Dokumenterstellung
                </Link>
                <Link href="/" className="btn btn-outline w-full">
                  Zur Startseite
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

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
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="card mb-8">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-3xl font-bold text-green-600 mb-2">
                Zahlung erfolgreich!
              </h1>
              <p className="text-gray-600">
                Vielen Dank für Ihren Kauf. Ihre Quittung wird an {paymentData.session?.customerEmail} gesendet.
              </p>
            </div>
          </div>

          {/* PDF Generation / Download */}
          {service === 'generate' && (
            <div className="card mb-8">
              <h2 className="text-xl font-bold mb-4">Ihr Herabsetzungsbegehren</h2>

              {generating ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">PDF wird generiert...</p>
                </div>
              ) : pdfUrl ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">
                      ✓ Ihr Dokument ist bereit zum Download
                    </p>
                  </div>

                  <a
                    href={pdfUrl}
                    download="herabsetzungsbegehren.pdf"
                    className="btn btn-primary w-full text-center text-lg block"
                  >
                    📄 PDF herunterladen
                  </a>

                  <p className="text-sm text-gray-500 text-center">
                    Sie können das PDF jederzeit erneut herunterladen, solange diese Seite geöffnet ist.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    PDF konnte nicht automatisch generiert werden.
                  </p>
                  <button
                    onClick={() => generatePDF(paymentData.session?.metadata)}
                    className="btn btn-primary"
                  >
                    PDF erneut generieren
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Next Steps */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Nächste Schritte</h2>
            <ol className="space-y-4">
              <li className="flex items-start">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  1
                </span>
                <div>
                  <p className="font-medium">PDF ausdrucken</p>
                  <p className="text-sm text-gray-600">
                    Drucken Sie das Dokument auf weissem A4-Papier aus.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  2
                </span>
                <div>
                  <p className="font-medium">Unterschreiben</p>
                  <p className="text-sm text-gray-600">
                    Unterschreiben Sie den Brief handschriftlich im vorgesehenen Feld.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  3
                </span>
                <div>
                  <p className="font-medium">Per Einschreiben versenden</p>
                  <p className="text-sm text-gray-600">
                    Senden Sie den Brief als Einschreiben (A-Post Plus) an Ihren Vermieter.
                    Bewahren Sie den Einlieferungsbeleg auf!
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  4
                </span>
                <div>
                  <p className="font-medium">30 Tage warten</p>
                  <p className="text-sm text-gray-600">
                    Ihr Vermieter hat 30 Tage Zeit, Ihnen auf dem amtlichen Formular zu antworten.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  5
                </span>
                <div>
                  <p className="font-medium">Bei Ablehnung: Schlichtungsbehörde</p>
                  <p className="text-sm text-gray-600">
                    Falls Ihr Vermieter nicht antwortet oder ablehnt, können Sie sich kostenlos
                    an die Schlichtungsbehörde Ihres Bezirks wenden.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Support */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Fragen? Kontaktieren Sie uns unter{' '}
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

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
