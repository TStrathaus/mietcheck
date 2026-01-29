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

export function generateHerabsetzungsbegehren(data: DocumentData): Uint8Array {
  const doc = new jsPDF();
  let y = 20;
  
  // Tenant address
  doc.setFontSize(10);
  doc.text(data.tenant.name, 20, y);
  y += 5;
  doc.text(data.tenant.address, 20, y);
  y += 5;
  doc.text(data.tenant.city, 20, y);
  y += 15;
  
  // Landlord address
  doc.text(data.landlord.name, 20, y);
  y += 5;
  doc.text(data.landlord.address, 20, y);
  y += 5;
  doc.text(data.landlord.city, 20, y);
  y += 15;
  
  // Date and subject
  const today = new Date().toLocaleDateString('de-CH');
  doc.text(`Per Einschreiben`, 20, y);
  y += 10;
  doc.text(today, 20, y);
  y += 15;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Betreff: Herabsetzungsbegehren des Nettomietzinses', 20, y);
  y += 10;
  
  // Main text
 doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  
  const lines = [
    '',
    'Sehr geehrte Damen und Herren',
    '',
    `Ich beziehe mich auf den Mietvertrag vom ${data.contract.contractDate}`,
    `für die Wohnung an der ${data.contract.address}.`,
    '',
    'Ausgangslage:',
    `- Bei Vertragsabschluss galt ein hypothekarischer Referenzzinssatz von ${data.contract.referenceRate}%`,
    '- Per 02.09.2025 wurde der Referenzzinssatz vom Bundesamt für Wohnungswesen',
    `  (BWO) auf 1.25% gesenkt`,
    '',
    'Rechtliche Grundlage:',
    'Gemäss Art. 13 der Verordnung über die Miete und Pacht von Wohn- und',
    'Geschäftsräumen (VMWG) haben Mieter bei einer Senkung des Referenzzinssatzes',
    'um 0,25 Prozentpunkte grundsätzlich Anspruch auf eine Mietzinssenkung von',
    '2,91% des Nettomietzinses.',
    '',
    'Berechnung:',
    `- Aktueller Nettomietzins: CHF ${data.contract.currentRent.toFixed(2)}`,
    `- Netto-Reduktion: CHF ${data.calculation.netReduction.toFixed(2)}`,
    `- Neuer Nettomietzins: CHF ${data.calculation.newRent.toFixed(2)}`,
    `- Jährliche Ersparnis: CHF ${data.calculation.yearlySavings.toFixed(2)}`,
    '',
    'Antrag:',
    `Hiermit beantrage ich auf den ${data.nextTerminationDate}`,
    'eine Herabsetzung des Nettomietzinses von aktuell',
    `CHF ${data.contract.currentRent.toFixed(2)} auf CHF ${data.calculation.newRent.toFixed(2)}.`,
    '',
    'Ich bitte Sie, mir die Herabsetzung des Mietzinses innerhalb von 30 Tagen',
    'auf dem amtlichen Formular zu bestätigen. Sollten Sie meinem Begehren nicht',
    'entsprechen oder innert dieser Frist nicht antworten, werde ich mich an die',
    'Schlichtungsbehörde wenden.',
    '',
    'Für Rückfragen stehe ich Ihnen gerne zur Verfügung.',
    '',
    'Freundliche Grüsse',
    '',
    '',
    data.tenant.name,
  ];
  
  lines.forEach(line => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 20, y);
    y += 5;
  });
  
  return doc.output('arraybuffer');
}

export function generateAnalysisReport(data: any): Uint8Array {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
 doc.setFont('helvetica', 'bold');
  doc.text('Mietminderungs-Analyse', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
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
  
  lines.forEach(line => {
    doc.text(line, 20, y);
    y += 7;
  });
  
  return doc.output('arraybuffer');
}
