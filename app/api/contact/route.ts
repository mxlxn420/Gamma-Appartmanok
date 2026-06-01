import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(5, "60 m"),
  prefix: "contact",
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      { success: false, error: "Túl sok üzenet. Próbáld újra később." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    const name    = typeof body.name    === "string" ? body.name.trim().slice(0, 100)    : "";
    const email   = typeof body.email   === "string" ? body.email.trim().slice(0, 200)   : "";
    const phone   = typeof body.phone   === "string" ? body.phone.trim().slice(0, 30)    : "";
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Hiányzó mezők" },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Érvénytelen e-mail cím" },
        { status: 400 }
      );
    }

    // Mentés adatbázisba
    await prisma.contactMessage.create({
      data: { name, email, phone: phone || null, message },
    });

    // Email küldés adminnak
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const ADMIN_EMAIL    = process.env.ADMIN_EMAIL ?? process.env.FROM_EMAIL;
    const FROM_EMAIL     = process.env.FROM_EMAIL  ?? "onboarding@resend.dev";

    if (RESEND_API_KEY && RESEND_API_KEY !== "re_xxxxxxxxxxxx") {
      await fetch("https://api.resend.com/emails", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": "Bearer " + RESEND_API_KEY,
        },
        body: JSON.stringify({
          from:     "Gamma Apartmanok <" + FROM_EMAIL + ">",
          to:       [ADMIN_EMAIL],
          reply_to: email,
          subject:  "Új üzenet: " + escapeHtml(name),
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:20px;">
              <div style="background:#1a3a2a;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
                <h2 style="color:#f5f0e8;margin:0;font-weight:300;">Új kapcsolatfelvétel</h2>
              </div>
              <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e8e8e8;">
                <table style="width:100%;font-size:14px;border-collapse:collapse;">
                  <tr>
                    <td style="padding:8px 0;color:#737373;border-bottom:1px solid #f0f0f0;">Név</td>
                    <td style="padding:8px 0;font-weight:600;border-bottom:1px solid #f0f0f0;">${escapeHtml(name)}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#737373;border-bottom:1px solid #f0f0f0;">E-mail</td>
                    <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
                      <a href="mailto:${escapeHtml(email)}" style="color:#1a3a2a;">${escapeHtml(email)}</a>
                    </td>
                  </tr>
                  ${phone ? `
                  <tr>
                    <td style="padding:8px 0;color:#737373;border-bottom:1px solid #f0f0f0;">Telefon</td>
                    <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
                      <a href="tel:${escapeHtml(phone)}" style="color:#1a3a2a;">${escapeHtml(phone)}</a>
                    </td>
                  </tr>` : ""}
                  <tr>
                    <td style="padding:8px 0;color:#737373;vertical-align:top;">Üzenet</td>
                    <td style="padding:8px 0;line-height:1.6;">${escapeHtml(message).replace(/\n/g, "<br>")}</td>
                  </tr>
                </table>
                <div style="margin-top:20px;padding-top:20px;border-top:1px solid #f0f0f0;text-align:center;">
                  <a href="mailto:${escapeHtml(email)}" style="background:#1a3a2a;color:#f5f0e8;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;">
                    Válasz küldése
                  </a>
                </div>
              </div>
            </div>
          `,
        }),
      });
    } else {
      console.log("📧 [DEV] Kapcsolat email szimulálva:", { name, email, message });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Szerver hiba, kérjük próbáld újra." },
      { status: 500 }
    );
  }
}