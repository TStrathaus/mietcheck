# ⚡ QUICK START (5 Minuten)

## 1. Files herunterladen

Lade alle Files aus dem Chat herunter und speichere sie in einem Ordner `mietcheck-app`.

## 2. Terminal öffnen

In Visual Studio Code:
- Öffne den Ordner `mietcheck-app`
- Terminal: `View` → `Terminal` (oder Ctrl+`)

## 3. Dependencies installieren

```bash
npm install
```

Warte bis "added 500 packages" erscheint (~2-3 Minuten).

## 4. Environment Variables

Erstelle eine Datei `.env.local`:

```env
POSTGRES_URL="postgres://placeholder"
OPENAI_API_KEY="sk-placeholder"
STRIPE_SECRET_KEY="sk_test_placeholder"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_placeholder"
SESSION_SECRET="my-super-secret-key-12345"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 5. App starten

```bash
npm run dev
```

## 6. Browser öffnen

Gehe zu: **http://localhost:3000**

**FERTIG!** 🎉

---

## Was funktioniert OHNE echte API Keys?

✅ Landing Page
✅ Alle Services (Formular & Berechnung)
✅ PDF-Generierung (im Browser)

❌ Braucht echte Keys:
- Datenbank-Speicherung
- Stripe Payments
- KI-Analyse (optional)

---

## Nächste Schritte

1. **Testen:** Probiere alle 3 Services aus
2. **Anpassen:** Ändere Texte in `src/app/page.tsx`
3. **Deployen:** Folge der Anleitung in `README.md`

---

## Probleme?

**"Module not found":**
```bash
rm -rf node_modules
npm install
```

**Port 3000 bereits belegt:**
```bash
npm run dev -- --port 3001
```

**Andere Fragen:**
→ Siehe `README.md`
