# MietCheck.ch - Automatic Dashboard Deployment (Windows PowerShell)
# Phase 1.2.5: User Authentication & Dashboard System
# 
# Usage: Run this script from your mietcheck-app root directory
#        .\deploy-dashboard.ps1

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   MietCheck.ch - Dashboard System Deployment          ║" -ForegroundColor Cyan
Write-Host "║   Phase 1.2.5: User Authentication & Dashboard        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from your mietcheck-app root directory"
    exit 1
}

Write-Host "✅ Found package.json" -ForegroundColor Green
Write-Host ""

# Check if dashboard-files directory exists
if (-not (Test-Path "dashboard-files")) {
    Write-Host "❌ Error: dashboard-files directory not found!" -ForegroundColor Red
    Write-Host "Please make sure you extracted the deployment package correctly"
    exit 1
}

Write-Host "✅ Found dashboard-files directory" -ForegroundColor Green
Write-Host ""

# Backup current state
Write-Host "📦 Creating backup..." -ForegroundColor Blue
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
git stash push -m "Backup before dashboard deployment $timestamp" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backup created" -ForegroundColor Green
} else {
    Write-Host "✅ Nothing to backup" -ForegroundColor Green
}
Write-Host ""

# Install dependencies
Write-Host "📥 Installing next-auth..." -ForegroundColor Blue
npm install next-auth@^4.24.10 --save
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Create directory structure
Write-Host "📁 Creating directory structure..." -ForegroundColor Blue
New-Item -ItemType Directory -Force -Path "src\app\login" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\dashboard" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\api\auth\[...nextauth]" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\api\user\contracts" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\api\user\transactions" | Out-Null
New-Item -ItemType Directory -Force -Path "src\types" | Out-Null
Write-Host "✅ Directories created" -ForegroundColor Green
Write-Host ""

# Copy files
Write-Host "📄 Deploying dashboard files..." -ForegroundColor Blue

Write-Host "  → src\app\providers.tsx"
Copy-Item "dashboard-files\providers.tsx" "src\app\" -Force

Write-Host "  → src\app\layout.tsx"
Copy-Item "dashboard-files\layout.tsx" "src\app\" -Force

Write-Host "  → src\app\page.tsx"
Copy-Item "dashboard-files\page.tsx" "src\app\" -Force

Write-Host "  → src\app\login\page.tsx"
Copy-Item "dashboard-files\login-page.tsx" "src\app\login\page.tsx" -Force

Write-Host "  → src\app\dashboard\page.tsx"
Copy-Item "dashboard-files\dashboard-page.tsx" "src\app\dashboard\page.tsx" -Force

Write-Host "  → src\app\api\auth\[...nextauth]\route.ts"
Copy-Item "dashboard-files\nextauth-route.ts" "src\app\api\auth\[...nextauth]\route.ts" -Force

Write-Host "  → src\app\api\user\contracts\route.ts"
Copy-Item "dashboard-files\api-user-contracts.ts" "src\app\api\user\contracts\route.ts" -Force

Write-Host "  → src\app\api\user\transactions\route.ts"
Copy-Item "dashboard-files\api-user-transactions.ts" "src\app\api\user\transactions\route.ts" -Force

Write-Host "  → src\types\next-auth.d.ts"
Copy-Item "dashboard-files\next-auth.d.ts" "src\types\" -Force

Write-Host "✅ All files deployed" -ForegroundColor Green
Write-Host ""

# Check environment variables
Write-Host "🔐 Checking environment variables..." -ForegroundColor Blue

if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Warning: .env.local not found" -ForegroundColor Yellow
    Write-Host "Creating .env.local template..."
    @"
# Database (Neon)
POSTGRES_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx

# OpenAI (for future AI analysis)
OPENAI_API_KEY=sk-proj-xxx

# NextAuth Configuration (NEW - REQUIRED)
NEXTAUTH_SECRET=GENERATE_WITH_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "⚠️  Created .env.local template" -ForegroundColor Yellow
    Write-Host "⚠️  IMPORTANT: You MUST update NEXTAUTH_SECRET!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Generate a secret with PowerShell:"
    Write-Host '  $bytes = New-Object Byte[] 32'
    Write-Host '  [Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)'
    Write-Host '  [Convert]::ToBase64String($bytes)'
    Write-Host ""
} else {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -notmatch "NEXTAUTH_SECRET") {
        Write-Host "⚠️  NEXTAUTH_SECRET not found in .env.local" -ForegroundColor Yellow
        Write-Host "Adding NEXTAUTH_SECRET placeholder..."
        @"

# NextAuth Configuration
NEXTAUTH_SECRET=GENERATE_WITH_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000
"@ | Out-File -FilePath ".env.local" -Append -Encoding UTF8
        Write-Host "⚠️  Added NEXTAUTH_SECRET - please generate a real secret!" -ForegroundColor Yellow
    } else {
        Write-Host "✅ NEXTAUTH_SECRET found" -ForegroundColor Green
    }
    
    if ($envContent -notmatch "NEXTAUTH_URL") {
        "NEXTAUTH_URL=http://localhost:3000" | Out-File -FilePath ".env.local" -Append -Encoding UTF8
        Write-Host "✅ Added NEXTAUTH_URL" -ForegroundColor Green
    } else {
        Write-Host "✅ NEXTAUTH_URL found" -ForegroundColor Green
    }
}
Write-Host ""

# Git commit
Write-Host "📝 Committing changes to git..." -ForegroundColor Blue
git add .
git commit -m "feat: Add user authentication and dashboard system (Phase 1.2.5)

- NextAuth.js authentication with email/password
- User dashboard with contract management
- Service selection and transaction history
- Session management (30 days)
- Protected routes
- Login/Register page
- API routes for user data

Deployed via automated script"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Changes committed" -ForegroundColor Green
} else {
    Write-Host "✅ Nothing to commit" -ForegroundColor Green
}
Write-Host ""

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Blue
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║            🎉 DEPLOYMENT SUCCESSFUL! 🎉                ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Update .env.local with real NEXTAUTH_SECRET:" -ForegroundColor Yellow
    Write-Host '   $bytes = New-Object Byte[] 32'
    Write-Host '   [Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)'
    Write-Host '   [Convert]::ToBase64String($bytes)'
    Write-Host ""
    Write-Host "2. Add NEXTAUTH_SECRET to Vercel:" -ForegroundColor Yellow
    Write-Host "   vercel env add NEXTAUTH_SECRET production"
    Write-Host "   vercel env add NEXTAUTH_URL production"
    Write-Host "   (Set NEXTAUTH_URL to: https://mietcheck-nine.vercel.app)"
    Write-Host ""
    Write-Host "3. Test locally:" -ForegroundColor Yellow
    Write-Host "   npm run dev"
    Write-Host "   → Open http://localhost:3000"
    Write-Host "   → Click 'Kostenlos starten'"
    Write-Host "   → Register and test dashboard"
    Write-Host ""
    Write-Host "4. Vercel will auto-deploy from GitHub" -ForegroundColor Yellow
    Write-Host "   → Check: https://vercel.com/tstrathaus/mietcheck"
    Write-Host ""
} else {
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    Write-Host "Please check your git configuration and try:"
    Write-Host "  git push origin main"
    exit 1
}
