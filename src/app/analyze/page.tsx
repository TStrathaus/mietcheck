// src/app/analyze/page.tsx - With complete data transfer to Service 2
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';
import MietHistorieExtended from '@/components/MietHistorieExtended';
import { ContractData } from '@/lib/contract-analyzer';
import { MietHistorie } from '@/lib/miet-calculator-extended';
import { showSuccess, showError, showLoading, dismissToast, toastMessages, getErrorMessage } from '@/lib/toast';

export default function AnalyzePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    address: '',
    netRent: '',
    currentRate: '1.25',
    contractDate: '',
  });

  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [mietHistorie, setMietHistorie] = useState<MietHistorie | null>(null);
  const [showHistorie, setShowHistorie] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Handle analysis completion from FileUpload
  const handleAnalysisComplete = (data: ContractData) => {
    console.log('📊 Auto-filling form with analyzed data:', data);

    // Save complete contract data
    setContractData(data);

    // Auto-fill form fields
    setFormData({
      address: data.address,
      netRent: data.netRent.toString(),
      currentRate: data.referenceRate.toString(),
      contractDate: data.contractDate,
    });

    // Show MietHistorie component
    setShowHistorie(true);
    showSuccess('Vertragsdaten erfolgreich extrahiert!');
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle MietHistorie changes
  const handleHistorieChange = (historie: MietHistorie) => {
    setMietHistorie(historie);
  };

  // Navigate to Service 2 with complete data
  const handleNavigateToGenerate = () => {
    // Prepare complete data package
    const completeData = {
      contract: {
        address: formData.address,
        landlordName: contractData?.landlordName || '',
        landlordAddress: contractData?.landlordAddress || '',
        contractDate: formData.contractDate,
        netRent: parseFloat(formData.netRent),
        referenceRate: parseFloat(formData.currentRate),
      },
      calculation: {
        currentRent: result.currentRent,
        newRent: result.newRent,
        monthlyReduction: result.monthlyReduction,
        yearlySavings: result.yearlySavings,
      },
      historie: mietHistorie,
      hasHistory: result.hasHistory || false,
      einsparungDetails: result.einsparungDetails || null,
      validation: result.validation || null,
    };

    // Save to sessionStorage (better than localStorage - clears on tab close)
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('mietCheckData', JSON.stringify(completeData));
      console.log('💾 Saved complete data to sessionStorage:', completeData);
    }

    showSuccess('Daten gespeichert - Weiterleitung...');

    // Navigate to generate page
    router.push('/generate');
  };

  // Validate form before submission
  const validateForm = (): string | null => {
    if (!formData.address.trim()) {
      return 'Bitte geben Sie die Adresse der Mietwohnung ein';
    }
    if (!formData.netRent || parseFloat(formData.netRent) <= 0) {
      return 'Bitte geben Sie eine gültige Nettomiete ein';
    }
    if (parseFloat(formData.netRent) < 100) {
      return 'Die Nettomiete scheint zu niedrig zu sein (< CHF 100)';
    }
    if (parseFloat(formData.netRent) > 20000) {
      return 'Die Nettomiete scheint zu hoch zu sein (> CHF 20\'000). Bitte prüfen Sie die Eingabe.';
    }
    if (!formData.contractDate) {
      return 'Bitte geben Sie das Vertragsdatum ein';
    }
    const contractDate = new Date(formData.contractDate);
    const now = new Date();
    if (contractDate > now) {
      return 'Das Vertragsdatum kann nicht in der Zukunft liegen';
    }
    if (contractDate < new Date('1990-01-01')) {
      return 'Das Vertragsdatum scheint zu weit in der Vergangenheit zu liegen';
    }
    return null;
  };

  // Submit calculation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      showError(validationError);
      return;
    }

    setLoading(true);
    setResult(null);

    const loadingToast = showLoading('Berechnung läuft...');

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
          newReferenceRate: 1.25, // Current rate (2026-02-01)
          contractDate: formData.contractDate,
          mietHistorie: mietHistorie, // Include history if available
        }),
      });

      dismissToast(loadingToast);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Berechnung fehlgeschlagen');
      }

      setResult(data);

      // Show appropriate message based on result
      if (data.monthlyReduction > 0) {
        showSuccess(`Sie können CHF ${data.monthlyReduction.toFixed(2)}/Monat sparen!`);
      } else {
        showError('Leider kein Einsparungspotential gefunden. Der aktuelle Referenzzinssatz ist bereits optimal für Sie.');
      }
    } catch (err) {
      dismissToast(loadingToast);
      const errorMessage = getErrorMessage(err);
      showError(errorMessage);
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
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
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
                📍 Adresse der Mietwohnung *
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
                💰 Nettomiete (CHF/Monat) *
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
                Grundmiete ohne Nebenkosten (CHF 100 - 20'000)
              </p>
            </div>

            {/* Reference Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 Referenzzinssatz bei Vertragsabschluss (%) *
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
                📅 Vertragsdatum *
              </label>
              <input
                type="date"
                name="contractDate"
                value={formData.contractDate}
                onChange={handleInputChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Berechnung läuft...
                </>
              ) : (
                '🧮 Einsparung berechnen'
              )}
            </button>
          </form>

          {/* Results */}
          {result && (
            <div className="mt-8 bg-green-50 border-2 border-green-500 rounded-lg p-6 animate-fadeIn">
              <h3 className="text-2xl font-bold text-green-900 mb-4">
                🎉 Ihr Einsparungspotential
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600">Aktuelle Miete</p>
                  <p className="text-2xl font-bold text-gray-900">
                    CHF {result.currentRent.toFixed(2)}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600">Neue Miete</p>
                  <p className="text-2xl font-bold text-green-600">
                    CHF {result.newRent.toFixed(2)}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600">Monatliche Reduktion</p>
                  <p className="text-2xl font-bold text-blue-600">
                    CHF {result.monthlyReduction.toFixed(2)}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600">Jährliche Einsparung</p>
                  <p className="text-2xl font-bold text-blue-600">
                    CHF {result.yearlySavings.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={handleNavigateToGenerate}
                  className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
                >
                  📄 Weiter zu Service 2: Brief generieren
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  💡 Alle Daten werden automatisch übernommen
                </p>
              </div>
            </div>
          )}
        </div>

        {/* MietHistorie Section */}
        {showHistorie && formData.contractDate && formData.netRent && formData.currentRate && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <MietHistorieExtended
              vertragsbeginn={{
                datum: formData.contractDate,
                miete: parseFloat(formData.netRent),
                referenzzinssatz: parseFloat(formData.currentRate),
              }}
              onHistorieChange={handleHistorieChange}
            />
          </div>
        )}

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
            <li>
              • <strong>NEU:</strong> Erfassen Sie alle bisherigen Mietanpassungen für eine präzisere Berechnung
            </li>
            <li>
              • <strong>NEU:</strong> Alle Daten werden automatisch an Service 2 übergeben - Sie müssen nichts zweimal eingeben!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
