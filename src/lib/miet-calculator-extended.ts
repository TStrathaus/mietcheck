// src/lib/miet-calculator-extended.ts
/**
 * Erweiterter Schweizer Miet-Calculator
 * Mit Tracking von nicht-umgesetzten Änderungen und detaillierter Validierung
 */

export interface ReferenzZinssatz {
  datum: string;
  satz: number;
}

export interface NichtUmgesetzteAenderung {
  datum: string;
  referenzzinssatz: number;
  grund: 'schwellwert' | 'vermieter_ignoriert' | 'anderer_grund';
  beschreibung?: string;
}

export interface MietAnpassung {
  datum: string;
  referenzzinssatz: number;
  miete: number;
  typ: 'start' | 'erhöhung' | 'reduzierung';
  begründung?: string;
  dokumentUrl?: string;
  zusaetzlicheGruende?: string[]; // Teuerung, Kosten, etc.
}

export interface MietHistorie {
  vertragsbeginn: MietAnpassung;
  anpassungen: MietAnpassung[];
  aktuell: MietAnpassung;
  nichtUmgesetzteAenderungen?: NichtUmgesetzteAenderung[];
  vertraglicheSchwelle?: number; // z.B. 0.5 für 0.5%
}

export interface SollIstVergleich {
  datum: string;
  sollReferenzzins: number;
  istReferenzzins: number;
  sollMiete: number;
  istMiete: number;
  differenzZins: number;
  differenzMiete: number;
  status: 'korrekt' | 'zu_hoch' | 'zu_niedrig' | 'fehlend';
  erklaerung: string;
}

export interface DetailValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  kritisch: string[];
  sollIstVergleiche: SollIstVergleich[];
  uebersprungeneSchritte: string[];
  falscheberechnungen: string[];
  einsparungsPotential?: {
    monatlich: number;
    jaehrlich: number;
    naechsterTermin: string;
  };
}

/**
 * Schweizer Referenzzinssatz-Historie (offiziell)
 */
export const REFERENZZINSSATZ_HISTORIE: ReferenzZinssatz[] = [
  { datum: '2025-09-02', satz: 1.25 },
  { datum: '2025-03-03', satz: 1.50 },
  { datum: '2023-12-01', satz: 1.75 },
  { datum: '2023-06-01', satz: 1.50 },
  { datum: '2022-12-01', satz: 1.25 },
  { datum: '2022-03-02', satz: 1.25 },
  { datum: '2020-03-02', satz: 1.25 },
  { datum: '2019-06-03', satz: 1.25 },
  { datum: '2017-06-01', satz: 1.50 },
  { datum: '2016-09-01', satz: 1.50 },
  { datum: '2015-09-01', satz: 1.75 },
];

/**
 * Berechnet den nächsten möglichen Kündigungstermin (Quartalsende + 3 Monate)
 * In der Schweiz sind übliche Kündigungstermine: 31.3., 30.6., 30.9., 31.12.
 */
export function berechneNaechstenKuendigungstermin(datum: Date): Date {
  const heute = new Date(datum);

  // Kündigungsfrist: 3 Monate zum Quartalsende
  // Wir addieren 3 Monate und finden das nächste Quartalsende
  const inDreiMonaten = new Date(heute);
  inDreiMonaten.setMonth(inDreiMonaten.getMonth() + 3);

  const monat = inDreiMonaten.getMonth();
  const jahr = inDreiMonaten.getFullYear();

  // Finde nächstes Quartalsende
  let kuendigungsTermin: Date;

  if (monat < 3) {
    // Q1 -> 31. März
    kuendigungsTermin = new Date(jahr, 2, 31);
  } else if (monat < 6) {
    // Q2 -> 30. Juni
    kuendigungsTermin = new Date(jahr, 5, 30);
  } else if (monat < 9) {
    // Q3 -> 30. September
    kuendigungsTermin = new Date(jahr, 8, 30);
  } else {
    // Q4 -> 31. Dezember
    kuendigungsTermin = new Date(jahr, 11, 31);
  }

  // Wenn wir schon im Quartalsende-Monat sind, gehe zum nächsten Quartal
  if (kuendigungsTermin <= inDreiMonaten) {
    kuendigungsTermin.setMonth(kuendigungsTermin.getMonth() + 3);
    // Korrigiere Tage für verschiedene Monate
    if (kuendigungsTermin.getMonth() === 5) {
      kuendigungsTermin.setDate(30); // Juni
    } else if (kuendigungsTermin.getMonth() === 8) {
      kuendigungsTermin.setDate(30); // September
    }
  }

  return kuendigungsTermin;
}

