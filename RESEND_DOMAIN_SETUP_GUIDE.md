# Resend Domain Setup - Detaillierte Anleitung

## Schritt-für-Schritt Guide für mietcheck.ch

---

## Übersicht

Resend ermöglicht dir, Emails von deiner eigenen Domain (z.B. `noreply@mietcheck.ch`) zu versenden, ohne ein Email-Postfach zu benötigen.

**Was du brauchst:**
- Domain `mietcheck.ch` (die du besitzt)
- Zugang zum DNS-Management deiner Domain
- Resend Account (kostenlos)

**Dauer:** 10-15 Minuten Setup + 5-60 Minuten DNS-Propagation

---

## Teil 1: Resend Account erstellen

### Schritt 1: Registrierung

1. Gehe zu **[resend.com](https://resend.com)**

2. Klicke auf **"Sign Up"** (oben rechts)

3. Wähle eine Registrierungsmethode:
   - **GitHub** (empfohlen - schnellste)
   - **Google**
   - **Email & Password**

4. Bestätige deine Email-Adresse (falls Email-Registrierung)

5. Du landest im **Resend Dashboard**

### Schritt 2: API Key erstellen (später benötigt)

1. Im Dashboard → **API Keys** (linkes Menü)

2. Klicke **"Create API Key"**

3. Gib einen Namen ein: `MietCheck Production`

4. **Permission:** Full Access (Standard)

5. Klicke **"Create"**

6. **WICHTIG:** Kopiere den API Key sofort!
   ```
   re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

7. Speichere ihn sicher (er wird nur einmal angezeigt!)

---

## Teil 2: Domain hinzufügen

### Schritt 3: Domain zu Resend hinzufügen

1. Im Resend Dashboard → **Domains** (linkes Menü)

2. Klicke **"Add Domain"**

3. **Domain eingeben:**
   ```
   mietcheck.ch
   ```
   (OHNE www, OHNE https://, nur die nackte Domain)

4. **Region wählen:**
   - **EU (Frankfurt)** - Empfohlen für Schweiz
   - US (Virginia) - Falls du primär US-Kunden hast

5. Klicke **"Add"**

6. Du siehst jetzt eine **Übersicht mit DNS Records**, die du eintragen musst

---

## Teil 3: DNS Records eintragen

Jetzt musst du 3 DNS-Records bei deinem Domain-Provider eintragen.

### Wo finde ich mein DNS-Management?

**Typische Domain-Provider in der Schweiz:**

#### **Infomaniak** (https://manager.infomaniak.com)
1. Login
2. **Domain & Hosting** → **Meine Domains**
3. Domain `mietcheck.ch` auswählen
4. **DNS-Zone** → **DNS verwalten**

#### **Hostpoint** (https://admin.hostpoint.ch)
1. Login
2. **My Panel** → **Domains**
3. Domain auswählen
4. **DNS-Einstellungen**

#### **Cloudflare** (https://dash.cloudflare.com)
1. Login
2. Domain auswählen
3. **DNS** (linkes Menü)

#### **Andere Provider:**
- Google Domains: Domains → DNS
- GoDaddy: My Products → Domains → DNS
- Namecheap: Domain List → Manage → Advanced DNS

---

### Schritt 4: SPF Record (TXT Record)

**Was ist das?** SPF (Sender Policy Framework) erlaubt Resend, Emails in deinem Namen zu senden.

#### In Resend Dashboard:
Du siehst einen Record wie:
```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
```

#### In deinem DNS-Management:
1. **Record hinzufügen** → **TXT**

2. **Name/Host:**
   - Bei meisten Providern: `@` oder leer lassen
   - Bei einigen: `mietcheck.ch`

3. **Value/Content:**
   ```
   v=spf1 include:resend.com ~all
   ```

   **WICHTIG:** Wenn du bereits einen SPF-Record hast:
   ```
   Vorher:  v=spf1 include:_spf.google.com ~all
   Nachher: v=spf1 include:_spf.google.com include:resend.com ~all
   ```
   (Füge `include:resend.com` VOR `~all` hinzu)

4. **TTL:** 3600 (oder Standard)

5. **Speichern**

#### Beispiel (Infomaniak):
```
Type:  TXT
Name:  @
Value: v=spf1 include:resend.com ~all
TTL:   3600
```

---

### Schritt 5: DKIM Record (CNAME Record)

**Was ist das?** DKIM (DomainKeys Identified Mail) signiert deine Emails digital.

#### In Resend Dashboard:
Du siehst einen Record wie:
```
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
```

#### In deinem DNS-Management:
1. **Record hinzufügen** → **CNAME**

2. **Name/Host:**
   ```
   resend._domainkey
   ```

   **WICHTIG:**
   - Bei einigen Providern: `resend._domainkey.mietcheck.ch`
   - Bei den meisten: nur `resend._domainkey`

3. **Value/Target/Points to:**
   ```
   resend._domainkey.resend.com
   ```

   **WICHTIG:** KEIN Punkt am Ende (bei den meisten Providern)

4. **TTL:** 3600 (oder Standard)

5. **Speichern**

#### Beispiel (Infomaniak):
```
Type:   CNAME
Name:   resend._domainkey
Target: resend._domainkey.resend.com
TTL:    3600
```

---

### Schritt 6: Tracking Record (CNAME Record - Optional)

**Was ist das?** Ermöglicht Email-Tracking (Opens, Clicks).

**Empfehlung:**
- ✅ **Aktivieren** wenn du wissen willst, ob Emails geöffnet werden
- ❌ **Weglassen** für bessere Datenschutz

#### In Resend Dashboard:
```
Type: CNAME
Name: rs
Value: track.resend.com
```

#### In deinem DNS-Management (falls gewünscht):
1. **Record hinzufügen** → **CNAME**

2. **Name/Host:**
   ```
   rs
   ```

3. **Value/Target:**
   ```
   track.resend.com
   ```

4. **TTL:** 3600

5. **Speichern**

**Hinweis:** Für MietCheck würde ich das **weglassen** - Datenschutz ist wichtiger als Tracking.

---

## Teil 4: Verifizierung

### Schritt 7: DNS-Propagation abwarten

1. **Speichere alle DNS-Records**

2. **Warte 5-60 Minuten**
   - Normalerweise: 5-15 Minuten
   - Bei manchen Providern: bis zu 2 Stunden
   - Weltweit: bis zu 48 Stunden (sehr selten)

3. **Prüfen mit Online-Tools:**
   - SPF Check: https://mxtoolbox.com/spf.aspx
   - DKIM Check: https://mxtoolbox.com/dkim.aspx
   - Gib `mietcheck.ch` ein

### Schritt 8: Domain verifizieren in Resend

1. Zurück zu **Resend Dashboard** → **Domains**

2. Deine Domain sollte sichtbar sein mit Status:
   - ⏳ **Pending** (noch am Prüfen)
   - ✅ **Verified** (fertig!)
   - ❌ **Failed** (DNS-Records falsch)

3. Falls **Pending** nach 30 Minuten:
   - Klicke **"Verify"** Button
   - Resend prüft die DNS-Records erneut

4. Falls **Failed**:
   - Klicke auf die Domain für Details
   - Sieh welcher Record fehlt/falsch ist
   - Korrigiere im DNS-Management
   - Warte weitere 15 Minuten
   - Klicke **"Verify"** erneut

---

## Teil 5: Testing

### Schritt 9: Test-Email senden

1. Im Resend Dashboard → **Emails** → **Send Test Email**

2. Oder mit Code:

```javascript
const { Resend } = require('resend');
const resend = new Resend('re_dein_api_key_hier');

resend.emails.send({
  from: 'MietCheck <noreply@mietcheck.ch>',
  to: 'thorsten.strathaus@gmail.com',
  subject: 'Test von MietCheck.ch',
  text: 'Diese Email wurde von Resend versendet!'
}).then(console.log).catch(console.error);
```

3. **Prüfe dein Gmail Postfach:**
   - Email sollte ankommen (nicht im Spam)
   - Absender: `MietCheck <noreply@mietcheck.ch>`
   - Reply-To: Sollte NICHT funktionieren (noreply)

4. **Prüfe Email-Headers** (in Gmail):
   - Klicke auf **︙** (3 Punkte)
   - **Show original**
   - Suche nach:
     ```
     spf=pass
     dkim=pass
     ```
   - Beide sollten **pass** sein ✅

---

## Teil 6: Environment Variables setzen

### Schritt 10: Lokale Entwicklung (.env.local)

```bash
# Resend API Key (von Schritt 2)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Email Configuration
EMAIL_FROM="noreply@mietcheck.ch"
SUPPORT_EMAIL="support@mietcheck.ch"
ADMIN_EMAIL="thorsten.strathaus@gmail.com"
```

### Schritt 11: Production (Vercel)

1. Gehe zu **[vercel.com](https://vercel.com)**

2. Dein Projekt auswählen → **Settings** → **Environment Variables**

3. Füge hinzu:

   **Variable 1:**
   ```
   Key:   RESEND_API_KEY
   Value: re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   ```
   Key:   EMAIL_FROM
   Value: noreply@mietcheck.ch
   ```

   **Variable 3:**
   ```
   Key:   SUPPORT_EMAIL
   Value: support@mietcheck.ch
   ```

   **Variable 4:**
   ```
   Key:   ADMIN_EMAIL
   Value: thorsten.strathaus@gmail.com
   ```

4. **Speichern**

5. **Neues Deployment auslösen:**
   - Gehe zu **Deployments**
   - Klicke **︙** beim letzten Deployment
   - **Redeploy** → **Use existing Build Cache**

---

## Teil 7: Email-Weiterleitung für Support

### Schritt 12: Support-Email Forwarding

Damit du Emails an `support@mietcheck.ch` empfangen kannst:

#### Bei Infomaniak:
1. **Domain & Hosting** → **Email**
2. **Weiterleitungen erstellen**
3. Neue Weiterleitung:
   ```
   Von:  support@mietcheck.ch
   An:   thorsten.strathaus@gmail.com
   ```

#### Bei Hostpoint:
1. **Email** → **Weiterleitungen**
2. **Neue Weiterleitung**
3. Eingabe wie oben

#### Bei Cloudflare:
Cloudflare bietet **Email Routing** (kostenlos):
1. **Email** → **Email Routing**
2. **Enable Email Routing**
3. Füge hinzu:
   ```
   support@mietcheck.ch → thorsten.strathaus@gmail.com
   ```

### Schritt 13: Weiterleitung testen

1. Sende Email von deinem Handy/anderem Account an:
   ```
   support@mietcheck.ch
   ```

2. Prüfe ob sie bei `thorsten.strathaus@gmail.com` ankommt

3. **Antworte aus Gmail:**
   - Setze in Gmail "Reply-To" auf `support@mietcheck.ch`
   - Oder installiere Gmail-Extension für Custom From

---

## Troubleshooting

### Problem: Domain bleibt auf "Pending"

**Lösung:**
1. Prüfe DNS-Records mit https://mxtoolbox.com
2. Warte weitere 30 Minuten
3. Klicke "Verify" Button in Resend
4. Prüfe ob TTL zu hoch ist (sollte ≤ 3600 sein)

### Problem: SPF Record wird nicht erkannt

**Ursache:** Du hast bereits einen SPF-Record

**Lösung:**
```
Falsch:  v=spf1 include:resend.com ~all
         v=spf1 include:google.com ~all

Richtig: v=spf1 include:google.com include:resend.com ~all
```
Du kannst nur EINEN SPF-Record haben, aber mehrere `include:`

### Problem: DKIM Record wird nicht erkannt

**Ursache:** Falscher Name oder fehlender Punkt

**Versuche:**
```
Variante 1: resend._domainkey
Variante 2: resend._domainkey.mietcheck.ch
Variante 3: resend._domainkey.mietcheck.ch.
```
(Mit/ohne Punkt am Ende, je nach Provider)

### Problem: Emails landen im Spam

**Ursachen:**
- ❌ SPF/DKIM nicht korrekt
- ❌ Domain noch zu neu
- ❌ Email-Inhalt verdächtig

**Lösungen:**
1. Prüfe SPF/DKIM Status (beide müssen "pass" sein)
2. Warte 1-2 Tage nach Domain-Verifizierung
3. Vermeide Spam-Wörter ("FREE", "CLICK NOW", etc.)
4. Sende von verified Domain
5. Füge unsubscribe Link hinzu (rechtlich erforderlich)

### Problem: API Key funktioniert nicht

**Lösung:**
1. API Key muss mit `re_` beginnen
2. Neu erstellen in Resend Dashboard
3. In `.env.local` UND Vercel setzen
4. Neu deployen nach Vercel-Änderung

---

## Checkliste

### DNS Setup:
- [ ] SPF Record (TXT) eingetragen
- [ ] DKIM Record (CNAME) eingetragen
- [ ] Tracking Record (CNAME) - optional
- [ ] DNS-Propagation abgewartet (15+ Min)
- [ ] Domain in Resend verifiziert ✅

### Resend Configuration:
- [ ] Resend Account erstellt
- [ ] Domain hinzugefügt
- [ ] API Key erstellt & gespeichert
- [ ] Test-Email erfolgreich versendet

### Environment Variables:
- [ ] `.env.local` aktualisiert
- [ ] Vercel Environment Variables gesetzt
- [ ] Neu deployed

### Email Forwarding:
- [ ] `support@mietcheck.ch` → Gmail eingerichtet
- [ ] Weiterleitung getestet

### Testing:
- [ ] Test-Email von `noreply@mietcheck.ch` versendet
- [ ] Email kam an (nicht im Spam)
- [ ] SPF=pass, DKIM=pass in Headers
- [ ] Support-Email Weiterleitung funktioniert

---

## Kosten

- **Resend Free Plan:**
  - 100 Emails/Tag
  - 3.000 Emails/Monat
  - Kostenlos ✅

- **Bei Überschreitung:**
  - Pro Plan: $20/Monat für 50.000 Emails
  - Erst nötig bei vielen Usern

---

## Support & Hilfe

- **Resend Docs:** https://resend.com/docs
- **DNS Setup Guide:** https://resend.com/docs/dashboard/domains/introduction
- **Troubleshooting:** https://resend.com/docs/dashboard/domains/troubleshooting
- **Resend Support:** support@resend.com

---

## Zusammenfassung

Nach diesem Setup kannst du:
- ✅ Emails von `noreply@mietcheck.ch` senden
- ✅ Emails an `support@mietcheck.ch` empfangen (via Gmail)
- ✅ System-Alerts von `admin@mietcheck.ch` erhalten
- ✅ Professionelle transaktionale Emails versenden

**Total Dauer:** ~30 Minuten
**Total Kosten:** CHF 0/Monat
