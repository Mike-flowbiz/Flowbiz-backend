import { NextRequest, NextResponse } from 'next/server';
import { withAuthz } from '@/lib/middleware/auth';
import nodemailer from 'nodemailer';

// POST /api/settings/test-email - Send a test email to verify SMTP configuration
export const POST = withAuthz(['ADMIN'], async (request: NextRequest) => {
  try {
    const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, smtpFrom, testTo } =
      await request.json();

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: 'SMTP Host, User, and Password are required' },
        { status: 400 }
      );
    }

    const recipient = testTo || smtpUser;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587', 10),
      secure: smtpSecure === true || smtpSecure === 'true',
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: smtpFrom || smtpUser,
      to: recipient,
      subject: 'FlowBiz — SMTP Test Email',
      html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:#6366f1;padding:24px 32px;">
          <h1 style="margin:0;color:#fff;font-size:22px;">FlowBiz</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;color:#374151;font-size:16px;">Your SMTP configuration is working correctly!</p>
          <p style="margin:0;color:#6b7280;font-size:14px;">This is a test email sent from FlowBiz settings. You can now send invoices and password reset emails.</p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">FlowBiz — Business Management</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    return NextResponse.json({
      message: `Test email sent successfully to ${recipient}`,
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send test email. Check your SMTP settings.' },
      { status: 500 }
    );
  }
});
