// src/lib/pdf-extractor.ts - Server-side PDF extraction with unpdf
import { extractText } from 'unpdf';

export async function extractTextFromPDF(fileUrl: string): Promise<string> {
  try {
    // Fetch PDF as buffer
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();

    // Extract text using unpdf (ESM-compatible, works in Edge Runtime)
    const { text } = await extractText(arrayBuffer, {
      mergePages: true,
    });

    const cleanText = text.trim();
    
    console.log('📄 PDF extracted with unpdf:', {
      textLength: cleanText.length,
      preview: cleanText.substring(0, 200)
    });

    if (cleanText.length < 50) {
      throw new Error('Extrahierter Text zu kurz - PDF könnte ein Scan sein');
    }

    return cleanText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Konnte Text nicht aus PDF extrahieren');
  }
}
