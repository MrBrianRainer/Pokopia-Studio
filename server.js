// ─────────────────────────────────────────────
//  Pokopia Builder — Anthropic API Proxy
//  Deploy free on Railway, Render, or Fly.io
//  Set env var: ANTHROPIC_API_KEY=sk-ant-...
// ─────────────────────────────────────────────

const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error('ERROR: Set the ANTHROPIC_API_KEY environment variable.');
  process.exit(1);
}

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : ['*']; // lock this down to your domain in production

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes('*') ? '*' : (ALLOWED_ORIGINS.includes(origin) ? origin : '');
  return {
    'Access-Control-Allow-Origin': allow || '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

const server = http.createServer((req, res) => {
  const origin = req.headers['origin'] || '';

  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(origin));
    return res.end();
  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders(origin) });
    return res.end(JSON.stringify({ status: 'ok' }));
  }

  // Only allow POST /generate
  if (req.method !== 'POST' || req.url !== '/generate') {
    res.writeHead(404, { 'Content-Type': 'application/json', ...corsHeaders(origin) });
    return res.end(JSON.stringify({ error: 'Not found' }));
  }

  // Collect body
  let body = '';
  req.on('data', chunk => { body += chunk; if (body.length > 10_000_000) req.destroy(); });
  req.on('end', () => {
    let payload;
    try { payload = JSON.parse(body); } catch {
      res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders(origin) });
      return res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }

    // Forward to Anthropic
    const anthropicBody = Buffer.from(JSON.stringify(payload));
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': anthropicBody.length,
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
    };

    const proxy = https.request(options, apiRes => {
      let data = '';
      apiRes.on('data', chunk => { data += chunk; });
      apiRes.on('end', () => {
        res.writeHead(apiRes.statusCode, {
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
        });
        res.end(data);
      });
    });

    proxy.on('error', err => {
      console.error('Proxy error:', err.message);
      res.writeHead(502, { 'Content-Type': 'application/json', ...corsHeaders(origin) });
      res.end(JSON.stringify({ error: 'Upstream request failed' }));
    });

    proxy.write(anthropicBody);
    proxy.end();
  });
});

server.listen(PORT, () => {
  console.log(`✅ Pokopia proxy running on port ${PORT}`);
});
