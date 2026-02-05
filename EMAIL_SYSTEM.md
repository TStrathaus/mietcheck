# Email-System Dokumentation

## Übersicht

Das MietCheck.ch Email-System nutzt **Resend** als Email-Service-Provider und **React Email** für die Email-Templates.

---

## Setup

### 1. Resend Account erstellen

1. Gehe zu [resend.com](https://resend.com)
2. Erstelle einen Account
3. Verifiziere deine Domain (z.B. `mietcheck-app.ch`)
4. Generiere einen API Key im Dashboard

### 2. Environment Variables

Füge folgende Variablen zu `.env.local` hinzu:

```bash
# Resend API Key (von resend.com)
RESEND_API_KEY="re_xxxxxxxxxxxxx"

# Sender Email (muss mit verifizierter Domain übereinstimmen)
EMAIL_FROM="noreply@mietcheck-app.ch"

# Base URL für Links in Emails
NEXT_PUBLIC_BASE_URL="https://mietcheck-app.ch"
```

### 3. Domain Verifizierung

**Wichtig:** Bevor du Emails an echte User senden kannst, muss die Domain `mietcheck-app.ch` bei Resend verifiziert werden:

1. Gehe zu Resend Dashboard → Domains
2. Füge `mietcheck-app.ch` hinzu
3. Füge die DNS-Records (SPF, DKIM, DMARC) in deinem Domain-Provider ein
4. Warte auf Verifizierung (dauert 24-48h)

**Testen ohne verifizierte Domain:**
- Im Development kannst du Emails nur an die Email-Adresse senden, mit der du dich bei Resend registriert hast
- Für Testing mit anderen Adressen: Domain verifizieren oder Sandbox-Modus nutzen

---

## Email-Templates

Alle Email-Templates befinden sich in `src/emails/`:

### 1. Welcome Email (`welcome.tsx`)
**Trigger:** Nach Benutzerregistrierung
**Inhalt:**
- Willkommenstext
- Übersicht der Features
- Link zum Dashboard
- Info über aktuellen Referenzzins

**Verwendung:**
```typescript
import { sendWelcomeEmail } from '@/lib/email-service';

await sendWelcomeEmail({
  to: 'user@example.com',
  userName: 'Max Mustermann',
  userEmail: 'user@example.com',
});
```

---

### 2. Analysis Complete Email (`analysis-complete.tsx`)
**Trigger:** Nach erfolgreicher Mietvertrag-Analyse
**Inhalt:**
- Zusammenfassung der Analyse-Ergebnisse
- Aktuelle vs. neue Miete
- Mögliche Ersparnis (monatlich & jährlich)
- Link zum Dashboard

**Verwendung:**
```typescript
import { sendAnalysisCompleteEmail } from '@/lib/email-service';

await sendAnalysisCompleteEmail({
  to: 'user@example.com',
  userName: 'Max Mustermann',
  address: 'Musterstrasse 123, 8000 Zürich',
  currentRent: 2000,
  newRent: 1940,
  monthlyReduction: 60,
  yearlyReduction: 720,
  contractId: '123', // Optional
});
```

---

### 3. Letter Generated Email (`letter-generated.tsx`)
**Trigger:** Nach Brief-Generierung (ohne PDF-Attachment)
**Inhalt:**
- Bestätigung dass Brief generiert wurde
- Download-Link zum Brief
- Anleitung für nächste Schritte (Unterschrift, Versand)
- Link zum Dashboard

**Verwendung:**
```typescript
import { sendLetterGeneratedEmail } from '@/lib/email-service';

await sendLetterGeneratedEmail({
  to: 'user@example.com',
  userName: 'Max Mustermann',
  address: 'Musterstrasse 123, 8000 Zürich',
  monthlyReduction: 60,
  downloadUrl: 'https://mietcheck-app.ch/download/abc123',
  contractId: '123', // Optional
});
```

---

### 4. Letter with Attachment Email (`letter-with-attachment.tsx`)
**Trigger:** Brief-Generierung mit PDF als Anhang
**Inhalt:**
- PDF-Brief im Anhang
- Anleitung für nächste Schritte
- Wichtige Hinweise zum Versand (A-Post Plus)
- Link zum Dashboard

**Verwendung:**
```typescript
import { sendLetterWithAttachmentEmail } from '@/lib/email-service';

const pdfBuffer = generateHerabsetzungsbegehren(data);

await sendLetterWithAttachmentEmail({
  to: 'user@example.com',
  userName: 'Max Mustermann',
  address: 'Musterstrasse 123, 8000 Zürich',
  monthlyReduction: 60,
  pdfBuffer: Buffer.from(pdfBuffer),
  pdfFilename: 'herabsetzungsbegehren.pdf', // Optional
  contractId: '123', // Optional
});
```

---

## API-Routen

### 1. `/api/send-email` (POST)
Generische Email-Route für alle Email-Typen.

**Authentifizierung:** Erforderlich (NextAuth Session)
**Rate Limiting:** 5 Emails pro Stunde pro User

**Request Body:**
```json
{
  "type": "analysis-complete",
  "data": {
    "to": "user@example.com",
    "userName": "Max Mustermann",
    "address": "Musterstrasse 123",
    "currentRent": 2000,
    "newRent": 1940,
    "monthlyReduction": 60,
    "yearlyReduction": 720
  }
}
```

**Response:**
```json
{
  "success": true,
  "id": "email_id_from_resend"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Rate limit exceeded"
}
```

---

### 2. `/api/send-letter-email` (POST)
Spezielle Route für Brief-Versand mit PDF-Attachment.

**Authentifizierung:** Erforderlich (NextAuth Session)

**Request Body:**
```json
{
  "tenantName": "Max Mustermann",
  "tenantAddress": "Mieterstrasse 1",
  "tenantCity": "8000 Zürich",
  "propertyAddress": "Musterstrasse 123, 8000 Zürich",
  "netRent": "2000",
  "referenceRate": "2.00",
  "contractDate": "2020-01-01",
  "landlordName": "Vermieter AG",
  "landlordAddress": "Vermieterweg 10",
  "landlordCity": "8001 Zürich"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Brief wurde erfolgreich per E-Mail versendet"
}
```

---

## Integration in bestehende Flows

### Flow 1: Registrierung → Welcome Email
```typescript
// src/app/api/register/route.ts
import { sendWelcomeEmail } from '@/lib/email-service';

// Nach erfolgreicher User-Erstellung
await sendWelcomeEmail({
  to: email,
  userName: name,
  userEmail: email,
});
```

---

### Flow 2: Analyse → Analysis Complete Email
```typescript
// src/app/api/analyze/route.ts
import { sendAnalysisCompleteEmail } from '@/lib/email-service';
import { getServerSession } from 'next-auth';

const session = await getServerSession(authOptions);

if (session?.user?.email && monthlyReduction > 0) {
  await sendAnalysisCompleteEmail({
    to: session.user.email,
    userName: session.user.name,
    address,
    currentRent,
    newRent,
    monthlyReduction,
    yearlyReduction,
  });
}
```

---

### Flow 3: Brief-Generierung → Email mit PDF
```typescript
// Frontend: src/app/generate/page.tsx
const sendEmailWithPdf = async () => {
  const response = await fetch('/api/send-letter-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (response.ok) {
    toast.success('Brief wurde per E-Mail versendet');
  }
};
```

---

## Rate Limiting

Das System nutzt **LRU Cache** für Rate Limiting:

- **5 Emails pro Stunde** pro User
- **500 unique tokens** im Cache
- Verhindert Email-Spam und Missbrauch

**Implementation:**
```typescript
// src/lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
});

await limiter.check(5, userEmail); // 5 requests per hour
```

---

## Error Handling

Alle Email-Funktionen sind **non-blocking**:

```typescript
// Email wird asynchron gesendet, blockiert nicht die Response
sendWelcomeEmail(data).catch((error) => {
  console.error('Failed to send email:', error);
  // Request schlägt NICHT fehl wenn Email fehlschlägt
});
```

**Warum non-blocking?**
- User-Experience wird nicht beeinträchtigt
- Registrierung/Analyse schlägt nicht fehl wenn Email-Service down ist
- Fehler werden nur geloggt

---

## Testing

### Development (ohne verifizierte Domain)

```bash
# .env.local
RESEND_API_KEY="re_xxxxx"  # Dein Resend API Key
EMAIL_FROM="onboarding@resend.dev"  # Resend Test-Adresse
```

**Limitation:** Emails können nur an die Email-Adresse gesendet werden, mit der du dich bei Resend registriert hast.

### Production (mit verifizierter Domain)

```bash
# .env.production
RESEND_API_KEY="re_xxxxx"
EMAIL_FROM="noreply@mietcheck-app.ch"  # Verifizierte Domain
NEXT_PUBLIC_BASE_URL="https://mietcheck-app.ch"
```

---

## Email-Templates anpassen

Alle Templates nutzen **React Email Components**:

```tsx
import {
  Body,
  Button,
  Container,
  Heading,
  Html,
  Text,
} from '@react-email/components';

export const MyEmail = ({ userName }: { userName: string }) => (
  <Html>
    <Body>
      <Container>
        <Heading>Hallo {userName}</Heading>
        <Text>Dein Text hier</Text>
        <Button href="https://mietcheck-app.ch">
          Call to Action
        </Button>
      </Container>
    </Body>
  </Html>
);
```

**Styling:**
- Inline Styles verwenden
- Keine external CSS
- Keine Tailwind (funktioniert nicht in Emails)
- Tables für Layout (beste Email-Client-Kompatibilität)

---

## Monitoring & Logs

### Console Logs
```bash
✅ Email sent successfully: { type, to, id }
❌ Email send error: { error }
⚠️ RESEND_API_KEY not configured
```

### Resend Dashboard
- Email-Status (Sent, Delivered, Bounced, Complained)
- Open Rate & Click Rate
- Delivery Logs
- Error Messages

---

## Kosten (Resend)

**Free Tier:**
- 100 Emails/Tag
- 3,000 Emails/Monat
- Perfekt für Start

**Pro Plan ($20/Monat):**
- 50,000 Emails/Monat
- $0.40 pro 1,000 danach
- Dedicated IP (optional)
- Priority Support

**Empfehlung:** Start mit Free Tier, upgrade bei > 100 Emails/Tag

---

## Troubleshooting

### Problem: "Email service not configured"
**Lösung:** `RESEND_API_KEY` in `.env.local` setzen

### Problem: "Failed to send email"
**Lösung:**
1. Prüfe Resend Dashboard auf Fehler
2. Prüfe ob Domain verifiziert ist
3. Prüfe ob Recipient-Email erlaubt ist (im Free Tier)

### Problem: "Rate limit exceeded"
**Lösung:** User kann max 5 Emails/Stunde empfangen, warte 1 Stunde

### Problem: Email kommt nicht an
**Lösung:**
1. Prüfe Spam-Ordner
2. Prüfe Resend Dashboard (Delivery Status)
3. Prüfe DNS-Records (SPF, DKIM, DMARC)
4. Prüfe ob Domain verifiziert ist

---

## Nächste Schritte

- [x] Email-Templates erstellt
- [x] Email-Service implementiert
- [x] API-Routen erstellt
- [x] Integration in bestehende Flows
- [x] Rate-Limiting hinzugefügt
- [ ] **Resend Account erstellen** (vor Go-Live)
- [ ] **Domain verifizieren** (vor Go-Live)
- [ ] **API Key in Production setzen** (Vercel Environment Variables)
- [ ] **Email-Templates testen** (mit echten Daten)
- [ ] Email-Tracking implementieren (Open Rate, Click Rate)
- [ ] Email-Preferences für User (Opt-out)

---

## Weitere Informationen

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email/docs)
- [Email Best Practices](https://resend.com/blog/email-best-practices)
