import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Use onboarding@resend.dev for testing. Replace with your verified domain in production.
const FROM = "Human Flourishing Platform <onboarding@resend.dev>"
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${BASE_URL}/verify-email?token=${token}`

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your email — Human Flourishing Platform",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h1 style="font-size:24px;font-weight:700;color:#5b21b6;margin-bottom:8px">
          Welcome to Human Flourishing Platform
        </h1>
        <p style="color:#374151;margin-bottom:24px">
          Click the button below to verify your email address. This link expires in 24 hours.
        </p>
        <a href="${url}"
           style="display:inline-block;background:#7c3aed;color:#fff;font-weight:600;
                  padding:12px 24px;border-radius:8px;text-decoration:none;font-size:15px">
          Verify Email
        </a>
        <p style="color:#6b7280;font-size:13px;margin-top:24px">
          Or paste this link into your browser:<br/>
          <a href="${url}" style="color:#7c3aed;word-break:break-all">${url}</a>
        </p>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}
