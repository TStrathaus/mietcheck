# 📋 Aufgabenliste nach Datenbank-Fix

Priorisierung: Nach Go-Live Wichtigkeit und Abhängigkeiten

---

## 🔴 KRITISCH - Vor Go-Live (Blocker)

### 1. Payment Integration (Payrexx + TWINT)
**Warum kritisch:** Ohne Payment kann niemand Service 1 & 2 kaufen
**Status:** Nicht implementiert
**Aufwand:** 2-3 Stunden
**Abhängigkeiten:** Payrexx Account, API Keys

**Tasks:**
- [ ] Payrexx Account erstellen & API Keys holen
- [ ] Payment Flow implementieren (Service 1: CHF 9, Service 2: CHF 49)
- [ ] TWINT Integration testen
- [ ] Success/Cancel Pages mit korrekte Weiterleitung
- [ ] Transaction Tracking in Database

---

### 2. E-Mail System konfigurieren
**Warum kritisch:** Support-Emails, Passwort-Reset, Benachrichtigungen funktionieren nicht
**Status:** Teilweise implementiert, keine Email-Adressen konfiguriert
**Aufwand:** 1-2 Stunden

**Tasks:**
- [ ] **Resend Account konfigurieren:**
  - Domain verifizieren (mietcheck.ch oder mietcheck-app.ch)
  - DKIM/SPF Records bei Hostfactory eintragen
  - API Key generieren und in Vercel Environment Variables eintragen

- [ ] **Email-Adressen definieren:**
  - `noreply@mietcheck.ch` - Automatische Benachrichtigungen (bereits im Code)
  - `support@mietcheck.ch` - Kundensupport (neu anlegen)
  - `admin@mietcheck.ch` - Admin-Benachrichtigungen (optional)

- [ ] **Auf Webseite veröffentlichen:**
  - Footer: "support@mietcheck.ch"
  - Impressum: "support@mietcheck.ch"
  - Datenschutz: "datenschutz@mietcheck.ch" (oder support)

- [ ] **Passwort-Reset Flow implementieren:**
  - /forgot-password Seite erstellen
  - /api/auth/forgot-password Route
  - /reset-password/[token] Seite
  - Email-Template für Reset-Link

- [ ] **Support-Formular implementieren:**
  - Kontaktformular auf Homepage
  - /api/contact Route → sendet Email an support@mietcheck.ch
  - Auto-Reply an Nutzer

**Email Flow nach Implementation:**
```
User → support@mietcheck.ch → Resend → Forwarding an externe Person
```

---

### 3. System-Architektur & Kosten-Übersicht erstellen
**Warum wichtig:** Übersicht für Sie und zukünftige Admins
**Status:** Noch nicht erstellt
**Aufwand:** 1 Stunde

**Tasks:**
- [ ] Architektur-Diagramm erstellen (Markdown mit Mermaid)
- [ ] Service-Matrix mit Kosten
- [ ] Datenfluss dokumentieren
- [ ] In Admin-Bereich integrieren

**Services (vorläufige Liste):**
1. **Claude Code** (Lokal) - Entwicklung
2. **GitHub** - Code Repository (Kostenlos für Public/Free Plan)
3. **Vercel** - Hosting & Deployment (Free: $0, Pro: $20/Monat)
4. **Neon Postgres** - Database (Free: 0.5GB, Scale: $19/Monat)
5. **Vercel Blob** - File Storage (Free: 500MB, dann pay-as-you-go)
6. **Resend** - Email Service (Free: 100 emails/Tag, Paid: $20/Monat für 50k)
7. **OpenAI API** - PDF Analyse (Pay-per-use, ca. $0.01 pro Analyse)
8. **Payrexx** - Payment (2.9% + CHF 0.30 pro Transaktion)
9. **Hostfactory** - Domain & DNS (Bestehend)
10. **Google Ads** - Marketing (Budget-abhängig, optional)

**Fehlende Services?**
- Monitoring? (z.B. Sentry für Error Tracking)
- Analytics? (Plausible/GA4)
- Backup? (Neon hat automatische Backups)

