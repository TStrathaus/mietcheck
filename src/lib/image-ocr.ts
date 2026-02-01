// src/lib/image-ocr.ts
/**
 * OCR for images using Gemini Vision API
 */

export async function extractTextFromImage(
  imageUrl: string,
  mimeType: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY nicht konfiguriert');
  }

  console.log('🖼️ Extracting text from image using Gemini Vision...');
  console.log('📷 Image URL:', imageUrl);
  console.log('📋 MIME type:', mimeType);

  try {
    // Step 1: Download image from Blob storage
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    
    console.log('✅ Image downloaded, size:', arrayBuffer.byteLength, 'bytes');

    // Step 2: Call Gemini Vision API
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
                mime_type: mimeType,
                data: base64Image,
              }
            },
            {
              text: 'Extract all text from this image. Include all visible text, numbers, dates, and addresses. Return only the extracted text without any additional commentary or explanations.'
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
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

    console.log('✅ Text extracted successfully, length:', extractedText.length);
    console.log('📄 First 200 chars:', extractedText.substring(0, 200));

    return extractedText;

  } catch (error: any) {
    console.error('❌ Image OCR error:', error);
    throw new Error(`Image-Texterkennung fehlgeschlagen: ${error.message}`);
  }
}

/**
 * Determines if a file type is an image
 */
export function isImageType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Determines if a file type is a PDF
 */
export function isPDFType(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}
