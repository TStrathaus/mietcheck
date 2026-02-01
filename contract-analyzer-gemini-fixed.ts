// src/lib/contract-analyzer.ts - Google Gemini mit v1 API
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

  // Initialize with explicit baseUrl for v1 API (not v1beta)
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Use models/gemini-1.5-pro (full path, works with free tier)
  const model = genAI.getGenerativeModel({ 
    model: 'models/gemini-1.5-pro',
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    }
  });

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
    console.log('🤖 Sending to Gemini 1.5 Pro...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('📥 Gemini response received:', text.substring(0, 200));

    // Extract JSON from response (remove markdown code blocks if present)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const data = JSON.parse(jsonText);

    // Validate required fields
    const validatedData: ContractData = {
      address: data.address || '',
      netRent: parseFloat(data.netRent) || 0,
      referenceRate: parseFloat(data.referenceRate) || 0,
      contractDate: data.contractDate || '',
      landlordName: data.landlordName || '',
      landlordAddress: data.landlordAddress || '',
      confidence: data.confidence || 'low',
      missingFields: data.missingFields || [],
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