---

## 🟡 WICHTIG - Kurzfristig (1-2 Wochen nach Go-Live)

### 4. Admin-Dashboard erstellen
**Warum wichtig:** Zentrale Verwaltung ohne Code-Zugriff
**Status:** Nicht implementiert
**Aufwand:** 3-4 Stunden

**Tasks:**
- [ ] **Admin-Authentifizierung:**
  - `/admin/login` - Separates Login (Admin-Role in DB)
  - Middleware für Admin-Routes
  - Admin-User in DB anlegen (nur Sie + externe Person)

- [ ] **Admin-Übersicht (`/admin/dashboard`):**
  - Statistiken: Registrierungen, Analysen, Käufe
  - Letzte Aktivitäten
  - System-Status (DB, Email, Payment)

- [ ] **Nutzer-Verwaltung (`/admin/users`):**
  - Liste aller User mit Email, Name, Created Date
  - Filter: Service 0/1/2 Nutzer
  - User-Details anzeigen (Verträge, Transaktionen)
  - User löschen (mit DSGVO-konformer Löschung)
  - Suchfunktion

- [ ] **Vertragsverwaltung (`/admin/contracts`):**
  - Alle analysierten Verträge
  - Filter nach User, Datum, Einsparung
  - Export als CSV

- [ ] **Transaktionen (`/admin/transactions`):**
  - Alle Käufe (Service 1 & 2)
  - Filter nach Status, Datum
  - Export für Buchhaltung

- [ ] **Email-Center (`/admin/emails`):**
  - Email an einzelnen User senden
  - Email an User-Gruppe (z.B. alle Service 0)
  - Template-System für häufige Emails
  - Email-Historie anzeigen

- [ ] **System-Dokumentation (`/admin/docs`):**
  - TODO.md anzeigen (Live aus Repo)
  - System-Architektur anzeigen
  - Diese TASKS_POST_DATABASE_FIX.md anzeigen
  - Auto-Update nach Git Push

**Wichtig für externe Person:**
- Zugang nur zu /admin (keine Code/Vercel/DB-Zugriffe)
- Kann Emails versenden
- Kann User-Daten einsehen/verwalten
- Kann Käufe verwalten
- **KEINE privaten Emails mehr an Sie!**

**Alternativen zum Admin-Dashboard:**
- **Retool** - Low-Code Admin Panel (schneller, aber $10-50/Monat)
- **Forest Admin** - Auto-generiertes Admin Panel ($0-99/Monat)
- **Custom Admin Dashboard** - Volle Kontrolle, mehr Aufwand

**Empfehlung:** Custom Admin Dashboard (wie geplant), weil:
- Volle Kontrolle über Daten
- Keine zusätzlichen Kosten
- Kann direkt mit Ihrer DB arbeiten
- Kann in Ihre App integriert werden

---

### 5. Service 0 - Vertragsupload & Auto-Analyse
**Warum wichtig:** Bessere UX, weniger manuelle Eingabe
**Status:** PDF-Upload funktioniert, aber nicht in Service 0
**Aufwand:** 2 Stunden

**Tasks:**
- [ ] `/register` Seite erweitern:
  - Option 1: Manuelle Eingabe (aktuell)
  - Option 2: PDF hochladen (neu)
  - Toggle zwischen beiden Modi

- [ ] PDF-Upload in Service 0:
  - Gleiche Upload-Komponente wie in /analyze
  - Auto-Extraktion: Address, Net Rent, Reference Rate, Contract Date
  - User kann Werte korrigieren vor Submit
  - Falls Extraktion fehlschlägt → Fallback auf manuelle Eingabe

- [ ] OpenAI API Key konfigurieren:
  - Für bessere PDF-Analyse
  - In Vercel Environment Variables
  - Kosten: ~$0.01 pro Analyse

---

### 6. DSGVO - Daten-Löschung implementieren
**Warum wichtig:** Rechtliche Anforderung, User-Vertrauen
**Status:** Nicht implementiert
**Aufwand:** 1-2 Stunden

