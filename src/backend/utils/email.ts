import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer; contentType: string }[];
}

// Support both SMTP_ prefix (preferred) and legacy EMAIL_ prefix
function getEnv(smtpKey: string, emailKey: string): string | undefined {
  return process.env[smtpKey] || process.env[emailKey];
}

export function isEmailConfigured(): boolean {
  return !!(
    getEnv('SMTP_HOST', 'EMAIL_HOST') &&
    getEnv('SMTP_USER', 'EMAIL_USER') &&
    getEnv('SMTP_PASS', 'EMAIL_PASSWORD')
  );
}

async function getSmtpConfig(): Promise<{
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
} | null> {
  // 1. Try environment variables first
  const envHost = getEnv('SMTP_HOST', 'EMAIL_HOST');
  const envUser = getEnv('SMTP_USER', 'EMAIL_USER');
  const envPass = getEnv('SMTP_PASS', 'EMAIL_PASSWORD');

  if (envHost && envUser && envPass) {
    return {
      host: envHost,
      port: parseInt(getEnv('SMTP_PORT', 'EMAIL_PORT') || '587', 10),
      secure: (getEnv('SMTP_SECURE', 'EMAIL_SECURE') || 'false') === 'true',
      user: envUser,
      pass: envPass,
      from: getEnv('SMTP_FROM', 'EMAIL_FROM') || envUser,
    };
  }

  // 2. Fallback to database settings
  try {
    const settings = await prisma.businessSetting.findFirst();
    if (settings?.smtpHost && settings?.smtpUser && settings?.smtpPass) {
      return {
        host: settings.smtpHost,
        port: parseInt(settings.smtpPort || '587', 10),
        secure: settings.smtpSecure,
        user: settings.smtpUser,
        pass: settings.smtpPass,
        from: settings.smtpFrom || settings.smtpUser,
      };
    }
  } catch {
    // DB not available, fall through
  }

  return null;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const config = await getSmtpConfig();

  if (!config) {
    throw new Error(
      'Email (SMTP) is not configured. Go to Settings → Email Configuration to set up SMTP, or set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.'
    );
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })),
  });
}

// ---------- Email templates ----------

interface InvoiceEmailData {
  invoiceNumber: string;
  clientName: string;
  companyName: string;
  companyEmail?: string | null;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  notes?: string | null;
  primaryColor?: string | null;
  pdfUrl?: string | null;
}

export function buildInvoiceEmail(data: InvoiceEmailData): string {
  const color = data.primaryColor || '#3B82F6';
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n);
  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:${color};padding:32px 40px;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">${data.companyName}</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Invoice ${data.invoiceNumber}</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 24px;color:#374151;font-size:16px;">Hi <strong>${data.clientName}</strong>,</p>
            <p style="margin:0 0 32px;color:#6b7280;font-size:15px;">
              Please find your invoice ${data.invoiceNumber}${data.pdfUrl ? ' attached' : ''} for the services provided.
            </p>

            <!-- Invoice details box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:24px;margin-bottom:32px;">
              <tr>
                <td style="padding:6px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color:#6b7280;font-size:13px;width:50%;">Invoice Number</td>
                      <td style="color:#111827;font-size:13px;font-weight:600;text-align:right;">${data.invoiceNumber}</td>
                    </tr>
                    <tr>
                      <td style="color:#6b7280;font-size:13px;padding-top:8px;">Issue Date</td>
                      <td style="color:#111827;font-size:13px;font-weight:600;text-align:right;padding-top:8px;">${fmtDate(data.issueDate)}</td>
                    </tr>
                    <tr>
                      <td style="color:#6b7280;font-size:13px;padding-top:8px;">Due Date</td>
                      <td style="color:#111827;font-size:13px;font-weight:600;text-align:right;padding-top:8px;">${fmtDate(data.dueDate)}</td>
                    </tr>
                    <tr>
                      <td colspan="2" style="border-top:1px solid #e5e7eb;padding-top:12px;margin-top:12px;"></td>
                    </tr>
                    <tr>
                      <td style="color:#6b7280;font-size:13px;padding-top:8px;">Subtotal</td>
                      <td style="color:#111827;font-size:13px;text-align:right;padding-top:8px;">${fmt(data.subtotal)}</td>
                    </tr>
                    <tr>
                      <td style="color:#6b7280;font-size:13px;padding-top:6px;">VAT (${data.vatRate}%)</td>
                      <td style="color:#111827;font-size:13px;text-align:right;padding-top:6px;">${fmt(data.vatAmount)}</td>
                    </tr>
                    <tr>
                      <td style="color:#111827;font-size:15px;font-weight:700;padding-top:12px;border-top:2px solid #e5e7eb;">Total Due</td>
                      <td style="color:${color};font-size:18px;font-weight:700;text-align:right;padding-top:12px;border-top:2px solid #e5e7eb;">${fmt(data.total)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            ${data.pdfUrl ? `
            <!-- View PDF button -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td align="center">
                  <a href="${data.pdfUrl}" style="display:inline-block;padding:14px 32px;background:${color};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">View Invoice PDF</a>
                </td>
              </tr>
            </table>` : ''}

            ${data.notes ? `
            <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:16px;border-radius:4px;margin-bottom:32px;">
              <p style="margin:0;color:#92400e;font-size:13px;font-weight:600;">Note</p>
              <p style="margin:6px 0 0;color:#78350f;font-size:14px;">${data.notes}</p>
            </div>` : ''}

            <p style="margin:0;color:#6b7280;font-size:14px;">Thank you for your business!</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
              ${data.companyName}${data.companyEmail ? ` · <a href="mailto:${data.companyEmail}" style="color:#9ca3af;">${data.companyEmail}</a>` : ''}
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildPasswordResetEmail(resetUrl: string, firstName: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#3B82F6;padding:32px 40px;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">FlowBiz</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Password Reset Request</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 16px;color:#374151;font-size:16px;">Hi <strong>${firstName}</strong>,</p>
            <p style="margin:0 0 32px;color:#6b7280;font-size:15px;">
              We received a request to reset your FlowBiz password. Click the button below to choose a new password.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td align="center">
                  <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:#3B82F6;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Reset Password</a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="margin:0 0 32px;word-break:break-all;">
              <a href="${resetUrl}" style="color:#3B82F6;font-size:13px;">${resetUrl}</a>
            </p>
            <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;border-radius:4px;">
              <p style="margin:0;color:#991b1b;font-size:13px;font-weight:600;">Security Notice</p>
              <p style="margin:6px 0 0;color:#7f1d1d;font-size:13px;">
                This link expires in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email — your account is safe.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">FlowBiz · This is an automated message, please do not reply.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
