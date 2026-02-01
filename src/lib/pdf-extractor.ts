// src/lib/pdf-extractor.ts - Server-side PDF extraction
// VERIFIED: Works with pdf-parse CommonJS module

export async function extractTextFromPDF(fileUrl: string): Promise<string> {
  try {
    // Fetch PDF as buffer
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // pdf-parse is a CommonJS module, use require
    // @ts-ignore - pdf-parse doesn't have proper types
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);

    const text = data.text.trim();
    
    console.log('📄 PDF extracted:', {
      pages: data.numpages,
      textLength: text.length,
      preview: text.substring(0, 200)
    });

    if (text.length < 50) {
      throw new Error('Extrahierter Text zu kurz - PDF könnte ein Scan sein');
    }

    return text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Konnte Text nicht aus PDF extrahieren');
  }
}