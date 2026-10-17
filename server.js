/**
 * server.js - High-Performance Production HTTP Server for DuyvesTI Platform
 *
 * Implements:
 * - Native Node.js HTTP server (zero external dependencies).
 * - Grade A+ Security HTTP Headers (HSTS, CSP, X-Frame-Options, etc.).
 * - Clean static asset streaming with MIME type resolution.
 * - Path traversal protection and robust error handling.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT_DIR = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://wa.me; font-src 'self'; connect-src 'self'; frame-ancestors 'none';"
};

/**
 * Apply security headers to response
 * @param {http.ServerResponse} res
 */
function applySecurityHeaders(res) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(key, value);
  }
}

/**
 * Resolve request URL to filesystem path
 * @param {string} pathname
 * @returns {string|null} Absolute file path if valid
 */
function resolveFilePath(pathname) {
  // Normalize path and prevent directory traversal
  let safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  if (safePath === '/' || safePath === '' || safePath === '/index.html') {
    return path.join(ROOT_DIR, 'src/index.html');
  }

  // Check in root directory
  let candidate = path.join(ROOT_DIR, safePath);
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }

  // Check in src directory
  candidate = path.join(ROOT_DIR, 'src', safePath);
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }

  // Check in public directory
  candidate = path.join(ROOT_DIR, 'public', safePath);
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }

  return null;
}

/**
 * Request handler
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function handleRequest(req, res) {
  applySecurityHeaders(res);

  const parsedUrl = new URL(req.url, 'http://' + (req.headers.host || '127.0.0.1'));
  const pathname = parsedUrl.pathname;

  // Health check endpoint
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString(), version: '1.0.0' }));
    return;
  }

  // Handle GET / HEAD requests for static assets
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  const filePath = resolveFilePath(pathname);

  if (!filePath) {
    // 404 Not Found
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>404 - Página no encontrada | DuyvesTI</title></head>
<body style="font-family:system-ui;text-align:center;padding:4rem;background:#0A0D14;color:#F1F5F9;">
  <h1>404 - Página no encontrada</h1>
  <p>El recurso solicitado no existe.</p>
  <a href="/" style="color:#FF6A13;text-decoration:none;font-weight:bold;">Volver al inicio</a>
</body>
</html>`);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable'
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on('error', (err) => {
      console.error('File stream error:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });
  } catch (err) {
    console.error('File read error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
}

/**
 * Creates and starts the HTTP server
 * @param {number} [port=PORT]
 * @param {string} [host=HOST]
 * @returns {http.Server}
 */
function createServer(port = PORT, host = HOST) {
  const server = http.createServer(handleRequest);
  return server;
}

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, HOST, () => {
    console.log(`=======================================================`);
    console.log(`  DuyvesTI Platform Server running at http://${HOST === '0.0.0.0' ? '127.0.0.1' : HOST}:${PORT}`);
    console.log(`  Security Headers: Grade A+ enabled`);
    console.log(`  Environment: Production Node.js (${process.version})`);
    console.log(`=======================================================`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server gracefully...');
    server.close(() => process.exit(0));
  });
  process.on('SIGINT', () => {
    console.log('SIGINT received, closing server gracefully...');
    server.close(() => process.exit(0));
  });
}

module.exports = {
  createServer,
  handleRequest,
  resolveFilePath,
  SECURITY_HEADERS,
  MIME_TYPES
};