/**
 * Berechnet Miete basierend auf Referenzzinssatz-Änderung
 */
export function berechneMiete(
  aktuelleMiete: number,
  alterZins: number,
  neuerZins: number
): number {
  const zinsDifferenz = neuerZins - alterZins;
  const prozentualerWechsel = (zinsDifferenz / 0.25) * 3;
  const neueMiete = aktuelleMiete * (1 + prozentualerWechsel / 100);
  return Math.round(neueMiete * 100) / 100;
}

/**
 * Findet alle Referenzzinssatz-Änderungen zwischen zwei Daten
 */
export function findZinsaenderungenZwischen(
  startDatum: string,
  endDatum: string
): ReferenzZinssatz[] {
  const start = new Date(startDatum);
  const end = new Date(endDatum);
  
  return REFERENZZINSSATZ_HISTORIE.filter(eintrag => {
    const datum = new Date(eintrag.datum);
    return datum > start && datum <= end;
  }).reverse(); // Chronologisch
}

/**
 * Berechnet Soll-Miete über mehrere Zinsschritte
 */
export function berechneSollMieteUeberSchritte(
  startMiete: number,
  startZins: number,
  startDatum: string,
  zielDatum: string
): { sollMiete: number; schritte: Array<{ datum: string; zins: number; miete: number }> } {
  const schritte: Array<{ datum: string; zins: number; miete: number }> = [];
  
  let aktuelleMiete = startMiete;
  let aktuellerZins = startZins;
  
  const start = new Date(startDatum);
  const ziel = new Date(zielDatum);
  
  // Finde alle Zinsänderungen ZWISCHEN start und ziel
  const aenderungen = REFERENZZINSSATZ_HISTORIE
    .filter(z => {
      const d = new Date(z.datum);
      return d > start && d <= ziel;
    })
    .reverse();
  
  for (const aenderung of aenderungen) {
    if (aenderung.satz !== aktuellerZins) {
      aktuelleMiete = berechneMiete(aktuelleMiete, aktuellerZins, aenderung.satz);
      aktuellerZins = aenderung.satz;
      
      schritte.push({
        datum: aenderung.datum,
        zins: aktuellerZins,
        miete: aktuelleMiete,
      });
    }
  }
  
  return { sollMiete: aktuelleMiete, schritte };
}

/**
 * HAUPTFUNKTION: Detaillierte Validierung der Miet-Historie
 */
