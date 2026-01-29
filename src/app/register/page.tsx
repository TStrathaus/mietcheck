'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    address: '',
    netRent: '',
    referenceRate: '',
    contractDate: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registrierung fehlgeschlagen')
      }

      // Success
      alert('✅ Registrierung erfolgreich! Du erhältst eine E-Mail sobald der Referenzzinssatz sinkt.')
      router.push('/')
    } catch (err: any) {
      setError(err.message)
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
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h1 className="text-3xl font-bold mb-2">Service 0: Kostenlose Registrierung</h1>
            <p className="text-gray-600 mb-8">
              Erhalte eine E-Mail sobald der Referenzzinssatz sinkt und spare automatisch bei deiner Miete.
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Deine Daten</h3>
                
                <div className="mb-4">
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
                  <label className="label">Name</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Max Muster"
                  />
                </div>
              </div>

              {/* Contract Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Mietvertrag</h3>
                
                <div className="mb-4">
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

                <div className="grid md:grid-cols-2 gap-4 mb-4">
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
                  <p className="text-sm text-gray-500 mt-1">
                    Wann hast du den Vertrag unterschrieben oder die letzte Mietanpassung erhalten?
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  ✓ Kostenlos und unverbindlich<br/>
                  ✓ Jederzeit kündbar<br/>
                  ✓ Deine Daten sind sicher (SSL-verschlüsselt)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full text-lg"
              >
                {loading ? 'Wird registriert...' : 'Kostenlos registrieren →'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Mit der Registrierung akzeptierst du unsere{' '}
            <Link href="/agb" className="text-primary hover:underline">AGB</Link> und{' '}
            <Link href="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
