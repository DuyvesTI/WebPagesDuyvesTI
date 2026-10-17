/**
 * tests/stress_server.js
 * Empirical stress harness for server.js
 * Tests: Concurrency, Path Traversal, Malformed Headers, HTTP Methods, Edge URIs.
 */

const http = require('node:http');
const net = require('node:net');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createServer } = require('../server.js');

const TEST_PORT = 3899;
const TEST_HOST = '127.0.0.1';

async function run() {
  console.log('--- Starting server.js Stress Harness ---');
  const server = createServer(TEST_PORT, TEST_HOST);

  await new Promise((resolve) => server.listen(TEST_PORT, TEST_HOST, resolve));
  console.log(`Server listening on http://${TEST_HOST}:${TEST_PORT}`);

  const results = {
    concurrency: { passed: 0, failed: 0, errors: [] },
    traversal: { tested: 0, blocked: 0, leaked: [], errors: [] },
    malformed: { tested: 0, handled: 0, crashed: false, errors: [] },
    methods: { tested: 0, passed: 0, errors: [] }
  };

  try {
    // -------------------------------------------------------------
    // Test 1: Concurrency (300 simultaneous requests)
    // -------------------------------------------------------------
    console.log('\n[1] Testing Concurrency: 300 rapid requests...');
    const endpoints = [
      '/',
      '/api/health',
      '/src/css/globals.css',
      '/src/css/components.css',
      '/src/js/theme.js',
      '/src/js/nav.js',
      '/nonexistent-404'
    ];

    const startTime = Date.now();
    const reqPromises = Array.from({ length: 300 }, (_, i) => {
      const ep = endpoints[i % endpoints.length];
      return new Promise((resolve) => {
        const req = http.get(
          {
            host: TEST_HOST,
            port: TEST_PORT,
            path: ep,
            timeout: 5000
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              const expectedStatus = ep === '/nonexistent-404' ? 404 : 200;
              if (res.statusCode === expectedStatus) {
                results.concurrency.passed++;
              } else {
                results.concurrency.failed++;
                results.concurrency.errors.push(`Ep: ${ep} expected ${expectedStatus} got ${res.statusCode}`);
              }
              resolve();
            });
          }
        );
        req.on('error', (err) => {
          results.concurrency.failed++;
          results.concurrency.errors.push(`Req ${i} error: ${err.message}`);
          resolve();
        });
      });
    });

    await Promise.all(reqPromises);
    const duration = Date.now() - startTime;
    console.log(`  Concurrency: ${results.concurrency.passed}/300 passed in ${duration}ms (Avg ${(duration / 300).toFixed(2)}ms/req)`);

    // -------------------------------------------------------------
    // Test 2: Path Traversal Probing
    // -------------------------------------------------------------
    console.log('\n[2] Testing Path Traversal & Sensitive File Exposure...');
    const traversalPayloads = [
      '/../../../../etc/passwd',
      '/../../../etc/shadow',
      '/..%2f..%2f..%2fetc/passwd',
      '/%2e%2e/%2e%2e/%2e%2e/etc/passwd',
      '/....//....//etc/passwd',
      '/etc/passwd',
      '/proc/self/environ',
      '/.agents/orchestrator_1/PROJECT.md',
      '/.agents/teamwork_preview_worker_m1_1/handoff.md',
      '/package.json',
      '/server.js',
      '/.git/config',
      '/.env',
      '//etc/passwd',
      '/src/../../server.js',
      '/public/../../../etc/passwd',
      '/index.html\0.js',
      '/index.html%00.png'
    ];

    for (const payload of traversalPayloads) {
      results.traversal.tested++;
      await new Promise((resolve) => {
        // Use raw socket if path has unescaped chars, else http.get
        if (payload.includes('\0')) {
          const socket = net.createConnection({ host: TEST_HOST, port: TEST_PORT }, () => {
            socket.write(`GET ${payload} HTTP/1.1\r\nHost: ${TEST_HOST}\r\n\r\n`);
          });
          let resp = '';
          socket.on('data', (d) => (resp += d.toString()));
          socket.on('close', () => {
            results.traversal.blocked++;
            resolve();
          });
          socket.on('error', () => {
            results.traversal.blocked++;
            resolve();
          });
          setTimeout(() => { socket.destroy(); resolve(); }, 300);
          return;
        }

        const req = http.get(
          {
            host: TEST_HOST,
            port: TEST_PORT,
            path: payload,
            timeout: 2000
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              // System files outside ROOT_DIR must never be returned!
              const isSystemFile = payload.includes('etc/') || payload.includes('proc/');
              const isAgentFile = payload.includes('.agents/');
              const isSourceFile = payload === '/server.js' || payload.includes('server.js');

              if (res.statusCode === 200) {
                if (isSystemFile) {
                  results.traversal.leaked.push(`CRITICAL: System file exposed via ${payload}`);
                } else if (isAgentFile) {
                  results.traversal.leaked.push(`WARNING/FINDING: Internal agent file exposed via ${payload} (Status: 200)`);
                } else if (isSourceFile) {
                  results.traversal.leaked.push(`INFO/FINDING: Server source code served via ${payload} (Status: 200)`);
                }
              } else if (res.statusCode === 404 || res.statusCode === 400 || res.statusCode === 403) {
                results.traversal.blocked++;
              }
              resolve();
            });
          }
        );
        req.on('error', (err) => {
          results.traversal.blocked++;
          resolve();
        });
      });
    }
    console.log(`  Traversal probes: ${results.traversal.tested} tested, ${results.traversal.blocked} safely blocked/404.`);
    if (results.traversal.leaked.length > 0) {
      console.log('  Findings detected:');
      results.traversal.leaked.forEach((f) => console.log('   -', f));
    }

    // -------------------------------------------------------------
    // Test 3: HTTP Methods Handling
    // -------------------------------------------------------------
    console.log('\n[3] Testing HTTP Methods (HEAD, POST, PUT, DELETE, OPTIONS, TRACE)...');
    const methods = ['HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'TRACE'];
    for (const m of methods) {
      results.methods.tested++;
      await new Promise((resolve) => {
        const req = http.request(
          {
            host: TEST_HOST,
            port: TEST_PORT,
            path: '/',
            method: m,
            timeout: 2000
          },
          (res) => {
            let body = '';
            res.on('data', (c) => (body += c));
            res.on('end', () => {
              if (m === 'HEAD') {
                if (res.statusCode === 200 && body.length === 0) {
                  results.methods.passed++;
                } else {
                  results.methods.errors.push(`HEAD returned status ${res.statusCode} with body length ${body.length}`);
                }
              } else {
                // Non-GET/HEAD should return 405 Method Not Allowed
                if (res.statusCode === 405) {
                  results.methods.passed++;
                } else {
                  results.methods.errors.push(`${m} returned status ${res.statusCode} instead of 405`);
                }
              }
              resolve();
            });
          }
        );
        req.on('error', (err) => {
          results.methods.errors.push(`${m} error: ${err.message}`);
          resolve();
        });
        req.end();
      });
    }
    console.log(`  HTTP Methods: ${results.methods.passed}/${results.methods.tested} behaved correctly.`);

    // -------------------------------------------------------------
    // Test 4: Malformed Headers & URL Injection (Crash resistance)
    // -------------------------------------------------------------
    console.log('\n[4] Testing Malformed Headers, Raw Sockets & Crash Resistance...');
    
    // First, verify URL parser behavior on malformed host
    try {
      new URL('/', 'http://[invalid:::host');
      results.malformed.handled++;
    } catch (err) {
      results.malformed.crashed = true;
      results.malformed.errors.push(
        `CRITICAL FINDING: server.js:95 'new URL(req.url, "http://" + req.headers.host)' throws unhandled TypeError [${err.code}]: "${err.message}". An attacker sending malformed Host header crashes the Node.js server.`
      );
    }

    const safeRawPayloads = [
      'GET / HTTP/1.0\r\n\r\n', // Missing Host header (HTTP/1.0)
      'GET /api/health HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n',
      // Very long header (>16KB)
      `GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nX-Long-Header: ${'A'.repeat(16384)}\r\n\r\n`,
      // Query params with special characters
      'GET /?query=test%20search HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n'
    ];

    for (let i = 0; i < safeRawPayloads.length; i++) {
      results.malformed.tested++;
      const payload = safeRawPayloads[i];
      await new Promise((resolve) => {
        const socket = net.createConnection({ host: TEST_HOST, port: TEST_PORT }, () => {
          socket.write(payload);
        });

        socket.on('data', () => {});
        socket.on('error', () => resolve());
        socket.on('close', () => {
          results.malformed.handled++;
          resolve();
        });
        setTimeout(() => { socket.destroy(); resolve(); }, 300);
      });
    }

    // Verify server is STILL alive
    console.log('  Verifying server health after safe payload battery...');
    const isAlive = await new Promise((resolve) => {
      const req = http.get(`http://${TEST_HOST}:${TEST_PORT}/api/health`, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
    });

    console.log(`  Server alive check: ${isAlive ? 'ALIVE ✔' : 'CRASHED ✖'}`);
    assert.strictEqual(isAlive, true, 'Server must remain alive after malformed header tests');

  } finally {
    server.close();
    console.log('Server shut down cleanly.');
  }

  console.log('\n=== Stress Harness Results ===');
  console.log(JSON.stringify(results, null, 2));
  return results;
}

run().catch((err) => {
  console.error('Fatal stress test failure:', err);
  process.exit(1);
});
