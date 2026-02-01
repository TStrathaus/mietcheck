// src/app/analyze/page.tsx (Enhanced Version)
'use client';

import { useState } from 'react';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';
import { ContractData } from '@/lib/contract-analyzer';

export default function AnalyzePage() {
  const [formData, setFormData] = useState({
    address: '',
    netRent: '',
    currentRate: '1.25',
    contractDate: '',
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle analysis completion from FileUpload
  const handleAnalysisComplete = (data: ContractData) => {
    console.log('📊 Auto-filling form with analyzed data:', data);
    
    // Auto-fill form fields
    setFormData({
      address: data.address,
      netRent: data.netRent.toString(),
      currentRate: data.referenceRate.toString(),
      contractDate: data.contractDate,
    });

    // Show success notification
    setError(null);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit calculation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: formData.address,
          currentRent: parseFloat(formData.netRent),
          currentReferenceRate: parseFloat(formData.currentRate),
          newReferenceRate: 1.25, // Current rate (2025-09-02)
          contractDate: formData.contractDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Berechnung fehlgeschlagen');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Zurück zur Startseite
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Service 1: Mietvertrag-Analyse
          </h1>
          <p className="text-xl text-gray-600">
            Laden Sie Ihren Mietvertrag hoch für eine automatische Analyse
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 inline-block">
            <p className="text-sm text-blue-800">
              💰 <strong>Kosten:</strong> CHF 20 (einmalig)
            </p>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🤖 Automatische Analyse mit KI
          </h2>
          <p className="text-gray-600 mb-6">
            Laden Sie Ihren Mietvertrag hoch (PDF, JPG oder PNG). Unsere KI extrahiert automatisch:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Adresse der Mietwohnung</li>
            <li>Nettomiete (Grundmiete ohne Nebenkosten)</li>
            <li>Referenzzinssatz bei Vertragsabschluss</li>
            <li>Vertragsdatum</li>
            <li>Vermieterinformationen</li>
          </ul>

          <FileUpload onAnalysisComplete={handleAnalysisComplete} />
        </div>

        {/* Manual Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ✏️ Vertragsdaten {formData.address && '(automatisch ausgefüllt)'}
          </h2>
          <p className="text-gray-600 mb-6">
            {formData.address 
              ? 'Bitte überprüfen Sie die automatisch ausgefüllten Daten und korrigieren Sie sie bei Bedarf.'
              : 'Oder geben Sie die Daten manuell ein, falls Sie keinen Vertrag hochladen möchten.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 Adresse der Mietwohnung
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="z.B. Musterstrasse 123, 8000 Zürich"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Net Rent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💰 Nettomiete (CHF/Monat)
              </label>
              <input
                type="number"
                name="netRent"
                value={formData.netRent}
                onChange={handleInputChange}
                placeholder="z.B. 2000"
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Grundmiete ohne Nebenkosten
              </p>
            </div>

            {/* Reference Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 Referenzzinssatz bei Vertragsabschluss (%)
              </label>
              <select
                name="currentRate"
                value={formData.currentRate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1.25">1.25% (seit Sept 2025)</option>
                <option value="1.50">1.50% (März - Aug 2025)</option>
                <option value="1.75">1.75% (Dez 2023 - Feb 2025)</option>
                <option value="2.00">2.00% oder höher</option>
              </select>
            </div>

            {/* Contract Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Vertragsdatum
              </label>
              <input
                type="date"
                name="contractDate"
                value={formData.contractDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '⏳ Berechnung läuft...' : '🧮 Einsparung berechnen'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">❌ {error}</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="mt-8 bg-green-50 border-2 border-green-500 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-green-900 mb-4">
                🎉 Ihr Einsparungspotential
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Aktuelle Miete</p>
                  <p className="text-2xl font-bold text-gray-900">
                    CHF {result.currentRent.toFixed(2)}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Neue Miete</p>
                  <p className="text-2xl font-bold text-green-600">
                    CHF {result.newRent.toFixed(2)}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Monatliche Reduktion</p>
                  <p className="text-2xl font-bold text-blue-600">
                    CHF {result.monthlyReduction.toFixed(2)}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Jährliche Einsparung</p>
                  <p className="text-2xl font-bold text-blue-600">
                    CHF {result.yearlySavings.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href={`/generate?${new URLSearchParams({
                    address: formData.address,
                    netRent: formData.netRent,
                    newRent: result.newRent.toString(),
                    contractDate: formData.contractDate,
                  })}`}
                  className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
                >
                  📄 Weiter zu Service 2: Brief generieren
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            ℹ️ Wichtige Hinweise
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>
              • Die Berechnung basiert auf Art. 13 VMWG (Mietrecht)
            </li>
            <li>
              • Der aktuelle Referenzzinssatz beträgt 1.25% (seit Sept 2025)
            </li>
            <li>
              • Nur Mietverträge mit Referenzzinssatz-Klausel sind berechtigt
            </li>
            <li>
              • Die KI-Analyse ist ein Hilfsmittel - bitte prüfen Sie die Daten
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
