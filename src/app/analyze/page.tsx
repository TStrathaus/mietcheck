'use client'

import FileUpload from '@/components/FileUpload'
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
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'analyze',
        amount: 2000,
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
              <>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Option 1: Mietvertrag hochladen
                  </h3>
                  <FileUpload onFileAnalyzed={(data) => {
                    console.log('File analyzed:', data)
                  }} />
                  
                  <div className="text-center my-8">
                    <div className="inline-block bg-gray-200 px-4 py-2 rounded-full text-sm text-gray-600">
                      oder
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-4">
                    Option 2: Daten manuell eingeben
                  </h3>
                </div>

                <form onSubmit={handleAnalyze} className="space-y-6">
                  <div>
                    <label className="label">E-Mail *</label>
                    <input
                      type="email"
                      required
                      className="input"
                      value={formData.email}
                      onChange={e => setForm