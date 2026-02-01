// src/app/api/analyze-anpassung/route.ts (Updated with OCR support)
import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/pdf-extractor';
import { extractTextFromImage, isImageType, isPDFType } from '@/lib/image-ocr';

export async function POST(request: NextRequest) {
  try {
    const { blobUrl, fileType } = await request.json();
    
    if (!blobUrl) {
      return NextResponse.json(
        { error: 'Blob URL fehlt' },
        { status: 400 }
      );
    }

    if (!fileType) {
      return NextResponse.json(
        { error: 'File type fehlt' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY nicht konfiguriert' },
        { status: 500 }
      );
    }

    console.log('📄 Analyzing rent adjustment document:', { blobUrl, fileType });

    // Extract text based on file type
    let extractedText: string;

    if (isPDFType(fileType)) {
      console.log('📑 Extracting from PDF...');
      extractedText = await extractTextFromPDF(blobUrl);
    } else if (isImageType(fileType)) {
      console.log('🖼️ Extracting from Image with OCR...');
      extractedText = await extractTextFromImage(blobUrl, fileType);
    } else {
      return NextResponse.json(
        { error: `Nicht unterstützter Dateityp: ${fileType}` },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Kein Text konnte extrahiert werden' },
        { status: 400 }
      );
    }

    console.log('📄 Text extracted, length:', extractedText.length);

    // Analyze with Gemini
    const model = 'models/gemini-2.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${apiKey}`;

    const prompt = `Analysiere dieses Schweizer Mietanpassungs-Dokument und extrahiere folgende Informationen im JSON-Format:

DOKUMENT TEXT:
${extractedText}

Extrahiere:
1. datum: Datum der Mietanpassung im Format YYYY-MM-DD (wann tritt die neue Miete in Kraft?)
2. alteMiete: Bisherige Nettomiete in CHF (nur Zahl, ohne CHF)
3. neueMiete: Neue Nettomiete in CHF (nur Zahl, ohne CHF)
4. alterReferenzzinssatz: Bisheriger Referenzzinssatz in Prozent (z.B. 1.25 für 1.25%)
5. neuerReferenzzinssatz: Neuer Referenzzinssatz in Prozent (z.B. 1.50 für 1.50%)
6. begruendung: Kurze Begründung der Anpassung (max 200 Zeichen)
7. typ: "erhöhung" oder "reduzierung"
8. zusaetzlicheGruende: Array mit weiteren Gründen falls vorhanden (z.B. ["Teuerung", "Kostensteigerung", "Wertvermehrung"])

WICHTIG:
- Wenn mehrere Gründe genannt werden (z.B. Referenzzinssatz UND Teuerung), liste alle in zusaetzlicheGruende
- Berechne den Typ basierend auf neueMiete vs. alteMiete
- Datum im Format YYYY-MM-DD

Antworte NUR mit einem JSON-Objekt, keine zusätzlichen Erklärungen:

{
  "datum": "YYYY-MM-DD",
  "alteMiete": 0,
  "neueMiete": 0,
  "alterReferenzzinssatz": 0,
  "neuerReferenzzinssatz": 0,
  "begruendung": "...",
  "typ": "erhöhung",
  "zusaetzlicheGruende": []
}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API Error ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Keine Response von Gemini erhalten');
    }

    console.log('📥 Gemini response:', text.substring(0, 200));

    // Extract JSON
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const parsedData = JSON.parse(jsonText);

    // Validate
    const validatedData = {
      datum: parsedData.datum || '',
      alteMiete: parseFloat(parsedData.alteMiete) || 0,
      neueMiete: parseFloat(parsedData.neueMiete) || 0,
      alterReferenzzinssatz: parseFloat(parsedData.alterReferenzzinssatz) || 0,
      neuerReferenzzinssatz: parseFloat(parsedData.neuerReferenzzinssatz) || 0,
      begruendung: parsedData.begruendung || '',
      typ: parsedData.typ || 'erhöhung',
      zusaetzlicheGruende: parsedData.zusaetzlicheGruende || [],
    };

    console.log('✅ Analysis successful:', validatedData);

    return NextResponse.json({
      success: true,
      data: validatedData,
    });

  } catch (error: any) {
    console.error('❌ Analyze anpassung error:', error);
    return NextResponse.json(
      { error: 'Analyse fehlgeschlagen: ' + error.message },
      { status: 500 }
    );
  }
}
