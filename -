// src/components/FileUpload.tsx (Updated to pass fileType)
'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import { ContractData } from '@/lib/contract-analyzer';

interface FileUploadProps {
  onAnalysisComplete: (data: ContractData) => void;
}

export default function FileUpload({ onAnalysisComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadedFileName(file.name);

    try {
      // Step 1: Upload to Vercel Blob
      console.log('📤 Uploading file:', file.name, file.type);
      
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload-url',
      });

      console.log('✅ Upload successful:', blob.url);
      setUploading(false);
      setAnalyzing(true);

      // Step 2: Process upload (extract text - PDF or OCR)
      console.log('🔄 Processing upload with type:', file.type);
      
      const processResponse = await fetch('/api/process-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blobUrl: blob.url,
          fileType: file.type, // CRITICAL: Pass file type!
        }),
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.error || 'Dateiverarbeitung fehlgeschlagen');
      }

      const { extractedText } = await processResponse.json();
      console.log('✅ Text extracted, length:', extractedText?.length);

      // Step 3: Analyze with Gemini
      console.log('🤖 Analyzing contract...');
      
      const analyzeResponse = await fetch('/api/analyze-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extractedText }),
      });

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        throw new Error(errorData.error || 'Analyse fehlgeschlagen');
      }

      const contractData = await analyzeResponse.json();
      console.log('✅ Analysis complete:', contractData);

      // Step 4: Callback
      onAnalysisComplete(contractData);
      setAnalyzing(false);

    } catch (err: any) {
      console.error('❌ Upload/Analysis error:', err);
      setError(err.message || 'Ein Fehler ist aufgetreten');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          disabled={uploading || analyzing}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer ${uploading || analyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="text-6xl mb-4">📄</div>
          <div className="text-lg font-medium text-gray-700 mb-2">
            {uploading
              ? '⏳ Wird hochgeladen...'
              : analyzing
              ? '🤖 Wird analysiert...'
              : 'Mietvertrag hochladen'}
          </div>
          <div className="text-sm text-gray-500">
            {uploadedFileName || 'PDF, JPG oder PNG (max. 10 MB)'}
          </div>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">❌ {error}</p>
        </div>
      )}

      {(uploading || analyzing) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-blue-800">
              {uploading && 'Datei wird hochgeladen...'}
              {analyzing && 'KI analysiert den Vertrag...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
