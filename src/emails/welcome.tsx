// src/emails/welcome.tsx
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

interface WelcomeEmailProps {
  userName?: string;
  userEmail: string;
  loginUrl: string;
}

export const WelcomeEmail = ({
  userName,
  userEmail,
  loginUrl,
}: WelcomeEmailProps) => {
  const displayName = userName || userEmail;
  const previewText = 'Willkommen bei MietCheck.ch - Ihr Mietrechts-Assistent';

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🏠 Willkommen bei MietCheck.ch</Heading>

          <Text style={text}>
            Hallo {displayName},
          </Text>

          <Text style={text}>
            Vielen Dank für Ihre Registrierung! Wir freuen uns, Sie bei MietCheck.ch begrüßen zu dürfen.
          </Text>

          <Section style={featureBox}>
            <Heading style={h2}>Was Sie jetzt tun können:</Heading>

            <Text style={featureText}>
              ✅ <strong>Mietvertrag analysieren</strong> - Laden Sie Ihren Vertrag hoch
            </Text>
            <Text style={featureText}>
              ✅ <strong>Herabsetzung berechnen</strong> - Basierend auf dem Referenzzins
            </Text>
            <Text style={featureText}>
              ✅ <strong>Brief generieren</strong> - Offizieller Herabsetzungsbrief
            </Text>
            <Text style={featureText}>
              ✅ <strong>Verträge verwalten</strong> - Alle Analysen in Ihrem Dashboard
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Zum Dashboard
            </Button>
          </Section>

          <Section style={infoBox}>
            <Heading style={h3}>💡 Wussten Sie?</Heading>
            <Text style={infoText}>
              Der Referenzzins ist aktuell bei <strong>1.25%</strong>. Wenn Ihr Vertrag eine
              Referenzzins-Klausel enthält und bei einem höheren Zinssatz abgeschlossen wurde,
              haben Sie möglicherweise Anspruch auf eine Mietzinsreduktion.
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            MietCheck.ch - Ihr Mietrechts-Assistent
            <br />
            Bei Fragen erreichen Sie uns unter info@mietcheck.ch
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

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
  margin: '0 0 16px',
};

const h3 = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  marginBottom: '16px',
};

const featureBox = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '24px',
};

const featureText = {
  color: '#444',
  fontSize: '15px',
  lineHeight: '28px',
  margin: '8px 0',
};

const infoBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '24px',
};

const infoText = {
  color: '#444',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
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
