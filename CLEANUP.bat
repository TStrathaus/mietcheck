@echo off
chcp 65001 >nul
echo.
echo ========================================
echo MietCheck - KOMPLETTES CLEANUP
echo ========================================
echo.

if not exist package.json (
    echo FEHLER: package.json nicht gefunden!
    pause
    exit /b 1
)

echo [1/4] Loesche Root-Duplikate...
del /Q nextauth-route.ts 2>nul
del /Q contract-analyzer.ts 2>nul
del /Q analyze-contract-route.ts 2>nul
del /Q user-contracts-route.ts 2>nul
del /Q user-transactions-route.ts 2>nul

echo [2/4] Loesche dashboard-files aus Git...
git rm -r --cached dashboard-files 2>nul
rd /S /Q dashboard-files 2>nul

echo [3/4] Ersetze korrekte Auth-Dateien...
copy /Y fixed-nextauth-route.ts src\app\api\auth\[...nextauth]\route.ts
copy /Y fixed-user-contracts.ts src\app\api\user\contracts\route.ts
copy /Y fixed-user-transactions.ts src\app\api\user\transactions\route.ts

echo [4/4] Git Commit und Push...
git add .
git commit -m "fix: Complete cleanup - remove duplicates and fix auth"
git push origin main

echo.
echo ========================================
echo CLEANUP ERFOLGREICH!
echo ========================================
echo.
echo Vercel baut in 2 Minuten
echo Teste: https://mietcheck-nine.vercel.app/analyze
echo.
pause
