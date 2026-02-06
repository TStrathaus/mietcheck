// Health Check Endpoint for Monitoring
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connection
    let dbHealthy = false;
    let dbResponseTime = 0;

    try {
      const dbStart = Date.now();
      const dbCheck = await sql`SELECT 1 as ok`;
      dbResponseTime = Date.now() - dbStart;
      dbHealthy = dbCheck.rows[0]?.ok === 1;
    } catch (dbError) {
      console.error('Database health check failed:', dbError);
    }

    // Check critical environment variables
    const requiredEnvVars = [
      'POSTGRES_URL',
      'NEXTAUTH_SECRET',
      'GEMINI_API_KEY',
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    const envHealthy = missingEnvVars.length === 0;

    // Optional services (don't fail health check if missing)
    const optionalServices = {
      payrexx: !!(process.env.PAYREXX_INSTANCE && process.env.PAYREXX_API_SECRET),
      resend: !!process.env.RESEND_API_KEY,
    };

    const healthy = dbHealthy && envHealthy;
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: healthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        checks: {
          database: {
            status: dbHealthy ? 'ok' : 'error',
            responseTime: `${dbResponseTime}ms`,
          },
          environment: {
            status: envHealthy ? 'ok' : 'error',
            missing: missingEnvVars,
          },
          optionalServices,
        },
        version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'dev',
      },
      {
        status: healthy ? 200 : 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}
