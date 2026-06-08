// api/contact.js — Emberforge Works contact form handler
// Emails new inquiries via Resend. No database, no subscriber tracking — just email-me.
// Deploy on Vercel; the page POSTs here from /api/contact.

// --- Config (edit these two, or set as Vercel env vars) ---
const TO_EMAIL   = process.env.CONTACT_TO   || 'Erick@EmberforgeWorks.com';                 // where leads land in your inbox
const FROM_EMAIL = process.env.CONTACT_FROM || 'Emberforge Works <noreply@emberforgeworks.com>'; // MUST be a Resend-verified domain
// RESEND_API_KEY is read from the environment — never hardcode it. Set it in Vercel project settings.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const clean = (s) => String(s ?? '').trim();

  const name    = clean(body.name);
  const email   = clean(body.email);
  const phone   = clean(body.phone);
  const problem = clean(body.problem);
  const tried   = clean(body.tried);
  const why     = clean(body.why);
  const website = clean(body.website); // honeypot

  // Bots auto-fill the hidden "website" field. Drop silently, return success.
  if (website) return res.status(200).json({ ok: true });

  // Validate server-side — never trust the client. Name, email, and Q1 are required.
  if (!name || !email || !problem) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Server not configured' });
  }

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const rowHtml = (label, val) => val
    ? `<tr><td style="padding:6px 14px 6px 0;color:#8b919b;vertical-align:top;white-space:nowrap;font-weight:600">${label}</td><td style="padding:6px 0;color:#ecebe6">${esc(val).replace(/\n/g, '<br>')}</td></tr>`
    : '';

  const html = `
    <div style="background:#0b0d10;padding:28px;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
      <div style="max-width:560px;margin:auto;background:#14181d;border:1px solid #23282f;border-radius:12px;padding:26px">
        <div style="font-family:monospace;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#ffb347;margin-bottom:6px">New inquiry</div>
        <h2 style="margin:0 0 18px;color:#ecebe6;font-size:20px">${esc(name)}</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.55">
          ${rowHtml('Email', email)}
          ${rowHtml('Phone', phone)}
          ${rowHtml('Biggest problem', problem)}
          ${rowHtml('Tried so far', tried)}
          ${rowHtml('Why now', why)}
        </table>
        <p style="margin:20px 0 0;color:#646a73;font-size:12px">Reply directly to this email to respond to ${esc(name)}.</p>
      </div>
    </div>`;

  const text = [
    `New inquiry — ${name}`,
    ``,
    `Email: ${email}`,
    phone   ? `Phone: ${phone}`             : null,
    `Biggest problem: ${problem}`,
    tried   ? `Tried so far: ${tried}`      : null,
    why     ? `Why now: ${why}`             : null,
  ].filter(Boolean).join('\n');

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: email,            // hit Reply and it goes straight to the lead
        subject: `New inquiry — ${name}`,
        html,
        text,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      console.error('Resend error:', resp.status, detail);
      return res.status(502).json({ error: 'Email failed to send' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(502).json({ error: 'Email failed to send' });
  }
}