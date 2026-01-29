'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AnalyzePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    email: '',
    address: '',
    netRent: '',
    referenceRate: '',
    contractDate: '',
  })

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // In production: Redirect to Stripe Checkout first
      // For MVP: Direct calculation
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      alert('Fehler bei der Analyse')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    // Create Stripe Checkout session
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'analyze',
        amount: 2000, // CHF 20.00 in Rappen
        email: formData.email,
        metadata: formData,
      }),
    })

    const { url } = await response.json()
    window.location.href = url
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
        <div className="max-w-3xl mx-auto">
          <div className="card mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Service 1: Anspruchsanalyse</h1>
                <p className="text-gray-600">
                  KI-gestützte Analyse deines Mietvertrags inkl. exakter Berechnung deiner Ersparnis
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">CHF 20</div>
                <div className="text-sm text-gray-500">einmalig</div>
              </div>
            </div>

            {!result ? (
              <form onSubmit={handleAnalyze} className="space-y-6">
                <div>
                  <label className="label">E-Mail *</label>
                  <input
                    type="email"
                    required
                    className="input"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="deine@email.ch"
                  />
                </div>

                <div>
                  <label className="label">Adresse der Mietwohnung *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    placeholder="Musterstrasse 123, 8000 Zürich"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Aktuelle Nettomiete (CHF) *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      className="input"
                      value={formData.netRent}
                      onChange={e => setFormData({...formData, netRent: e.target.value})}
                      placeholder="2000"
                    />
                  </div>

                  <div>
                    <label className="label">Referenzzinssatz bei Vertragsabschluss *</label>
                    <select
                      required
                      className="input"
                      value={formData.referenceRate}
                      onChange={e => setFormData({...formData, referenceRate: e.target.value})}
                    >
                      <option value="">Bitte wählen</option>
                      <option value="1.25">1.25%</option>
                      <option value="1.50">1.50%</option>
                      <option value="1.75">1.75%</option>
                      <option value="2.00">2.00%</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Datum Vertragsabschluss / letzte Anpassung *</label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={formData.contractDate}
                    onChange={e => setFormData({...formData, contractDate: e.target.value})}
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 font-semibold mb-2">
                    Was du erhältst:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ Exakte Berechnung deines Minderungsanspruchs</li>
                    <li>✓ Detaillierter PDF-Report</li>
                    <li>✓ Berücksichtigung von Teuerung & Kostensteigerung</li>
                    <li>✓ Sofortiges Ergebnis</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handlePayment}
                  className="btn btn-primary w-full text-lg"
                >
                  Jetzt für CHF 20 analysieren →
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border-2 border-green-500 p-6 rounded-lg">
                  <h3 className="text-2xl font-bold text-green-800 mb-4">
                    ✓ Analyse abgeschlossen!
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Deine monatliche Ersparnis</div>
                      <div className="text-4xl font-bold text-green-600">
                        CHF {result.calculation.netReduction}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Jährliche Ersparnis</div>
                      <div className="text-4xl font-bold text-green-600">
                        CHF {result.calculation.yearlySavings}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Berechnungsdetails:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {result.calculation.details.map((detail: string, i: number) => (
                      <li key={i}>• {detail}</li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">Nächster Schritt:</h4>
                  <p className="text-gray-700 mb-4">
                    Möchtest du jetzt das fertige Herabsetzungsbegehren erstellen?
                    Wir generieren dir ein rechtssicheres Dokument, das du sofort per Einschreiben
                    an deinen Vermieter senden kannst.
                  </p>
                  <Link 
                    href="/generate" 
                    className="btn btn-primary inline-block"
                  >
                    Service 2: Dokument erstellen (CHF 50) →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
