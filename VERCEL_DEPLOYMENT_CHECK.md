# 🔍 Vercel Deployment Error - Dashboard

## Problem
URL: https://mietcheck-nine.vercel.app/dashboard
Error: "Application error: a client-side exception has occurred"

## Mögliche Ursachen

### 1. Fehlende Environment Variables in Vercel ❌
**Sehr wahrscheinlich!**

Die App benötigt diese Environment Variables in Vercel:

#### ✅ VORHANDEN (vermutlich):
- `POSTGRES_URL` - Neon Database Connection
- `POSTGRES_PRISMA_URL` - Neon Pooled Connection

#### ❓ FEHLEND (wahrscheinlich):
- `NEXTAUTH_SECRET` - **KRITISCH** für Session Management
- `NEXTAUTH_URL` - Base URL der App
- `OPENAI_API_KEY` - Für PDF-Analyse (optional)
- `RESEND_API_KEY` - Für Emails (optional für jetzt)
- `EMAIL_FROM` - Absender-Email (optional)

### Lösung: Environment Variables in Vercel setzen

#### Schritt 1: Zu Vercel gehen
1. https://vercel.com/dashboard
2. Projekt "mietcheck" öffnen
3. **Settings** → **Environment Variables**

#### Schritt 2: Diese Variables hinzufügen

```bash
# Session Management (KRITISCH!)
NEXTAUTH_SECRET=mij2948rhuerfd9cwnb3i243ne2ewcpdafcmn2n03xn20o32discxcj39uo42ip3qew
NEXTAUTH_URL=https://mietcheck-nine.vercel.app

# Database (sollte schon da sein)
POSTGRES_URL=postgresql://neondb_owner:npg_XTn8A1vuMdcV@ep-divine-wind-ab1u32a5-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=requir
POSTGRES_PRISMA_URL=postgresql://neondb_owner:npg_XTn8A1vuMdcV@ep-divine-wind-ab1u32a5-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=requir

# Optional (für später)
OPENAI_API_KEY=sk-xxx
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@mietcheck.ch
```

#### Schritt 3: Redeploy auslösen
Nach dem Hinzufügen der Environment Variables:
- Klicken Sie auf **"Redeploy"** Button
- Oder: Gehen Sie zu **Deployments** → Neuestes Deployment → **"Redeploy"**

---

## 2. NextAuth Session Provider fehlt ❌
**Weniger wahrscheinlich, aber möglich**

Prüfen ob `SessionProvider` in `layout.tsx` vorhanden ist.

---

## 3. Browser Console Error Details ℹ️

Wenn Sie die Seite in Chrome/Edge öffnen:
1. F12 drücken
2. Console Tab öffnen
3. Seite neu laden
4. Error-Meldung kopieren

Typische Errors:

### Error: "NEXTAUTH_SECRET missing"
→ Environment Variable fehlt in Vercel

### Error: "fetch failed" oder "Network error"
→ API-Route funktioniert nicht (DB Connection?)

### Error: "Cannot read property 'user' of undefined"
→ Session ist nicht initialisiert

---

## 4. Dashboard ohne Login aufrufen ❌
**Möglich**

Die Dashboard-Seite erwartet eine authentifizierte Session.

**Test:**
1. Gehen Sie zu: https://mietcheck-nine.vercel.app/login
2. Erstellen Sie einen Account (Register)
3. Nach Login → Dashboard sollte funktionieren

---

## 🎯 Wahrscheinlichste Lösung (90%)

**NEXTAUTH_SECRET fehlt in Vercel Environment Variables**

### Quick Fix:
1. Vercel Dashboard → Settings → Environment Variables
2. Hinzufügen:
   ```
   NEXTAUTH_SECRET = mij2948rhuerfd9cwnb3i243ne2ewcpdafcmn2n03xn20o32discxcj39uo42ip3qew
   NEXTAUTH_URL = https://mietcheck-nine.vercel.app
   ```
3. Redeploy
4. Testen: https://mietcheck-nine.vercel.app/login

---

## Alternative: Deployment Logs prüfen

In Vercel:
1. **Deployments** → Neuestes Deployment
2. **"View Build Logs"** oder **"View Function Logs"**
3. Suchen nach Errors während Runtime

Häufige Logs:
```
❌ Error: NEXTAUTH_SECRET must be provided
❌ VercelPostgresError: missing_connection_string
❌ Error: Cannot find module '@/lib/...'
```

---

## 📝 Checklist

- [ ] NEXTAUTH_SECRET in Vercel Environment Variables gesetzt
- [ ] NEXTAUTH_URL in Vercel Environment Variables gesetzt
- [ ] POSTGRES_URL vorhanden (von Neon Integration)
- [ ] Redeploy nach Environment Variables-Änderung
- [ ] /login Seite funktioniert (ohne Error)
- [ ] /dashboard mit Login funktioniert

---

## Nach dem Fix

Wenn alles funktioniert:
1. ✅ Login/Register sollte funktionieren
2. ✅ Dashboard sollte laden (ggf. leer wenn keine Verträge)
3. ✅ Analyse sollte Verträge speichern
4. ✅ Dashboard zeigt gespeicherte Verträge

Dann können wir mit **Sprint 1** weitermachen (Email + Payment)! 🚀
