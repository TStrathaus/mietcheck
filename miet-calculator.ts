// src/lib/miet-calculator.ts
/**
 * Schweizer Referenzzinssatz-Historie und Mietberechnungs-Logik
 * Quelle: Bundesamt für Wohnungswesen (BWO)
 */

export interface ReferenzZinssatz {
  datum: string; // YYYY-MM-DD
  satz: number; // Prozent
}

export interface MietAnpassung {
  datum: string; // YYYY-MM-DD
  referenzzinssatz: number;
  miete: number;
  typ: 'start' | 'erhöhung' | 'reduzierung';
  begründung?: string;
}

export interface MietHistorie {
  vertragsbeginn: MietAnpassung;
  anpassungen: MietAnpassung[];
  aktuell: MietAnpassung;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sollMiete?: number;
  istMiete?: number;
  differenz?: number;
}

/**
 * Offizielle Schweizer Referenzzinssatz-Historie
 * Stand: Februar 2026
 */
export const REFERENZZINSSATZ_HISTORIE: ReferenzZinssatz[] = [
  { datum: '2025-09-02', satz: 1.25 },
  { datum: '2025-03-03', satz: 1.50 },
  { datum: '2023-12-01', satz: 1.75 },
  { datum: '2023-06-01', satz: 1.50 },
  { datum: '2022-12-01', satz: 1.25 },
  { datum: '2022-06-01', satz: 1.25 },
  { datum: '2020-03-02', satz: 1.25 },
  { datum: '2019-06-03', satz: 1.25 },
  { datum: '2017-06-01', satz: 1.50 },
  { datum: '2016-09-01', satz: 1.50 },
  { datum: '2015-09-01', satz: 1.75 },
];

/**
 * Berechnet die neue Miete basierend auf Referenzzinssatz-Änderung
 * Formel: 3% Mietänderung pro 0.25% Zinssatz-Änderung
 */
export function berechneMiete(
  aktuelleMinete: number,
  alterZins: number,
  neuerZins: number
): number {
  const zinsDifferenz = neuerZins - alterZins;
  const prozentualerWechsel = (zinsDifferenz / 0.25) * 3;
  const neueMiete = aktuelleMinete * (1 + prozentualerWechsel / 100);
  return Math.round(neueMiete * 100) / 100; // Runden auf 2 Dezimalen
}

/**
 * Validiert ob eine Mietanpassung korrekt berechnet wurde
 */
export function validateAnpassung(
  vorherigeMinete: number,
  vorherZins: number,
  neueMinete: number,
  neuerZins: number
): { isValid: boolean; sollMiete: number; differenz: number } {
  const sollMiete = berechneMiete(vorherigeMinete, vorherZins, neuerZins);
  const differenz = Math.abs(neueMinete - sollMiete);
  const isValid = differenz < 0.5; // Toleranz: 50 Rappen
  
  return { isValid, sollMiete, differenz };
}

/**
 * Validiert die komplette Miet-Historie
 */
export function validateMietHistorie(historie: MietHistorie): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 1. Chronologische Reihenfolge prüfen
  const alleDaten = [
    historie.vertragsbeginn.datum,
    ...historie.anpassungen.map(a => a.datum),
  ];
  
  for (let i = 1; i < alleDaten.length; i++) {
    if (new Date(alleDaten[i]) <= new Date(alleDaten[i - 1])) {
      errors.push(`Datum ${alleDaten[i]} ist nicht chronologisch`);
    }
  }
  
  // 2. Jede Anpassung validieren
  let vorherigeAnpassung = historie.vertragsbeginn;
  
  for (const anpassung of historie.anpassungen) {
    const validation = validateAnpassung(
      vorherigeAnpassung.miete,
      vorherigeAnpassung.referenzzinssatz,
      anpassung.miete,
      anpassung.referenzzinssatz
    );
    
    if (!validation.isValid) {
      warnings.push(
        `Anpassung ${anpassung.datum}: Miete sollte CHF ${validation.sollMiete.toFixed(2)} sein, ist aber CHF ${anpassung.miete.toFixed(2)} (Differenz: CHF ${validation.differenz.toFixed(2)})`
      );
    }
    
    vorherigeAnpassung = anpassung;
  }
  
  // 3. Aktuellen Zinssatz prüfen
  const aktuellerZins = getAktuellerReferenzzinssatz();
  const aktuelleAnpassung = historie.aktuell || vorherigeAnpassung;
  
  if (aktuelleAnpassung.referenzzinssatz > aktuellerZins) {
    const sollMiete = berechneMiete(
      aktuelleAnpassung.miete,
      aktuelleAnpassung.referenzzinssatz,
      aktuellerZins
    );
    
    warnings.push(
      `⚠️ Einsparungspotential: Der aktuelle Referenzzinssatz ist ${aktuellerZins}% (seit ${getAktuellesDatum()}). ` +
      `Ihre Miete sollte CHF ${sollMiete.toFixed(2)} betragen statt CHF ${aktuelleAnpassung.miete.toFixed(2)}. ` +
      `Mögliche Einsparung: CHF ${(aktuelleAnpassung.miete - sollMiete).toFixed(2)}/Monat`
    );
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sollMiete,
      istMiete: aktuelleAnpassung.miete,
      differenz: aktuelleAnpassung.miete - sollMiete,
    };
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Gibt den aktuellen Referenzzinssatz zurück
 */
export function getAktuellerReferenzzinssatz(): number {
  return REFERENZZINSSATZ_HISTORIE[0].satz;
}

/**
 * Gibt das Datum des aktuellen Referenzzinssatzes zurück
 */
export function getAktuellesDatum(): string {
  return REFERENZZINSSATZ_HISTORIE[0].datum;
}

/**
 * Findet den Referenzzinssatz zu einem bestimmten Datum
 */
export function getReferenzzinssatzAmDatum(datum: string): number | null {
  const date = new Date(datum);
  
  for (const eintrag of REFERENZZINSSATZ_HISTORIE) {
    if (new Date(eintrag.datum) <= date) {
      return eintrag.satz;
    }
  }
  
  return null;
}

/**
 * Berechnet die Gesamteinsparung über einen Zeitraum
 */
export function berechneEinsparung(
  sollMiete: number,
  istMiete: number,
  startDatum: string
): { monatlich: number; jaehrlich: number; gesamt: number; monate: number } {
  const monatlich = istMiete - sollMiete;
  const jaehrlich = monatlich * 12;
  
  const start = new Date(startDatum);
  const heute = new Date();
  const monate = Math.floor(
    (heute.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  const gesamt = monatlich * monate;
  
  return { monatlich, jaehrlich, gesamt, monate };
}
