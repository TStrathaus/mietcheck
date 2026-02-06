// src/components/MietHistorieExtended.tsx
'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import {
  MietAnpassung,
  MietHistorie as MietHistorieType,
  validateMietHistorieDetailed,
  berechneMiete,
  formatSollIstVergleich,
  REFERENZZINSSATZ_HISTORIE,
  DetailValidation,
} from '@/lib/miet-calculator-extended';

interface MietHistorieExtendedProps {
  vertragsbeginn: {
    datum: string;
    miete: number;
    referenzzinssatz: number;
  };
  onHistorieChange: (historie: MietHistorieType) => void;
  onValidationChange?: (validation: DetailValidation) => void;
}

interface AnalyzeResult {
  datum: string;
  alteMiete: number;
  neueMiete: number;
  alterReferenzzinssatz: number;
  neuerReferenzzinssatz: number;
  begruendung: string;
  typ: 'erhöhung' | 'reduzierung';
  zusaetzlicheGruende?: string[];
}

export default function MietHistorieExtended({
  vertragsbeginn,
  onHistorieChange,
  onValidationChange,
}: MietHistorieExtendedProps) {
  const [anpassungen, setAnpassungen] = useState<MietAnpassung[]>([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<AnalyzeResult | null>(null);
  const [blobUrl, setBlobUrl] = useState<string>('');
  
  // Manual form state
  const [newDatum, setNewDatum] = useState('');
  const [newZins, setNewZins] = useState('');
  const [newMiete, setNewMiete] = useState('');
  const [newBegruendung, setNewBegruendung] = useState('');
  const [zusatzGruende, setZusatzGruende] = useState<string[]>([]);

  const startAnpassung: MietAnpassung = {
    datum: vertragsbeginn.datum,
    referenzzinssatz: vertragsbeginn.referenzzinssatz,
    miete: vertragsbeginn.miete,
    typ: 'start',
  };

  const aktuelleAnpassung =
    anpassungen.length > 0 ? anpassungen[anpassungen.length - 1] : startAnpassung;

  const historie: MietHistorieType = {
    vertragsbeginn: startAnpassung,
    anpassungen,
    aktuell: aktuelleAnpassung,
  };

  // Auto-Berechnung der Miete
  const handleZinsChange = (zins: string) => {
    setNewZins(zins);
    if (zins && !isNaN(parseFloat(zins))) {
      const vorherZins = aktuelleAnpassung.referenzzinssatz;
      const vorherMiete = aktuelleAnpassung.miete;
      const berechneteMinete = berechneMiete(
        vorherMiete,
        vorherZins,
        parseFloat(zins)
      );
      setNewMiete(berechneteMinete.toFixed(2));
    }
  };

  // Upload & Analyze Document
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Step 1: Upload to Blob
      console.log('📤 Uploading adjustment document...');
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload-url',
      });
      
      setBlobUrl(blob.url);
      console.log('✅ Upload successful:', blob.url);

      // Step 2: Analyze with Gemini
      console.log('🤖 Analyzing adjustment document...');
      const analyzeResponse = await fetch('/api/analyze-anpassung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blobUrl: blob.url, fileType: file.type }),
      });

      if (!analyzeResponse.ok) {
        throw new Error('Analyse fehlgeschlagen');
      }

      const result = await analyzeResponse.json();
      console.log('✅ Analysis complete:', result);
      
      setAnalyzedData(result.data);
      
    } catch (error: any) {
      console.error('❌ Upload/Analysis error:', error);
      alert('Fehler: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Accept analyzed data
  const handleAcceptAnalyzed = () => {
    if (!analyzedData) return;

    const neueAnpassung: MietAnpassung = {
      datum: analyzedData.datum,
      referenzzinssatz: analyzedData.neuerReferenzzinssatz,
      miete: analyzedData.neueMiete,
      typ: analyzedData.typ,
      begründung: analyzedData.begruendung,
      dokumentUrl: blobUrl,
      zusaetzlicheGruende: analyzedData.zusaetzlicheGruende,
    };

    addAnpassung(neueAnpassung);
    
    // Reset
    setAnalyzedData(null);
    setBlobUrl('');
    setShowUploadModal(false);
  };

  // Manual add
  const handleAddManual = () => {
    if (!newDatum || !newZins || !newMiete) {
      alert('Bitte alle Pflichtfelder ausfüllen');
      return;
    }

    const typ =
      parseFloat(newMiete) > aktuelleAnpassung.miete ? 'erhöhung' : 'reduzierung';

    const neueAnpassung: MietAnpassung = {
      datum: newDatum,
      referenzzinssatz: parseFloat(newZins),
      miete: parseFloat(newMiete),
      typ,
      begründung: newBegruendung || undefined,
      zusaetzlicheGruende: zusatzGruende.length > 0 ? zusatzGruende : undefined,
    };

    addAnpassung(neueAnpassung);

    // Reset
    setNewDatum('');
    setNewZins('');
    setNewMiete('');
    setNewBegruendung('');
    setZusatzGruende([]);
    setShowManualForm(false);
  };

  // Helper to add anpassung
  const addAnpassung = (neueAnpassung: MietAnpassung) => {
    const neueAnpassungen = [...anpassungen, neueAnpassung].sort(
      (a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime()
    );

    setAnpassungen(neueAnpassungen);

    const neueHistorie: MietHistorieType = {
      vertragsbeginn: startAnpassung,
      anpassungen: neueAnpassungen,
      aktuell: neueAnpassung,
    };

    onHistorieChange(neueHistorie);
  };

  const handleRemoveAnpassung = (index: number) => {
    const neueAnpassungen = anpassungen.filter((_, i) => i !== index);
    setAnpassungen(neueAnpassungen);

    const neueHistorie: MietHistorieType = {
      vertragsbeginn: startAnpassung,
      anpassungen: neueAnpassungen,
      aktuell:
        neueAnpassungen.length > 0
          ? neueAnpassungen[neueAnpassungen.length - 1]
          : startAnpassung,
    };

    onHistorieChange(neueHistorie);
  };

  // Detaillierte Validierung
  const validation = validateMietHistorieDetailed(historie);

  // Notify parent component of validation changes
  if (onValidationChange) {
    onValidationChange(validation);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-xl font-bold text-gray-900">
          📊 Mietanpassungs-Historie
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUploadModal(!showUploadModal)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            {showUploadModal ? '✕ Abbrechen' : '📄 Dokument hochladen'}
          </button>
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {showManualForm ? '✕ Abbrechen' : '✏️ Manuell erfassen'}
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-sm">
        Laden Sie Mieterhöhungs-/Reduktionsbriefe hoch oder erfassen Sie Anpassungen manuell. 
        Das System validiert automatisch die Berechnungen und zeigt Ihr Einsparungspotential.
      </p>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
          <h4 className="font-bold text-gray-900">📄 Anpassungs-Dokument hochladen</h4>
          
          {!analyzedData ? (
            <div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                disabled={uploading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              {uploading && (
                <p className="text-sm text-green-600 mt-2">
                  ⏳ Wird analysiert...
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white border border-gray-300 rounded-lg p-4 space-y-3">
                <h5 className="font-bold text-gray-900">📋 Analysierte Daten:</h5>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-gray-600">Datum</label>
                    <input
                      type="date"
                      value={analyzedData.datum}
                      onChange={(e) => setAnalyzedData({...analyzedData, datum: e.target.value})}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-600">Typ</label>
                    <p className="font-medium">{analyzedData.typ === 'erhöhung' ? '↑ Erhöhung' : '↓ Reduzierung'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-600">Alt: Referenzzins</label>
                    <input
                      type="number"
                      step="0.25"
                      value={analyzedData.alterReferenzzinssatz}
                      onChange={(e) => setAnalyzedData({...analyzedData, alterReferenzzinssatz: parseFloat(e.target.value)})}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-600">Neu: Referenzzins</label>
                    <input
                      type="number"
                      step="0.25"
                      value={analyzedData.neuerReferenzzinssatz}
                      onChange={(e) => setAnalyzedData({...analyzedData, neuerReferenzzinssatz: parseFloat(e.target.value)})}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-600">Alt: Miete (CHF)</label>
                    <p className="font-medium">CHF {analyzedData.alteMiete.toFixed(2)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-600">Neu: Miete (CHF)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={analyzedData.neueMiete}
                      onChange={(e) => setAnalyzedData({...analyzedData, neueMiete: parseFloat(e.target.value)})}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-600 text-sm">Begründung</label>
                  <textarea
                    value={analyzedData.begruendung}
                    onChange={(e) => setAnalyzedData({...analyzedData, begruendung: e.target.value})}
                    className="w-full px-2 py-1 border rounded text-sm"
                    rows={2}
                  />
                </div>
                
                {analyzedData.zusaetzlicheGruende && analyzedData.zusaetzlicheGruende.length > 0 && (
                  <div>
                    <label className="block text-gray-600 text-sm">Zusätzliche Gründe</label>
                    <p className="text-sm">{analyzedData.zusaetzlicheGruende.join(', ')}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAcceptAnalyzed}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  ✓ Übernehmen
                </button>
                <button
                  onClick={() => {
                    setAnalyzedData(null);
                    setBlobUrl('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  ✕ Ablehnen
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Form */}
      {showManualForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
          <h4 className="font-bold text-gray-900">✏️ Manuelle Erfassung</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datum *
              </label>
              <input
                type="date"
                value={newDatum}
                onChange={(e) => setNewDatum(e.target.value)}
                min={aktuelleAnpassung.datum}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neuer Referenzzinssatz (%) *
              </label>
              <input
                type="number"
                step="0.25"
                value={newZins}
                onChange={(e) => handleZinsChange(e.target.value)}
                placeholder="z.B. 1.50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neue Miete (CHF) *
              </label>
              <input
                type="number"
                step="0.01"
                value={newMiete}
                onChange={(e) => setNewMiete(e.target.value)}
                placeholder="Auto-berechnet"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Wird automatisch berechnet
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Begründung (optional)
            </label>
            <textarea
              value={newBegruendung}
              onChange={(e) => setNewBegruendung(e.target.value)}
              placeholder="z.B. Erhöhung gemäß Brief vom..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zusätzliche Gründe (optional)
            </label>
            <div className="flex gap-2 flex-wrap">
              {['Teuerung', 'Kostensteigerung', 'Wertvermehrung'].map(grund => (
                <button
                  key={grund}
                  type="button"
                  onClick={() => {
                    if (zusatzGruende.includes(grund)) {
                      setZusatzGruende(zusatzGruende.filter(g => g !== grund));
                    } else {
                      setZusatzGruende([...zusatzGruende, grund]);
                    }
                  }}
                  className={`px-3 py-1 rounded text-sm ${
                    zusatzGruende.includes(grund)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {grund}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddManual}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            ✓ Hinzufügen
          </button>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Datum
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Referenzzins
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Miete
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Änderung
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Begründung
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Start */}
              <tr className="bg-blue-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {new Date(startAnpassung.datum).toLocaleDateString('de-CH')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {startAnpassung.referenzzinssatz}%
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  CHF {startAnpassung.miete.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  🏁 Vertragsbeginn
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">-</td>
                <td></td>
              </tr>

              {/* Anpassungen */}
              {anpassungen.map((anpassung, index) => {
                const vorher =
                  index === 0 ? startAnpassung : anpassungen[index - 1];
                const differenz = anpassung.miete - vorher.miete;

                return (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(anpassung.datum).toLocaleDateString('de-CH')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {anpassung.referenzzinssatz}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      CHF {anpassung.miete.toFixed(2)}
                      {anpassung.dokumentUrl && (
                        <a
                          href={anpassung.dokumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:underline text-xs"
                        >
                          📄
                        </a>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                        differenz > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {differenz > 0 ? '↑' : '↓'} CHF {Math.abs(differenz).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {anpassung.begründung || '-'}
                      {anpassung.zusaetzlicheGruende && anpassung.zusaetzlicheGruende.length > 0 && (
                        <span className="text-orange-600 ml-1">
                          +{anpassung.zusaetzlicheGruende.length}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleRemoveAnpassung(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Soll-Ist Vergleich */}
      {validation.sollIstVergleiche.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-bold text-gray-900 mb-3">🔍 Soll-Ist Vergleich</h4>
          <div className="space-y-1 text-sm font-mono">
            {validation.sollIstVergleiche.map((v, i) => (
              <div key={i}>{formatSollIstVergleich(v)}</div>
            ))}
          </div>
        </div>
      )}

      {/* Übersprungene Schritte */}
      {validation.uebersprungeneSchritte.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-bold text-yellow-900 mb-2">⚠️ Übersprungene Zinsänderungen</h4>
          {validation.uebersprungeneSchritte.map((schritt, i) => (
            <p key={i} className="text-sm text-yellow-800">{schritt}</p>
          ))}
        </div>
      )}

      {/* Falsche Berechnungen */}
      {validation.falscheberechnungen.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-bold text-orange-900 mb-2">⚠️ Mögliche Berechnungsfehler</h4>
          {validation.falscheberechnungen.map((fehler, i) => (
            <p key={i} className="text-sm text-orange-800 mb-2">{fehler}</p>
          ))}
        </div>
      )}

      {/* Warnungen */}
      {validation.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-bold text-yellow-900 mb-2">⚠️ Hinweise</h4>
          {validation.warnings.map((warning, i) => (
            <p key={i} className="text-sm text-yellow-800 mb-2">{warning}</p>
          ))}
        </div>
      )}

      {/* KRITISCH */}
      {validation.kritisch.length > 0 && (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
          <div className="space-y-2">
            {validation.kritisch.map((line, i) => {
              if (i === 0) {
                // First line - KRITISCH message
                return <p key={i} className="text-2xl font-bold text-red-900">{line}</p>;
              } else if (i === 1 && line.includes('Jährliche Ersparnis')) {
                // Second line - Yearly savings
                return <p key={i} className="text-3xl font-extrabold text-red-900">{line}</p>;
              } else {
                // Other lines
                return <p key={i} className="text-sm text-red-800">{line}</p>;
              }
            })}
          </div>
        </div>
      )}

      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-bold text-red-900 mb-2">❌ Fehler</h4>
          {validation.errors.map((error, i) => (
            <p key={i} className="text-sm text-red-800">{error}</p>
          ))}
        </div>
      )}

      {/* Aktueller Status */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="font-bold text-gray-900 mb-4">📍 Aktueller Status</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Aktuelle Miete</p>
            <p className="text-2xl font-bold text-gray-900">
              CHF {aktuelleAnpassung.miete.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              Basierend auf {aktuelleAnpassung.referenzzinssatz}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Aktueller Referenzzins</p>
            <p className="text-2xl font-bold text-gray-900">
              {REFERENZZINSSATZ_HISTORIE[0].satz}%
            </p>
            <p className="text-xs text-gray-500">
              Stand: {new Date(REFERENZZINSSATZ_HISTORIE[0].datum).toLocaleDateString('de-CH')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
