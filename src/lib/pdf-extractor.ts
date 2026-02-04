// src/lib/pdf-extractor.ts
// Server-side PDF extraction with unpdf (Node.js Runtime)
// Falls back to Gemini Vision for scanned PDFs or when unpdf fails

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

    try {
      // Try text extraction with unpdf first
      const { text, totalPages } = await extractText(arrayBuffer, {
        mergePages: true,
      });

      const cleanText = text.trim();

      console.log('📄 PDF extraction with unpdf:', {
        pages: totalPages || 0,
        textLength: cleanText.length,
        preview: cleanText.substring(0, 150) + '...'
      });

      if (cleanText.length >= 50) {
        return cleanText;
      }

      console.warn('⚠️ Extracted text too short, falling back to Gemini Vision OCR');
    } catch (unpdfError: any) {
      console.warn('⚠️ unpdf extraction failed, falling back to Gemini Vision:', unpdfError.message);
    }

    // Fallback: Use Gemini Vision for OCR
    console.log('🤖 Using Gemini Vision for PDF OCR...');
    return await extractPDFWithGemini(arrayBuffer);

  } catch (error: any) {
    console.error('❌ PDF extraction error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw new Error(`PDF-Extraktion fehlgeschlagen: ${error.message}`);
  }
}

/**
 * Fallback: Extract text from PDF using Gemini Vision API
 */
async function extractPDFWithGemini(arrayBuffer: ArrayBuffer): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY nicht konfiguriert');
  }

  const base64Data = Buffer.from(arrayBuffer).toString('base64');

  const model = 'models/gemini-2.5-flash';
  const apiUrl = `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            inline_data: {
              mime_type: 'application/pdf',
              data: base64Data,
            }
          },
          {
            text: 'Extract all text from this PDF document. Include all visible text, numbers, dates, addresses, and amounts. Return only the extracted text without any additional commentary or explanations.'
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini Vision API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!extractedText) {
    throw new Error('Keine Text-Extraktion von Gemini erhalten');
  }

  console.log('✅ Gemini Vision PDF OCR successful, length:', extractedText.length);

  return extractedText;
}
