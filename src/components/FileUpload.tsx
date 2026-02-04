// src/components/FileUpload.tsx
'use client';

import { useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import { ContractData } from '@/lib/contract-analyzer';
import {
  validateFile,
  fetchWithRetry,
  getErrorMessage,
  parseGeminiError,
  showSuccessToast,
  showErrorToast
} from '@/lib/api-utils';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onAnalysisComplete: (data: ContractData) => void;
}

type UploadStep = 'idle' | 'validating' | 'uploading' | 'extracting' | 'analyzing' | 'complete' | 'error';

const stepMessages: Record<UploadStep, string> = {
  idle: 'Mietvertrag hochladen',
  validating: 'Datei wird geprüft...',
  uploading: 'Wird hochgeladen...',
  extracting: 'Text wird extrahiert...',
  analyzing: 'KI analysiert den Vertrag...',
  complete: 'Analyse abgeschlossen!',
  error: 'Fehler aufgetreten',
};

export default function FileUpload({ onAnalysisComplete }: FileUploadProps) {
  const [step, setStep] = useState<UploadStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep('idle');
    setError(null);
    setUploadedFileName('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadedFileName(file.name);

    // Step 1: Validate file
    setStep('validating');
    setProgress(10);

    const validation = validateFile(file, {
      maxSize: 10 * 1024 * 1024,
      allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    });

    if (!validation.valid) {
      setStep('error');
      setError(validation.error || 'Ungültige Datei');
      showErrorToast(new Error(validation.error));
      return;
    }

    try {
      // Step 2: Upload to Vercel Blob
      setStep('uploading');
      setProgress(25);
      console.log('📤 Uploading file:', file.name, file.type);

      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload-url',
      });

      console.log('✅ Upload successful:', blob.url);
      setProgress(40);

      // Step 3: Extract text (PDF or OCR)
      setStep('extracting');
      setProgress(50);
      console.log('🔄 Processing upload with type:', file.type);

      const processResponse = await fetchWithRetry('/api/process-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blobUrl: blob.url,
          fileType: file.type,
        }),
        retries: 2,
        retryDelay: 1500,
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json().catch(() => ({}));
        const errorMsg = getErrorMessage(processResponse.status, errorData.error);
        throw new Error(errorMsg);
      }

      const { extractedText } = await processResponse.json();
      console.log('✅ Text extracted, length:', extractedText?.length);
      setProgress(70);

      // Step 4: Analyze with Gemini
      setStep('analyzing');
      setProgress(80);
      console.log('🤖 Analyzing contract...');

      const analyzeResponse = await fetchWithRetry('/api/analyze-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extractedText }),
        retries: 2,
        retryDelay: 2000,
      });

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json().catch(() => ({}));
        let errorMsg = getErrorMessage(analyzeResponse.status, errorData.error);
        errorMsg = parseGeminiError(errorMsg);
        throw new Error(errorMsg);
      }

      const responseData = await analyzeResponse.json();
      const contractData = responseData.data || responseData;
      console.log('✅ Analysis complete:', contractData);

      // Step 5: Complete!
      setStep('complete');
      setProgress(100);
      showSuccessToast('Vertrag erfolgreich analysiert!');

      // Callback after short delay for UX
      setTimeout(() => {
        onAnalysisComplete(contractData);
      }, 500);

    } catch (err: unknown) {
      console.error('❌ Upload/Analysis error:', err);
      setStep('error');
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten';
      setError(errorMessage);
      showErrorToast(err, errorMessage);
    }
  };

  const isProcessing = ['validating', 'uploading', 'extracting', 'analyzing'].includes(step);
  const showRetry = step === 'error';

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isProcessing
            ? 'border-blue-400 bg-blue-50'
            : step === 'complete'
            ? 'border-green-400 bg-green-50'
            : step === 'error'
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          disabled={isProcessing}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer ${isProcessing ? 'cursor-not-allowed' : ''}`}
        >
          {/* Icon based on state */}
          <div className="text-6xl mb-4">
            {step === 'idle' && '📄'}
            {step === 'validating' && '🔍'}
            {step === 'uploading' && '📤'}
            {step === 'extracting' && '📋'}
            {step === 'analyzing' && '🤖'}
            {step === 'complete' && '✅'}
            {step === 'error' && '❌'}
          </div>

          {/* Status message */}
          <div className={`text-lg font-medium mb-2 ${
            step === 'error' ? 'text-red-700' :
            step === 'complete' ? 'text-green-700' :
            isProcessing ? 'text-blue-700' :
            'text-gray-700'
          }`}>
            {stepMessages[step]}
          </div>

          {/* File name or instructions */}
          <div className="text-sm text-gray-500">
            {uploadedFileName || 'PDF, JPG oder PNG (max. 10 MB)'}
          </div>
        </label>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="relative">
          <div className="overflow-hidden h-2 text-xs flex rounded-full bg-blue-100">
            <div
              style={{ width: `${progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">Fortschritt</span>
            <span className="text-xs text-blue-600 font-medium">{progress}%</span>
          </div>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3" />
            <div>
              <p className="text-blue-800 font-medium">{stepMessages[step]}</p>
              <p className="text-blue-600 text-sm">
                {step === 'uploading' && 'Ihre Datei wird sicher hochgeladen...'}
                {step === 'extracting' && 'Text wird aus dem Dokument extrahiert...'}
                {step === 'analyzing' && 'Die KI analysiert Ihren Mietvertrag...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error with Retry */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-red-500 mr-2">❌</span>
            <div className="flex-1">
              <p className="text-red-800 font-medium">{error}</p>
              {showRetry && (
                <button
                  onClick={resetState}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Erneut versuchen
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {step === 'complete' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✅</span>
            <div>
              <p className="text-green-800 font-medium">Vertrag erfolgreich analysiert!</p>
              <p className="text-green-600 text-sm">Die Daten wurden in das Formular übernommen.</p>
            </div>
          </div>
        </div>
      )}

      {/* File type hints */}
      {step === 'idle' && (
        <div className="text-center text-sm text-gray-500">
          <p>💡 Tipp: Für beste Ergebnisse verwenden Sie einen gut lesbaren Scan</p>
        </div>
      )}
    </div>
  );
}