**Tasks:**
- [ ] **Dashboard User-Einstellungen:**
  - `/dashboard/settings` Seite erstellen
  - **Option 1:** "Vertragsdaten löschen, Email behalten"
    - Löscht: contracts, transactions, uploads
    - Behält: email, name (für Zinssatz-Benachrichtigung)

  - **Option 2:** "Alle Daten löschen"
    - Löscht: User-Account + alle zugehörigen Daten
    - CASCADE DELETE in DB (bereits implementiert)

  - **Bestätigung:** "Sind Sie sicher?" Modal
  - **Logging:** Löschung wird geloggt (für DSGVO Nachweis)

- [ ] **API Routes:**
  - `/api/user/delete-contracts` - Löscht nur Verträge
  - `/api/user/delete-account` - Löscht alles
  - Beide mit Session-Check und Bestätigung

- [ ] **Datenschutz-Seite aktualisieren:**
  - Hinweis auf Lösch-Optionen
  - Link zu /dashboard/settings

---

## 🟢 OPTIONAL - Nice-to-Have

### 7. C:\Users\Thors Cleanup
**Warum:** Verwirrung vermeiden, Ordnung schaffen
**Status:** Noch nicht gemacht
**Aufwand:** 30 Minuten

**Tasks:**
- [ ] **Prüfen was gelöscht werden kann:**
  ```bash
  C:\Users\Thors\.claude\              # Claude Code Settings (BEHALTEN!)
  C:\Users\Thors\.claude-worktrees\    # Temporäre Git Worktrees (können gelöscht werden nach Session)
  C:\Users\Thors\AppData\Local\Temp\   # Temp Files (Windows räumt automatisch auf)
  ```

- [ ] **Aktionen:**
  - `.claude` Ordner BEHALTEN (Ihre Einstellungen)
  - `.claude-worktrees` kann gelöscht werden wenn keine aktive Session
  - Temp-Files lässt Windows automatisch aufräumen

- [ ] **Empfehlung:**
  - Arbeiten Sie immer von `D:\STTH\2026 KI\mietcheck\` (Haupt-Repo)
  - Ignorieren Sie `C:\Users\Thors\.claude-worktrees\` (nur für Claude Code intern)

---

## 📊 Priorisierte Reihenfolge (Empfehlung)

### Sprint 1: Go-Live Vorbereitung (4-6 Stunden)
1. ✅ **Datenbank-Fix** (bereits erledigt!)
2. 🔴 **Email-System konfigurieren** (1-2h) - BLOCKER
3. 🔴 **Passwort-Reset implementieren** (1h)
4. 🔴 **Payment Integration** (2-3h) - BLOCKER
5. 🟡 **System-Architektur dokumentieren** (1h)

**Nach Sprint 1:** Minimale GO-LIVE Version ist bereit! 🚀

### Sprint 2: Post-Launch (1 Woche nach Go-Live, 5-7 Stunden)
6. 🟡 **Admin-Dashboard Basis** (3-4h)
   - User-Liste anzeigen
   - Email-Versand
   - Transaktionen anzeigen
7. 🟡 **Service 0 PDF-Upload** (2h)
8. 🟡 **DSGVO Daten-Löschung** (1-2h)

**Nach Sprint 2:** Externe Person kann Admin-Arbeit übernehmen

### Sprint 3: Optimierung (Optional)
9. 🟢 **Admin-Dashboard erweitern** (Analytics, Export, etc.)
10. 🟢 **Monitoring & Alerts** (Sentry, UptimeRobot)
11. 🟢 **Testing mit echten Verträgen** (10-20 Verträge)

---

## 🎯 Nächste Schritte JETZT

**Warten auf Vercel Deployment (~2 Minuten)**

Dann:

**Option A: Sofort Go-Live vorbereiten**
→ Email-System + Payment (Sprint 1)

**Option B: Vercel testen, dann Sprint 1**
→ Erst Registrierung/Dashboard auf Vercel prüfen

**Was möchten Sie als Nächstes angehen?** 💪
