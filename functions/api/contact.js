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
    const source = sanitize(body?.source || 'knorps.com contact form', 120);

    if (!name || !email || !message) {
      return json({ ok: false, error: 'Missing required fields' }, 400);
    }

    if (!isValidEmail(email)) {
      return json({ ok: false, error: 'Invalid email address' }, 400);
    }

    const resendApiKey = context.env.RESEND_API_KEY;
    const fromEmail = context.env.CONTACT_FROM_EMAIL || 'contact@knorps.com';
    const toEmail = context.env.CONTACT_TO_EMAIL || 'pawel.knorps@gmail.com';

    if (!resendApiKey) {
      return json({ ok: false, error: 'Email service is not configured' }, 500);
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
