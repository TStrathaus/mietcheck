// src/lib/document-generator.ts
// Professional Swiss Legal Format for Herabsetzungsbegehren
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
  };
  nextTerminationDate: string;
}

// Referenzzinssatz-Historie für die Tabelle
const REFERENZZINS_HISTORIE = [
  { datum: '02.09.2025', satz: 1.25 },
  { datum: '02.06.2025', satz: 1.50 },
  { datum: '02.03.2024', satz: 1.75 },
  { datum: '01.06.2023', satz: 1.50 },
  { datum: '02.03.2020', satz: 1.25 },
  { datum: '03.06.2019', satz: 1.25 },
  { datum: '01.06.2017', satz: 1.50 },
  { datum: '01.09.2016', satz: 1.50 },
  { datum: '01.09.2015', satz: 1.75 },
];

export function generateHerabsetzungsbegehren(data: DocumentData): Uint8Array {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  let y = margin;

  // ============== SEITE 1: BRIEF ==============

  // Header: Absender (oben links)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.tenant.name, margin, y);
  y += 5;
  doc.text(data.tenant.address, margin, y);
  y += 5;
  doc.text(data.tenant.city, margin, y);
  y += 15;

  // Empfänger (Vermieter)
  doc.setFont('helvetica', 'bold');
  doc.text(data.landlord.name, margin, y);
  doc.setFont('helvetica', 'normal');
  y += 5;
  doc.text(data.landlord.address, margin, y);
  y += 5;
  doc.text(data.landlord.city, margin, y);
  y += 20;

  // Datum und Versandart
  const today = new Date().toLocaleDateString('de-CH', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  doc.setFont('helvetica', 'bold');
  doc.text('Per Einschreiben (A-Post Plus)', margin, y);
  doc.setFont('helvetica', 'normal');
  y += 10;
  doc.text(today, margin, y);
  y += 15;

  // Betreff
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Betreff: Herabsetzungsbegehren gemäss Art. 270a OR', margin, y);
  y += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Mietobjekt: ${data.contract.address}`, margin, y);
  y += 12;

  // Anrede
  doc.text('Sehr geehrte Damen und Herren', margin, y);
  y += 10;

  // Haupttext
  const textLines = [
    `Ich beziehe mich auf den Mietvertrag vom ${formatDate(data.contract.contractDate)} für das oben`,
    `genannte Mietobjekt und verlange hiermit eine Herabsetzung des Mietzinses.`,
    '',
    'Begründung:',
    '',
    `Bei Vertragsabschluss bzw. der letzten Mietzinsanpassung betrug der hypothekarische`,
    `Referenzzinssatz ${data.contract.referenceRate}%. Seit dem 2. September 2025 beträgt der vom`,
    `Bundesamt für Wohnungswesen (BWO) publizierte Referenzzinssatz nur noch 1.25%.`,
    '',
    'Gemäss Art. 13 der Verordnung über die Miete und Pacht von Wohn- und Geschäftsräumen',
    '(VMWG) berechtigt eine Senkung des Referenzzinssatzes um 0.25 Prozentpunkte zu einer',
    'Mietzinsreduktion von 2.91% des Nettomietzinses.',
  ];

  textLines.forEach(line => {
    doc.text(line, margin, y);
    y += 5;
  });

  y += 5;

  // Berechnungs-Box
  doc.setDrawColor(0, 100, 180);
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 45, 3, 3, 'FD');

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Berechnung der Mietzinsreduktion:', margin + 5, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  y += 8;
  const col1 = margin + 10;
  const col2 = margin + 100;

  doc.text('Aktueller Nettomietzins:', col1, y);
  doc.text(`CHF ${data.contract.currentRent.toFixed(2)}`, col2, y);
  y += 6;

  doc.text(`Referenzzins bei Vertragsabschluss:`, col1, y);
  doc.text(`${data.contract.referenceRate}%`, col2, y);
  y += 6;

  doc.text('Aktueller Referenzzins:', col1, y);
  doc.text('1.25%', col2, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Neuer Nettomietzins:', col1, y);
  doc.setTextColor(0, 128, 0);
  doc.text(`CHF ${data.calculation.newRent.toFixed(2)}`, col2, y);
  doc.setTextColor(0, 0, 0);
  y += 6;

  doc.text('Monatliche Ersparnis:', col1, y);
  doc.setTextColor(0, 128, 0);
  doc.text(`CHF ${data.calculation.netReduction.toFixed(2)}`, col2, y);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  y += 15;

  // Antrag
  doc.setFont('helvetica', 'bold');
  doc.text('Antrag:', margin, y);
  doc.setFont('helvetica', 'normal');
  y += 7;

  const antragText = [
    `Gestützt auf Art. 270a OR verlange ich hiermit die Herabsetzung des monatlichen`,
    `Nettomietzinses von CHF ${data.contract.currentRent.toFixed(2)} auf CHF ${data.calculation.newRent.toFixed(2)}`,
    `per ${data.nextTerminationDate}.`,
    '',
    'Ich bitte Sie, mir diese Mietzinsreduktion innert 30 Tagen auf dem amtlichen Formular',
    'zur Mitteilung von Mietzinserhöhungen zu bestätigen.',
    '',
    'Sollten Sie meinem Begehren nicht entsprechen oder innert dieser Frist nicht antworten,',
    'werde ich mich an die Schlichtungsbehörde in Mietsachen wenden.',
  ];

  antragText.forEach(line => {
    doc.text(line, margin, y);
    y += 5;
  });

  y += 10;

  // Gruss
  doc.text('Freundliche Grüsse', margin, y);
  y += 20;

  // Unterschrifts-Feld
  doc.setDrawColor(150, 150, 150);
  doc.line(margin, y, margin + 60, y);
  y += 5;
  doc.setFontSize(9);
  doc.text('(Unterschrift)', margin, y);
  y += 7;
  doc.setFontSize(10);
  doc.text(data.tenant.name, margin, y);

  // Footer Seite 1
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Seite 1 von 2', pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.text('Erstellt mit MietCheck.ch', pageWidth / 2, pageHeight - 5, { align: 'center' });

  // ============== SEITE 2: ANLEITUNG & REFERENZZINS-HISTORIE ==============
  doc.addPage();
  doc.setTextColor(0, 0, 0);
  y = margin;

  // Titel Seite 2
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Anleitung zum Versand & Referenzzins-Historie', margin, y);
  y += 15;

  // Anleitung Box
  doc.setFillColor(255, 250, 240);
  doc.setDrawColor(255, 165, 0);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 70, 3, 3, 'FD');

  y += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('So versenden Sie das Herabsetzungsbegehren:', margin + 5, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const anleitungSteps = [
    '1. Drucken Sie Seite 1 dieses Dokuments aus',
    '2. Unterschreiben Sie das Dokument handschriftlich',
    '3. Senden Sie den Brief per Einschreiben (A-Post Plus) an Ihren Vermieter',
    '4. Bewahren Sie den Einlieferungsbeleg als Nachweis auf',
    '5. Warten Sie 30 Tage auf eine Antwort',
    '6. Bei Ablehnung oder ausbleibender Antwort: Schlichtungsbehörde kontaktieren',
  ];

  anleitungSteps.forEach(step => {
    doc.text(step, margin + 8, y);
    y += 7;
  });

  y += 20;

  // Wichtiger Hinweis
  doc.setFillColor(255, 240, 240);
  doc.setDrawColor(220, 53, 69);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 25, 3, 3, 'FD');
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 53, 69);
  doc.text('Wichtig:', margin + 5, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  y += 7;
  doc.text('Versenden Sie den Brief unbedingt per Einschreiben, um einen Zustellnachweis zu haben.', margin + 5, y);
  y += 5;
  doc.text('Nur Seite 1 an den Vermieter senden - Seite 2 ist für Ihre Unterlagen.', margin + 5, y);

  y += 25;

  // Referenzzins-Historie Tabelle
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Referenzzinssatz-Historie (BWO)', margin, y);
  y += 8;

  // Tabellen-Header
  doc.setFillColor(0, 100, 180);
  doc.setTextColor(255, 255, 255);
  doc.rect(margin, y, 60, 8, 'F');
  doc.rect(margin + 60, y, 50, 8, 'F');
  doc.setFontSize(9);
  doc.text('Gültig ab', margin + 5, y + 6);
  doc.text('Referenzzinssatz', margin + 65, y + 6);
  y += 8;

  // Tabellen-Zeilen
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  REFERENZZINS_HISTORIE.forEach((eintrag, index) => {
    const bgColor = index % 2 === 0 ? 245 : 255;
    doc.setFillColor(bgColor, bgColor, bgColor);
    doc.rect(margin, y, 60, 7, 'F');
    doc.rect(margin + 60, y, 50, 7, 'F');
    doc.text(eintrag.datum, margin + 5, y + 5);
    doc.text(`${eintrag.satz.toFixed(2)}%`, margin + 65, y + 5);
    y += 7;
  });

  y += 15;

  // Rechtliche Grundlagen
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Rechtliche Grundlagen:', margin, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const rechtText = [
    '• Art. 269d OR: Anpassung des Mietzinses an den Referenzzinssatz',
    '• Art. 270a OR: Anfechtung des Mietzinses und Herabsetzungsbegehren',
    '• Art. 13 VMWG: Berechnung der Mietzinsanpassung (2.91% pro 0.25% Zinssenkung)',
    '• Art. 270 OR: Frist von 30 Tagen für Anfechtung nach Vermieterantwort',
  ];

  rechtText.forEach(line => {
    doc.text(line, margin, y);
    y += 5;
  });

  // Footer Seite 2
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Seite 2 von 2 - Für Ihre Unterlagen', pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.text('Erstellt mit MietCheck.ch', pageWidth / 2, pageHeight - 5, { align: 'center' });

  return new Uint8Array(doc.output('arraybuffer') as ArrayBuffer);
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function generateAnalysisReport(data: any): Uint8Array {
  const doc = new jsPDF();
  const margin = 25;
  let y = margin;

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Mietminderungs-Analyse', margin, y);
  y += 15;

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-CH')}`, margin, y);
  y += 15;

  // Property Info
  doc.setFont('helvetica', 'bold');
  doc.text('Mietobjekt:', margin, y);
  doc.setFont('helvetica', 'normal');
  y += 7;
  doc.text(data.address || 'N/A', margin + 5, y);
  y += 12;

  // Current Rent
  doc.setFont('helvetica', 'bold');
  doc.text('Aktuelle Mietsituation:', margin, y);
  doc.setFont('helvetica', 'normal');
  y += 7;
  doc.text(`Nettomietzins: CHF ${(data.currentRent || 0).toFixed(2)}`, margin + 5, y);
  y += 5;
  doc.text(`Referenzzins bei Vertrag: ${data.referenceRate || 'N/A'}%`, margin + 5, y);
  y += 5;
  doc.text(`Aktueller Referenzzins: 1.25%`, margin + 5, y);
  y += 12;

  // Result
  if (data.calculation) {
    doc.setFillColor(240, 255, 240);
    doc.setDrawColor(0, 180, 0);
    doc.roundedRect(margin, y, 160, 35, 3, 3, 'FD');
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Ihr Anspruch auf Mietminderung:', margin + 5, y);
    y += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 128, 0);
    doc.text(`Neue Nettomiete: CHF ${data.calculation.newRent.toFixed(2)}`, margin + 10, y);
    y += 7;
    doc.text(`Monatliche Ersparnis: CHF ${data.calculation.netReduction.toFixed(2)}`, margin + 10, y);
    y += 7;
    doc.text(`Jährliche Ersparnis: CHF ${data.calculation.yearlySavings.toFixed(2)}`, margin + 10, y);

    doc.setTextColor(0, 0, 0);
  }

  y += 20;

  // Next Steps
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Nächste Schritte:', margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const steps = [
    '1. Herabsetzungsbegehren erstellen (Service 2)',
    '2. Brief per Einschreiben an Vermieter senden',
    '3. 30 Tage auf Antwort warten',
    '4. Bei Ablehnung: Schlichtungsbehörde kontaktieren',
  ];

  steps.forEach(step => {
    doc.text(step, margin + 5, y);
    y += 7;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Erstellt mit MietCheck.ch', 105, 285, { align: 'center' });

  return new Uint8Array(doc.output('arraybuffer') as ArrayBuffer);
}
