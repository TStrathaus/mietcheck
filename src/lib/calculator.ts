export interface CalculationParams {
  currentRent: number;
  currentReferenceRate: number;
  newReferenceRate: number;
  contractDate: Date;
}

export interface CalculationResult {
  reductionPercentage: number;
  grossReduction: number;
  inflationOffset: number;
  costIncreaseOffset: number;
  netReduction: number;
  newRent: number;
  yearlySavings: number;
  details: string[];
}

export function calculateRentReduction(params: CalculationParams): CalculationResult {
  const { currentRent, currentReferenceRate, newReferenceRate, contractDate } = params;
  
  // 1. Calculate base reduction
  const rateChange = currentReferenceRate - newReferenceRate;
  let reductionPercentage = 0;
  
  // According to VMWG Art. 13: 0.25% rate change = 2.91% rent reduction (when rate < 2%)
  if (rateChange === 0.25) {
    reductionPercentage = 2.91;
  } else if (rateChange === 0.5) {
    reductionPercentage = 5.82; // 2x 2.91%
  } else if (rateChange === 0.75) {
    reductionPercentage = 8.73; // 3x 2.91%
  }
  
  const grossReduction = currentRent * (reductionPercentage / 100);
  
  // 2. Calculate inflation offset (40% passable)
  // Simplified: assume 2% inflation per year
  const yearsSinceContract = (new Date().getTime() - contractDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  const inflationRate = Math.min(yearsSinceContract * 2, 5); // Cap at 5%
  const inflationOffset = currentRent * (inflationRate / 100) * 0.4;
  
  // 3. Calculate cost increase offset (0.5% per year, typical)
  const costIncreaseRate = yearsSinceContract * 0.5;
  const costIncreaseOffset = currentRent * (costIncreaseRate / 100);
  
  // 4. Net reduction
  const netReduction = Math.max(0, grossReduction - inflationOffset - costIncreaseOffset);
  const newRent = currentRent - netReduction;
  const yearlySavings = netReduction * 12;
  
  // 5. Create detailed explanation
  const details = [
    `Basis-Reduktion bei ${rateChange}% Zinssenkung: ${reductionPercentage.toFixed(2)}%`,
    `Brutto-Reduktion: CHF ${grossReduction.toFixed(2)}`,
    `Abzüglich 40% Teuerung (${inflationRate.toFixed(1)}%): CHF ${inflationOffset.toFixed(2)}`,
    `Abzüglich allgemeine Kostensteigerung: CHF ${costIncreaseOffset.toFixed(2)}`,
    `Netto-Reduktion pro Monat: CHF ${netReduction.toFixed(2)}`,
    `Neue Nettomiete: CHF ${newRent.toFixed(2)}`,
    `Jährliche Ersparnis: CHF ${yearlySavings.toFixed(2)}`
  ];
  
  return {
    reductionPercentage,
    grossReduction: Math.round(grossReduction * 100) / 100,
    inflationOffset: Math.round(inflationOffset * 100) / 100,
    costIncreaseOffset: Math.round(costIncreaseOffset * 100) / 100,
    netReduction: Math.round(netReduction * 100) / 100,
    newRent: Math.round(newRent * 100) / 100,
    yearlySavings: Math.round(yearlySavings * 100) / 100,
    details
  };
}

export function getReferenceRateHistory() {
  return [
    { date: '2022-02-02', rate: 1.25 },
    { date: '2023-06-02', rate: 1.50 },
    { date: '2023-12-02', rate: 1.75 },
    { date: '2025-03-01', rate: 1.50 },
    { date: '2025-09-02', rate: 1.25 },
  ];
}

export function getCurrentReferenceRate() {
  return 1.25; // As of September 2025
}
