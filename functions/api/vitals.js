const MAX_BODY_BYTES = 4096;

export async function onRequestPost(context) {
  try {
    const contentType = context.request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return json({ ok: false, error: 'Invalid content type' }, 400);
    }

    const raw = await context.request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ ok: false, error: 'Payload too large' }, 413);
    }

    const metric = JSON.parse(raw);
    if (!isValidMetric(metric)) {
      return json({ ok: false, error: 'Invalid payload' }, 400);
    }

    const loggingEnabled = context.env?.VITALS_LOG_ENABLED === 'true';
    if (loggingEnabled) {
      console.log('[web-vitals]', JSON.stringify(metric));
    }

    return json({ ok: true }, 202);
  } catch (error) {
    return json({ ok: false, error: 'Unexpected error', details: String(error?.message || error) }, 500);
  }
}

function isValidMetric(value) {
  if (!value || typeof value !== 'object') return false;
  if (typeof value.name !== 'string' || value.name.length > 20) return false;
  if (typeof value.value !== 'number' || Number.isNaN(value.value)) return false;
  if (typeof value.path !== 'string' || value.path.length > 180) return false;
  return true;
}

function json(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
