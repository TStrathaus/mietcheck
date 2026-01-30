@echo off
chcp 65001 >nul
echo.
echo ========================================
echo MietCheck Dashboard Deployment
echo ========================================
echo.

if not exist package.json (
    echo FEHLER: package.json nicht gefunden!
    pause
    exit /b 1
)

if not exist dashboard-files (
    echo FEHLER: dashboard-files Ordner nicht gefunden!
    pause
    exit /b 1
)

echo [1/6] Installiere next-auth...
call npm install next-auth@4.24.10 --save

echo.
echo [2/6] Erstelle Verzeichnisse...
mkdir src\app\login 2>nul
mkdir src\app\dashboard 2>nul
mkdir src\app\api\auth\[...nextauth] 2>nul
mkdir src\app\api\user\contracts 2>nul
mkdir src\app\api\user\transactions 2>nul
mkdir src\types 2>nul

echo.
echo [3/6] Kopiere Dateien...
copy /Y dashboard-files\providers.tsx src\app\
copy /Y dashboard-files\layout.tsx src\app\
copy /Y dashboard-files\page.tsx src\app\
copy /Y dashboard-files\login-page.tsx src\app\login\page.tsx
copy /Y dashboard-files\dashboard-page.tsx src\app\dashboard\page.tsx
copy /Y dashboard-files\nextauth-route.ts src\app\api\auth\[...nextauth]\route.ts
copy /Y dashboard-files\api-user-contracts.ts src\app\api\user\contracts\route.ts
copy /Y dashboard-files\api-user-transactions.ts src\app\api\user\transactions\route.ts
copy /Y dashboard-files\next-auth.d.ts src\types\

echo.
echo [4/6] Git Commit...
git add .
git commit -m "feat: Add dashboard system"

echo.
echo [5/6] Git Push...
git push origin main

echo.
echo [6/6] FERTIG!
echo.
echo ========================================
echo NAECHSTE SCHRITTE:
echo ========================================
echo 1. Oeffne .env.local
echo 2. Fuege hinzu:
echo    NEXTAUTH_SECRET=irgendein-langer-zufalls-text-min-32-zeichen
echo    NEXTAUTH_URL=http://localhost:3000
echo.
echo 3. Teste: npm run dev
echo ========================================
echo.
pause
