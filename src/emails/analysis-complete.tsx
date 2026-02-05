// src/emails/analysis-complete.tsx
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

interface AnalysisCompleteEmailProps {
  userName?: string;
  address: string;
  currentRent: number;
  newRent: number;
  monthlyReduction: number;
  yearlyReduction: number;
  dashboardUrl: string;
}

export const AnalysisCompleteEmail = ({
  userName = 'Mieter',
  address,
  currentRent,
  newRent,
  monthlyReduction,
  yearlyReduction,
  dashboardUrl,
}: AnalysisCompleteEmailProps) => {
  const previewText = `Ihre Mietanalyse für ${address} ist abgeschlossen`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✅ Analyse abgeschlossen</Heading>

          <Text style={text}>
            Hallo {userName},
          </Text>

          <Text style={text}>
            Gute Neuigkeiten! Die Analyse Ihres Mietvertrags ist abgeschlossen.
          </Text>

          <Section style={resultBox}>
            <Heading style={h2}>📍 {address}</Heading>
            <Hr style={hr} />

            <Text style={resultText}>
              <strong>Aktuelle Miete:</strong> CHF {currentRent.toFixed(2)}
            </Text>
            <Text style={resultText}>
              <strong>Neue Miete:</strong> CHF {newRent.toFixed(2)}
            </Text>
            <Text style={highlightText}>
              <strong>💰 Mögliche Ersparnis:</strong>
            </Text>
            <Text style={savingsText}>
              CHF {monthlyReduction.toFixed(2)} / Monat
            </Text>
            <Text style={savingsText}>
              CHF {yearlyReduction.toFixed(2)} / Jahr
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Ergebnis ansehen
            </Button>
          </Section>

          <Text style={footerText}>
            Sie können jetzt einen offiziellen Herabsetzungsbrief generieren und herunterladen.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            MietCheck.ch - Ihr Mietrechts-Assistent
            <br />
            Diese Email wurde automatisch generiert.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default AnalysisCompleteEmail;

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

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
};

const resultBox = {
  backgroundColor: '#f0f9ff',
  border: '2px solid #3b82f6',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '24px',
};

const resultText = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
};

const highlightText = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '16px 0 8px',
};

const savingsText = {
  color: '#16a34a',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '4px 0',
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

const footerText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 40px',
  marginTop: '24px',
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
