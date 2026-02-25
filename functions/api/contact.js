export async function onRequestPost(context) {
  try {
    const contentType = context.request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return json({ ok: false, error: 'Invalid content type' }, 400);
    }

    const body = await context.request.json();
    const name = sanitize(body?.name, 80);
    const email = sanitize(body?.email, 160);
    const message = sanitize(body?.message, 4000);
    const website = sanitize(body?.website, 120);
    const startedAt = Number(body?.startedAt || 0);
    const turnstileToken = sanitize(body?.turnstileToken, 2048);
    const source = sanitize(body?.source || 'knorps.com contact form', 120);
    const clientIp = context.request.headers.get('CF-Connecting-IP') || 'unknown';

    if (!name || !email || !message) {
      return json({ ok: false, error: 'Missing required fields' }, 400);
    }
    if (website) {
      return json({ ok: true }, 200);
    }
    if (!Number.isFinite(startedAt) || Date.now() - startedAt < 1200) {
      return json({ ok: false, error: 'Submission too fast' }, 429);
    }
    if (isRateLimited(clientIp)) {
      return json({ ok: false, error: 'Too many requests. Try again later.' }, 429);
    }

    if (!isValidEmail(email)) {
      return json({ ok: false, error: 'Invalid email address' }, 400);
    }

    const resendApiKey = context.env.RESEND_API_KEY;
    const turnstileSecret = context.env.TURNSTILE_SECRET_KEY;
    const fromEmail = context.env.CONTACT_FROM_EMAIL || 'contact@knorps.com';
    const toEmail = context.env.CONTACT_TO_EMAIL || 'pawel.knorps@gmail.com';

    if (!resendApiKey) {
      return json({ ok: false, error: 'Email service is not configured' }, 500);
    }
    const enforceTurnstile = context.env.TURNSTILE_ENFORCE === 'true';
    if (turnstileSecret && (turnstileToken || enforceTurnstile)) {
      const challenge = await verifyTurnstile(turnstileSecret, turnstileToken, clientIp);
      if (!challenge.ok) {
        return json({ ok: false, error: 'Bot verification failed' }, 403);
      }
    }

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>New Contact Form Message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Source:</strong> ${escapeHtml(source)}</p>
        <hr />
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      </div>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: `New message from ${name}`,
        reply_to: email,
        text: `Name: ${name}\nEmail: ${email}\nSource: ${source}\n\n${message}`,
        html
      })
    });

    if (!resendResponse.ok) {
      const errorPayload = await safeJson(resendResponse);
      return json(
        {
          ok: false,
          error: 'Failed to send message',
          details: errorPayload
        },
        502
      );
    }

    return json({ ok: true }, 200);
  } catch (error) {
    return json(
      { ok: false, error: 'Unexpected error', details: String(error?.message || error) },
      500
    );
  }
}

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const rateLimitStore = globalThis.__contactRateLimitStore || new Map();
globalThis.__contactRateLimitStore = rateLimitStore;

function isRateLimited(ip) {
  const now = Date.now();
  const entries = rateLimitStore.get(ip) || [];
  const fresh = entries.filter((ts) => now - ts < WINDOW_MS);
  fresh.push(now);
  rateLimitStore.set(ip, fresh);
  return fresh.length > MAX_PER_WINDOW;
}

function json(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

function sanitize(value, maxLen) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed.slice(0, maxLen);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return { status: response.status };
  }
}

async function verifyTurnstile(secretKey, token, remoteip) {
  if (!token) return { ok: false };
  try {
    const form = new URLSearchParams();
    form.set('secret', secretKey);
    form.set('response', token);
    if (remoteip && remoteip !== 'unknown') form.set('remoteip', remoteip);
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form
    });
    return (await safeJson(response)) || { ok: false };
  } catch {
    return { ok: false };
  }
}
