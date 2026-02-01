@echo off
chcp 65001 >nul
echo.
echo [1/2] Erstelle analyze Route...
mkdir src\app\api\analyze 2>nul
copy /Y analyze-route.ts src\app\api\analyze\route.ts

echo.
echo [2/2] Git Commit und Push...
git add src\app\api\analyze\route.ts
git commit -m "feat: Add analyze route for rent calculation"
git push origin main

echo.
echo FERTIG! Warte 2 Minuten dann testen.
pause
