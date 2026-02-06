# ⚡ Schnell-Anleitung: Vercel Postgres einrichten (3 Minuten)

## Problem
```
VercelPostgresError - 'invalid_connection_string':
This connection string is meant to be used with a direct connection.
```

**Grund:** Sie haben nur Blob Storage, aber keine Postgres Database!

---

## ✅ Lösung (3 Schritte)

### Schritt 1: Postgres Database erstellen

1. Gehen Sie zu [vercel.com](https://vercel.com/dashboard)
2. Wählen Sie Ihr Projekt **"mietcheck"**
3. Klicken Sie oben auf **"Storage"**
4. Klicken Sie auf **"Create Database"** (blauer Button)
5. Wählen Sie **"Postgres"** (nicht Blob oder KV!)
6. Name: `mietcheck-db` (oder beliebig)
7. Region: **"Frankfurt, Germany (fra1)"** (für CH am schnellsten)
8. Klicken Sie **"Create"**

⏱️ Dauert ~30 Sekunden

---

### Schritt 2: Connection Strings kopieren

Nach der Erstellung:

1. Sie sind jetzt auf der Database-Seite
2. Gehen Sie zum Tab **".env.local"** (wichtig!)
3. Sie sehen diese Zeilen:

```bash
POSTGRES_URL="postgres://default:ABC...@ep-cool-name.postgres.vercel-storage.com:5432/verceldb"
POSTGRES_PRISMA_URL="postgres://default:ABC...@ep-cool-name-pooler.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NO_SSL="..."
POSTGRES_URL_NON_POOLING="..."
POSTGRES_USER="default"
POSTGRES_HOST="ep-cool-name.postgres.vercel-storage.com"
POSTGRES_PASSWORD="ABC123..."
POSTGRES_DATABASE="verceldb"
```

4. **WICHTIG:** Klicken Sie auf den Copy-Button rechts, um ALLE Zeilen zu kopieren!

---

### Schritt 3: In Ihre lokale .env.local einfügen

1. Öffnen Sie auf Ihrem Computer:
   ```
   D:\STTH\2026 KI\mietcheck\.env.local
   ```

2. **Ersetzen Sie** die alte Zeile:
   ```bash
   POSTGRES_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb"
   ```

3. **Mit allen kopierten Zeilen** von Vercel (sollten so aussehen):
   ```bash
   POSTGRES_URL="postgres://default:ECHTES_PASSWORD@ep-ECHTER_NAME.postgres.vercel-storage.com:5432/verceldb"
   POSTGRES_PRISMA_URL="postgres://default:ECHTES_PASSWORD@ep-ECHTER_NAME-pooler.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15"
   POSTGRES_URL_NO_SSL="postgres://default:ECHTES_PASSWORD@ep-ECHTER_NAME.postgres.vercel-storage.com:5432/verceldb?sslmode=disable"
   POSTGRES_URL_NON_POOLING="postgres://default:ECHTES_PASSWORD@ep-ECHTER_NAME.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
   POSTGRES_USER="default"
   POSTGRES_HOST="ep-ECHTER_NAME.postgres.vercel-storage.com"
   POSTGRES_PASSWORD="ECHTES_PASSWORD"
   POSTGRES_DATABASE="verceldb"
   ```

4. **Speichern** Sie die Datei (Ctrl+S)

---

### Schritt 4: Datenbank initialisieren & Server starten

Öffnen Sie Terminal:

```bash
cd "D:\STTH\2026 KI\mietcheck"

# Datenbank-Tabellen erstellen
npm run db:setup

# Server neu starten
npm run dev
```

**Erwartete Ausgabe von db:setup:**
```
✅ Database tables created successfully
```

---

## 🧪 Testen

1. Gehen Sie zu `http://localhost:3000/register`
2. Erstellen Sie einen Account (z.B. test@example.com)
3. **Jetzt sollte keine Fehlermeldung mehr kommen!**
4. Nach Registrierung gehen Sie zu `/analyze`
5. Füllen Sie das Formular aus
6. Nach "Berechnen" sollten Sie sehen: **"✅ Vertrag erfolgreich gespeichert!"**
7. Gehen Sie zu `/dashboard` - **Vertrag sollte erscheinen!**

---

## ❌ Troubleshooting

### "missing_connection_string" Error
**Problem:** `.env.local` wurde nicht gespeichert oder Server nicht neu gestartet

**Lösung:**
```bash
# Terminal komplett schließen und neu öffnen
cd "D:\STTH\2026 KI\mietcheck"
npm run dev
```

---

### "invalid_connection_string" Error (immer noch)
**Problem:** Sie haben nur `POSTGRES_URL` kopiert, nicht `POSTGRES_PRISMA_URL`

**Lösung:** Gehen Sie zurück zu Vercel → Storage → Ihre Database → Tab ".env.local"

Achten Sie darauf, dass Sie **beide** Zeilen haben:
- `POSTGRES_URL` (Direct Connection)
- `POSTGRES_PRISMA_URL` (Pooled Connection - die wichtige!)

---

### "password authentication failed"
**Problem:** Password in Connection String ist falsch

**Lösung:**
1. Kopieren Sie die Connection Strings **exakt** von Vercel
2. Keine Leerzeichen hinzufügen
3. Nicht manuell editieren

---

### Server startet aber Fehler bei Registrierung
**Problem:** Tabellen wurden nicht erstellt

**Lösung:**
```bash
npm run db:setup
```

Wenn das fehlschlägt, prüfen Sie ob `.env.local` korrekt ist.

---

## ✅ Erfolgskriterien

Nach erfolgreicher Einrichtung:

1. ✅ `npm run db:setup` zeigt "✅ Database tables created successfully"
2. ✅ Registrierung funktioniert ohne Fehler
3. ✅ Nach Analyse erscheint Alert: "✅ Vertrag erfolgreich gespeichert!"
4. ✅ Dashboard zeigt gespeicherte Verträge
5. ✅ Console zeigt:
   ```
   📝 POST /api/user/contracts - Session: exists
   👤 User ID: 1
   ✅ Contract created with ID: 1
   ```

---

## 💡 Was Sie jetzt haben

**Vercel Blob Store** (bereits vorhanden):
- Für File-Uploads (PDFs, Bilder von Verträgen)
- Wird automatisch von `@vercel/blob` genutzt

**Vercel Postgres** (neu erstellt):
- Für strukturierte Daten (Users, Contracts, Transactions)
- Wird von `@vercel/postgres` genutzt

**Zusammen:** Vollständige Datenbank-Infrastruktur! 🎉

---

## 🚀 Nach erfolgreicher Einrichtung

Sie können jetzt:
1. ✅ Benutzer registrieren und einloggen
2. ✅ Verträge analysieren und speichern
3. ✅ Dashboard mit allen Verträgen sehen
4. ✅ Weiter mit Payment-Integration (Payrexx)

**Nächster Schritt:** Payrexx Payment Integration (TODO.md Punkt 2)

---

**Bei Problemen:** Senden Sie mir einen Screenshot des Errors! 📸
