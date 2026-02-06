# MietCheck.ch - Development Roadmap

**Last Updated:** 2026-02-06
**Current Phase:** Phase 1 - Critical Functions

---

## 📊 PROGRESS OVERVIEW

**Completed:** 11/19 tasks (58%)
**In Progress:** 0/19 tasks
**Not Started:** 8/19 tasks

---

## PHASE 1: KRITISCHE FUNKTIONEN (Must-Have für Launch)

### 1. Brief-Generierung (Service 2) ⭐⭐⭐
**Status:** ✅ COMPLETED
**Priority:** HIGHEST
**Completed:** 2026-02-04

**Implemented:**
- [x] PDF-Template mit Swiss Legal Format erstellen
- [x] Dynamische Daten-Insertion implementieren
- [x] Rechtssichere Formulierungen nach OR 269d und VMWG Art. 13
- [x] Unterschrifts-Feld hinzufügen
- [x] Anleitung für Einschreiben-Versand (A-Post Plus) - Seite 2
- [x] Berechnungs-Details im Brief anzeigen (Berechnungs-Box)
- [x] Referenzzins-Historie im Brief dokumentieren (Tabelle auf Seite 2)

**Files Changed:**
- `src/lib/document-generator.ts` - Komplett überarbeitet

---

### 2. Payment Integration (Payrexx statt Stripe) ⭐⭐⭐
**Status:** 🔄 PENDING (vor Go-Live)
**Priority:** HIGH
**Estimated Time:** 2-3 hours

**Entscheidung:** Payrexx statt Stripe wegen:
- ✅ TWINT Support (sehr beliebt in CH)
- ✅ Günstigere Gebühren (1.3% TWINT vs 2.9% Stripe)
- ✅ Schweizer Anbieter
- ✅ CHF-Auszahlung direkt

**Tasks (vor Go-Live):**
- [ ] Payrexx Account erstellen (payrexx.com)
- [ ] API Keys holen (Instance Name, API Secret)
- [ ] Stripe-Code auf Payrexx umbauen
- [ ] TWINT aktivieren
- [ ] Webhook konfigurieren
- [ ] Testen mit Test-Modus

**Aktueller Stand:**
- Stripe-Integration vorhanden (funktioniert, aber nicht konfiguriert)
- Success/Cancel Pages existieren
- Webhook-Route existiert
- DB Schema für Transactions bereit

**Payrexx API Docs:** https://docs.payrexx.com

---

### 3. Error Handling & User Feedback ⭐⭐
**Status:** ✅ COMPLETED
**Priority:** MEDIUM-HIGH
**Completed:** 2026-02-04

**Implemented:**
- [x] Toast Notifications System (react-hot-toast) in `src/lib/api-utils.ts`
- [x] Upload Error Messages verbessern
- [x] Gemini API Error Handling (Rate Limits, Timeouts)
- [x] Retry-Mechanismus bei temporären Fehlern (`fetchWithRetry`)
- [x] Loading States mit Progress Indicators
- [x] Network Error Detection
- [x] File Size/Type Validation mit klaren Messages
- [x] Success Animations

**Files Changed:**
- `src/lib/api-utils.ts` - Neues Error Handling Modul
- `src/app/analyze/page.tsx` - Integriert Toast & Retry

---

### 4. Validierung & Edge Cases ⭐⭐
**Status:** ❌ Not Started
**Priority:** MEDIUM
**Estimated Time:** 3-4 hours

