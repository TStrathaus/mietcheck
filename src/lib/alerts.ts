// Alert System - Slack & Email Notifications
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send alert to Slack (if configured)
 */
export async function sendSlackAlert(
  message: string,
  severity: 'info' | 'warning' | 'error' = 'info'
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('Slack webhook not configured, skipping alert');
    return;
  }

  const emoji = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '🚨',
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `${emoji[severity]} ${message}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${emoji[severity]} *${severity.toUpperCase()}*\n${message}`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Time: ${new Date().toISOString()} | Environment: ${process.env.VERCEL_ENV || 'local'}`,
              },
            ],
          },
        ],
      }),
    });

    console.log('✅ Slack alert sent:', severity, message);
  } catch (error) {
    console.error('❌ Failed to send Slack alert:', error);
  }
}

/**
 * Send alert via email (using Resend)
 */
export async function sendEmailAlert(
  subject: string,
  message: string,
  severity: 'info' | 'warning' | 'error' = 'info'
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'thorsten.strathaus@gmail.com';
  const fromEmail = process.env.EMAIL_FROM || 'noreply@mietcheck-app.ch';

  if (!process.env.RESEND_API_KEY) {
    console.warn('Resend not configured, skipping email alert');
    return;
  }

  const emoji = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '🚨',
  };

  try {
    await resend.emails.send({
      from: `MietCheck Alerts <${fromEmail}>`,
      to: adminEmail,
      subject: `${emoji[severity]} [ALERT] ${subject}`,
      text: `${message}\n\nTime: ${new Date().toISOString()}\nEnvironment: ${process.env.VERCEL_ENV || 'local'}`,
    });

    console.log('✅ Email alert sent:', severity, subject);
  } catch (error) {
    console.error('❌ Failed to send email alert:', error);
  }
}

/**
 * Send alert via both Slack and Email
 */
export async function sendAlert(
  message: string,
  severity: 'info' | 'warning' | 'error' = 'info'
): Promise<void> {
  await Promise.allSettled([
    sendSlackAlert(message, severity),
    sendEmailAlert(message, message, severity),
  ]);
}

/**
 * Alert presets for common scenarios
 */
export const alerts = {
  // Database issues
  databaseDown: () =>
    sendAlert('Database connection failed', 'error'),

  databaseSlow: (responseTime: number) =>
    sendAlert(`Database response time: ${responseTime}ms (slow)`, 'warning'),

  // Payment issues
  paymentFailed: (error: string) =>
    sendAlert(`Payment processing failed: ${error}`, 'error'),

  // API issues
  rateLimitExceeded: (ip: string) =>
    sendAlert(`Rate limit exceeded for IP: ${ip}`, 'warning'),

  apiError: (endpoint: string, error: string) =>
    sendAlert(`API error at ${endpoint}: ${error}`, 'error'),

  // System issues
  diskSpaceLow: (percentage: number) =>
    sendAlert(`Disk space low: ${percentage}% used`, 'warning'),

  highMemoryUsage: (percentage: number) =>
    sendAlert(`Memory usage high: ${percentage}%`, 'warning'),

  // Success notifications
  backupComplete: (rowCount: number) =>
    sendAlert(`Database backup completed successfully (${rowCount} rows)`, 'info'),

  deploymentSuccess: (version: string) =>
    sendAlert(`Deployment successful: ${version}`, 'info'),
};
