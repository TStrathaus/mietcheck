# Monitoring & Backup Setup Guide

## Übersicht

Für Production-Betrieb benötigen wir:
1. **Uptime Monitoring** - Ist die Seite erreichbar?
2. **Error Tracking** - Welche Fehler treten auf?
3. **Database Backup** - Tägliche Backups
4. **Performance Monitoring** - Wie schnell ist die App?
5. **Alerting** - Benachrichtigungen bei Problemen

---

## 1. Uptime Monitoring (UptimeRobot)

### Warum UptimeRobot?
- ✅ **Kostenlos** für bis zu 50 Monitors
- ✅ **5-Minuten-Checks**
- ✅ **Email/SMS Alerts**
- ✅ **Public Status Page**

### Setup:

1. **Account erstellen:** [uptimerobot.com](https://uptimerobot.com)
2. **Neuer Monitor:**
   - Type: **HTTP(s)**
   - URL: `https://mietcheck.vercel.app`
   - Friendly Name: `MietCheck.ch`
   - Monitoring Interval: **5 minutes**
   - Alert When Down For: **5 minutes**
   - Alert Contacts: Deine E-Mail

3. **Zusätzliche Monitors (optional):**
   - `/api/health` - API Health Check
   - `/analyze` - Service 1 Page
   - `/generate` - Service 2 Page

4. **Public Status Page:**
   - Erstelle öffentliche Status-Seite
   - URL: z.B. `status.mietcheck.ch`
   - Zeigt Uptime der letzten 90 Tage

### Alert-Beispiel:
```
⚠️ MietCheck.ch is DOWN
Duration: 5 minutes
Status Code: 500
Time: 2026-02-06 14:30 UTC
```

---

## 2. Error Tracking (Sentry)

### Warum Sentry?
- ✅ **5.000 Errors/Monat kostenlos**
- ✅ **Stack Traces** mit Kontext
- ✅ **Release Tracking**
- ✅ **Performance Monitoring** inklusive

### Setup:

1. **Account erstellen:** [sentry.io](https://sentry.io)
2. **Neues Projekt:**
   - Platform: **Next.js**
   - Project Name: `mietcheck`
3. **Installation:**
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```
4. **Konfiguration:**
   - Wizard generiert automatisch `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
   - DSN wird in `.env.local` gespeichert

5. **Environment Variables:**
   ```bash
   NEXT_PUBLIC_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
   SENTRY_ORG="your-org"
   SENTRY_PROJECT="mietcheck"
   SENTRY_AUTH_TOKEN="your-token"
   ```

6. **Vercel Integration:**
   - In Vercel: Add Integration → Sentry
   - Automatisches Release Tracking
   - Source Maps Upload

### Error-Beispiel:
```javascript
// Wird automatisch an Sentry gesendet
throw new Error('Payment failed');

// Manual tracking
import * as Sentry from '@sentry/nextjs';
Sentry.captureException(error);
```

---

## 3. Database Backup (Neon/Vercel Postgres)

### Automatische Backups (Neon):

Neon bietet automatische tägliche Backups:

1. **Neon Dashboard:** [neon.tech](https://neon.tech)
2. **Gehe zu:** Project → Settings → Backups
3. **Aktiviere:** Automatic Backups
   - Frequency: **Daily**
   - Retention: **7 days** (Free Plan)
   - Time: **02:00 UTC** (nachts)

### Manuelles Backup (per Script):

Script für on-demand Backups:

```javascript
// scripts/backup-database.js
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

const sql = neon(process.env.POSTGRES_URL);

async function backup() {
  const timestamp = new Date().toISOString().split('T')[0];

  console.log('📦 Starting database backup...');

  // Export all tables
  const tables = ['users', 'contracts', 'transactions', 'notification_list'];

  for (const table of tables) {
    const data = await sql`SELECT * FROM ${sql(table)}`;
    const filename = `backups/${table}-${timestamp}.json`;

    fs.mkdirSync('backups', { recursive: true });
    fs.writeFileSync(filename, JSON.stringify(data.rows, null, 2));

    console.log(`✅ ${table}: ${data.rows.length} rows → ${filename}`);
  }

  console.log('✅ Backup complete!');
}

backup().catch(console.error);
```

**Usage:**
```bash
node scripts/backup-database.js
```

### Backup-Strategie:
- **Automatisch:** Täglich durch Neon (7 Tage Retention)
- **Manuell:** Vor wichtigen Änderungen
- **Externes Backup:** Wöchentlich lokal sichern

---

## 4. Rate Limiting (API Protection)

Schütze deine API-Routes vor Missbrauch:

### Implementation:

```typescript
// src/lib/rate-limit.ts (bereits vorhanden, erweitern)
import { NextRequest } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= limit) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
}

export function getRateLimitHeaders(
  identifier: string,
  limit: number,
  windowMs: number
) {
  const record = rateLimitMap.get(identifier);
  const remaining = record ? Math.max(0, limit - record.count) : limit;
  const resetTime = record ? Math.ceil(record.resetTime / 1000) : Math.ceil((Date.now() + windowMs) / 1000);

  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetTime.toString(),
  };
}
```

### Anwendung in API-Routes:

```typescript
// src/app/api/analyze/route.ts
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  // 10 requests per minute per IP
  if (!rateLimit(ip, 10, 60000)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      {
        status: 429,
        headers: getRateLimitHeaders(ip, 10, 60000)
      }
    );
  }

  // ... rest of your code
}
```

---

## 5. Health Check Endpoint

Erstelle einen Health-Check-Endpoint für Monitoring:

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Check database connection
    const dbCheck = await sql`SELECT 1 as ok`;
    const dbHealthy = dbCheck.rows[0]?.ok === 1;

    // Check environment variables
    const envHealthy = !!(
      process.env.POSTGRES_URL &&
      process.env.NEXTAUTH_SECRET &&
      process.env.GEMINI_API_KEY
    );

    const healthy = dbHealthy && envHealthy;

    return NextResponse.json(
      {
        status: healthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        checks: {
          database: dbHealthy ? 'ok' : 'error',
          environment: envHealthy ? 'ok' : 'error',
        },
      },
      { status: healthy ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```

**Usage:**
- UptimeRobot monitort `https://mietcheck.vercel.app/api/health`
- 200 = Healthy, 503 = Unhealthy

---

## 6. Vercel Analytics (kostenlos)

Vercel bietet integriertes Analytics:

1. **Vercel Dashboard:** [vercel.com](https://vercel.com)
2. **Project → Analytics**
3. **Aktiviere:** Web Analytics & Speed Insights
4. **Kein Code nötig** - automatisch integriert

**Metriken:**
- Page Views
- Unique Visitors
- Top Pages
- Countries
- Core Web Vitals (LCP, FID, CLS)

---

## 7. Slack/Email Alerts (Optional)

### Slack Webhook:

```typescript
// src/lib/alerts.ts
export async function sendSlackAlert(message: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) return;

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message }),
  });
}

// Usage
sendSlackAlert('🚨 Database backup failed!');
```

### Email Alerts (via Resend):

```typescript
// src/lib/alerts.ts
import { sendEmail } from './email-service';

export async function sendEmailAlert(subject: string, message: string) {
  await sendEmail({
    to: 'admin@mietcheck.ch',
    subject: `[ALERT] ${subject}`,
    text: message,
  });
}
```

---

## 8. Security Headers

Aktiviere Security Headers in `next.config.js`:

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
```

---

## Setup Checklist

### Sofort (vor Go-Live):
- [ ] UptimeRobot Account erstellen
- [ ] Health-Check-Endpoint testen
- [ ] Neon automatische Backups aktivieren
- [ ] Rate Limiting in kritischen API-Routes
- [ ] Vercel Analytics aktivieren

### Diese Woche:
- [ ] Sentry Account erstellen + Installation
- [ ] Security Headers aktivieren
- [ ] Erstes manuelles Backup erstellen
- [ ] Alert-Kontakte konfigurieren

### Nice-to-Have:
- [ ] Slack Webhooks einrichten
- [ ] Status Page öffentlich machen
- [ ] Wöchentliche Backup-Routine

---

## Kosten-Übersicht

| Service | Plan | Kosten |
|---------|------|--------|
| UptimeRobot | Free | CHF 0 |
| Sentry | Developer | CHF 0 (5k errors/mo) |
| Neon Backups | Auto | CHF 0 (included) |
| Vercel Analytics | Free | CHF 0 |
| **TOTAL** | | **CHF 0/Monat** |

Alle Tools sind in der Free-Tier ausreichend für Start!

---

## Testing

### Test Health Check:
```bash
curl https://mietcheck.vercel.app/api/health
```

### Test Rate Limiting:
```bash
# Send 15 requests quickly (should get rate limited)
for i in {1..15}; do curl -X POST https://mietcheck.vercel.app/api/analyze; done
```

### Test Sentry:
```typescript
// Trigger test error
throw new Error('Test error for Sentry');
```

---

## Monitoring Dashboard

Empfohlene Tools im Browser:
1. **Vercel Dashboard** - Deployment Status, Analytics
2. **UptimeRobot Dashboard** - Uptime, Response Times
3. **Sentry Dashboard** - Errors, Performance
4. **Neon Dashboard** - Database Stats, Backups

---

## Support

- **Sentry Docs:** https://docs.sentry.io
- **UptimeRobot Docs:** https://uptimerobot.com/help
- **Neon Docs:** https://neon.tech/docs
- **Vercel Docs:** https://vercel.com/docs
