// src/lib/pdf-extractor.ts - Server-side PDF extraction
export async function extractTextFromPDF(fileUrl: string): Promise<string> {
  try {
    // Fetch PDF as buffer
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use pdf-parse for server-side extraction
    const pdfParse = (await import('pdf-parse');
    const data = await pdfParse(buffer);

    const text = data.text.trim();
    
    console.log('📄 PDF extracted:', {
      pages: data.numpages,
      textLength: text.length,
      preview: text.substring(0, 200)
    });

    return text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Konnte Text nicht aus PDF extrahieren');
  }
}
