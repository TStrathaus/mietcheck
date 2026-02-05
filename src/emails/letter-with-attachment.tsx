// src/emails/letter-with-attachment.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface LetterWithAttachmentEmailProps {
  userName?: string;
  address: string;
  monthlyReduction: number;
  dashboardUrl: string;
}

export const LetterWithAttachmentEmail = ({
  userName = 'Mieter',
  address,
  monthlyReduction,
  dashboardUrl,
}: LetterWithAttachmentEmailProps) => {
  const previewText = `Ihr Herabsetzungsbrief für ${address} ist im Anhang`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📄 Ihr Herabsetzungsbrief</Heading>

          <Text style={text}>
            Hallo {userName},
          </Text>

          <Text style={text}>
            Ihr offizieller Herabsetzungsbrief ist im <strong>Anhang dieser E-Mail</strong> als PDF-Datei enthalten.
          </Text>

          <Section style={infoBox}>
            <Heading style={h2}>📍 {address}</Heading>
            <Text style={infoText}>
              <strong>Beantragte Herabsetzung:</strong> CHF {monthlyReduction.toFixed(2)} / Monat
            </Text>
          </Section>

          <Section style={instructionBox}>
            <Heading style={h3}>📮 Nächste Schritte:</Heading>
            <Text style={instructionText}>
              1. <strong>PDF öffnen und ausdrucken</strong> (siehe Anhang)
            </Text>
            <Text style={instructionText}>
              2. <strong>Brief unterschreiben</strong> (unten auf Seite 1)
            </Text>
            <Text style={instructionText}>
              3. Per <strong>A-Post Plus (Einschreiben)</strong> an Vermieter senden
            </Text>
            <Text style={instructionText}>
              4. <strong>Kopie und Einschreibe-Beleg aufbewahren</strong>
            </Text>
            <Text style={instructionText}>
              5. Auf Antwort des Vermieters warten (30 Tage Frist)
            </Text>
          </Section>

          <Section style={tipBox}>
            <Heading style={h3}>💡 Wichtiger Tipp:</Heading>
            <Text style={tipText}>
              Der Versand per <strong>A-Post Plus (Einschreiben)</strong> ist wichtig, um den Zugang rechtlich nachweisen zu können.
              Sie erhalten einen Einschreibe-Beleg als Nachweis.
            </Text>
            <Text style={tipText}>
              Kosten: ca. CHF 2.50 zusätzlich zur normalen Briefmarke.
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Zum Dashboard
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            MietCheck.ch - Ihr Mietrechts-Assistent
            <br />
            Diese Email wurde automatisch generiert.
            <br />
            <br />
            Bei Fragen erreichen Sie uns unter info@mietcheck-app.ch
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default LetterWithAttachmentEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
  lineHeight: '1.4',
};

const h2 = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 15px',
};

const h3 = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  marginBottom: '16px',
};

const infoBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #16a34a',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '24px',
};

const infoText = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
};

const instructionBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '24px',
};

const instructionText = {
  color: '#444',
  fontSize: '15px',
  lineHeight: '28px',
  margin: '8px 0',
};

const tipBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #3b82f6',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '24px',
};

const tipText = {
  color: '#444',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '8px 0',
};

const buttonContainer = {
  padding: '27px 40px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  marginTop: '32px',
};
