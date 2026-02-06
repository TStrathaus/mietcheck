# 🔍 Testing Guide: Dashboard Contract Display Issue

## Problem
Contracts analyzed on `/analyze` are not appearing in `/dashboard` despite database save code being in place.

## Changes Made
I've added comprehensive logging throughout the application to help diagnose the issue:

### 1. **Analyze Page** (`src/app/analyze/page.tsx`)
- ✅ Added detailed console logs before/after save attempts
- ✅ Added user-facing alerts for save success/failure
- ✅ Added special handling for 401 (not authenticated) errors

### 2. **Contracts API** (`src/app/api/user/contracts/route.ts`)
- ✅ Added logging for session status
- ✅ Added logging for user ID
- ✅ Added logging for received data
- ✅ Added logging for created contract ID

### 3. **Dashboard** (`src/app/dashboard/page.tsx`)
- ✅ Added logging for fetch operations
- ✅ Added logging for response status
- ✅ Added logging for received data
- ✅ Added contract count logging

## 🧪 How to Test

### Step 1: Start Development Server
```bash
cd "D:\STTH\2026 KI\mietcheck"
npm run dev
```

### Step 2: Open Browser Console
1. Open Chrome/Edge
2. Press F12 to open DevTools
3. Go to Console tab
4. Keep it open during testing

### Step 3: Test Scenario A - Logged Out User
1. Go to `http://localhost:3000/analyze`
2. Fill in the form manually:
   - Address: "Teststrasse 123, 8000 Zürich"
   - Net Rent: 2000
   - Reference Rate: 2.00%
   - Contract Date: 2022-01-01
3. Click "🧮 Einsparung berechnen"
4. **Watch the console logs** - you should see:
   ```
   💾 Attempting to save contract to DB...
   📡 Save response status: 401
   ℹ️ Bitte melden Sie sich an, um den Vertrag zu speichern...
   ```
5. **You should see an alert** telling you to log in to save the contract

### Step 4: Test Scenario B - Logged In User
1. Go to `http://localhost:3000/register`
2. Create a test account:
   - Email: test@example.com
   - Password: Test1234!
   - Name: Test User
3. After registration, you'll be auto-logged in
4. Go to `http://localhost:3000/analyze`
5. Fill in the form:
   - Address: "Musterstrasse 456, 8001 Zürich"
   - Net Rent: 1800
   - Reference Rate: 1.75%
   - Contract Date: 2023-06-15
6. Click "🧮 Einsparung berechnen"
7. **Watch the console logs** - you should see:
   ```
   💾 Attempting to save contract to DB...
   📡 Save response status: 200
   ✅ Contract saved to DB: <number>
   ```
8. **You should see an alert**: "✅ Vertrag erfolgreich gespeichert!"

### Step 5: Check Dashboard
1. Go to `http://localhost:3000/dashboard`
2. **Watch the console logs** - you should see:
   ```
   🔍 Fetching user data...
   📡 Contracts response status: 200
   📦 Contracts data: { success: true, contracts: [...] }
   📋 Number of contracts: 1
   ```
3. **Check if the contract appears** in the "📋 Meine Mietverträge" section

## 🐛 What to Look For

### If contracts still don't appear:
1. **Check console for errors** - any red error messages?
2. **Check save status** - does it say 200 or 401?
3. **Check contract count** - does it show "Number of contracts: 0"?
4. **Check session** - in analyze page, does POST show session exists?

### Common Issues:

#### Issue 1: 401 Unauthorized
```
📡 Save response status: 401
⚠️ Unauthorized request - no session
```
**Solution**: User is not logged in. Register/login first.

#### Issue 2: Contract saves but doesn't appear
```
✅ Contract saved to DB: 123
📋 Number of contracts: 0
```
**Solution**: This indicates a database or query issue. Check:
- Is user_id matching?
- Is the session user ID the same in analyze and dashboard?

#### Issue 3: Database connection error
```
❌ Error creating contract: <error message>
```
**Solution**: Check environment variables:
- Is `POSTGRES_URL` set correctly in `.env.local`?
- Is the database accessible?

## 📊 Expected Console Output (Full Flow)

### During Analysis (Logged In):
```
💾 Attempting to save contract to DB...
📝 POST /api/user/contracts - Session: exists
👤 User ID: 1
📦 Contract data received: { address: "Musterstrasse 456...", netRent: 1800, newRent: 1750 }
✅ Contract created with ID: 1
📡 Save response status: 200
✅ Contract saved to DB: 1
```

### In Dashboard:
```
🔍 Fetching user data...
📡 Contracts response status: 200
📦 Contracts data: {
  success: true,
  contracts: [{
    id: 1,
    address: "Musterstrasse 456, 8001 Zürich",
    net_rent: 1800,
    new_rent: 1750,
    monthly_reduction: 50,
    yearly_savings: 600,
    ...
  }]
}
📋 Number of contracts: 1
```

## 📝 Report Back

After testing, please send me:

1. **Screenshot of browser console** (F12 → Console tab)
2. **Screenshot of dashboard** showing contracts or empty state
3. **Describe what happened**:
   - Did you see the alert after analysis?
   - What did the console logs show?
   - Did contracts appear in dashboard?

## 🔧 Next Steps

Based on your test results, I can:
- Fix authentication issues if 401 errors occur
- Fix database query issues if contracts save but don't load
- Fix data type mismatches if there are SQL errors
- Investigate session persistence issues

The comprehensive logging will tell us exactly where the problem is! 🎯
