// src/components/FileUpload.tsx (Enhanced Version)
'use client';

import { useState, useCallback } from 'react';
import { ContractData } from '@/lib/contract-analyzer';

interface FileUploadProps {
  onAnalysisComplete?: (data: ContractData) => void;
}

export default function FileUpload({ onAnalysisComplete }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<ContractData | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  // Handle drag & drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Validate file
  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    setUploadSuccess(false);
    setAnalysisResult(null);

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Nur PDF, JPG und PNG Dateien sind erlaubt.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      setError('Datei ist zu gross. Maximum: 10MB.');
      return;
    }

    setFile(selectedFile);
  };

  // Upload and analyze file
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Step 1: Upload file
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload fehlgeschlagen');
      }

      const uploadData = await uploadResponse.json();
      setUploadSuccess(true);
      setExtractedText(uploadData.extractedText || '');

      console.log('✅ Upload successful');
      console.log('📄 Extracted text length:', uploadData.extractedText?.length || 0);

      // Step 2: Analyze contract with GPT-4
      if (uploadData.extractedText && uploadData.extractedText.length > 50) {
        setAnalyzing(true);
        
        const analysisResponse = await fetch('/api/analyze-contract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            extractedText: uploadData.extractedText,
          }),
        });

        const analysisData = await analysisResponse.json();

        if (analysisData.success && analysisData.data) {
          console.log('✅ Analysis successful');
          console.log('📊 Contract data:', analysisData.data);
          
          setAnalysisResult(analysisData.data);
          
          // Notify parent component
          if (onAnalysisComplete) {
            onAnalysisComplete(analysisData.data);
          }
        } else {
          throw new Error(analysisData.error || 'Analyse fehlgeschlagen');
        }
      } else {
        setError('Text konnte nicht extrahiert werden oder ist zu kurz.');
      }

    } catch (err) {
      console.error('❌ Upload/Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      setUploadSuccess(false);
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get confidence color
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get confidence label
  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'Hoch';
      case 'medium': return 'Mittel';
      case 'low': return 'Niedrig';
      default: return confidence;
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
      >
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          id="file-upload"
          disabled={uploading || analyzing}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="text-gray-600 mb-2">
            📄 Ziehen Sie Ihren Mietvertrag hierher oder klicken Sie zum Auswählen
          </div>
          <div className="text-sm text-gray-500">
            PDF, JPG oder PNG (max. 10MB)
          </div>
        </label>
      </div>

      {/* Selected File Display */}
      {file && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setError(null);
                setUploadSuccess(false);
                setAnalysisResult(null);
              }}
              className="text-red-600 hover:text-red-700"
              disabled={uploading || analyzing}
            >
              ✕ Entfernen
            </button>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {file && !uploadSuccess && (
        <button
          onClick={handleUpload}
          disabled={uploading || analyzing}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? '⏳ Wird hochgeladen...' : '🚀 Hochladen & Analysieren'}
        </button>
      )}

      {/* Loading States */}
      {analyzing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent"></div>
            <p className="text-blue-800 font-medium">
              🤖 GPT-4 analysiert Ihren Vertrag...
            </p>
          </div>
          <p className="text-sm text-blue-600 mt-2">
            Dies kann 10-30 Sekunden dauern
          </p>
        </div>
      )}

      {/* Success Message */}
      {uploadSuccess && !analyzing && !analysisResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">✅ Datei erfolgreich hochgeladen!</p>
          {extractedText && (
            <p className="text-sm text-green-600 mt-1">
              📄 {extractedText.length} Zeichen extrahiert
            </p>
          )}
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="bg-white border-2 border-green-500 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              ✅ Vertragsanalyse abgeschlossen
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(analysisResult.confidence)}`}>
              {getConfidenceLabel(analysisResult.confidence)} Konfidenz
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">📍 Adresse</p>
              <p className="font-medium text-gray-900">{analysisResult.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">💰 Nettomiete</p>
              <p className="font-medium text-gray-900">CHF {analysisResult.netRent.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">📊 Referenzzinssatz</p>
              <p className="font-medium text-gray-900">{analysisResult.referenceRate}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">📅 Vertragsdatum</p>
              <p className="font-medium text-gray-900">
                {new Date(analysisResult.contractDate).toLocaleDateString('de-CH')}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">🏢 Vermieter</p>
              <p className="font-medium text-gray-900">{analysisResult.landlordName}</p>
              <p className="text-sm text-gray-700">{analysisResult.landlordAddress}</p>
            </div>
          </div>

          {analysisResult.missingFields && analysisResult.missingFields.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ Folgende Felder konnten nicht automatisch extrahiert werden:
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                {analysisResult.missingFields.join(', ')}
              </p>
            </div>
          )}

          <p className="text-sm text-gray-600 italic">
            💡 Die Felder im Formular wurden automatisch ausgefüllt. Bitte überprüfen Sie die Daten.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">❌ {error}</p>
        </div>
      )}
    </div>
  );
}
