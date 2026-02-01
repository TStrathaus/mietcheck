// src/app/api/process-upload/route.ts (Updated with OCR support)
import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/pdf-extractor';
import { extractTextFromImage, isImageType, isPDFType } from '@/lib/image-ocr';

export async function POST(request: NextRequest) {
  try {
    const { blobUrl, fileType } = await request.json();

    if (!blobUrl || !fileType) {
      return NextResponse.json(
        { error: 'Blob URL und fileType sind erforderlich' },
        { status: 400 }
      );
    }

    console.log('📄 Processing upload:', { blobUrl, fileType });

    let extractedText: string;

    // Route based on file type
    if (isPDFType(fileType)) {
      console.log('📑 Processing as PDF...');
      extractedText = await extractTextFromPDF(blobUrl);
    } else if (isImageType(fileType)) {
      console.log('🖼️ Processing as Image with OCR...');
      extractedText = await extractTextFromImage(blobUrl, fileType);
    } else {
      return NextResponse.json(
        { error: `Nicht unterstützter Dateityp: ${fileType}. Nur PDF, JPG und PNG werden unterstützt.` },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Kein Text konnte extrahiert werden. Bitte prüfen Sie die Datei.' },
        { status: 400 }
      );
    }

    console.log('✅ Text extraction successful, length:', extractedText.length);

    return NextResponse.json({
      success: true,
      extractedText,
      url: blobUrl,
    });

  } catch (error: any) {
    console.error('❌ Process upload error:', error);
    return NextResponse.json(
      { error: 'Dateiverarbeitung fehlgeschlagen: ' + error.message },
      { status: 500 }
    );
  }
}