export function validateMietHistorieDetailed(
  historie: MietHistorie
): DetailValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const kritisch: string[] = [];
  const sollIstVergleiche: SollIstVergleich[] = [];
  const uebersprungeneSchritte: string[] = [];
  const falscheberechnungen: string[] = [];
  
  // 1. CHRONOLOGIE PRÜFEN
  const alleDaten = [
    historie.vertragsbeginn.datum,
    ...historie.anpassungen.map(a => a.datum),
  ];
  
  for (let i = 1; i < alleDaten.length; i++) {
    if (new Date(alleDaten[i]) <= new Date(alleDaten[i - 1])) {
      errors.push(`Datum ${alleDaten[i]} ist nicht chronologisch nach ${alleDaten[i - 1]}`);
    }
  }
  
  // 2. JEDE ANPASSUNG VALIDIEREN
  let vorherigeAnpassung = historie.vertragsbeginn;
  
  for (let i = 0; i < historie.anpassungen.length; i++) {
    const anpassung = historie.anpassungen[i];
    
    // Finde alle Zinsänderungen zwischen vorheriger und dieser Anpassung
    const zwischenAenderungen = findZinsaenderungenZwischen(
      vorherigeAnpassung.datum,
      anpassung.datum
    );
    
    // Berechne Soll-Miete über alle Schritte
    const { sollMiete, schritte } = berechneSollMieteUeberSchritte(
      vorherigeAnpassung.miete,
      vorherigeAnpassung.referenzzinssatz,
      vorherigeAnpassung.datum,
      anpassung.datum
    );
    
    // Soll-Referenzzins ermitteln
    const sollZins = schritte.length > 0 
      ? schritte[schritte.length - 1].zins 
      : vorherigeAnpassung.referenzzinssatz;
    
    // Übersprungene Schritte?
    if (schritte.length > 1) {
      const uebersprungen = schritte.slice(0, -1);
      uebersprungeneSchritte.push(
        `Zwischen ${new Date(vorherigeAnpassung.datum).toLocaleDateString('de-CH')} ` +
        `und ${new Date(anpassung.datum).toLocaleDateString('de-CH')} ` +
        `wurden ${uebersprungen.length} Zinsänderung(en) übersprungen: ` +
        uebersprungen.map(s => 
          `${new Date(s.datum).toLocaleDateString('de-CH')}: ${s.zins}%`
        ).join(', ')
      );
    }
    
    // Soll-Ist Vergleich
    const differenzZins = anpassung.referenzzinssatz - sollZins;
    const differenzMiete = anpassung.miete - sollMiete;
    const toleranz = 1.0; // CHF 1.00 Toleranz
    
    let status: 'korrekt' | 'zu_hoch' | 'zu_niedrig' | 'fehlend' = 'korrekt';
    let erklaerung = '';
    
    if (Math.abs(differenzMiete) > toleranz) {
      if (differenzMiete > 0) {
        status = 'zu_hoch';
        erklaerung = `Miete ist CHF ${differenzMiete.toFixed(2)} zu hoch`;
        
        // Prüfe ob zusätzliche Gründe angegeben sind
        if (anpassung.zusaetzlicheGruende && anpassung.zusaetzlicheGruende.length > 0) {
          warnings.push(
            `Anpassung ${new Date(anpassung.datum).toLocaleDateString('de-CH')}: ` +
            `Miete CHF ${anpassung.miete.toFixed(2)} ist höher als Referenzzins-Berechnung ` +
            `(CHF ${sollMiete.toFixed(2)}). Zusätzliche Gründe: ${anpassung.zusaetzlicheGruende.join(', ')}. ` +
            `Bitte prüfen Sie die Rechtmäßigkeit dieser Zusatzerhöhung.`
          );
        } else {
          falscheberechnungen.push(
            `Anpassung ${new Date(anpassung.datum).toLocaleDateString('de-CH')}: ` +
            `Miete sollte CHF ${sollMiete.toFixed(2)} sein (Referenzzins ${sollZins}%), ` +
            `ist aber CHF ${anpassung.miete.toFixed(2)} (Referenzzins ${anpassung.referenzzinssatz}%). ` +
            `Differenz: CHF ${differenzMiete.toFixed(2)} zu hoch! ` +
            `KEINE zusätzlichen Gründe angegeben.`
          );
        }
      } else {
        status = 'zu_niedrig';
        erklaerung = `Miete ist CHF ${Math.abs(differenzMiete).toFixed(2)} zu niedrig (selten, aber möglich)`;
      }
    } else {
      erklaerung = 'Berechnung korrekt';
    }
    
    sollIstVergleiche.push({
      datum: anpassung.datum,
      sollReferenzzins: sollZins,
      istReferenzzins: anpassung.referenzzinssatz,
      sollMiete,
      istMiete: anpassung.miete,
      differenzZins,
      differenzMiete,
      status,
      erklaerung,
    });
    
    vorherigeAnpassung = anpassung;
  }
  
  // 3. AKTUELLE SITUATION PRÜFEN
  const aktuellerZins = REFERENZZINSSATZ_HISTORIE[0].satz;
  const aktuellerZinsDatum = REFERENZZINSSATZ_HISTORIE[0].datum;
  const aktuelleAnpassung = historie.aktuell || vorherigeAnpassung;
  
  // Berechne Soll-Miete vom letzten Stand bis heute
  const { sollMiete: aktuelleSollMiete, schritte: aktuelleSchritte } = 
    berechneSollMieteUeberSchritte(
      aktuelleAnpassung.miete,
      aktuelleAnpassung.referenzzinssatz,
      aktuelleAnpassung.datum,
      new Date().toISOString().split('T')[0]
    );
  
  // Gibt es nicht-berücksichtigte Änderungen?
  if (aktuelleSchritte.length > 0) {
    const letzterSchritt = aktuelleSchritte[aktuelleSchritte.length - 1];
    
    if (letzterSchritt.zins < aktuelleAnpassung.referenzzinssatz) {
      // ZINSSENKUNG NICHT BERÜCKSICHTIGT!
      const differenz = aktuelleAnpassung.miete - aktuelleSollMiete;
      
      if (differenz > 1.0) {
        // Berechne möglichen Kündigungstermin
        const zinssenkungDatum = letzterSchritt.datum;
        const naechsterKuendigungstermin = berechneNaechstenKuendigungstermin(new Date());

        kritisch.push(
          `❌ KRITISCH: Nicht-berücksichtigte Zinssenkung!`,
          ``,
          `Seit ${new Date(zinssenkungDatum).toLocaleDateString('de-CH')} ist der Referenzzins bei ${letzterSchritt.zins}%`,
          `Ihre Miete basiert noch auf ${aktuelleAnpassung.referenzzinssatz}%`,
          ``,
          `Differenz: ${(letzterSchritt.zins - aktuelleAnpassung.referenzzinssatz).toFixed(2)}% ` +
          `(${Math.abs((letzterSchritt.zins - aktuelleAnpassung.referenzzinssatz) / 0.25)} Schritte à 0.25%)`,
          `Reduzierung: ${((letzterSchritt.miete - aktuelleAnpassung.miete) / aktuelleAnpassung.miete * 100).toFixed(2)}%`,
          ``,
          `💰 SIE HABEN ANSPRUCH AUF:`,
          `• Neue Miete: CHF ${aktuelleSollMiete.toFixed(2)}/Monat`,
          `• Aktuelle Miete: CHF ${aktuelleAnpassung.miete.toFixed(2)}/Monat`,
          `• Monatliche Ersparnis: CHF ${differenz.toFixed(2)}`,
          `• Jährliche Ersparnis: CHF ${(differenz * 12).toFixed(2)}`,
          ``,
          `📅 Nächster möglicher Termin: ${naechsterKuendigungstermin.toLocaleDateString('de-CH')}`,
          `(Mietsenkung muss mit Herabsetzungsbegehren verlangt werden)`
        );
        
        sollIstVergleiche.push({
          datum: zinssenkungDatum,
          sollReferenzzins: letzterSchritt.zins,
          istReferenzzins: aktuelleAnpassung.referenzzinssatz,
          sollMiete: aktuelleSollMiete,
          istMiete: aktuelleAnpassung.miete,
          differenzZins: letzterSchritt.zins - aktuelleAnpassung.referenzzinssatz,
          differenzMiete: differenz,
          status: 'fehlend',
          erklaerung: 'Zinssenkung wurde NICHT berücksichtigt - Anspruch auf Mietreduzierung!',
        });
        
        return {
          isValid: false,
          errors,
          warnings,
          kritisch,
          sollIstVergleiche,
          uebersprungeneSchritte,
          falscheberechnungen,
          einsparungsPotential: {
            monatlich: differenz,
            jaehrlich: differenz * 12,
            naechsterTermin: naechsterKuendigungstermin.toISOString().split('T')[0],
          },
        };
      }
    }
  }
  
  return {
    isValid: errors.length === 0 && kritisch.length === 0,
    errors,
    warnings,
    kritisch,
    sollIstVergleiche,
    uebersprungeneSchritte,
    falscheberechnungen,
  };
}

/**
 * Helper: Formatiert Soll-Ist Vergleich für Anzeige
 */
export function formatSollIstVergleich(vergleich: SollIstVergleich): string {
  const datum = new Date(vergleich.datum).toLocaleDateString('de-CH');
  const status = {
    'korrekt': '✅',
    'zu_hoch': '⚠️',
    'zu_niedrig': 'ℹ️',
    'fehlend': '❌',
  }[vergleich.status];
  
  return `${status} ${datum}: Soll ${vergleich.sollMiete.toFixed(2)} @ ${vergleich.sollReferenzzins}% | ` +
         `Ist ${vergleich.istMiete.toFixed(2)} @ ${vergleich.istReferenzzins}% | ` +
         `${vergleich.erklaerung}`;
}
