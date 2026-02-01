// src/app/api/analyze-anpassung/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { blobUrl } = await request.json();
    
    if (!blobUrl) {
      return NextResponse.json(
        { error: 'Blob URL fehlt' },
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

    // Extract text from PDF
    const { extractTextFromPDF } = await import('@/lib/pdf-extractor');
    const extractedText = await extractTextFromPDF(blobUrl);

    console.log('📄 Analyzing rent adjustment document...');
    console.log('📄 Text length:', extractedText.length);

    // Gemini API call
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
