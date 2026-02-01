# 🤖 Phase 1.3: GPT-4 PDF-Analyse - Deployment

## 🎯 Was wird hinzugefügt?

✅ **Automatische Mietvertrag-Analyse** mit OpenAI GPT-4  
✅ **PDF hochladen** → KI extrahiert alle Daten  
✅ **Formular-Auto-Fill** mit extrahierten Daten  
✅ **Konfidenz-Bewertung** der Analyse  

---

## ⚡ Quick Start (3 Schritte)

### 1. DEPLOY-GPT4.bat ausführen
```
Doppelklick auf DEPLOY-GPT4.bat
```

### 2. OpenAI API Key holen
1. Gehe zu: https://platform.openai.com/api-keys
2. Login mit deinem OpenAI Account
3. "Create new secret key" klicken
4. Key kopieren (sieht aus wie: `sk-proj-xxx...`)

### 3. API Key setzen

**Lokal (.env.local):**
```
OPENAI_API_KEY=sk-proj-DEIN-ECHTER-KEY-HIER
```

**Vercel (Production):**
```
vercel env add OPENAI_API_KEY production
→ Paste deinen Key
```

**FERTIG!** 🎉

---

## 📦 Was ist im Paket?

```
gpt4-deployment/
├── DEPLOY-GPT4.bat              # Automatisches Deployment
├── README.md                    # Diese Datei
├── contract-analyzer.ts         # GPT-4 Analyzer
├── analyze-contract-route.ts    # API Route
├── FileUpload.tsx              # Enhanced Upload mit GPT-4
└── analyze-page.tsx            # Updated Analyze Page
```

---

## 🧪 Testen

Nach dem Deployment:

```bash
npm run dev
# → http://localhost:3000/analyze
```

**Test-Flow:**
1. Klick "Analyse" im Dashboard
2. Lade einen PDF-Mietvertrag hoch
3. Warte 10-30 Sekunden
4. ✅ Formular wird automatisch ausgefüllt!

---

## 📊 Was extrahiert GPT-4?

- 📍 **Adresse** der Mietwohnung
- 💰 **Nettomiete** (Grundmiete ohne NK)
- 📊 **Referenzzinssatz** bei Vertragsabschluss
- 📅 **Vertragsdatum**
- 🏢 **Vermieter** Name & Adresse
- ✅ **Konfidenz-Level** (high/medium/low)

---

## 💰 Kosten

**OpenAI GPT-4 Turbo:**
- ~$0.01 pro Analyse
- Bei 50 Analysen/Monat: ~$0.50/Monat
- Bei 500 Analysen/Monat: ~$5/Monat

**Super günstig!** ✅

---

## 🐛 Troubleshooting

### "OpenAI API Error: Invalid API Key"
→ Prüfe ob Key richtig in .env.local und Vercel

### "Analysis failed: Text too short"
→ PDF-Text-Extraktion hat nicht funktioniert
→ Prüfe ob PDF Text enthält (nicht nur Bild)

### "Rate limit exceeded"
→ Zu viele Requests
→ OpenAI Free Tier hat Limits

---

## 🎯 Nach dem Deployment

**Testen:**
1. Lokal: `npm run dev` → /analyze
2. Production: https://mietcheck-nine.vercel.app/analyze

**Was funktioniert:**
- ✅ PDF hochladen
- ✅ GPT-4 Analyse
- ✅ Auto-Fill Formular
- ✅ Konfidenz-Anzeige
- ✅ Fehlende Felder markiert

---

## 📚 Technische Details

**Stack:**
- OpenAI GPT-4 Turbo Preview
- Structured Output (JSON)
- Retry-Logic bei Fehlern
- Validation der extrahierten Daten

**Flow:**
1. User lädt PDF hoch
2. PDF.js extrahiert Text
3. Text → GPT-4 API
4. GPT-4 → Strukturierte JSON-Antwort
5. Validation der Daten
6. Auto-Fill Formular

---

**Version:** 1.3.0  
**Status:** Production Ready ✅  
**Deploy Time:** ~5 Minuten
