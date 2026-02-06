# 🔄 Neon Connection Strings wiederherstellen

## Situation
Sie haben bereits ein Neon-Projekt "mietcheck" (erstellt 29. Jan 2026), aber die Connection Strings sind in Ihrer lokalen `.env.local` nicht mehr vorhanden.

---

## ✅ Lösung: Connection Strings aus Neon holen (2 Minuten)

### Schritt 1: Zu Ihrem Neon-Projekt gehen

1. Bleiben Sie auf [console.neon.tech](https://console.neon.tech)
2. Klicken Sie auf Ihr Projekt **"mietcheck"** (in der Liste sichtbar)
3. Sie kommen zum Project Dashboard

---

### Schritt 2: Connection String finden

Im Neon Project Dashboard:

1. Gehen Sie zum Tab **"Connection Details"** oder **"Dashboard"**
2. Sie sehen eine Section **"Connection String"**
3. Dort finden Sie die Connection Strings in verschiedenen Formaten

**Wichtig:** Wählen Sie das Format **"node-postgres"** oder **"Pooled connection"**

Die Connection String sieht so aus:
```
postgres://username:password@ep-cool-name.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

---

### Schritt 3: In .env.local einfügen

1. Öffnen Sie `D:\STTH\2026 KI\mietcheck\.env.local`

2. **Ersetzen Sie** die Zeile:
   ```bash
   POSTGRES_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb"
   ```

3. **Mit der Neon Connection String:**
   ```bash
   POSTGRES_URL="postgres://username:password@ep-cool-name.eu-central-1.aws.neon.tech/neondb?sslmode=require"
   ```

4. **Fügen Sie auch hinzu** (für @vercel/postgres compatibility):
   ```bash
   POSTGRES_PRISMA_URL="postgres://username:password@ep-cool-name.eu-central-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15"
   ```

   (Gleiche URL, nur mit `&pgbouncer=true&connect_timeout=15` am Ende)

5. **Speichern** (Ctrl+S)

---

### Schritt 4: Tabellen prüfen/erstellen

Die Datenbank existiert bereits, aber vielleicht sind die Tabellen nicht mehr da:

```bash
cd "D:\STTH\2026 KI\mietcheck"

# Tabellen erstellen (falls nicht vorhanden)
npm run db:setup

# Server starten
npm run dev
```

**Erwartete Ausgabe von db:setup:**
```
✅ Database tables created successfully
```

Oder falls Tabellen schon existieren:
```
ERROR: relation "users" already exists
```
Das ist OK! Bedeutet die Tabellen sind schon da.

---

## 🧪 Testen

1. Gehen Sie zu `http://localhost:3000/register`
2. Erstellen Sie einen Test-Account
3. **Keine Fehler mehr!**
4. Gehen Sie zu `/analyze` und testen Sie eine Analyse
5. Nach "Berechnen" sollte erscheinen: **"✅ Vertrag erfolgreich gespeichert!"**
6. Dashboard sollte Verträge anzeigen

---

## 📍 Wo finde ich die Connection String in Neon?

### Option A: Dashboard Tab
1. Klicken Sie auf "mietcheck" Projekt
2. Tab: **"Dashboard"**
3. Sektion: **"Connection Details"**
4. Button: **"Copy"** neben der Connection String

### Option B: Connection Details Tab
1. Klicken Sie auf "mietcheck" Projekt
2. Linkes Menü: **"Connection Details"**
3. Format: Wählen Sie **"node-postgres"** oder **"Pooled"**
4. Kopieren Sie die String

### Option C: Quickstart Tab
1. Klicken Sie auf "mietcheck" Projekt
2. Tab: **"Quickstart"**
3. Sektion: **"Connect to your database"**
4. Select: **"node-postgres"**

---

## ⚠️ Wichtig: Password ist nur einmal sichtbar!

Falls Sie das Password nicht mehr haben:

1. Gehen Sie zu **"Connection Details"**
2. Klicken Sie auf **"Reset password"** oder **"Show password"**
3. Falls nicht verfügbar: Erstellen Sie ein **neues Password**
4. Kopieren Sie die neue Connection String

---

## 💡 Alternative: Neue Datenbank in bestehendem Projekt

Falls Sie die Connection String nicht finden:

1. Im Neon-Projekt "mietcheck"
2. Klicken Sie auf **"Databases"** (linkes Menü)
3. Klicken Sie **"New Database"** (falls nötig)
4. Name: `mietcheck_db`
5. Connection String wird angezeigt

---

## ✅ Erfolg

Nach erfolgreicher Einrichtung:

```bash
# Prüfen
node scripts/check-db.js
```

**Erwartete Ausgabe:**
```
🔍 Checking database...
👥 Users in database: X
📋 Contracts in database: Y
✅ Database check complete
```

---

**Problem gelöst:** Sie nutzen Ihre existierende Neon-Database! 🎉
