/**
 * Cloudflare Worker – Custom event ingestion for Deejay Tim analytics.
 * POST /event with JSON body { name, path, ts, data? }
 * Writes to Analytics Engine dataset DJTIM_EVENTS.
 */

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST' || !request.url.endsWith('/event')) {
      return new Response('Not Found', { status: 404 });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    if (!name || name.length > 64 || !/^[a-z0-9_]+$/.test(name)) {
      return new Response('Invalid event name', { status: 400 });
    }

    const path = typeof payload.path === 'string' ? payload.path.slice(0, 256) : '/';
    const data = payload.data && typeof payload.data === 'object' ? payload.data : {};
    const blob3 = data.eventType || '';
    const blob4 = data.vibe || '';
    const blob5 = data.ageMix || '';
    const blob6 = data.muted !== undefined ? String(data.muted) : '';

    env.DJTIM_EVENTS.writeDataPoint({
      blobs: [name, path, blob3, blob4, blob5, blob6],
      doubles: [1],
      indexes: [name],
    });

    return new Response(null, {
      status: 204,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  },
};
