// src/lib/contract-analyzer.ts
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Contract data interface
export interface ContractData {
  address: string;
  netRent: number;
  referenceRate: number;
  contractDate: string;
  landlordName: string;
  landlordAddress: string;
  confidence: 'high' | 'medium' | 'low';
  extractedFields: string[];
  missingFields: string[];
}

// Analysis result interface
export interface AnalysisResult {
  success: boolean;
  data?: ContractData;
  error?: string;
  rawResponse?: string;
}

/**
 * Analyzes Swiss rental contract text using GPT-4
 * Extracts key contract information for rent reduction calculations
 */
export async function analyzeContract(
  extractedText: string
): Promise<AnalysisResult> {
  try {
    // Validate input
    if (!extractedText || extractedText.trim().length < 50) {
      return {
        success: false,
        error: 'Text zu kurz oder leer. Bitte laden Sie einen vollständigen Mietvertrag hoch.',
      };
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: 'OpenAI API Key nicht konfiguriert.',
      };
    }

    // Call OpenAI API with structured output request
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Du bist ein Experte für Schweizer Mietverträge. Analysiere den folgenden Vertragstext und extrahiere die relevanten Informationen.

WICHTIG: Antworte NUR mit einem validen JSON-Objekt ohne zusätzlichen Text.

Das JSON-Format MUSS genau so aussehen:
{
  "address": "Strasse Nr., PLZ Ort",
  "netRent": 2000.00,
  "referenceRate": 1.50,
  "contractDate": "YYYY-MM-DD",
  "landlordName": "Name des Vermieters",
  "landlordAddress": "Vermieteradresse",
  "confidence": "high|medium|low",
  "extractedFields": ["field1", "field2"],
  "missingFields": ["field3"]
}

FELD-DEFINITIONEN:
- address: Die Adresse der Mietwohnung (NICHT die Vermieteradresse)
- netRent: Nettomiete in CHF (Grundmiete ohne Nebenkosten)
- referenceRate: Hypothekarischer Referenzzinssatz bei Vertragsabschluss (z.B. 1.50 für 1.50%)
- contractDate: Datum des Vertragsbeginns im Format YYYY-MM-DD
- landlordName: Name des Vermieters / der Vermieterin
- landlordAddress: Vollständige Adresse des Vermieters
- confidence: "high" wenn alle Felder klar, "medium" bei Unsicherheiten, "low" wenn viel fehlt
- extractedFields: Array der erfolgreich extrahierten Felder
- missingFields: Array der nicht gefundenen Felder

BESONDERE HINWEISE:
- Wenn der Referenzzinssatz nicht explizit genannt wird, nutze historische Daten (1.25% vor 2022, 1.50% 2022-2023, 1.75% 2023-2025)
- Bei fehlenden Werten verwende null statt 0
- Nettomiete ist OHNE Nebenkosten (suche nach "Grundmiete", "Nettomietzins")
- Achte auf Schweizer Datumsformate (DD.MM.YYYY oder DD/MM/YYYY)`,
        },
        {
          role: 'user',
          content: `Analysiere diesen Mietvertrag:\n\n${extractedText}`,
        },
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 1000,
    });

    // Extract response
    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      return {
        success: false,
        error: 'Keine Antwort von OpenAI erhalten.',
      };
    }

    // Parse JSON response
    let parsedData: ContractData;
    try {
      // Remove potential markdown code blocks
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      parsedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return {
        success: false,
        error: 'Antwort konnte nicht verarbeitet werden.',
        rawResponse: responseText,
      };
    }

    // Validate extracted data
    const validation = validateContractData(parsedData);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        data: parsedData,
      };
    }

    return {
      success: true,
      data: parsedData,
      rawResponse: responseText,
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: `Fehler bei der Analyse: ${error.message}`,
      };
    }
    
    return {
      success: false,
      error: 'Unbekannter Fehler bei der Vertragsanalyse.',
    };
  }
}

/**
 * Validates extracted contract data
 */
function validateContractData(data: any): { valid: boolean; error?: string } {
  // Check required fields
  if (!data.address || data.address === null) {
    return { valid: false, error: 'Adresse konnte nicht extrahiert werden.' };
  }

  if (!data.netRent || data.netRent <= 0) {
    return { valid: false, error: 'Nettomiete konnte nicht extrahiert werden.' };
  }

  if (!data.referenceRate || data.referenceRate < 0 || data.referenceRate > 5) {
    return { valid: false, error: 'Referenzzinssatz ungültig oder nicht gefunden.' };
  }

  if (!data.contractDate) {
    return { valid: false, error: 'Vertragsdatum konnte nicht extrahiert werden.' };
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.contractDate)) {
    return { valid: false, error: 'Vertragsdatum hat ungültiges Format.' };
  }

  return { valid: true };
}

/**
 * Formats contract data for display
 */
export function formatContractData(data: ContractData): string {
  return `
📍 Adresse: ${data.address}
💰 Nettomiete: CHF ${data.netRent.toFixed(2)}
📊 Referenzzinssatz: ${data.referenceRate}%
📅 Vertragsdatum: ${new Date(data.contractDate).toLocaleDateString('de-CH')}
🏢 Vermieter: ${data.landlordName}
📬 Vermieteradresse: ${data.landlordAddress}
✅ Konfidenz: ${data.confidence}
  `.trim();
}
