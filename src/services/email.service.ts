import nodemailer from "nodemailer";
import type { AuthMode } from "../models/types.js";

const brandName = "Tudoor";

function getTransporter() {
  const user = process.env.GMAIL_USER ?? process.env.SMTP_USER;
  const pass = (process.env.GMAIL_APP_PASSWORD ?? process.env.SMTP_PASS)?.replace(/\s/g, "");

  if (!user || !pass) return undefined;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });
}

function otpSubject(mode: AuthMode) {
  return mode === "register" ? "Verify your Tudoor account" : "Your Tudoor login code";
}

function otpHtml(code: string, mode: AuthMode) {
  const title = mode === "register" ? "Verify your email" : "Log in to Tudoor";
  const copy = mode === "register"
    ? "Use this code to finish creating your Tudoor account."
    : "Use this code to continue to your Tudoor account.";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${otpSubject(mode)}</title>
  </head>
  <body style="margin:0;background:#f6f3ff;font-family:Inter,Arial,sans-serif;color:#191724;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f3ff;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid #e7e1f5;border-radius:24px;overflow:hidden;box-shadow:0 18px 48px rgba(54,37,112,0.12);">
            <tr>
              <td style="padding:28px 28px 20px;background:linear-gradient(135deg,#6d5dfc,#22c1c3);color:#ffffff;">
                <div style="display:inline-block;width:42px;height:42px;line-height:42px;text-align:center;border-radius:14px;background:rgba(255,255,255,0.2);font-weight:800;font-size:22px;">T</div>
                <h1 style="margin:18px 0 0;font-size:28px;line-height:1.2;">${brandName}</h1>
                <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">${title}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 28px;">
                <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#4f4a5f;">${copy}</p>
                <div style="letter-spacing:10px;font-size:34px;font-weight:800;text-align:center;color:#191724;background:#f4f0ff;border:1px dashed #b7a9ff;border-radius:18px;padding:18px 10px;">${code}</div>
                <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#6f6a7f;">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:#fbfaff;border-top:1px solid #eee8fb;color:#817a91;font-size:12px;line-height:1.5;">
                Tudoor keeps contact details private until requests or bids are approved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export const emailService = {
  sendOtp: async (email: string, code: string, mode: AuthMode) => {
    const transporter = getTransporter();
    const from = process.env.MAIL_FROM ?? process.env.GMAIL_USER ?? "Tudoor <no-reply@tudoor.app>";

    if (!transporter) {
      console.info(`[email] SMTP not configured. Tudoor OTP for ${email}: ${code}`);
      return { sent: false, reason: "SMTP not configured" };
    }

    try {
      await transporter.sendMail({
        from,
        to: email,
        subject: otpSubject(mode),
        text: `Your Tudoor OTP is ${code}. It expires in 10 minutes.`,
        html: otpHtml(code, mode)
      });

      return { sent: true };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unable to send email";
      console.error(`[email] Tudoor OTP delivery failed for ${email}: ${reason}`);
      console.info(`[email] Tudoor OTP fallback for ${email}: ${code}`);
      return { sent: false, reason };
    }
  }
};
