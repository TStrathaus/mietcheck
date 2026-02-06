# Email Domain Setup für MietCheck.ch

## Empfohlene Email-Struktur

### Produktive Emails (über mietcheck.ch):
```
✅ noreply@mietcheck.ch     → Transaktionale Emails (Bestätigungen, PDFs)
✅ support@mietcheck.ch     → Kunden-Support (Antworten erlaubt)
✅ admin@mietcheck.ch       → Admin-Alerts, System-Monitoring
✅ info@mietcheck.ch        → Allgemeine Anfragen, Marketing
```

### Persönliche Email (aktuell):
```
thorsten.strathaus@gmail.com → Deine persönliche Email für Admin/Alerts
```

---

## Option 1: Resend mit mietcheck.ch (Empfohlen)

### Vorteile:
- ✅ Professionell: `support@mietcheck.ch` statt Gmail
- ✅ Keine Spam-Probleme
- ✅ Alle Emails zentral verwalten
- ✅ DKIM/SPF automatisch konfiguriert

### Setup-Schritte:

#### 1. Domain zu Resend hinzufügen

1. Gehe zu [resend.com](https://resend.com) → **Domains**
2. Klicke **Add Domain**
3. Gib ein: `mietcheck.ch`

#### 2. DNS Records konfigurieren

Resend zeigt dir DNS-Records zum Hinzufügen bei deinem Domain-Provider (z.B. Infomaniak, Hostpoint):

**TXT Record (SPF):**
```
Name:  @
Type:  TXT
Value: v=spf1 include:resend.com ~all
TTL:   3600
```

**CNAME Record (DKIM):**
```
Name:  resend._domainkey
Type:  CNAME
Value: resend._domainkey.resend.com
TTL:   3600
```

**CNAME Record (Tracking - Optional):**
```
Name:  rs
Type:  CNAME
Value: track.resend.com
TTL:   3600
```

#### 3. Domain verifizieren

- Warte 5-60 Minuten (DNS-Propagation)
- Resend prüft automatisch die Records
- Status wird "Verified" ✅

#### 4. Email-Adressen nutzen

Keine Postfächer nötig! Resend ist nur für **Versand**:

```typescript
// Jetzt kannst du senden von:
from: 'MietCheck Support <support@mietcheck.ch>'
from: 'MietCheck <noreply@mietcheck.ch>'
from: 'MietCheck Alerts <admin@mietcheck.ch>'
```

---

## Option 2: Email-Weiterleitung für Support

Für **support@mietcheck.ch** brauchst du Empfang. Zwei Möglichkeiten:

### A) Email-Forwarding (Einfach + Kostenlos)

Bei deinem Domain-Provider (z.B. Infomaniak):

1. Gehe zu **Email-Verwaltung** → **Weiterleitungen**
2. Erstelle Weiterleitung:
   ```
   support@mietcheck.ch → thorsten.strathaus@gmail.com
   ```

**Vorteile:**
- ✅ Kostenlos
- ✅ Empfang in Gmail
- ✅ Keine Extra-Postfach nötig

**Nachteile:**
- ❌ Antworten kommen von Gmail (nicht von support@mietcheck.ch)

### B) Google Workspace (Professionell)

**Kosten:** CHF 5.40/Monat pro User (Business Starter)

1. Gehe zu [Google Workspace](https://workspace.google.com)
2. Registriere `mietcheck.ch`
3. Erstelle Postfächer:
   - `support@mietcheck.ch`
   - `admin@mietcheck.ch`
   - `info@mietcheck.ch`

**Vorteile:**
- ✅ Professionelle Email-Adressen
- ✅ Senden UND Empfangen
- ✅ Gmail-Interface
- ✅ 30 GB Storage

**Nachteile:**
- ❌ Monatliche Kosten

---

## Empfohlenes Setup (Hybrid)

**Für den Start (kostenlos):**

1. **Resend für Versand:**
   - `noreply@mietcheck.ch` → Transaktionale Emails
   - `admin@mietcheck.ch` → System-Alerts

2. **Email-Weiterleitung für Support:**
   - `support@mietcheck.ch` → weitergeleitet zu `thorsten.strathaus@gmail.com`
   - Du antwortest von Gmail (mit "Reply-To: support@mietcheck.ch")

3. **Gmail für Admin:**
   - `thorsten.strathaus@gmail.com` → Admin-Alerts

**Total Kosten:** CHF 0/Monat

---

**Später (bei Wachstum):**

1. **Google Workspace** für `support@mietcheck.ch`
2. **Resend weiter nutzen** für transaktionale Emails
3. **Separates Admin-Postfach** wenn nötig

**Total Kosten:** CHF 5.40/Monat (1 User)

---

## Aktuelle Konfiguration aktualisieren

### .env.local (Development):

```bash
# Email Configuration
RESEND_API_KEY="re_xxx"  # Von resend.com
EMAIL_FROM="noreply@mietcheck.ch"  # Nach Domain-Verifizierung
SUPPORT_EMAIL="support@mietcheck.ch"  # Für "Kontakt"-Links
ADMIN_EMAIL="thorsten.strathaus@gmail.com"  # Für Alerts

# Optional: Slack für Team-Alerts
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

### Vercel Environment Variables:

Gleiche Variables in Vercel Dashboard → Settings → Environment Variables

---

## Code-Anpassungen

### Email-Absender (bereits korrekt):

```typescript
// src/lib/email-service.ts
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@mietcheck.ch';
const FROM_NAME = 'MietCheck';

// Versenden:
from: `${FROM_NAME} <${FROM_EMAIL}>`
// → "MietCheck <noreply@mietcheck.ch>"
```

### Support-Email in Frontend:

```typescript
// src/app/page.tsx (Footer)
<a href="mailto:support@mietcheck.ch" className="text-blue-600">
  support@mietcheck.ch
</a>
```

### Admin-Alerts:

```typescript
// src/lib/alerts.ts (bereits korrekt)
const adminEmail = process.env.ADMIN_EMAIL || 'thorsten.strathaus@gmail.com';

await resend.emails.send({
  from: `MietCheck Alerts <admin@mietcheck.ch>`,  // Absender
  to: adminEmail,  // Empfänger (deine Gmail)
  subject: '🚨 [ALERT] Database down',
  text: 'Alert message...'
});
```

---

## Testing

### Test Email-Versand (nach Domain-Verifizierung):

```bash
# In der Development-Umgebung
node -e "
const { Resend } = require('resend');
const resend = new Resend('re_xxx');  // Dein API Key

resend.emails.send({
  from: 'MietCheck <noreply@mietcheck.ch>',
  to: 'thorsten.strathaus@gmail.com',
  subject: 'Test Email',
  text: 'This is a test from mietcheck.ch'
}).then(console.log).catch(console.error);
"
```

### Test Support-Weiterleitung:

1. Sende Email an `support@mietcheck.ch`
2. Prüfe ob sie bei `thorsten.strathaus@gmail.com` ankommt

---

## Checkliste

### Sofort (vor Go-Live):
- [ ] Resend Account erstellen (falls noch nicht vorhanden)
- [ ] Domain `mietcheck.ch` zu Resend hinzufügen
- [ ] DNS Records beim Domain-Provider eintragen
- [ ] Domain-Verifizierung abwarten (5-60 Min)
- [ ] Email-Weiterleitung einrichten: `support@mietcheck.ch` → Gmail
- [ ] `.env.local` aktualisieren:
  ```
  EMAIL_FROM="noreply@mietcheck.ch"
  SUPPORT_EMAIL="support@mietcheck.ch"
  ```
- [ ] Vercel Environment Variables aktualisieren
- [ ] Test-Email senden
- [ ] Support-Weiterleitung testen

### Optional (später):
- [ ] Google Workspace Account (CHF 5.40/Monat)
- [ ] Slack Webhook für Team-Alerts
- [ ] Separate Admin-Email

---

## FAQ

### Q: Kann ich von noreply@mietcheck.ch Emails empfangen?
**A:** Nein, "noreply" sollte nicht empfangen. Nutze `support@mietcheck.ch` für Kundenkommunikation.

### Q: Brauche ich ein Postfach für noreply@mietcheck.ch?
**A:** Nein, Resend ist nur für Versand. Kein Postfach nötig.

### Q: Wie antworte ich auf Support-Anfragen?
**A:**
- **Mit Weiterleitung:** Antworte aus Gmail, aber setze "Reply-To: support@mietcheck.ch" (manuell)
- **Mit Google Workspace:** Antworte direkt aus `support@mietcheck.ch` Postfach

### Q: Was kostet Resend?
**A:**
- **Free Plan:** 100 Emails/Tag, 3.000 Emails/Monat
- **Pro Plan:** $20/Monat, 50.000 Emails/Monat
- Für den Start reicht Free Plan!

### Q: Landen meine Emails im Spam?
**A:** Mit korrekten DNS-Records (SPF, DKIM) und verifizierter Domain: **Nein**. Resend hat exzellente Deliverability.

---

## Support

- **Resend Docs:** https://resend.com/docs
- **DNS Setup:** https://resend.com/docs/dashboard/domains/introduction
- **Email Best Practices:** https://resend.com/docs/dashboard/emails/introduction
