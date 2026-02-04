// src/lib/pdf-extractor.ts
// Server-side PDF extraction - uses Gemini Vision as primary method
// (unpdf has compatibility issues with Vercel serverless)

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

    // Use Gemini Vision directly for PDF extraction (more reliable on Vercel)
    console.log('🤖 Using Gemini Vision for PDF text extraction...');
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
 * Extract text from PDF using Gemini Vision API
 */
async function extractPDFWithGemini(arrayBuffer: ArrayBuffer): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY nicht konfiguriert');
  }

  const base64Data = Buffer.from(arrayBuffer).toString('base64');

  // Check file size - Gemini has limits
  const fileSizeMB = arrayBuffer.byteLength / (1024 * 1024);
  console.log('📄 PDF size:', fileSizeMB.toFixed(2), 'MB');

  if (fileSizeMB > 20) {
    throw new Error('PDF ist zu gross (max. 20 MB)');
  }

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
    console.error('❌ Gemini API error:', response.status, errorText);

    if (response.status === 429) {
      throw new Error('KI-Service überlastet. Bitte in einer Minute erneut versuchen.');
    }
    if (response.status === 400) {
      throw new Error('PDF konnte nicht verarbeitet werden. Bitte versuchen Sie eine andere Datei.');
    }

    throw new Error(`Gemini API Fehler: ${response.status}`);
  }

  const data = await response.json();
  const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!extractedText) {
    throw new Error('Kein Text konnte aus dem PDF extrahiert werden');
  }

  console.log('✅ Gemini Vision PDF extraction successful, length:', extractedText.length);

  return extractedText;
}
