// src/components/FileUpload.tsx - With improved error handling and toast notifications
'use client';

import { useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import { ContractData } from '@/lib/contract-analyzer';
import { showSuccess, showError, showLoading, dismissToast, toastMessages, withRetry } from '@/lib/toast';

interface FileUploadProps {
  onAnalysisComplete: (data: ContractData) => void;
}

// Constants for validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

export default function FileUpload({ onAnalysisComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file before upload
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `Datei ist zu gross (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum: 10 MB`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return `Ungültiges Dateiformat: ${file.type || fileExtension}. Erlaubt: PDF, JPG, PNG`;
    }

    // Check if file is empty
    if (file.size === 0) {
      return 'Die Datei ist leer. Bitte wählen Sie eine andere Datei.';
    }

    return null;
  };

  // Reset the component state
  const resetState = () => {
    setUploading(false);
    setAnalyzing(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      showError(validationError);
      resetState();
      return;
    }

    setUploading(true);
    setProgress(10);
    setUploadedFileName(file.name);

    let loadingToast: string | null = null;

    try {
      // Step 1: Upload to Vercel Blob
      loadingToast = showLoading(toastMessages.uploadStart);
      console.log('📤 Uploading file:', file.name, file.type);

      setProgress(20);

      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload-url',
      });

      dismissToast(loadingToast);
      console.log('✅ Upload successful:', blob.url);
      setProgress(40);
      setUploading(false);
      setAnalyzing(true);

      // Step 2: Process upload (extract text - PDF or OCR) with retry
      loadingToast = showLoading('Text wird extrahiert...');
      console.log('🔄 Processing upload with type:', file.type);

      setProgress(50);

      const processResponse = await withRetry(
        async () => {
          const response = await fetch('/api/process-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              blobUrl: blob.url,
              fileType: file.type,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Dateiverarbeitung fehlgeschlagen');
          }

          return response;
        },
        { maxRetries: 2, delay: 1500 }
      );

      dismissToast(loadingToast);
      setProgress(70);

      const { extractedText } = await processResponse.json();
      console.log('✅ Text extracted, length:', extractedText?.length);

      if (!extractedText || extractedText.length < 50) {
        throw new Error('Der Vertrag konnte nicht gelesen werden. Bitte stellen Sie sicher, dass das Dokument gut lesbar ist.');
      }

      // Step 3: Analyze with Gemini
      loadingToast = showLoading(toastMessages.analysisStart);
      console.log('🤖 Analyzing contract...');

      setProgress(80);

      const analyzeResponse = await withRetry(
        async () => {
          const response = await fetch('/api/analyze-contract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ extractedText }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Analyse fehlgeschlagen');
          }

          return response;
        },
        { maxRetries: 2, delay: 2000 }
      );

      dismissToast(loadingToast);
      setProgress(100);

      const result = await analyzeResponse.json();
      console.log('✅ Analysis complete:', result);

      // Check if we got valid data
      if (!result.data && !result.success) {
        throw new Error(result.error || 'Analyse lieferte keine Daten');
      }

      const contractData = result.data || result;

      // Step 4: Success callback
      showSuccess(toastMessages.analysisSuccess);
      onAnalysisComplete(contractData);
      setAnalyzing(false);

    } catch (err: any) {
      console.error('❌ Upload/Analysis error:', err);

      if (loadingToast) {
        dismissToast(loadingToast);
      }

      // Show user-friendly error message
      let errorMessage = err.message || toastMessages.genericError;

      // Handle specific error cases
      if (err.message?.includes('fetch') || err.message?.includes('network')) {
        errorMessage = toastMessages.networkError;
      } else if (err.message?.includes('timeout')) {
        errorMessage = 'Die Analyse hat zu lange gedauert. Bitte versuchen Sie es mit einem kleineren Dokument.';
      } else if (err.message?.includes('rate limit') || err.message?.includes('429')) {
        errorMessage = 'Zu viele Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.';
      }

      showError(errorMessage);
      resetState();
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0 && fileInputRef.current) {
      // Create a new DataTransfer to set files
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      fileInputRef.current.files = dataTransfer.files;

      // Trigger the change handler
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };

  const isProcessing = uploading || analyzing;

  return (
    <div className="space-y-4">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isProcessing
            ? 'border-blue-300 bg-blue-50'
            : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
          }
        `}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
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
          className={`cursor-pointer block ${isProcessing ? 'cursor-not-allowed' : ''}`}
        >
          {/* Icon */}
          <div className="text-6xl mb-4">
            {uploading ? '📤' : analyzing ? '🤖' : '📄'}
          </div>

          {/* Status text */}
          <div className="text-lg font-medium text-gray-700 mb-2">
            {uploading
              ? 'Wird hochgeladen...'
              : analyzing
              ? 'KI analysiert den Vertrag...'
              : 'Mietvertrag hochladen'}
          </div>

          {/* File info or instructions */}
          <div className="text-sm text-gray-500">
            {uploadedFileName ? (
              <span className="text-blue-600">{uploadedFileName}</span>
            ) : (
              <>
                Klicken oder Datei hierher ziehen
                <br />
                <span className="text-xs">PDF, JPG oder PNG (max. 10 MB)</span>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Progress bar */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              {progress < 40 && 'Hochladen...'}
              {progress >= 40 && progress < 70 && 'Text extrahieren...'}
              {progress >= 70 && progress < 100 && 'KI-Analyse...'}
              {progress === 100 && 'Fertig!'}
            </span>
            <span>{progress}%</span>
          </div>
        </div>
      )}

      {/* Tips */}
      {!isProcessing && !uploadedFileName && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
          <p className="font-medium mb-2">💡 Tipps für beste Ergebnisse:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Verwenden Sie gut lesbare Scans oder Fotos</li>
            <li>Stellen Sie sicher, dass alle Seiten gerade sind</li>
            <li>Bei Fotos: Gute Beleuchtung ohne Schatten</li>
          </ul>
        </div>
      )}
    </div>
  );
}
