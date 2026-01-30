#!/bin/bash
# MietCheck.ch - Automatic Dashboard Deployment
# Phase 1.2.5: User Authentication & Dashboard System
# 
# Usage: Run this script from your mietcheck-app root directory
#        ./deploy-dashboard.sh

set -e  # Exit on error

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   MietCheck.ch - Dashboard System Deployment          ║"
echo "║   Phase 1.2.5: User Authentication & Dashboard        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found!${NC}"
    echo "Please run this script from your mietcheck-app root directory"
    exit 1
fi

echo -e "${GREEN}✅ Found package.json${NC}"
echo ""

# Check if dashboard-files directory exists
if [ ! -d "dashboard-files" ]; then
    echo -e "${RED}❌ Error: dashboard-files directory not found!${NC}"
    echo "Please make sure you extracted the deployment package correctly"
    exit 1
fi

echo -e "${GREEN}✅ Found dashboard-files directory${NC}"
echo ""

# Backup current state
echo -e "${BLUE}📦 Creating backup...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
git stash push -m "Backup before dashboard deployment $TIMESTAMP" 2>/dev/null || echo "Nothing to stash"
echo -e "${GREEN}✅ Backup created (if needed)${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}📥 Installing next-auth...${NC}"
npm install next-auth@^4.24.10 --save
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Create directory structure
echo -e "${BLUE}📁 Creating directory structure...${NC}"
mkdir -p src/app/login
mkdir -p src/app/dashboard
mkdir -p src/app/api/auth/\[...nextauth\]
mkdir -p src/app/api/user/contracts
mkdir -p src/app/api/user/transactions
mkdir -p src/types
echo -e "${GREEN}✅ Directories created${NC}"
echo ""

# Copy files
echo -e "${BLUE}📄 Deploying dashboard files...${NC}"

echo "  → src/app/providers.tsx"
cp dashboard-files/providers.tsx src/app/

echo "  → src/app/layout.tsx"
cp dashboard-files/layout.tsx src/app/

echo "  → src/app/page.tsx"
cp dashboard-files/page.tsx src/app/

echo "  → src/app/login/page.tsx"
cp dashboard-files/login-page.tsx src/app/login/page.tsx

echo "  → src/app/dashboard/page.tsx"
cp dashboard-files/dashboard-page.tsx src/app/dashboard/page.tsx

echo "  → src/app/api/auth/[...nextauth]/route.ts"
cp dashboard-files/nextauth-route.ts src/app/api/auth/\[...nextauth\]/route.ts

echo "  → src/app/api/user/contracts/route.ts"
cp dashboard-files/api-user-contracts.ts src/app/api/user/contracts/route.ts

echo "  → src/app/api/user/transactions/route.ts"
cp dashboard-files/api-user-transactions.ts src/app/api/user/transactions/route.ts

echo "  → src/types/next-auth.d.ts"
cp dashboard-files/next-auth.d.ts src/types/

echo -e "${GREEN}✅ All files deployed${NC}"
echo ""

# Check environment variables
echo -e "${BLUE}🔐 Checking environment variables...${NC}"

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.local not found${NC}"
    echo "Creating .env.local template..."
    cat > .env.local << 'ENVEOF'
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
ENVEOF
    echo -e "${YELLOW}⚠️  Created .env.local template${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: You MUST update NEXTAUTH_SECRET!${NC}"
    echo ""
    echo "Generate a secret with:"
    echo "  openssl rand -base64 32"
    echo ""
else
    # Check if NEXTAUTH_SECRET exists
    if ! grep -q "NEXTAUTH_SECRET" .env.local; then
        echo -e "${YELLOW}⚠️  NEXTAUTH_SECRET not found in .env.local${NC}"
        echo "Adding NEXTAUTH_SECRET placeholder..."
        echo "" >> .env.local
        echo "# NextAuth Configuration" >> .env.local
        echo "NEXTAUTH_SECRET=GENERATE_WITH_openssl_rand_base64_32" >> .env.local
        echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
        echo -e "${YELLOW}⚠️  Added NEXTAUTH_SECRET - please generate a real secret!${NC}"
    else
        echo -e "${GREEN}✅ NEXTAUTH_SECRET found${NC}"
    fi
    
    if ! grep -q "NEXTAUTH_URL" .env.local; then
        echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
        echo -e "${GREEN}✅ Added NEXTAUTH_URL${NC}"
    else
        echo -e "${GREEN}✅ NEXTAUTH_URL found${NC}"
    fi
fi
echo ""

# Git commit
echo -e "${BLUE}📝 Committing changes to git...${NC}"
git add .
git commit -m "feat: Add user authentication and dashboard system (Phase 1.2.5)

- NextAuth.js authentication with email/password
- User dashboard with contract management
- Service selection and transaction history
- Session management (30 days)
- Protected routes
- Login/Register page
- API routes for user data

Deployed via automated script" || echo "Nothing to commit"

echo -e "${GREEN}✅ Changes committed${NC}"
echo ""

# Push to GitHub
echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║            🎉 DEPLOYMENT SUCCESSFUL! 🎉                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. ${YELLOW}Update .env.local with real NEXTAUTH_SECRET:${NC}"
    echo "   openssl rand -base64 32"
    echo ""
    echo "2. ${YELLOW}Add NEXTAUTH_SECRET to Vercel:${NC}"
    echo "   vercel env add NEXTAUTH_SECRET production"
    echo "   vercel env add NEXTAUTH_URL production"
    echo "   (Set NEXTAUTH_URL to: https://mietcheck-nine.vercel.app)"
    echo ""
    echo "3. ${YELLOW}Test locally:${NC}"
    echo "   npm run dev"
    echo "   → Open http://localhost:3000"
    echo "   → Click 'Kostenlos starten'"
    echo "   → Register and test dashboard"
    echo ""
    echo "4. ${YELLOW}Vercel will auto-deploy from GitHub${NC}"
    echo "   → Check: https://vercel.com/tstrathaus/mietcheck"
    echo ""
    echo "📚 Documentation:"
    echo "   → README-DEPLOYMENT.md"
    echo "   → QUICKSTART.md"
    echo ""
else
    echo -e "${RED}❌ Failed to push to GitHub${NC}"
    echo "Please check your git configuration and try:"
    echo "  git push origin main"
    exit 1
fi
