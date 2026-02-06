# 🗄️ Datenbank Setup - MietCheck.ch

## ❌ Aktuelles Problem

Die Datenbank ist nicht verbunden! Deshalb werden Verträge nicht gespeichert.

**Error:** `missing_connection_string: You did not supply a 'POSTGRES_URL'`

---

## ✅ Lösung: Vercel Postgres einrichten (5 Minuten)

### Schritt 1: Vercel Account & Projekt

1. Gehen Sie zu [vercel.com/signup](https://vercel.com/signup)
2. Melden Sie sich an (GitHub-Login empfohlen)
3. Klicken Sie auf **"Add New"** → **"Project"**
4. Importieren Sie Ihr GitHub-Repo (oder erstellen Sie leeres Projekt)

### Schritt 2: Postgres Database erstellen

1. Gehen Sie in Ihr Vercel-Projekt
2. Klicken Sie auf **"Storage"** (im Top-Menu)
3. Klicken Sie auf **"Create Database"**
4. Wählen Sie **"Postgres"**
5. Geben Sie einen Namen ein (z.B. "mietcheck-db")
6. Wählen Sie Region: **"Frankfurt, Germany (fra1)"** (näher = schneller)
7. Klicken Sie auf **"Create"**

### Schritt 3: Connection String kopieren

1. Nach Erstellung wird die Database-Seite angezeigt
2. Gehen Sie zum Tab **".env.local"**
3. Sie sehen mehrere Connection Strings:

```bash
POSTGRES_URL="postgres://default:ACTUAL_PASSWORD@xxx-xxx.postgres.vercel-storage.com:5432/verceldb"
POSTGRES_PRISMA_URL="postgres://default:ACTUAL_PASSWORD@xxx-xxx-pooler.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NO_SSL="postgres://default:ACTUAL_PASSWORD@xxx-xxx.postgres.vercel-storage.com:5432/verceldb?sslmode=disable"
POSTGRES_URL_NON_POOLING="postgres://default:ACTUAL_PASSWORD@xxx-xxx.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
POSTGRES_USER="default"
POSTGRES_HOST="xxx-xxx.postgres.vercel-storage.com"
POSTGRES_PASSWORD="ACTUAL_PASSWORD"
POSTGRES_DATABASE="verceldb"
```

4. **Kopieren Sie ALLE diese Zeilen**

### Schritt 4: In .env.local einfügen

1. Öffnen Sie `D:\STTH\2026 KI\mietcheck\.env.local`
2. Ersetzen Sie die Zeile:
   ```bash
   POSTGRES_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb"
   ```
   mit den **echten Connection Strings** von Vercel

3. Ihre `.env.local` sollte jetzt so aussehen:

```bash
# Database (Vercel Postgres)
POSTGRES_URL="postgres://default:ABC123...@ep-cool-name.postgres.vercel-storage.com:5432/verceldb"
POSTGRES_PRISMA_URL="postgres://default:ABC123...@ep-cool-name-pooler.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgres://default:ABC123...@ep-cool-name.postgres.vercel-storage.com:5432/verceldb?sslmode=require"

# OpenAI API
OPENAI_API_KEY="sk-proj-YOUR_ACTUAL_KEY"

# ... rest of config
```

### Schritt 5: Datenbank initialisieren

```bash
cd "D:\STTH\2026 KI\mietcheck"
npm run db:setup
```

**Erwartete Ausgabe:**
```
✅ Database tables created successfully
```

### Schritt 6: Testen

```bash
# Check database
node scripts/check-db.js

# Start dev server
npm run dev
```

Jetzt sollten Verträge gespeichert und im Dashboard angezeigt werden!

---

## 🔍 Verifizieren, dass es funktioniert

### Test 1: Check Database Script
```bash
node scripts/check-db.js
```

**Erwartete Ausgabe:**
```
🔍 Checking database...

👥 Users in database: 1
  - ID: 1, Email: test@example.com, Name: Test User, Created: 2026-02-06...

📋 Contracts in database:
Total contracts: 0

💳 Transactions: 0

✅ Database check complete
```

### Test 2: Registrieren & Vertrag analysieren

1. Gehen Sie zu `http://localhost:3000/register`
2. Erstellen Sie einen Account
3. Gehen Sie zu `http://localhost:3000/analyze`
4. Füllen Sie das Formular aus und klicken Sie auf "Berechnen"
5. **Sie sollten ein Alert sehen:** "✅ Vertrag erfolgreich gespeichert!"
6. Gehen Sie zu `http://localhost:3000/dashboard`
7. **Der Vertrag sollte jetzt erscheinen!**

### Test 3: Console Logs prüfen

Öffnen Sie Browser Console (F12) während der Analyse:

**Erwartete Logs:**
```
💾 Attempting to save contract to DB...
📝 POST /api/user/contracts - Session: exists
👤 User ID: 1
📦 Contract data received: { address: "...", netRent: 2000, newRent: 1950 }
✅ Contract created with ID: 1
📡 Save response status: 200
✅ Contract saved to DB: 1
```

---

## ❓ Troubleshooting

### Problem: "missing_connection_string" Error
**Lösung:** `.env.local` wurde nicht richtig gespeichert oder dev-server nicht neu gestartet
```bash
# Restart dev server
npm run dev
```

### Problem: "Connection refused" oder "ECONNREFUSED"
**Lösung:** Falsche Connection String oder Firewall blockiert
- Prüfen Sie, dass Sie die richtige Region gewählt haben
- Vercel Postgres erlaubt standardmäßig alle IPs

### Problem: "password authentication failed"
**Lösung:** Password in Connection String ist falsch
- Kopieren Sie die Connection String **exakt** von Vercel (inkl. Sonderzeichen)
- Keine zusätzlichen Leerzeichen einfügen

### Problem: Tabellen existieren nicht
**Lösung:** Datenbank nicht initialisiert
```bash
npm run db:setup
```

---

## 🚀 Nächste Schritte

Nach erfolgreichem Database Setup:

1. ✅ Testen Sie den kompletten Flow (Register → Analyze → Dashboard)
2. ✅ Prüfen Sie, dass Verträge im Dashboard erscheinen
3. ✅ Deployen Sie auf Vercel (Environment Variables werden automatisch übernommen)

---

## 💡 Alternative: Neon Database

Falls Vercel Postgres nicht funktioniert, können Sie auch [Neon](https://neon.tech) verwenden:

1. Gehen Sie zu [neon.tech/signup](https://neon.tech/signup)
2. Erstellen Sie kostenloses Projekt
3. Kopieren Sie Connection String
4. Einfügen in `.env.local`:
```bash
POSTGRES_URL="postgresql://username:password@ep-cool-name.us-east-2.aws.neon.tech/neondb?sslmode=require"
```
5. `npm run db:setup`

---

**Bei Problemen:** Senden Sie mir einen Screenshot der Fehlermeldung! 📸
