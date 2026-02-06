import jsPDF from 'jspdf';

export interface DocumentData {
  tenant: {
    name: string;
    address: string;
    city: string;
  };
  landlord: {
    name: string;
    address: string;
    city: string;
  };
  contract: {
    address: string;
    contractDate: string;
    currentRent: number;
    referenceRate: number;
  };
  calculation: {
    newRent: number;
    netReduction: number;
    yearlySavings: number;
    reductionPercentage?: number;
    grossReduction?: number;
    inflationOffset?: number;
    costIncreaseOffset?: number;
  };
  nextTerminationDate: string;
}

/**
 * Schweizer Referenzzinssatz-Historie für den Brief
 */
const REFERENZZINSSATZ_HISTORIE = [
  { datum: '02.09.2025', satz: 1.25 },
  { datum: '03.03.2025', satz: 1.50 },
  { datum: '01.12.2023', satz: 1.75 },
  { datum: '01.06.2023', satz: 1.50 },
  { datum: '01.12.2022', satz: 1.25 },
];

/**
 * Generiert ein rechtssicheres Herabsetzungsbegehren im Swiss Legal Format
 * Konform mit OR 269d und VMWG Art. 13
 */
export function generateHerabsetzungsbegehren(data: DocumentData): Uint8Array {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 25;
  const marginRight = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;

  let y = 20;

  // === ABSENDER (oben links) ===
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.tenant.name, marginLeft, y);
  y += 5;
  doc.text(data.tenant.address, marginLeft, y);
  y += 5;
  doc.text(data.tenant.city, marginLeft, y);
  y += 20;

  // === EMPFÄNGER (rechts eingerückt) ===
  const recipientX = 120;
  doc.text(data.landlord.name, recipientX, y);
  y += 5;
  doc.text(data.landlord.address, recipientX, y);
  y += 5;
  doc.text(data.landlord.city, recipientX, y);
  y += 20;

  // === VERSANDART ===
  doc.setFont('helvetica', 'bold');
  doc.text('Per Einschreiben (A-Post Plus)', marginLeft, y);
  doc.setFont('helvetica', 'normal');
  y += 15;

  // === ORT UND DATUM ===
  const today = new Date().toLocaleDateString('de-CH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`${data.tenant.city.split(' ').slice(1).join(' ')}, ${today}`, marginLeft, y);
  y += 15;

  // === BETREFF ===
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Betreff: Herabsetzungsbegehren gemäss Art. 270a OR', marginLeft, y);
  y += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Mietobjekt: ${data.contract.address}`, marginLeft, y);
  y += 12;

  // === ANREDE ===
  doc.text('Sehr geehrte Damen und Herren', marginLeft, y);
  y += 10;

  // === HAUPTTEXT ===
  const paragraphs = [
    `Gestützt auf Art. 270a OR und Art. 13 VMWG beantrage ich hiermit die Herabsetzung des Nettomietzinses für die oben genannte Wohnung.`,
    '',
    '1. Ausgangslage',
    `Bei Abschluss des Mietvertrages vom ${formatDate(data.contract.contractDate)} betrug der hypothekarische Referenzzinssatz ${data.contract.referenceRate}%. Das Bundesamt für Wohnungswesen (BWO) hat den Referenzzinssatz per 02. September 2025 auf 1.25% gesenkt.`,
    '',
    '2. Rechtliche Grundlage',
    `Gemäss Art. 13 Abs. 1 VMWG berechtigt eine Senkung des Referenzzinssatzes um 0.25 Prozentpunkte zu einer Mietzinsreduktion von 2.91% des Nettomietzinses (bei einem Zinssatz unter 5%).`,
  ];

  // Render paragraphs
  for (const para of paragraphs) {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    if (para === '') {
      y += 3;
      continue;
    }

    if (para.startsWith('1.') || para.startsWith('2.') || para.startsWith('3.') || para.startsWith('4.')) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }

    const lines = doc.splitTextToSize(para, contentWidth);
    doc.text(lines, marginLeft, y);
    y += lines.length * 5;
  }

  // === BERECHNUNG (Box) ===
  y += 5;
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('3. Berechnung', marginLeft, y);
  y += 7;

  // Berechnungs-Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(marginLeft, y, contentWidth, 45, 2, 2, 'FD');

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const rateSteps = Math.round((data.contract.referenceRate - 1.25) / 0.25);
  const reductionPercent = rateSteps * 2.91;

  const calcLines = [
    `Referenzzinssatz bei Vertragsabschluss: ${data.contract.referenceRate}%`,
    `Aktueller Referenzzinssatz (seit 02.09.2025): 1.25%`,
    `Zinssenkung: ${(data.contract.referenceRate - 1.25).toFixed(2)}% (${rateSteps} × 0.25%)`,
    `Mietzinsreduktion: ${rateSteps} × 2.91% = ${reductionPercent.toFixed(2)}%`,
    ``,
    `Aktueller Nettomietzins: CHF ${data.contract.currentRent.toFixed(2)}`,
    `Reduktion: CHF ${data.calculation.netReduction.toFixed(2)} (${reductionPercent.toFixed(2)}%)`,
    `Neuer Nettomietzins: CHF ${data.calculation.newRent.toFixed(2)}`,
  ];

  for (const line of calcLines) {
    if (line === '') {
      y += 2;
      continue;
    }
    doc.text(line, marginLeft + 5, y);
    y += 4.5;
  }

  y += 10;

  // === ANTRAG ===
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Antrag', marginLeft, y);
  y += 7;
  doc.setFont('helvetica', 'normal');

  const antragText = [
    `Ich beantrage hiermit die Herabsetzung des monatlichen Nettomietzinses von CHF ${data.contract.currentRent.toFixed(2)} auf CHF ${data.calculation.newRent.toFixed(2)} per ${data.nextTerminationDate}.`,
    '',
    `Dies entspricht einer jährlichen Ersparnis von CHF ${data.calculation.yearlySavings.toFixed(2)}.`,
    '',
    `Ich bitte Sie, mir die Herabsetzung innert 30 Tagen schriftlich auf dem amtlichen Formular zu bestätigen.`,
    '',
    `Sollten Sie meinem Begehren nicht entsprechen oder innert dieser Frist nicht antworten, werde ich mich gemäss Art. 270b OR an die zuständige Schlichtungsbehörde wenden.`,
  ];

  for (const para of antragText) {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    if (para === '') {
      y += 3;
      continue;
    }

    const lines = doc.splitTextToSize(para, contentWidth);
    doc.text(lines, marginLeft, y);
    y += lines.length * 5;
  }

  // === SCHLUSS ===
  y += 10;
  doc.text('Freundliche Grüsse', marginLeft, y);
  y += 20;

  // === UNTERSCHRIFTSFELD ===
  doc.setDrawColor(150, 150, 150);
  doc.line(marginLeft, y, marginLeft + 60, y);
  y += 5;
  doc.setFontSize(9);
  doc.text(data.tenant.name, marginLeft, y);
  y += 4;
  doc.text('(Handschriftliche Unterschrift)', marginLeft, y);

  // === BEILAGEN ===
  y += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Beilagen:', marginLeft, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('- Kopie des Mietvertrages (empfohlen)', marginLeft, y);
  y += 4;
  doc.text('- Referenzzinssatz-Bekanntmachung BWO (empfohlen)', marginLeft, y);

  // === SEITE 2: REFERENZZINS-HISTORIE & ANLEITUNG ===
  doc.addPage();
  y = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Beilage: Referenzzinssatz-Historie und Versandanleitung', marginLeft, y);
  y += 15;

  // Referenzzins-Tabelle
  doc.setFontSize(11);
  doc.text('Hypothekarischer Referenzzinssatz (BWO)', marginLeft, y);
  y += 8;

  // Tabellen-Header
  doc.setFillColor(240, 240, 240);
  doc.rect(marginLeft, y, 80, 7, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Gültig ab', marginLeft + 5, y + 5);
  doc.text('Referenzzinssatz', marginLeft + 45, y + 5);
  y += 7;

  doc.setFont('helvetica', 'normal');
  for (const entry of REFERENZZINSSATZ_HISTORIE) {
    const isCurrentRate = entry.satz === 1.25 && entry.datum === '02.09.2025';
    if (isCurrentRate) {
      doc.setFillColor(220, 252, 231); // Grün für aktuellen Satz
      doc.rect(marginLeft, y, 80, 6, 'F');
    }
    doc.text(entry.datum, marginLeft + 5, y + 4);
    doc.text(`${entry.satz.toFixed(2)}%`, marginLeft + 45, y + 4);
    y += 6;
  }

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Quelle: Bundesamt für Wohnungswesen (BWO)', marginLeft, y + 5);
  doc.setTextColor(0, 0, 0);

  // Versandanleitung
  y += 20;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Versandanleitung', marginLeft, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const anleitung = [
    '1. Brief ausdrucken',
    '   Drucken Sie dieses Dokument auf weissem A4-Papier aus.',
    '',
    '2. Handschriftlich unterschreiben',
    '   Unterschreiben Sie den Brief im vorgesehenen Feld mit Kugelschreiber.',
    '',
    '3. Per Einschreiben versenden (A-Post Plus)',
    '   Senden Sie den Brief als Einschreiben an Ihren Vermieter.',
    '   Wichtig: Bewahren Sie den Einlieferungsbeleg auf!',
    '',
    '4. Frist abwarten',
    '   Der Vermieter hat 30 Tage Zeit, Ihnen auf dem amtlichen Formular',
    '   zu antworten.',
    '',
    '5. Bei Ablehnung oder Nichtantwort',
    '   Wenden Sie sich an die Schlichtungsbehörde Ihres Bezirks.',
    '   Das Verfahren ist in der Regel kostenlos.',
  ];

  for (const line of anleitung) {
    if (line === '') {
      y += 3;
      continue;
    }

    if (line.match(/^\d\./)) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }

    doc.text(line, marginLeft, y);
    y += 5;
  }

  // Wichtiger Hinweis
  y += 10;
  doc.setFillColor(254, 243, 199); // Gelb
  doc.roundedRect(marginLeft, y, contentWidth, 25, 2, 2, 'F');

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Wichtiger Hinweis:', marginLeft + 5, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  const hinweis = doc.splitTextToSize(
    'Dieses Dokument wurde automatisch erstellt und ersetzt keine Rechtsberatung. Bei komplexen Fällen oder Unsicherheiten empfehlen wir die Konsultation eines Mieterschutzverbandes oder einer Rechtsberatung.',
    contentWidth - 10
  );
  doc.text(hinweis, marginLeft + 5, y);

  // Footer mit MietCheck.ch
  y = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Erstellt mit MietCheck.ch - Ihr Helfer für faire Mieten', marginLeft, y);
  doc.text(`Generiert am: ${today}`, pageWidth - marginRight - 50, y);

  return new Uint8Array(doc.output('arraybuffer') as ArrayBuffer);
}

/**
 * Formatiert ein Datum im deutschen Format
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-CH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Generiert einen Analyse-Report (Service 1)
 */
export function generateAnalysisReport(data: any): Uint8Array {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Mietminderungs-Analyse', 20, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let y = 40;

  const lines = [
    `Mietobjekt: ${data.address}`,
    `Aktuelle Nettomiete: CHF ${data.currentRent.toFixed(2)}`,
    `Referenzzinssatz bei Vertragsabschluss: ${data.referenceRate}%`,
    `Aktueller Referenzzinssatz: 1.25%`,
    '',
    `✓ Ihr Anspruch auf Mietminderung: CHF ${data.calculation.netReduction.toFixed(2)}/Monat`,
    `✓ Neue Nettomiete: CHF ${data.calculation.newRent.toFixed(2)}`,
    `✓ Jährliche Ersparnis: CHF ${data.calculation.yearlySavings.toFixed(2)}`,
    '',
    'Berechnungsdetails:',
    ...data.calculation.details,
    '',
    'Nächste Schritte:',
    '1. Herabsetzungsbegehren erstellen (Service 2 für CHF 50)',
    '2. Per Einschreiben an Vermieter senden',
    '3. 30 Tage auf Antwort warten',
    '4. Bei Ablehnung: Schlichtungsbehörde kontaktieren',
  ];

  lines.forEach((line) => {
    doc.text(line, 20, y);
    y += 7;
  });

  return new Uint8Array(doc.output('arraybuffer') as ArrayBuffer);
}
