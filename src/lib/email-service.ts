// src/lib/email-service.ts
import { Resend } from 'resend';
import { render } from '@react-email/render';
import AnalysisCompleteEmail from '@/emails/analysis-complete';
import LetterGeneratedEmail from '@/emails/letter-generated';
import LetterWithAttachmentEmail from '@/emails/letter-with-attachment';
import WelcomeEmail from '@/emails/welcome';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// Email sender configuration
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@mietcheck-app.ch';
const FROM_NAME = 'MietCheck';

export type EmailType =
  | 'analysis-complete'
  | 'letter-generated'
  | 'letter-with-attachment'
  | 'welcome';

interface BaseEmailData {
  to: string;
  userName?: string;
}

interface AnalysisCompleteData extends BaseEmailData {
  address: string;
  currentRent: number;
  newRent: number;
  monthlyReduction: number;
  yearlyReduction: number;
  contractId?: string;
}

interface LetterGeneratedData extends BaseEmailData {
  address: string;
  monthlyReduction: number;
  downloadUrl: string;
  contractId?: string;
}

interface LetterWithAttachmentData extends BaseEmailData {
  address: string;
  monthlyReduction: number;
  pdfBuffer: Buffer;
  pdfFilename?: string;
  contractId?: string;
}

interface WelcomeData extends BaseEmailData {
  userEmail: string;
}

export type EmailData =
  | { type: 'analysis-complete'; data: AnalysisCompleteData }
  | { type: 'letter-generated'; data: LetterGeneratedData }
  | { type: 'letter-with-attachment'; data: LetterWithAttachmentData }
  | { type: 'welcome'; data: WelcomeData };

/**
 * Send an email using Resend
 */
export async function sendEmail(emailData: EmailData) {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured, email not sent');
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    const { type, data } = emailData;
    let subject: string;
    let html: string;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mietcheck-app.ch';

    switch (type) {
      case 'analysis-complete': {
        const { address, currentRent, newRent, monthlyReduction, yearlyReduction, contractId } = data as AnalysisCompleteData;
        const dashboardUrl = contractId
          ? `${baseUrl}/dashboard?contract=${contractId}`
          : `${baseUrl}/dashboard`;

        subject = `✅ Analyse abgeschlossen: ${address}`;
        html = render(
          AnalysisCompleteEmail({
            userName: data.userName,
            address,
            currentRent,
            newRent,
            monthlyReduction,
            yearlyReduction,
            dashboardUrl,
          })
        );
        break;
      }

      case 'letter-generated': {
        const { address, monthlyReduction, downloadUrl, contractId } = data as LetterGeneratedData;
        const dashboardUrl = contractId
          ? `${baseUrl}/dashboard?contract=${contractId}`
          : `${baseUrl}/dashboard`;

        subject = `📄 Herabsetzungsbrief bereit: ${address}`;
        html = render(
          LetterGeneratedEmail({
            userName: data.userName,
            address,
            monthlyReduction,
            downloadUrl,
            dashboardUrl,
          })
        );
        break;
      }

      case 'letter-with-attachment': {
        const { address, monthlyReduction, pdfBuffer, pdfFilename, contractId } = data as LetterWithAttachmentData;
        const dashboardUrl = contractId
          ? `${baseUrl}/dashboard?contract=${contractId}`
          : `${baseUrl}/dashboard`;

        subject = `📄 Ihr Herabsetzungsbrief: ${address}`;
        html = render(
          LetterWithAttachmentEmail({
            userName: data.userName,
            address,
            monthlyReduction,
            dashboardUrl,
          })
        );

        // Send email with PDF attachment
        const filename = pdfFilename || 'herabsetzungsbegehren.pdf';
        const result = await resend.emails.send({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: data.to,
          subject,
          html,
          attachments: [
            {
              filename,
              content: pdfBuffer,
            },
          ],
        });

        if (result.error) {
          console.error('❌ Email send error:', result.error);
          return {
            success: false,
            error: result.error.message,
          };
        }

        console.log('✅ Email with PDF attachment sent:', {
          type,
          to: data.to,
          id: result.data?.id,
          attachment: filename,
        });

        return {
          success: true,
          id: result.data?.id,
        };
      }

      case 'welcome': {
        const { userEmail } = data as WelcomeData;
        const loginUrl = `${baseUrl}/dashboard`;

        subject = '🏠 Willkommen bei MietCheck.ch';
        html = render(
          WelcomeEmail({
            userName: data.userName,
            userEmail,
            loginUrl,
          })
        );
        break;
      }

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    // Send email via Resend
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: data.to,
      subject,
      html,
    });

    if (result.error) {
      console.error('❌ Email send error:', result.error);
      return {
        success: false,
        error: result.error.message,
      };
    }

    console.log('✅ Email sent successfully:', {
      type,
      to: data.to,
      id: result.data?.id,
    });

    return {
      success: true,
      id: result.data?.id,
    };

  } catch (error: any) {
    console.error('❌ Email service error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

/**
 * Send analysis complete notification
 */
export async function sendAnalysisCompleteEmail(data: AnalysisCompleteData) {
  return sendEmail({
    type: 'analysis-complete',
    data,
  });
}

/**
 * Send letter generated notification
 */
export async function sendLetterGeneratedEmail(data: LetterGeneratedData) {
  return sendEmail({
    type: 'letter-generated',
    data,
  });
}

/**
 * Send letter with PDF attachment
 */
export async function sendLetterWithAttachmentEmail(data: LetterWithAttachmentData) {
  return sendEmail({
    type: 'letter-with-attachment',
    data,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(data: WelcomeData) {
  return sendEmail({
    type: 'welcome',
    data,
  });
}
