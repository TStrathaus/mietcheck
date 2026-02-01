@echo off
chcp 65001 >nul
echo.
echo ========================================
echo MietCheck - GPT-4 Integration
echo Phase 1.3: Automatische PDF-Analyse
echo ========================================
echo.

if not exist package.json (
    echo FEHLER: package.json nicht gefunden!
    pause
    exit /b 1
)

echo [1/5] Installiere OpenAI...
call npm install openai@4.77.3 --save

echo.
echo [2/5] Erstelle Verzeichnisse...
mkdir src\lib 2>nul
mkdir src\app\api\analyze-contract 2>nul

echo.
echo [3/5] Kopiere GPT-4 Dateien...
copy /Y contract-analyzer.ts src\lib\
copy /Y analyze-contract-route.ts src\app\api\analyze-contract\route.ts
copy /Y FileUpload.tsx src\components\
copy /Y analyze-page.tsx src\app\analyze\page.tsx

echo.
echo [4/5] Pruefe .env.local...
findstr /C:"OPENAI_API_KEY" .env.local >nul 2>&1
if errorlevel 1 (
    echo OPENAI_API_KEY=sk-proj-DEIN-KEY-HIER >> .env.local
    echo [WARNUNG] OPENAI_API_KEY zu .env.local hinzugefuegt
    echo Du musst den echten API-Key eintragen!
) else (
    echo [OK] OPENAI_API_KEY gefunden
)

echo.
echo [5/5] Git Commit und Push...
git add .
git commit -m "feat: Add GPT-4 contract analysis (Phase 1.3)"
git push origin main

echo.
echo ========================================
echo DEPLOYMENT ERFOLGREICH!
echo ========================================
echo.
echo NAECHSTE SCHRITTE:
echo.
echo 1. OpenAI API Key holen:
echo    - Gehe zu: https://platform.openai.com/api-keys
echo    - Erstelle neuen Key
echo    - Kopiere den Key
echo.
echo 2. In .env.local eintragen:
echo    OPENAI_API_KEY=sk-proj-DEIN-ECHTER-KEY
echo.
echo 3. In Vercel setzen:
echo    vercel env add OPENAI_API_KEY production
echo.
echo 4. Testen:
echo    npm run dev
echo    - Gehe zu /analyze
echo    - PDF hochladen
echo    - GPT-4 analysiert automatisch
echo.
echo ========================================
pause
