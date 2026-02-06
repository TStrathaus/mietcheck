# DNS Records - Quick Reference

## Für Copy/Paste bei deinem Domain-Provider

---

## 1. SPF Record (TXT)

```
Type:  TXT
Name:  @
Value: v=spf1 include:resend.com ~all
TTL:   3600
```

**Falls du bereits einen SPF-Record hast:**
```
Vorher:  v=spf1 include:_spf.google.com ~all
Nachher: v=spf1 include:_spf.google.com include:resend.com ~all
```
⚠️ Füge `include:resend.com` VOR dem `~all` hinzu!

---

## 2. DKIM Record (CNAME)

```
Type:   CNAME
Name:   resend._domainkey
Target: resend._domainkey.resend.com
TTL:    3600
```

**Alternative Schreibweisen (je nach Provider):**
```
Name: resend._domainkey
Name: resend._domainkey.mietcheck.ch
Name: resend._domainkey.mietcheck.ch.
```

---

## 3. Tracking Record (CNAME) - Optional

```
Type:   CNAME
Name:   rs
Target: track.resend.com
TTL:    3600
```

⚠️ **Empfehlung für MietCheck:** NICHT einrichten (Datenschutz)

---

## Email-Weiterleitung

Für Support-Email:

```
Von: support@mietcheck.ch
An:  thorsten.strathaus@gmail.com
```

---

## Verifikation

### Online Tools:
- **SPF Check:** https://mxtoolbox.com/spf.aspx
- **DKIM Check:** https://mxtoolbox.com/dkim.aspx
- **DNS Propagation:** https://dnschecker.org

### Eingabe:
```
Domain: mietcheck.ch
```

### Erwartete Ergebnisse:
- ✅ SPF: `v=spf1 include:resend.com ~all`
- ✅ DKIM: `resend._domainkey.resend.com`
- ✅ Status: Pass/Verified

---

## Provider-Spezifische Hinweise

### Infomaniak:
- Name: Nutze `@` für Root-Domain
- CNAME: Kein Punkt am Ende

### Hostpoint:
- Name: Kann leer bleiben für Root
- CNAME: Ohne Punkt

### Cloudflare:
- Name: Nutze `@` für Root
- CNAME: Automatischer Proxy (OK)
- TTL: Auto ist OK

### Google Domains:
- Name: Verwende `@`
- CNAME: Genau wie angegeben

---

## Nach dem Eintragen

1. **Speichern** aller Records
2. **Warten** 5-60 Minuten
3. **Prüfen** mit MXToolbox
4. In **Resend** auf **"Verify"** klicken
5. **Status** sollte ✅ werden

---

## Häufige Fehler

❌ **Punkt am Ende vergessen/hinzugefügt**
```
Falsch: resend._domainkey.resend.com.
Richtig: resend._domainkey.resend.com
```
(Je nach Provider unterschiedlich!)

❌ **Mehrere SPF-Records**
```
Falsch: Zwei separate TXT-Records
Richtig: Ein TXT-Record mit beiden includes
```

❌ **Falscher Name für CNAME**
```
Falsch: _domainkey.resend
Richtig: resend._domainkey
```

---

## Support

Bei Problemen:
1. Screenshot der DNS-Einträge machen
2. MXToolbox Results kopieren
3. Resend Support kontaktieren: support@resend.com
