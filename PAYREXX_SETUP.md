# Payrexx Payment Integration Setup

## Warum Payrexx statt Stripe?

✅ **TWINT Support** - Sehr beliebt in der Schweiz
✅ **Günstigere Gebühren** - 1.3% (TWINT) vs 2.9% (Stripe)
✅ **Schweizer Anbieter** - CHF-Auszahlung direkt
✅ **Einfache Integration** - REST API mit guter Dokumentation

---

## 1. Payrexx Account Erstellen

1. Gehe zu [payrexx.com](https://www.payrexx.com)
2. Klicke auf "Jetzt registrieren" oder "Kostenlos testen"
3. Wähle den passenden Plan:
   - **Basic**: CHF 19/Monat + Transaktionsgebühren
   - **Professional**: CHF 49/Monat + reduzierte Gebühren
4. Fülle das Registrierungsformular aus
5. Bestätige deine E-Mail-Adresse

---

## 2. API Keys Holen

### In Payrexx Dashboard:

1. Logge dich ein auf [payrexx.com](https://www.payrexx.com)
2. Gehe zu **Einstellungen** → **API**
3. Kopiere folgende Werte:
   - **Instance Name**: z.B. `mietcheck` (deine Subdomain)
   - **API Secret**: Langer String (keep secret!)

### In deinem Projekt:

Füge die Werte in `.env.local` ein:

```bash
PAYREXX_INSTANCE="mietcheck"
PAYREXX_API_SECRET="dein-api-secret-hier"
```

**WICHTIG:** Füge auch in **Vercel Environment Variables** hinzu:
1. Gehe zu Vercel Dashboard → Project Settings → Environment Variables
2. Füge `PAYREXX_INSTANCE` und `PAYREXX_API_SECRET` hinzu
3. Speichern und Projekt neu deployen

---

## 3. Test-Modus aktivieren

Payrexx hat einen **Sandbox-Modus** für Tests:

1. In Payrexx Dashboard → **Einstellungen** → **Test-Modus**
2. Aktiviere Test-Modus
3. Nutze Test-Kreditkarten für Payments (siehe Payrexx Docs)

**Test-Kreditkarte:**
- Nummer: `4242 4242 4242 4242`
- CVV: `123`
- Datum: Beliebiges zukünftiges Datum

---

## 4. TWINT Aktivieren

1. In Payrexx Dashboard → **Payment Methods**
2. Aktiviere **TWINT**
3. Verifiziere dein Business (KYC-Prozess)
4. Nach Freischaltung (1-2 Werktage) ist TWINT live

---

## 5. Webhook Konfigurieren

Payrexx sendet Webhooks bei erfolgreichen Payments.

### In Payrexx Dashboard:

1. Gehe zu **Einstellungen** → **Webhooks**
2. Füge neue Webhook-URL hinzu:
   ```
   https://mietcheck.vercel.app/api/webhook/payrexx
   ```
3. Wähle Events:
   - ✅ `transaction.confirmed`
   - ✅ `transaction.failed`
4. Speichern

### Signatur-Verifizierung:

Webhooks werden mit HMAC-SHA256 signiert. Der Code verifiziert automatisch die Signatur (siehe `src/lib/payrexx.ts`).

---

## 6. Integration Testen

### Lokales Testen:

```bash
npm run dev
```

1. Gehe zu `/analyze`
2. Lade Mietvertrag hoch
3. Klicke auf "Jetzt bezahlen"
4. Du wirst zu Payrexx weitergeleitet
5. Zahle mit Test-Karte oder TWINT-Sandbox

### Production Testing:

1. Deploye auf Vercel mit korrekten Environment Variables
2. Teste mit echten CHF 9 oder CHF 49 Payments
3. Prüfe in Payrexx Dashboard, ob Transaktion ankommt
4. Prüfe in deiner Datenbank, ob Transaction gespeichert wird

---

## 7. Go-Live Checklist

- [ ] Payrexx Account erstellt
- [ ] API Keys in Vercel Environment Variables
- [ ] TWINT aktiviert und verifiziert
- [ ] Webhook konfiguriert
- [ ] Test-Payments erfolgreich
- [ ] Production-Payments getestet (kleine Beträge)
- [ ] Transaktionen in DB gespeichert
- [ ] Confirmation Emails funktionieren
- [ ] Test-Modus deaktiviert

---

## 8. Gebührenstruktur

### TWINT:
- **1.3%** pro Transaktion
- Keine Fixkosten pro Transaktion

### Kreditkarte:
- **2.5%** pro Transaktion (je nach Plan)
- Keine Fixkosten pro Transaktion

### Beispiel-Rechnung:
- Service 2 (Brief): CHF 49
- Mit TWINT: CHF 49 - 1.3% = **CHF 48.36** (Gewinn)
- Mit Kreditkarte: CHF 49 - 2.5% = **CHF 47.77** (Gewinn)

---

## 9. Troubleshooting

### "Payrexx not configured" Fehler:
- Prüfe ob `PAYREXX_INSTANCE` und `PAYREXX_API_SECRET` gesetzt sind
- Vercel: Neu deployen nach Änderung von Environment Variables

### Webhook kommt nicht an:
- Prüfe Webhook-URL in Payrexx Dashboard
- Prüfe Logs in Vercel Dashboard → Logs
- Teste Webhook mit Payrexx Test-Tool

### Payment fehlgeschlagen:
- Prüfe Test-Modus vs. Production-Modus
- Prüfe ob TWINT/Kreditkarte aktiviert ist
- Prüfe Payrexx Dashboard für Error-Messages

### Transaktion nicht in DB:
- Prüfe Webhook-Logs (`/api/webhook/payrexx`)
- Prüfe ob Transaction-Table existiert
- Manuell in DB prüfen: `SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10`

---

## 10. Support & Dokumentation

- **Payrexx Docs**: https://docs.payrexx.com
- **Payrexx Support**: support@payrexx.com
- **API Reference**: https://docs.payrexx.com/reference/api-reference

---

## Code-Übersicht

### Neue Dateien:
- `src/lib/payrexx.ts` - Payrexx API Client
- `src/app/api/webhook/payrexx/route.ts` - Webhook Handler
- `src/app/api/create-checkout/route.ts` - Updated für Payrexx

### Test-Modus:
Wenn Payrexx nicht konfiguriert ist, funktioniert die App im **Test-Modus**:
- Payments werden simuliert
- User wird direkt zu Success-Page weitergeleitet
- Keine echten Transaktionen

### Environment Variables:
```bash
PAYREXX_INSTANCE="mietcheck"
PAYREXX_API_SECRET="your-secret"
```

---

## Nächste Schritte

1. **Jetzt**: Account erstellen, API Keys holen
2. **Heute**: Integration testen (lokales Testing)
3. **Diese Woche**: TWINT aktivieren + verifizieren
4. **Vor Go-Live**: Production-Tests + Webhook-Tests
