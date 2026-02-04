// src/lib/validation.ts
// Input validation and sanity checks for contract data

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ContractInput {
  address?: string;
  netRent?: number;
  referenceRate?: number;
  contractDate?: string;
  landlordName?: string;
  landlordAddress?: string;
}

// Reference rate history for validation
const REFERENCE_RATE_HISTORY = [
  { date: '2008-12-01', rate: 3.50 },
  { date: '2009-03-01', rate: 3.25 },
  { date: '2009-09-01', rate: 3.00 },
  { date: '2010-03-01', rate: 2.75 },
  { date: '2011-09-01', rate: 2.50 },
  { date: '2012-06-01', rate: 2.25 },
  { date: '2013-09-01', rate: 2.00 },
  { date: '2017-06-01', rate: 1.50 },
  { date: '2020-03-02', rate: 1.25 },
  { date: '2023-06-02', rate: 1.50 },
  { date: '2023-12-02', rate: 1.75 },
  { date: '2025-03-01', rate: 1.50 },
  { date: '2025-09-02', rate: 1.25 }, // Current
];

/**
 * Validate contract input data with comprehensive sanity checks
 */
export function validateContractInput(input: ContractInput): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field checks
  if (!input.address || input.address.trim().length === 0) {
    errors.push('Adresse ist erforderlich');
  }

  if (input.netRent === undefined || input.netRent === null) {
    errors.push('Nettomiete ist erforderlich');
  }

  if (input.referenceRate === undefined || input.referenceRate === null) {
    errors.push('Referenzzinssatz ist erforderlich');
  }

  if (!input.contractDate) {
    errors.push('Vertragsdatum ist erforderlich');
  }

  // If there are required field errors, return early
  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // Sanity checks for rent
  if (input.netRent !== undefined) {
    if (input.netRent < 100) {
      errors.push('Nettomiete unter CHF 100 ist unrealistisch');
    } else if (input.netRent < 500) {
      warnings.push('Nettomiete unter CHF 500 ist ungewöhnlich tief. Bitte prüfen Sie den Wert.');
    }

    if (input.netRent > 20000) {
      errors.push('Nettomiete über CHF 20\'000 ist für Wohnungen unrealistisch');
    } else if (input.netRent > 10000) {
      warnings.push('Nettomiete über CHF 10\'000 ist ungewöhnlich hoch. Ist dies eine Gewerbeliegenschaft?');
    }

    if (!Number.isFinite(input.netRent)) {
      errors.push('Nettomiete muss eine gültige Zahl sein');
    }
  }

  // Validate reference rate
  if (input.referenceRate !== undefined) {
    const validRates = [1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.25, 3.50];

    if (!validRates.includes(input.referenceRate)) {
      // Check if it's close to a valid rate (might be AI extraction error)
      const closestRate = validRates.find(r => Math.abs(r - input.referenceRate!) < 0.1);
      if (closestRate) {
        warnings.push(`Referenzzinssatz ${input.referenceRate}% ist ungewöhnlich. Meinten Sie ${closestRate}%?`);
      } else if (input.referenceRate < 1.00) {
        errors.push('Referenzzinssatz unter 1% gab es in der Schweiz nie');
      } else if (input.referenceRate > 4.00) {
        errors.push('Referenzzinssatz über 4% ist seit 2005 nicht mehr vorgekommen');
      }
    }
  }

  // Validate contract date
  if (input.contractDate) {
    const contractDate = new Date(input.contractDate);
    const today = new Date();

    if (isNaN(contractDate.getTime())) {
      errors.push('Ungültiges Datumsformat');
    } else {
      // Contract in the future
      if (contractDate > today) {
        errors.push('Vertragsdatum kann nicht in der Zukunft liegen');
      }

      // Very old contract
      const yearsAgo = (today.getTime() - contractDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (yearsAgo > 50) {
        errors.push('Verträge älter als 50 Jahre sind nicht unterstützt');
      } else if (yearsAgo > 30) {
        warnings.push('Vertrag ist über 30 Jahre alt. Die Berechnung könnte ungenau sein.');
      }

      // Check if reference rate matches the date
      if (input.referenceRate !== undefined) {
        const expectedRate = getReferenceRateForDate(contractDate);
        if (expectedRate && Math.abs(expectedRate - input.referenceRate) > 0.01) {
          warnings.push(
            `Am ${formatDate(contractDate)} war der Referenzzinssatz ${expectedRate}%, ` +
            `nicht ${input.referenceRate}%. Bitte prüfen Sie die Angaben.`
          );
        }
      }
    }
  }

  // Validate address format (Swiss)
  if (input.address) {
    // Check for PLZ (4 digits for Swiss addresses)
    const plzMatch = input.address.match(/\b(\d{4})\b/);
    if (plzMatch) {
      const plz = parseInt(plzMatch[1]);
      if (plz < 1000 || plz > 9999) {
        warnings.push('PLZ scheint ungültig zu sein');
      }
    } else {
      warnings.push('Keine Schweizer PLZ in der Adresse gefunden');
    }

    // Very short address
    if (input.address.length < 10) {
      warnings.push('Adresse scheint unvollständig zu sein');
    }
  }

  // Validate landlord info (optional but check if provided)
  if (input.landlordName && input.landlordName.length < 2) {
    warnings.push('Vermietername scheint unvollständig zu sein');
  }

  if (input.landlordAddress && input.landlordAddress.length < 10) {
    warnings.push('Vermieteradresse scheint unvollständig zu sein');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if a contract has a reference rate clause (based on common indicators)
 */
export function checkReferenceRateClause(extractedText: string): {
  hasClause: boolean;
  confidence: 'high' | 'medium' | 'low';
  indicators: string[];
} {
  const indicators: string[] = [];
  let score = 0;

  // Strong indicators
  const strongIndicators = [
    /referenzzins/i,
    /hypothekarischer referenzzinssatz/i,
    /art\.?\s*13\s*vmwg/i,
    /mietzinsanpassung.*referenz/i,
  ];

  // Medium indicators
  const mediumIndicators = [
    /zinssatz/i,
    /mietzins.*änderung/i,
    /indexiert/i,
    /hypo.*zins/i,
  ];

  // Negative indicators (suggests no reference rate clause)
  const negativeIndicators = [
    /pauschalmiete/i,
    /all-?inclusive/i,
    /fest.*miete/i,
  ];

  for (const pattern of strongIndicators) {
    if (pattern.test(extractedText)) {
      score += 2;
      indicators.push(`Starker Indikator: "${extractedText.match(pattern)?.[0]}"`);
    }
  }

  for (const pattern of mediumIndicators) {
    if (pattern.test(extractedText)) {
      score += 1;
      indicators.push(`Möglicher Indikator: "${extractedText.match(pattern)?.[0]}"`);
    }
  }

  for (const pattern of negativeIndicators) {
    if (pattern.test(extractedText)) {
      score -= 2;
      indicators.push(`Warnung: "${extractedText.match(pattern)?.[0]}" deutet auf keine Referenzzins-Klausel hin`);
    }
  }

  return {
    hasClause: score > 0,
    confidence: score >= 3 ? 'high' : score >= 1 ? 'medium' : 'low',
    indicators,
  };
}

/**
 * Get the reference rate that was valid on a specific date
 */
export function getReferenceRateForDate(date: Date): number | null {
  const dateStr = date.toISOString().split('T')[0];

  // Find the rate that was valid on that date
  for (let i = REFERENCE_RATE_HISTORY.length - 1; i >= 0; i--) {
    if (REFERENCE_RATE_HISTORY[i].date <= dateStr) {
      return REFERENCE_RATE_HISTORY[i].rate;
    }
  }

  // Before our history
  return null;
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Validate that the extracted data makes sense together
 */
export function validateDataConsistency(data: ContractInput): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if net rent is realistic for the implied location
  if (data.address && data.netRent) {
    const plzMatch = data.address.match(/\b(\d{4})\b/);
    if (plzMatch) {
      const plz = parseInt(plzMatch[1]);

      // Major city check (Zürich, Basel, Genf, Bern)
      const expensiveCities = [8000, 8001, 8002, 8003, 8004, 8005, 8006, 8008, 4000, 1200, 3000];
      const isMajorCity = expensiveCities.some(p => Math.abs(plz - p) < 100);

      if (isMajorCity && data.netRent < 1000) {
        warnings.push('Miete scheint für eine Grossstadt sehr niedrig zu sein');
      }

      // Rural area check
      if (!isMajorCity && data.netRent > 4000) {
        warnings.push('Miete scheint für eine ländliche Gegend sehr hoch zu sein');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
