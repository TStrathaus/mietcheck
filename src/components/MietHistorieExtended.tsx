// src/components/MietHistorieExtended.tsx
'use client';

import { useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import {
  MietAnpassung,
  MietHistorie as MietHistorieType,
  validateMietHistorieDetailed,
  berechneMiete,
  formatSollIstVergleich,
  REFERENZZINSSATZ_HISTORIE,
} from '@/lib/miet-calculator-extended';
import { validateFile, showSuccessToast, showErrorToast } from '@/lib/api-utils';

interface MietHistorieExtendedProps {
  vertragsbeginn: {
    datum: string;
    miete: number;
    referenzzinssatz: number;
  };
  onHistorieChange: (historie: MietHistorieType) => void;
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
}: MietHistorieExtendedProps) {
  const [anpassungen, setAnpassungen] = useState<MietAnpassung[]>([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStep, setUploadStep] = useState<'idle' | 'validating' | 'uploading' | 'analyzing' | 'complete' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [analyzedData, setAnalyzedData] = useState<AnalyzeResult | null>(null);
  const [blobUrl, setBlobUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // Reset upload state
  const resetUploadState = () => {
    setUploadStep('idle');
    setUploadProgress(0);
    setUploadError(null);
    setUploadedFileName('');
    setAnalyzedData(null);
    setBlobUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload & Analyze Document
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadedFileName(file.name);

    // Step 1: Validate
    setUploadStep('validating');
    setUploadProgress(10);

    const validation = validateFile(file, {
      maxSize: 10 * 1024 * 1024,
      allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    });

    if (!validation.valid) {
      setUploadStep('error');
      setUploadError(validation.error || 'Ungültige Datei');
      showErrorToast(new Error(validation.error));
      return;
    }

    try {
      // Step 2: Upload to Blob
      setUploadStep('uploading');
      setUploadProgress(30);
      console.log('📤 Uploading adjustment document...');

      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload-url',
      });

      setBlobUrl(blob.url);
      console.log('✅ Upload successful:', blob.url);
      setUploadProgress(50);

      // Step 3: Analyze with Gemini
      setUploadStep('analyzing');
      setUploadProgress(70);
      console.log('🤖 Analyzing adjustment document...');

      const analyzeResponse = await fetch('/api/analyze-anpassung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blobUrl: blob.url, fileType: file.type }),
      });

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Analyse fehlgeschlagen');
      }

      const result = await analyzeResponse.json();
      console.log('✅ Analysis complete:', result);

      setUploadStep('complete');
      setUploadProgress(100);
      setAnalyzedData(result.data);
      showSuccessToast('Dokument erfolgreich analysiert!');

    } catch (error: any) {
      console.error('❌ Upload/Analysis error:', error);
      setUploadStep('error');
      setUploadError(error.message || 'Ein Fehler ist aufgetreten');
      showErrorToast(error, error.message);
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
    showSuccessToast('Anpassung hinzugefügt!');

    // Reset
    resetUploadState();
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
          <p className="text-sm text-gray-600">
            Laden Sie einen Mieterhöhungs- oder Reduktionsbrief hoch (PDF, JPG oder PNG)
          </p>

          {!analyzedData ? (
            <div className="space-y-4">
              {/* Drop Zone - gleich wie FileUpload */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  ['validating', 'uploading', 'analyzing'].includes(uploadStep)
                    ? 'border-green-400 bg-green-100'
                    : uploadStep === 'complete'
                    ? 'border-green-500 bg-green-100'
                    : uploadStep === 'error'
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 hover:border-green-500 hover:bg-green-100 bg-white'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  disabled={['validating', 'uploading', 'analyzing'].includes(uploadStep)}
                  className="hidden"
                  id="anpassung-file-upload"
                />
                <label
                  htmlFor="anpassung-file-upload"
                  className={`cursor-pointer ${['validating', 'uploading', 'analyzing'].includes(uploadStep) ? 'cursor-not-allowed' : ''}`}
                >
                  {/* Icon based on state */}
                  <div className="text-5xl mb-3">
                    {uploadStep === 'idle' && '📄'}
                    {uploadStep === 'validating' && '🔍'}
                    {uploadStep === 'uploading' && '📤'}
                    {uploadStep === 'analyzing' && '🤖'}
                    {uploadStep === 'complete' && '✅'}
                    {uploadStep === 'error' && '❌'}
                  </div>

                  {/* Status message */}
                  <div className={`text-base font-medium mb-1 ${
                    uploadStep === 'error' ? 'text-red-700' :
                    uploadStep === 'complete' ? 'text-green-700' :
                    ['validating', 'uploading', 'analyzing'].includes(uploadStep) ? 'text-green-700' :
                    'text-gray-700'
                  }`}>
                    {uploadStep === 'idle' && 'Dokument hochladen'}
                    {uploadStep === 'validating' && 'Datei wird geprüft...'}
                    {uploadStep === 'uploading' && 'Wird hochgeladen...'}
                    {uploadStep === 'analyzing' && 'KI analysiert das Dokument...'}
                    {uploadStep === 'complete' && 'Analyse abgeschlossen!'}
                    {uploadStep === 'error' && 'Fehler aufgetreten'}
                  </div>

                  {/* File name or instructions */}
                  <div className="text-sm text-gray-500">
                    {uploadedFileName || 'PDF, JPG oder PNG (max. 10 MB)'}
                  </div>
                </label>
              </div>

              {/* Progress Bar */}
              {['validating', 'uploading', 'analyzing'].includes(uploadStep) && (
                <div className="relative">
                  <div className="overflow-hidden h-2 text-xs flex rounded-full bg-green-100">
                    <div
                      style={{ width: `${uploadProgress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-600 transition-all duration-500"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">Fortschritt</span>
                    <span className="text-xs text-green-600 font-medium">{uploadProgress}%</span>
                  </div>
                </div>
              )}

              {/* Processing Status */}
              {['validating', 'uploading', 'analyzing'].includes(uploadStep) && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-3" />
                    <div>
                      <p className="text-green-800 font-medium text-sm">
                        {uploadStep === 'uploading' && 'Ihre Datei wird sicher hochgeladen...'}
                        {uploadStep === 'analyzing' && 'Die KI analysiert Ihr Dokument...'}
                        {uploadStep === 'validating' && 'Datei wird überprüft...'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error with Retry */}
              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <span className="text-red-500 mr-2">❌</span>
                    <div className="flex-1">
                      <p className="text-red-800 font-medium text-sm">{uploadError}</p>
                      <button
                        onClick={resetUploadState}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                      >
                        Erneut versuchen
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tip */}
              {uploadStep === 'idle' && (
                <div className="text-center text-sm text-gray-500">
                  <p>💡 Tipp: Für beste Ergebnisse verwenden Sie einen gut lesbaren Scan</p>
                </div>
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
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium"
                >
                  ✓ Übernehmen
                </button>
                <button
                  onClick={resetUploadState}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-medium"
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
            {validation.kritisch.map((line, i) => (
              <p key={i} className={`${i === 0 ? 'text-lg font-bold text-red-900' : 'text-sm text-red-800'}`}>
                {line}
              </p>
            ))}
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
