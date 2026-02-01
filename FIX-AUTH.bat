@echo off
chcp 65001 >nul
echo.
echo ========================================
echo MietCheck - Auth Fix
echo ========================================
echo.

if not exist package.json (
    echo FEHLER: package.json nicht gefunden!
    echo Bitte im mietcheck Ordner ausfuehren
    pause
    exit /b 1
)

echo [1/3] Ersetze NextAuth Route...
copy /Y nextauth-route.ts src\app\api\auth\[...nextauth]\route.ts

echo [2/3] Ersetze User Contracts Route...
copy /Y user-contracts-route.ts src\app\api\user\contracts\route.ts

echo [3/3] Ersetze User Transactions Route...
copy /Y user-transactions-route.ts src\app\api\user\transactions\route.ts

echo.
echo [4/4] Git Commit und Push...
git add src\app\api\auth\[...nextauth]\route.ts src\app\api\user\contracts\route.ts src\app\api\user\transactions\route.ts
git commit -m "fix: Use getServerSession instead of importing authOptions"
git push origin main

echo.
echo ========================================
echo FIX ERFOLGREICH!
echo ========================================
echo.
echo Vercel baut jetzt neu (2 Minuten)
echo Dann teste: https://mietcheck-nine.vercel.app/analyze
echo.
pause
