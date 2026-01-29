'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function GeneratePage() {
  const [loading, setLoading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')
  const [formData, setFormData] = useState({
    // Tenant
    email: '',
    tenantName: '',
    tenantAddress: '',
    tenantCity: '',
    
    // Contract
    propertyAddress: '',
    netRent: '',
    referenceRate: '',
    contractDate: '',
    
    // Landlord
    landlordName: '',
    landlordAddress: '',
    landlordCity: '',
  })

  const handlePayment = async () => {
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'generate',
        amount: 5000, // CHF 50.00 in Rappen
        email: formData.email,
        metadata: formData,
      }),
    })

    const { url } = await response.json()
    window.location.href = url
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch (error) {
      alert('Fehler beim Generieren des Dokuments')
    } finally {
      setLoading(false)
    }
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
                <h1 className="text-3xl font-bold mb-2">Service 2: Dokument-Erstellung</h1>
                <p className="text-gray-600">
                  Rechtssicheres Herabsetzungsbegehren - fertig zum Versand
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">CHF 50</div>
                <div className="text-sm text-gray-500">einmalig</div>
              </div>
            </div>

            {!pdfUrl ? (
              <form onSubmit={handleGenerate} className="space-y-8">
                {/* Tenant Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-2">1</span>
                    Deine Daten
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="label">E-Mail *</label>
                      <input
                        type="email"
                        required
                        className="input"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="label">Dein Name *</label>
                      <input
                        type="text"
                        required
                        className="input"
                        value={formData.tenantName}
                        onChange={e => setFormData({...formData, tenantName: e.target.value})}
                        placeholder="Max Muster"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Deine Adresse *</label>
                        <input
                          type="text"
                          required
                          className="input"
                          value={formData.tenantAddress}
                          onChange={e => setFormData({...formData, tenantAddress: e.target.value})}
                          placeholder="Musterstrasse 123"
                        />
                      </div>
                      <div>
                        <label className="label">PLZ & Ort *</label>
                        <input
                          type="text"
                          required
                          className="input"
                          value={formData.tenantCity}
                          onChange={e => setFormData({...formData, tenantCity: e.target.value})}
                          placeholder="8000 Zürich"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contract Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-2">2</span>
                    Mietvertrag
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="label">Adresse der Mietwohnung *</label>
                      <input
                        type="text"
                        required
                        className="input"
                        value={formData.propertyAddress}
                        onChange={e => setFormData({...formData, propertyAddress: e.target.value})}
                        placeholder="Wohnstrasse 456, 8000 Zürich"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="label">Nettomiete (CHF) *</label>
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
                        <label className="label">Referenzzinssatz *</label>
                        <select
                          required
                          className="input"
                          value={formData.referenceRate}
                          onChange={e => setFormData({...formData, referenceRate: e.target.value})}
                        >
                          <option value="">Wählen</option>
                          <option value="1.50">1.50%</option>
                          <option value="1.75">1.75%</option>
                        </select>
                      </div>

                      <div>
                        <label className="label">Vertragsdatum *</label>
                        <input
                          type="date"
                          required
                          className="input"
                          value={formData.contractDate}
                          onChange={e => setFormData({...formData, contractDate: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Landlord Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-2">3</span>
                    Vermieter
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="label">Name des Vermieters *</label>
                      <input
                        type="text"
                        required
                        className="input"
                        value={formData.landlordName}
                        onChange={e => setFormData({...formData, landlordName: e.target.value})}
                        placeholder="Immobilien AG"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Adresse *</label>
                        <input
                          type="text"
                          required
                          className="input"
                          value={formData.landlordAddress}
                          onChange={e => setFormData({...formData, landlordAddress: e.target.value})}
                          placeholder="Hausverwaltung 1"
                        />
                      </div>
                      <div>
                        <label className="label">PLZ & Ort *</label>
                        <input
                          type="text"
                          required
                          className="input"
                          value={formData.landlordCity}
                          onChange={e => setFormData({...formData, landlordCity: e.target.value})}
                          placeholder="8000 Zürich"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* What you get */}
                <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                  <h4 className="font-semibold mb-3">Was du erhältst:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✓ Alle Funktionen von Service 1 (Analyse)</li>
                    <li>✓ Fertiges Herabsetzungsbegehren als PDF</li>
                    <li>✓ Rechtssicher nach Art. 13 VMWG</li>
                    <li>✓ Personalisiert mit all deinen Daten</li>
                    <li>✓ Bereit zum Ausdrucken & Versenden</li>
                    <li>✓ Anleitung für Einschreiben-Versand</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handlePayment}
                  className="btn btn-primary w-full text-lg"
                >
                  Jetzt für CHF 50 Dokument erstellen →
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border-2 border-green-500 p-6 rounded-lg text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold text-green-800 mb-2">
                    Dokument erfolgreich erstellt!
                  </h3>
                  <p className="text-gray-700">
                    Dein rechtssicheres Herabsetzungsbegehren ist bereit.
                  </p>
                </div>

                <div className="text-center">
                  <a
                    href={pdfUrl}
                    download="herabsetzungsbegehren.pdf"
                    className="btn btn-primary inline-block text-lg"
                  >
                    📄 PDF herunterladen
                  </a>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-3">Nächste Schritte:</h4>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li><strong>1.</strong> PDF ausdrucken & unterschreiben</li>
                    <li><strong>2.</strong> Per Einschreiben (A-Post Plus) an Vermieter senden</li>
                    <li><strong>3.</strong> 30 Tage auf Antwort warten</li>
                    <li><strong>4.</strong> Bei Ablehnung: Schlichtungsbehörde kontaktieren</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
