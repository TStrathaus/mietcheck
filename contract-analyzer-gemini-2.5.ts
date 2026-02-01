// src/lib/contract-analyzer.ts - Google Gemini 2.5 Flash
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ContractData {
  address: string;
  netRent: number;
  referenceRate: number;
  contractDate: string;
  landlordName: string;
  landlordAddress: string;
  confidence: 'high' | 'medium' | 'low';
  missingFields: string[];
}

export async function analyzeContract(contractText: string): Promise<ContractData> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY nicht konfiguriert');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = 'models/gemini-2.5-flash';
  const apiUrl = `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${apiKey}`;

  const prompt = `Analysiere diesen Schweizer Mietvertrag und extrahiere folgende Informationen im JSON-Format:

MIETVERTRAG TEXT:
${contractText}

Extrahiere:
1. address: Vollständige Adresse der Mietwohnung (Strasse, PLZ, Ort)
2. netRent: Nettomiete pro Monat in CHF (nur die Zahl, ohne "CHF" oder Währung)
3. referenceRate: Referenzzinssatz in Prozent (z.B. 1.5 für 1.5%)
4. contractDate: Vertragsdatum im Format DD.MM.YYYY
5. landlordName: Name des Vermieters
6. landlordAddress: Adresse des Vermieters
7. confidence: Bewertung der Datenqualität ("high", "medium", oder "low")
8. missingFields: Array mit fehlenden Feldern

Antworte NUR mit einem JSON-Objekt, keine zusätzlichen Erklärungen:

{
  "address": "...",
  "netRent": 0,
  "referenceRate": 0,
  "contractDate": "...",
  "landlordName": "...",
  "landlordAddress": "...",
  "confidence": "high",
  "missingFields": []
}`;

  try {
    console.log('🤖 Sending to Gemini 2.5 Flash...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API Error ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Keine Response von Gemini erhalten');
    }

    console.log('📥 Gemini response received:', text.substring(0, 200));

    // Extract JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const parsedData = JSON.parse(jsonText);

    // Validate required fields
    const validatedData: ContractData = {
      address: parsedData.address || '',
      netRent: parseFloat(parsedData.netRent) || 0,
      referenceRate: parseFloat(parsedData.referenceRate) || 0,
      contractDate: parsedData.contractDate || '',
      landlordName: parsedData.landlordName || '',
      landlordAddress: parsedData.landlordAddress || '',
      confidence: parsedData.confidence || 'low',
      missingFields: parsedData.missingFields || [],
    };

    console.log('✅ Contract analysis successful:', {
      address: validatedData.address,
      netRent: validatedData.netRent,
      confidence: validatedData.confidence,
    });

    return validatedData;

  } catch (error: any) {
    console.error('❌ Gemini analysis error:', error);
    throw new Error(`Vertragsanalyse fehlgeschlagen: ${error.message}`);
  }
}
