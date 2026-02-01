// src/lib/contract-analyzer.ts (Updated with landlord data)

export interface ContractData {
  address: string;
  netRent: number;
  referenceRate: number;
  contractDate: string;
  landlordName: string;
  landlordAddress: string;
}

export async function analyzeContract(extractedText: string): Promise<ContractData> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY nicht konfiguriert');
  }

  console.log('🤖 Analyzing contract with Gemini 2.5 Flash...');

  const model = 'models/gemini-2.5-flash';
  const apiUrl = `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${apiKey}`;

  const prompt = `Analysiere diesen Schweizer Mietvertrag und extrahiere folgende Informationen im JSON-Format:

MIETVERTRAG TEXT:
${extractedText}

Extrahiere:
1. address: Vollständige Adresse der Mietwohnung (Strasse, PLZ, Ort)
2. netRent: Nettomiete in CHF (nur die Zahl, ohne CHF)
3. referenceRate: Referenzzinssatz in Prozent (z.B. 1.25 für 1.25%)
4. contractDate: Vertragsdatum im Format YYYY-MM-DD
5. landlordName: Name des Vermieters / der Verwaltung
6. landlordAddress: Vollständige Adresse des Vermieters (Strasse, PLZ, Ort)

Antworte NUR mit einem JSON-Objekt, keine zusätzlichen Erklärungen:

{
  "address": "Strasse Nr, PLZ Ort",
  "netRent": 0,
  "referenceRate": 0,
  "contractDate": "YYYY-MM-DD",
  "landlordName": "Name",
  "landlordAddress": "Strasse Nr, PLZ Ort"
}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
    const errorText = await response.text();
    throw new Error(`Gemini API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Keine Antwort von Gemini erhalten');
  }

  console.log('📥 Gemini response:', text.substring(0, 200));

  // Extract JSON from response
  let jsonText = text.trim();
  
  // Remove markdown code blocks if present
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '');
  }

  const parsedData = JSON.parse(jsonText);

  // Validate and transform
  const contractData: ContractData = {
    address: parsedData.address || '',
    netRent: parseFloat(parsedData.netRent) || 0,
    referenceRate: parseFloat(parsedData.referenceRate) || 0,
    contractDate: parsedData.contractDate || '',
    landlordName: parsedData.landlordName || '',
    landlordAddress: parsedData.landlordAddress || '',
  };

  console.log('✅ Contract analysis complete:', contractData);

  return contractData;
}
