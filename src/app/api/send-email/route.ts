// src/app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail, type EmailData } from '@/lib/email-service';
import { rateLimit } from '@/lib/rate-limit';

// Rate limiter: 5 emails per hour per user
const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - Please log in'
        },
        { status: 401 }
      );
    }

    // Rate limiting
    const identifier = session.user.email;
    try {
      await limiter.check(5, identifier); // 5 requests per hour
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { type, data } = body as EmailData;

    if (!type || !data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing email type or data',
        },
        { status: 400 }
      );
    }

    // Validate that recipient matches session user (security check)
    if (data.to !== session.user.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email recipient must match authenticated user',
        },
        { status: 403 }
      );
    }

    console.log('📧 Sending email:', {
      type,
      to: data.to,
      userName: data.userName,
    });

    // Send email
    const result = await sendEmail({ type, data } as EmailData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send email',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: result.id,
    });

  } catch (error: any) {
    console.error('❌ Send email API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send email',
      },
      { status: 500 }
    );
  }
}