**Tasks:**
- [ ] Gemini Extraktions-Qualität testen (20+ echte Verträge)
- [ ] Fehlerhafte Extraktion: User kann korrigieren
- [ ] Alte Verträge (vor 2015) richtig handhaben
- [ ] Verträge ohne Referenzzins-Klausel: Warning anzeigen
- [ ] Mehrere Mieter pro Vertrag unterstützen
- [ ] Gewerbemiete vs. Wohnmiete unterscheiden
- [ ] Unmögliche Daten-Kombinationen erkennen
- [ ] Sanity Checks für Mieten (z.B. > CHF 100, < CHF 20'000)

**Test Cases:**
- [ ] Sehr alter Vertrag (2010)
- [ ] Handgeschriebener Vertrag (schlechte Qualität)
- [ ] Nicht-Standard Format
- [ ] Vertrag ohne Referenzzins-Klausel
- [ ] Gewerberaum
- [ ] WG mit mehreren Mietern

**Blockers:**
- Benötigt echte Test-Verträge von Users

---

### 5. Datenbank-Persistenz ⭐⭐⭐
**Status:** ✅ COMPLETED
**Priority:** HIGH
**Completed:** 2026-02-04

**Implemented:**
- [x] POST /api/user/contracts Endpoint zum Speichern
- [x] GET /api/user/contracts/[id] Endpoint zum Laden einzelner Verträge
- [x] Erweiterte DB-Schema mit tenant_name, tenant_address, new_rent, monthly_reduction, yearly_savings
- [x] Automatische Migration für bestehende Datenbanken
- [x] Analyze-Seite speichert Verträge nach Berechnung (wenn eingeloggt)
- [x] Generate-Seite lädt Vertrag via contractId Query-Parameter
- [x] Fallback auf sessionStorage wenn DB nicht verfügbar

**Files Changed:**
- `src/lib/db.ts` - Erweiterte Schema
- `src/app/api/user/contracts/route.ts` - POST Endpoint hinzugefügt
- `src/app/api/user/contracts/[id]/route.ts` - Neuer Single-Contract Endpoint
- `src/app/analyze/page.tsx` - DB-Speicherung integriert
- `src/app/generate/page.tsx` - DB-Laden mit Suspense Boundary

**Benefit:** Verträge bleiben nach Deploy erhalten, nicht nur sessionStorage

---

## PHASE 2: UX VERBESSERUNGEN

### 6. Email-Versand des Briefs 📧
**Status:** ✅ COMPLETED
**Priority:** MEDIUM
**Completed:** 2026-02-05

**Implemented:**
- [x] Email-Service-Provider evaluiert → **Resend** gewählt
- [x] Email-Templates erstellt (React Email Components)
  - [x] Welcome Email (nach Registrierung)
  - [x] Analysis Complete Email (nach Analyse)
  - [x] Letter Generated Email (mit Download-Link)
  - [x] Letter with Attachment Email (PDF im Anhang)
- [x] Email-Service Library (`src/lib/email-service.ts`)
- [x] API Route für Email-Versand (`/api/send-email`)
- [x] API Route für Brief per Email (`/api/send-letter-email`)
- [x] Rate-Limiting implementiert (5 Emails/Stunde pro User)
- [x] Integration in bestehende Flows:
  - [x] Registrierung → Welcome Email
  - [x] Analyse → Analysis Complete Email
  - [x] Brief-Generierung → Email mit PDF-Attachment
- [x] Error-Handling (non-blocking emails)
- [x] PDF als Attachment senden
- [x] Dokumentation (`EMAIL_SYSTEM.md`)

**Files Changed:**
- `src/emails/` - 4 neue Email-Templates
- `src/lib/email-service.ts` - Email-Service mit Resend
- `src/lib/rate-limit.ts` - Rate-Limiting Utility
- `src/app/api/send-email/route.ts` - Email-API
- `src/app/api/send-letter-email/route.ts` - Brief-Email-API
- `src/app/api/register/route.ts` - Welcome Email
- `src/app/api/analyze/route.ts` - Analysis Email
- `.env.local` - Resend Config
- `EMAIL_SYSTEM.md` - Dokumentation

**Vor Go-Live:**
- [ ] Resend Account erstellen
- [ ] Domain verifizieren
- [ ] API Key in Production setzen

---

### 7. User Dashboard 📊
**Status:** 🔄 PARTIAL
**Priority:** MEDIUM
**Estimated Time:** 4-6 hours

**Implemented:**
- [x] Dashboard Layout vorhanden (`/dashboard`)
- [x] Verträge werden aus DB geladen
- [x] Grundlegende Übersicht der Analysen

**Noch zu tun:**
- [ ] Historie der generierten Briefe
- [ ] Status-Tracking (versendet/Antwort erhalten/Schlichtung)
- [ ] Re-Download von bezahlten Briefen
- [ ] Notizen-Funktion
- [ ] Timeline-View der Miet-Historie
- [ ] Export als Excel/CSV

**Blockers:** None

---

### 8. Analytics & Tracking 📈
**Status:** ❌ Not Started
**Priority:** LOW-MEDIUM
**Estimated Time:** 1-2 hours

**Tasks:**
- [ ] Google Analytics 4 oder Plausible integrieren
- [ ] Conversion Tracking (Upload → Analyze → Generate → Payment)
- [ ] Funnel-Analyse Setup
- [ ] Error-Tracking (Sentry)
- [ ] User-Feedback Tool (z.B. Hotjar)

**Acceptance Criteria:**
- [ ] Alle wichtigen Events werden getrackt
- [ ] Conversion Rate messbar
- [ ] Fehler werden automatisch gemeldet

**Blockers:** None

---

## PHASE 3: BUSINESS FEATURES

### 9. A/B Testing & Optimization 🧪
**Status:** ❌ Not Started
**Priority:** LOW
**Estimated Time:** 2-3 hours

**Tasks:**
- [ ] Pricing A/B Test (CHF 20 vs CHF 50)
- [ ] Landing Page Varianten
- [ ] CTA Button Texte testen
- [ ] Upload Flow optimieren

**Blockers:**
- Benötigt Traffic für aussagekräftige Tests

---

### 10. Multi-Language Support 🌍
**Status:** ✅ COMPLETED
**Priority:** LOW
**Completed:** 2026-02-06
**Time Taken:** 6 hours

**Implemented:**
- [x] i18n Setup (next-intl)
- [x] Deutsch ✅ (vollständig)
- [x] Französisch ✅ (vollständig)
- [x] Italienisch ✅ (vollständig)
- [x] Englisch ✅ (vollständig)
- [x] Language Switcher UI mit Flaggen und Cookie-Persistenz
- [x] Homepage komplett übersetzt mit useTranslations()
- [x] Brief-Sprachauswahl unabhängig von UI-Sprache (DE/FR/IT)
- [x] Dashboard zeigt gespeicherte Verträge mit allen Berechnungsdaten

**Files Changed:**
- `messages/de.json`, `messages/fr.json`, `messages/it.json`, `messages/en.json` - Vollständige Übersetzungen
- `src/app/page.tsx` - Homepage mit next-intl
- `src/app/generate/page.tsx` - Letter language selector
- `src/app/dashboard/page.tsx` - Erweiterte Contract-Anzeige
- `src/components/LanguageSwitcher.tsx` - Dropdown mit Flaggen
- `src/i18n/config.ts`, `src/i18n/request.ts` - i18n Configuration
- `next.config.js` - withNextIntl wrapper

**Note:** Übersetzungen wurden mit KI erstellt und sollten von Muttersprachlern reviewed werden

---

### 11. Referral & Affiliate Program 💰
**Status:** ❌ Not Started
**Priority:** LOW
**Estimated Time:** 3-4 hours

**Tasks:**
- [ ] Referral-Link System
- [ ] Commission Tracking
- [ ] Affiliate Dashboard
- [ ] Payout Management

**Blockers:**
- Payment System muss stabil laufen

---

## PHASE 4: OPTIMIERUNGEN

### 12. Performance Optimization ⚡
**Status:** ❌ Not Started
**Priority:** LOW
**Estimated Time:** 2-3 hours

**Tasks:**
- [ ] Image Optimization (next/image)
- [ ] Font Optimization
- [ ] Lazy Loading
- [ ] Bundle Size Reduction
- [ ] CDN Setup für Static Assets
- [ ] Caching Strategy
- [ ] Lighthouse Score > 90

**Acceptance Criteria:**
- [ ] Page Load < 2 seconds
- [ ] Lighthouse Performance > 90

**Blockers:** None

---

### 13. SEO & Marketing 📢
**Status:** ✅ COMPLETED
**Priority:** MEDIUM
**Completed:** 2026-02-04

**Implemented:**
- [x] Meta Tags optimieren (Keywords, Description, Authors, Robots)
- [x] sitemap.xml generieren (dynamisch via Next.js)
- [x] robots.txt erstellen
- [x] Schema.org Markup (Organization, WebApplication, FAQ, Breadcrumb)
- [x] Open Graph Tags (mit dynamischem OG Image)
- [x] Twitter Cards (mit dynamischem Twitter Image)
- [ ] Google Search Console Setup (manuell nach Deploy)
- [ ] Blog für Content Marketing (Phase 3)

**Files Changed:**
- `src/app/layout.tsx` - Umfassende Meta Tags
- `src/app/sitemap.ts` - Dynamische Sitemap
- `public/robots.txt` - Crawler Rules
- `src/components/JsonLd.tsx` - Schema.org Structured Data
- `src/app/opengraph-image.tsx` - Dynamisches OG Image
- `src/app/twitter-image.tsx` - Dynamisches Twitter Image

**Blockers:** None

---

### 14. Legal & Compliance ⚖️
**Status:** ✅ COMPLETED
**Priority:** HIGH (vor Launch!)
**Completed:** 2026-02-04

**Implemented:**
- [x] Impressum erstellen (mit echten Daten: Thorsten Strathaus, Im Ahorn 14, 8125 Zollikerberg)
- [x] Datenschutzerklärung vorhanden (`/datenschutz`)
- [x] AGB für Service vorhanden (`/agb`)
- [ ] Cookie Consent Banner (optional, da keine Tracking-Cookies)
- [x] Disclaimer für rechtliche Beratung im Brief

**Files Changed:**
- `src/app/impressum/page.tsx` - Mit echten Kontaktdaten

**Blockers:** None

---

### 15. Backup & Security 🔒
**Status:** ❌ Not Started
**Priority:** HIGH
**Estimated Time:** 1-2 hours

**Tasks:**
- [ ] Database Backup Strategy
- [ ] Vercel Blob Backup
- [ ] Rate Limiting API Routes
- [ ] CSRF Protection
- [ ] Input Sanitization
- [ ] SQL Injection Prevention (✅ bereits via Parameterized Queries)
- [ ] Dependency Security Audit

**Acceptance Criteria:**
- [ ] Daily Backups
- [ ] Security Headers korrekt
- [ ] Keine Known Vulnerabilities

**Blockers:** None

---

### 16. Testing & Quality Assurance ✅
**Status:** ❌ Not Started
**Priority:** MEDIUM
**Estimated Time:** 4-6 hours

**Tasks:**
- [ ] E2E Tests mit Playwright
- [ ] Unit Tests für Calculator Functions
- [ ] Integration Tests für API Routes
- [ ] Visual Regression Tests
- [ ] Cross-Browser Testing
- [ ] Mobile Testing (iOS/Android)

**Acceptance Criteria:**
- [ ] 80%+ Code Coverage
- [ ] Alle Critical Paths getestet

**Blockers:** None

---

### 17. Documentation 📚
**Status:** ❌ Not Started
**Priority:** LOW
**Estimated Time:** 2-3 hours

**Tasks:**
- [ ] API Documentation
- [ ] Code Comments
- [ ] README.md aktualisieren
- [ ] Setup Guide für neue Entwickler
- [ ] Architecture Diagrams

**Blockers:** None

---

### 18. Monitoring & Alerting 🚨
**Status:** ❌ Not Started
**Priority:** MEDIUM
**Estimated Time:** 1-2 hours

**Tasks:**
- [ ] Uptime Monitoring (UptimeRobot)
- [ ] Error Alerting (Sentry)
- [ ] Performance Monitoring
- [ ] API Rate Limit Monitoring
- [ ] Vercel Analytics
- [ ] Slack/Email Alerts bei Critical Errors

**Acceptance Criteria:**
- [ ] Downtime wird sofort gemeldet
- [ ] Performance-Probleme werden erkannt

**Blockers:** None

---

## PHASE 5: CONTENT MANAGEMENT (FUTURE)

### 19. Content Management System 📝
**Status:** ❌ Not Started (FUTURE)
**Priority:** LOW
**Estimated Time:** 8-12 hours (für CMS) / 2-3 hours (für GitHub-basierte Lösung)

**Entscheidung:** CMS erst bei MRR > €10,000 oder Marketing-Team

**Optionen:**

**Option A: Status Quo (JSON-Dateien in Git) - EMPFOHLEN für 2026** ✅
- **Vorteile:**
  - ✅ Kein Extra-Hosting nötig
  - ✅ Versionskontrolle in Git
  - ✅ Kostenlos
  - ✅ Schnell (Texte im Build gebacken)
  - ✅ Typsicher
- **Nachteile:**
  - ❌ Technisches Wissen für Änderungen nötig
  - ❌ Deployment bei jeder Textänderung
- **Wann verwenden:** Startup-Phase, kleines Team, Budget < €10k MRR

**Option B: GitHub als "CMS" (Kompromiss)**
- Einfache Web-UI bauen, die JSON über GitHub API editiert
- Automatischer PR-Erstellung bei Änderungen
- Kostenlos, aber nutzerfreundlicher als direkt Git
- **Estimated Time:** 2-3 hours
- **Wann verwenden:** Wenn Marketing-Team oft Texte ändert, aber Budget klein

**Option C: Headless CMS (Contentful / Sanity / Strapi)**
- **Kosten:** €99-300/Monat
- **Vorteile:**
  - ✅ WYSIWYG Editor
  - ✅ Sofortige Updates ohne Deploy
  - ✅ Workflow (Review, Scheduling)
  - ✅ Mehrere Editoren gleichzeitig
- **Nachteile:**
  - ❌ Monatliche Kosten
  - ❌ Komplexität
  - ❌ Externe Abhängigkeit
  - ❌ Langsamere Ladezeit (API-Calls)
- **Wann verwenden:** MRR > €10k, Marketing-Team vorhanden, viele A/B-Tests

**Empfehlung:**
1. **JETZT (2026):** Option A - JSON in Git ✅
2. **Nach 6-12 Monaten:** Option B - GitHub-basiertes CMS (wenn nötig)
3. **Nach Product-Market-Fit:** Option C - Professionelles CMS

**Tasks (wenn CMS gewünscht):**
- [ ] CMS Provider auswählen (Contentful vs Sanity vs Strapi)
- [ ] Account einrichten
- [ ] Content-Model definieren
- [ ] API Integration
- [ ] Fallback-Strategy bei CMS-Ausfall
- [ ] Caching implementieren (ISR oder SSG)

**Blockers:**
- Nicht dringend, nur wenn Team wächst oder viele Textänderungen nötig

---

## 🎯 CURRENT SPRINT

**Focus:** Phase 1 - Critical Functions
**Timeline:** Week 1-2

**Completed:**
1. [x] Brief-Generierung implementieren ✅
2. [x] SEO & Marketing ✅
3. [x] Error Handling & User Feedback ✅
4. [x] Legal & Compliance (Impressum) ✅
5. [x] Datenbank-Persistenz ✅
6. [x] Datenübertragung Analyze → Generate ✅

**This Week:**
7. [ ] Validierung & Edge Cases
8. [ ] Dashboard verbessern

**Before Go-Live:**
9. [ ] Payrexx Payment Integration (statt Stripe)

---

## 📝 NOTES

**Technical Debt:**
- `next@14.2.18` Security Update pending
- `@vercel/postgres` Migration zu Neon
- ESLint Packages Updates

**Known Issues:**
- None currently blocking

**Dependencies:**
- Payrexx Account (vor Go-Live)
- Email Service Provider
- ~~Legal Review (vor Launch)~~ ✅ Done

**Payment Provider Decision:**
- ~~Stripe~~ → **Payrexx** gewählt
- Grund: TWINT + günstigere Gebühren + Schweizer Anbieter
- Gebühren: TWINT 1.3%, Kreditkarte 2.5% (vs Stripe 2.9%)

**Digitale Signaturen (Recherche 2026-02-04):**
- ZertES (Schweizer Signaturgesetz) regelt elektronische Signaturen
- QES (Qualifizierte elektronische Signatur) = rechtlich gleichwertig zu handschriftlich
- Anbieter: Swisscom Sign, SwissSign, Skribble
- Für Herabsetzungsbegehren: QES nicht erforderlich, physischer Brief mit Unterschrift reicht

---

## 🚀 LAUNCH CHECKLIST

**Before Public Launch:**
- [x] Brief-Generierung funktioniert
- [x] Error Handling robust
- [x] Legal Pages (Impressum, Datenschutz, AGB)
- [x] SEO implementiert
- [x] Datenbank-Persistenz funktioniert
- [ ] Payrexx Payment funktioniert (inkl. TWINT)
- [ ] Backup Strategy
- [ ] Monitoring aktiv
- [ ] Beta Testing mit 10+ Users

---

**Next Update:** Nach Completion von Payrexx Integration
