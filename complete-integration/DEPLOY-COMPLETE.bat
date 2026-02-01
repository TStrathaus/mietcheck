@echo off
chcp 65001 >nul
echo.
echo ========================================
echo COMPLETE INTEGRATION DEPLOYMENT
echo ========================================
echo.

if not exist package.json (
    echo FEHLER: package.json nicht gefunden!
    pause
    exit /b 1
)

echo [1/10] Create miet-calculator-extended...
copy /Y miet-calculator-extended.ts src\lib\miet-calculator-extended.ts

echo.
echo [2/10] Create address-helper...
copy /Y address-helper.ts src\lib\address-helper.ts

echo.
echo [3/10] Create image-ocr...
copy /Y image-ocr.ts src\lib\image-ocr.ts

echo.
echo [4/10] Update contract-analyzer...
copy /Y contract-analyzer-updated.ts src\lib\contract-analyzer.ts

echo.
echo [5/10] Create MietHistorieExtended Component...
copy /Y MietHistorieExtended.tsx src\components\MietHistorieExtended.tsx

echo.
echo [6/10] Update FileUpload Component...
copy /Y FileUpload-ocr.tsx src\components\FileUpload.tsx

echo.
echo [7/10] Update analyze page...
copy /Y analyze-page-with-transfer.tsx src\app\analyze\page.tsx

echo.
echo [8/10] Update generate page...
copy /Y generate-page-updated.tsx src\app\generate\page.tsx

echo.
echo [9/10] Update API routes...
mkdir src\app\api\analyze-anpassung 2>nul
copy /Y analyze-anpassung-route-ocr.ts src\app\api\analyze-anpassung\route.ts
copy /Y process-upload-route-ocr.ts src\app\api\process-upload\route.ts

echo.
echo [10/10] Git Commit und Push...
git add src\lib\miet-calculator-extended.ts src\lib\address-helper.ts src\lib\image-ocr.ts src\lib\contract-analyzer.ts src\components\MietHistorieExtended.tsx src\components\FileUpload.tsx src\app\analyze\page.tsx src\app\generate\page.tsx src\app\api\analyze-anpassung\route.ts src\app\api\process-upload\route.ts
git commit -m "feat: Complete MietCheck integration"
git push origin main

echo.
echo ========================================
echo DEPLOYMENT ERFOLGREICH!
echo ========================================
echo.
echo Warte 2 Minuten, dann testen!
echo.
pause
