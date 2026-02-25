const endpoint = '/api/vitals';

const sendMetric = (metric) => {
  const payload = {
    name: metric.name,
    value: Number(metric.value?.toFixed?.(2) || metric.value || 0),
    rating: metric.rating || 'unknown',
    id: metric.id,
    navigationType: metric.navigationType || 'unknown',
    ts: Date.now(),
    path: typeof window !== 'undefined' ? window.location.pathname : '/'
  };

  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, body);
      return;
    }
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true
    }).catch(() => {});
  } catch {
    // Ignore telemetry errors
  }
};

export const setupVitals = async () => {
  if (typeof window === 'undefined') return;

  const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import('web-vitals/attribution');
  onCLS(sendMetric);
  onINP(sendMetric);
  onLCP(sendMetric);
  onFCP(sendMetric);
  onTTFB(sendMetric);
};
