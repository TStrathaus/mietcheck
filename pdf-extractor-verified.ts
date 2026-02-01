// src/lib/pdf-extractor.ts
// Server-side PDF extraction with unpdf (Node.js Runtime)

import { extractText } from 'unpdf';

export async function extractTextFromPDF(fileUrl: string): Promise<string> {
  try {
    console.log('📥 Fetching PDF from:', fileUrl);
    
    // Fetch PDF
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('📦 PDF size:', arrayBuffer.byteLength, 'bytes');

    // Extract text with unpdf
    const { text, pages } = await extractText(arrayBuffer, {
      mergePages: true,
    });

    const cleanText = text.trim();
    
    console.log('📄 PDF extraction successful:', {
      pages: pages?.length || 0,
      textLength: cleanText.length,
      preview: cleanText.substring(0, 150) + '...'
    });

    if (cleanText.length < 50) {
      console.warn('⚠️ Extracted text too short:', cleanText.length, 'chars');
      throw new Error('PDF enthält zu wenig Text (möglicherweise nur Bilder). Bitte verwenden Sie ein PDF mit Text-Ebene.');
    }

    return cleanText;
    
  } catch (error: any) {
    console.error('❌ PDF extraction error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw new Error(`PDF-Extraktion fehlgeschlagen: ${error.message}`);
  }
}
