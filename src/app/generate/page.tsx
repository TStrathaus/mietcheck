// src/app/generate/page.tsx - With auto-fill from Service 1 & DB
'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { splitAddress } from '@/lib/address-helper'

// Inner component that uses useSearchParams
function GeneratePageContent() {
  const searchParams = useSearchParams()
  const contractId = searchParams.get('contractId')
  const { data: session } = useSession()

  const [loading, setLoading] = useState(false)
  const [loadingContract, setLoadingContract] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')
  const [autoFilled, setAutoFilled] = useState(false)
  const [dataSource, setDataSource] = useState<'db' | 'session' | 'manual'>('manual')

  const [formData, setFormData] = useState({
    // Tenant
    email: '',
    tenantName: '',
    tenantAddress: '',
    tenantCity: '',

    // Contract
    propertyAddress: '',
    netRent: '',
    newRent: '', // NEU - berechnete Sollmiete
    monthlyReduction: '', // NEU - monatliche Einsparung
    referenceRate: '',
    contractDate: '',

    // Landlord
    landlordName: '',
    landlordAddress: '',
    landlordCity: '',
  })

  // Helper function to fill form from data object
  const fillFormFromData = useCallback((data: any) => {
    const landlord = splitAddress(data.contract?.landlordAddress || '')
    const tenant = splitAddress(data.tenant?.address || data.contract?.address || '')

    setFormData(prev => ({
      ...prev,
      tenantName: data.tenant?.name || '',
      tenantAddress: tenant.street,
      tenantCity: tenant.city,
      propertyAddress: data.contract?.address || '',
      netRent: data.contract?.netRent?.toString() || '',
      newRent: data.calculation?.newRent?.toFixed(2) || '',
      monthlyReduction: data.calculation?.monthlyReduction?.toFixed(2) || '',
      referenceRate: data.contract?.referenceRate?.toString() || '',
      contractDate: data.contract?.contractDate || '',
      landlordName: data.contract?.landlordName || '',
      landlordAddress: landlord.street,
      landlordCity: landlord.city,
    }))

    setAutoFilled(true)
  }, [])

  // Load contract from database
  const loadContractFromDB = useCallback(async (id: string, userSession: any) => {
    setLoadingContract(true)
    try {
      const response = await fetch(`/api/user/contracts/${id}`)
      if (response.ok) {
        const data = await response.json()
        const contract = data.contract

        console.log('📥 Loading contract from DB:', contract)

        // Split addresses
        const landlord = splitAddress(contract.landlord_address || '')
        const tenant = splitAddress(contract.tenant_address || contract.address || '')

        setFormData(prev => ({
          ...prev,
          email: userSession?.user?.email || '',
          tenantName: contract.tenant_name || '',
          tenantAddress: tenant.street,
          tenantCity: tenant.city,
          propertyAddress: contract.address || '',
          netRent: contract.net_rent?.toString() || '',
          newRent: contract.new_rent?.toFixed(2) || '',
          monthlyReduction: contract.monthly_reduction?.toFixed(2) || '',
          referenceRate: contract.reference_rate?.toString() || '',
          contractDate: contract.contract_date?.split('T')[0] || '',
          landlordName: contract.landlord_name || '',
          landlordAddress: landlord.street,
          landlordCity: landlord.city,
        }))

        setAutoFilled(true)
        setDataSource('db')
        console.log('✅ Loaded contract from database')
      } else {
        // Fallback auf sessionStorage
        if (typeof window !== 'undefined') {
          const savedData = sessionStorage.getItem('mietCheckData')
          if (savedData) {
            fillFormFromData(JSON.parse(savedData))
            setDataSource('session')
          }
        }
      }
    } catch (error) {
      console.error('❌ Error loading from DB:', error)
      // Fallback auf sessionStorage
      if (typeof window !== 'undefined') {
        const savedData = sessionStorage.getItem('mietCheckData')
        if (savedData) {
          fillFormFromData(JSON.parse(savedData))
          setDataSource('session')
        }
      }
    } finally {
      setLoadingContract(false)
    }
  }, [fillFormFromData])

  // Load contract from database if contractId is provided
  useEffect(() => {
    if (contractId && session?.user) {
      loadContractFromDB(contractId, session)
    }
  }, [contractId, session, loadContractFromDB])

  // Fallback: Load from sessionStorage
  useEffect(() => {
    // Nur laden wenn kein contractId oder DB-Laden fehlgeschlagen
    if (!contractId && typeof window !== 'undefined' && window.sessionStorage) {
      const savedData = sessionStorage.getItem('mietCheckData')

      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          console.log('📥 Loading data from sessionStorage:', data)
          fillFormFromData(data)
          setDataSource('session')
        } catch (error) {
          console.error('❌ Error loading sessionStorage data:', error)
        }
      }
    }
  }, [contractId, fillFormFromData])

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
                {autoFilled && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">
                      ✓ Daten automatisch aus Mietvertrag-Analyse übernommen
                    </p>
                    <p className="text-xs text-gray-500">
                      Alle Felder können von Ihnen angepasst werden
                    </p>
                  </div>
                )}
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
                    Deine Daten (Mieter)
                    {autoFilled && formData.tenantName && (
                      <span className="ml-2 text-sm text-green-600">(aus Vertrag)</span>
                    )}
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
                    {autoFilled && (
                      <span className="ml-2 text-sm text-green-600">(automatisch ausgefüllt)</span>
                    )}
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

                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <label className="label">Aktuelle Miete (CHF) *</label>
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
                        <label className="label">Neue Miete (CHF) *</label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          className="input bg-green-50"
                          value={formData.newRent}
                          onChange={e => setFormData({...formData, newRent: e.target.value})}
                          placeholder="1900"
                        />
                        <p className="text-xs text-green-600 mt-1">Berechnete Sollmiete</p>
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
                          <option value="1.25">1.25%</option>
                          <option value="1.50">1.50%</option>
                          <option value="1.75">1.75%</option>
                          <option value="2.00">2.00%</option>
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

                    {formData.monthlyReduction && parseFloat(formData.monthlyReduction) > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-green-800">
                          💰 Monatliche Einsparung: CHF {parseFloat(formData.monthlyReduction).toFixed(2)}
                        </p>
                        <p className="text-sm text-green-600">
                          Jährlich: CHF {(parseFloat(formData.monthlyReduction) * 12).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Landlord Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-2">3</span>
                    Vermieter
                    {autoFilled && (
                      <span className="ml-2 text-sm text-green-600">(automatisch ausgefüllt)</span>
                    )}
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

// Loading component for Suspense fallback
function GeneratePageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Daten werden geladen...</p>
      </div>
    </div>
  )
}

// Main export wrapped in Suspense boundary
export default function GeneratePage() {
  return (
    <Suspense fallback={<GeneratePageLoading />}>
      <GeneratePageContent />
    </Suspense>
  )
}
