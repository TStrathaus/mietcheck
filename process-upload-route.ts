// src/app/api/process-upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/pdf-extractor';

export async function POST(request: NextRequest) {
  try {
    const { blobUrl, fileType } = await request.json();
    
    if (!blobUrl) {
      return NextResponse.json(
        { error: 'Blob URL fehlt' },
        { status: 400 }
      );
    }

    let extractedText = '';

    // Process PDF files
    if (fileType === 'application/pdf') {
      try {
        console.log('📄 Extracting text from PDF:', blobUrl);
        extractedText = await extractTextFromPDF(blobUrl);
        console.log('✅ Text extracted, length:', extractedText.length);
      } catch (error: any) {
        console.error('❌ PDF extraction error:', error);
        return NextResponse.json({
          success: false,
          error: 'PDF-Textextraktion fehlgeschlagen',
          url: blobUrl,
        });
      }
    } else if (fileType?.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        error: 'Bild-OCR noch nicht implementiert',
        url: blobUrl,
      });
    }

    return NextResponse.json({
      success: true,
      extractedText,
      url: blobUrl,
      fileName: blobUrl.split('/').pop(),
    });

  } catch (error: any) {
    console.error('❌ Process upload error:', error);
    return NextResponse.json(
      { error: 'Verarbeitung fehlgeschlagen: ' + error.message },
      { status: 500 }
    );
  }
}
