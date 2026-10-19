/**
 * DuyvesTI — Subtle Futuristic Software Architecture & Fiber-Optic Circuit Engine
 * Inspired by Linear.app, Vercel & Stripe Enterprise Design Systems
 *
 * Design Principles:
 * 1. Reading-First Subtlety: A central reading vignette keeps the text zone calm
 *    and high-contrast so nothing ever distracts from reading copy or pricing.
 * 2. Interactive Precision Micro-Grid & Crosshairs: Nearly invisible at rest
 *    (3.5% opacity), gently illuminated by a soft radial spotlight around the cursor.
 * 3. Fiber-Optic Data Pulses (Telemetry Streams): Sleek light packets traveling
 *    along orthogonal circuit tracks with soft glowing trails, representing
 *    high-speed software architecture, cloud APIs, and data pipelines.
 * 4. Subtle Floating Code & Architecture Micro-Nodes in the peripheral margins
 *    with smooth scroll parallax.
 * 5. Locked 60 FPS on both mobile and Linux desktop integrated GPUs (Intel HD 5500).
 */
(function () {
  'use strict';

  function initFuturisticTechExperience() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    var canvas = document.getElementById('three-scroll-canvas');
    if (!canvas) return;

    var reducedMotionQuery = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : { matches: false };

    var state = {
      isLight: document.documentElement.getAttribute('data-theme') === 'light',
      reducedMotion: Boolean(reducedMotionQuery.matches),
      mouseX: -1000,
      mouseY: -1000,
      targetMouseX: -1000,
      targetMouseY: -1000,
      scrollY: window.pageYOffset || 0,
      targetScrollY: window.pageYOffset || 0
    };

    // Check HTML-in-Canvas feature support per modern-web-guidance (interactive-content-in-3d-scenes)
    if (
      typeof HTMLCanvasElement !== 'undefined' &&
      'requestPaint' in HTMLCanvasElement.prototype
    ) {
      canvas.setAttribute('data-html-in-canvas', 'supported');
    }

    document.documentElement.classList.add('three-active');
    canvas.classList.add('is-three-ready');

    initEditorialIndicator();
    startTechCircuitEngine(canvas, state);
  }

  /**
   * Minimalist Side Section Telemetry Counter (01 — 06)
   */
  function initEditorialIndicator() {
    if (document.getElementById('editorial-screen-controller')) return;

    var sections = [
      { id: 'inicio', num: '01' },
      { id: 'proceso', num: '02' },
      { id: 'planes', num: '03' },
      { id: 'portafolio', num: '04' },
      { id: 'faq', num: '05' },
      { id: 'contacto', num: '06' }
    ];

    var wrapper = document.createElement('div');
    wrapper.id = 'editorial-screen-controller';
    wrapper.className = 'editorial-screen-controller';
    wrapper.setAttribute('aria-hidden', 'true');

    wrapper.innerHTML =
      '<div class="esc-inner">' +
      '  <div class="esc-counter">' +
      '    <span class="esc-current" id="esc-current-num">01</span>' +
      '    <span class="esc-line-track"><span class="esc-line-fill" id="esc-line-fill"></span></span>' +
      '    <span class="esc-total">06</span>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(wrapper);

    var currentNumEl = document.getElementById('esc-current-num');
    var lineFillEl = document.getElementById('esc-line-fill');

    function updateIndicator() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      var maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var ratio = Math.min(1, Math.max(0, scrollY / maxScroll));
      if (lineFillEl) {
        lineFillEl.style.transform = 'scaleY(' + Math.max(0.08, ratio).toFixed(3) + ')';
      }

      var viewMid = scrollY + (window.innerHeight || 800) * 0.42;
      var activeNum = '01';
      for (var i = 0; i < sections.length; i++) {
        var el = document.getElementById(sections[i].id);
        if (el) {
          var top = el.getBoundingClientRect().top + scrollY;
          if (viewMid >= top) activeNum = sections[i].num;
        }
      }
      if (currentNumEl && currentNumEl.textContent !== activeNum) {
        currentNumEl.textContent = activeNum;
      }
    }

    window.addEventListener('scroll', updateIndicator, { passive: true });
    updateIndicator();
  }

  /**
   * Subtle Futuristic Software Engineering Canvas Engine
   * - Orthogonal circuit grid + micro-crosshairs revealed around cursor
   * - Fiber-optic data pulses streaming along peripheral tracks
   * - Peripheral software telemetry tokens & depth nodes with scroll parallax
   */
  function startTechCircuitEngine(canvas, state) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var width = window.innerWidth || 1280;
    var height = window.innerHeight || 800;
    var GRID_STEP = 64;

    function updateSize() {
      width = window.innerWidth || canvas.clientWidth || 1280;
      height = window.innerHeight || canvas.clientHeight || 800;
      canvas.width = width;
      canvas.height = height;
    }

    // MANDATORY per modern-web-guidance: ResizeObserver outside the render loop
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function () {
        updateSize();
        if (state.reducedMotion) renderFrame(performance.now());
      });
      ro.observe(canvas);
    } else {
      window.addEventListener('resize', updateSize, { passive: true });
    }
    updateSize();

    window.addEventListener(
      'pointermove',
      function (e) {
        state.targetMouseX = e.clientX;
        state.targetMouseY = e.clientY;
        if (state.mouseX < -500) {
          state.mouseX = e.clientX;
          state.mouseY = e.clientY;
        }
      },
      { passive: true }
    );

    window.addEventListener(
      'scroll',
      function () {
        state.targetScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      },
      { passive: true }
    );

    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function () {
        state.isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if (state.reducedMotion) renderFrame(performance.now());
      });
      mo.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
    }

    // 1. Fiber-Optic Data Packets traveling along grid lines (mostly in peripheral zones)
    var PULSES_COUNT = 14;
    var pulses = [];

    function spawnPulse(index, randomProgress) {
      var isVertical = index % 3 !== 0; // 2/3 vertical streams, 1/3 horizontal
      var cols = Math.max(4, Math.floor(width / GRID_STEP));
      var rows = Math.max(4, Math.floor(height / GRID_STEP));

      // Prefer peripheral columns (left 25% or right 25%) so center reading area stays calm
      var colIndex;
      if (index % 2 === 0) {
        colIndex = 1 + (index % Math.max(2, Math.floor(cols * 0.25)));
      } else {
        colIndex = cols - 1 - (index % Math.max(2, Math.floor(cols * 0.25)));
      }

      var rowIndex = 1 + ((index * 3) % Math.max(2, rows - 2));
      var dir = index % 2 === 0 ? 1 : -1;
      var length = 70 + (index % 4) * 30;
      var speed = 0.9 + (index % 5) * 0.28;
      var isCyan = index % 3 === 1;

      return {
        isVertical: isVertical,
        col: colIndex,
        row: rowIndex,
        pos: randomProgress ? ((index * 137) % Math.max(width, height)) : dir > 0 ? -length : (isVertical ? height + length : width + length),
        dir: dir,
        length: length,
        speed: speed,
        isCyan: isCyan
      };
    }

    for (var i = 0; i < PULSES_COUNT; i++) {
      pulses.push(spawnPulse(i, true));
    }

    // 2. Multi-Line Syntax-Highlighted Code Blocks (with live typing effect & parallax depth)
    var codeBlocks = [
      {
        xFrac: 0.025,
        yBase: 130,
        depth: 0.18,
        speed: 0.018,
        lines: [
          { num: '01', tag: 'comment', text: '// edge-gateway.ts — DuyvesTI Core' },
          { num: '02', tag: 'keyword', text: 'export async function handleRequest(req: Request) {' },
          { num: '03', tag: 'code',    text: '  const session = await verifyTLS13(req.headers);' },
          { num: '04', tag: 'string',  text: '  return Response.json({ status: 200, lcp: "0.78s" });' },
          { num: '05', tag: 'keyword', text: '}' }
        ]
      },
      {
        xFrac: 0.72,
        yBase: 210,
        depth: 0.24,
        speed: 0.022,
        lines: [
          { num: '14', tag: 'comment', text: '// security-oracle.ts — Anti-Bot F22' },
          { num: '15', tag: 'keyword', text: 'const verifySubmission = (payload: FormAST) => {' },
          { num: '16', tag: 'code',    text: '  if (payload.honeypot || payload.deltaMs < 2500) {' },
          { num: '17', tag: 'string',  text: '    return interceptBot({ action: "SILENT_DROP" });' },
          { num: '18', tag: 'code',    text: '  }' },
          { num: '19', tag: 'keyword', text: '  return sanitizeXSS(payload.data);' },
          { num: '20', tag: 'keyword', text: '};' }
        ]
      },
      {
        xFrac: 0.03,
        yBase: 520,
        depth: 0.15,
        speed: 0.016,
        lines: [
          { num: '08', tag: 'comment', text: '-- sync_pipeline.sql' },
          { num: '09', tag: 'keyword', text: 'SELECT client_id, code_ownership, sla_uptime' },
          { num: '10', tag: 'keyword', text: 'FROM duyvesti_deployments' },
          { num: '11', tag: 'string',  text: 'WHERE ownership = \'100%_CLIENT\' AND rent_clp = 0;' }
        ]
      },
      {
        xFrac: 0.73,
        yBase: 640,
        depth: 0.21,
        speed: 0.02,
        lines: [
          { num: '27', tag: 'comment', text: '// checkout-engine.ts' },
          { num: '28', tag: 'keyword', text: 'async function commitOrder(order: OrderCLP) {' },
          { num: '29', tag: 'code',    text: '  const tx = await webpay.commit(order.token);' },
          { num: '30', tag: 'string',  text: '  await notifyWhatsAppCRM(order.phone, tx.id);' },
          { num: '31', tag: 'keyword', text: '  return { confirmed: true, cipher: "AES-256" };' },
          { num: '32', tag: 'keyword', text: '}' }
        ]
      },
      {
        xFrac: 0.025,
        yBase: 910,
        depth: 0.22,
        speed: 0.019,
        lines: [
          { num: '01', tag: 'comment', text: '// cluster-config.json' },
          { num: '02', tag: 'code',    text: '{' },
          { num: '03', tag: 'string',  text: '  "region": "scl-chile-edge-01",' },
          { num: '04', tag: 'string',  text: '  "protocol": "HTTP/3 + QUIC",' },
          { num: '05', tag: 'keyword', text: '  "lighthouseScore": 99,' },
          { num: '06', tag: 'keyword', text: '  "zeroMonthlyRent": true' },
          { num: '07', tag: 'code',    text: '}' }
        ]
      },
      {
        xFrac: 0.71,
        yBase: 1040,
        depth: 0.17,
        speed: 0.021,
        lines: [
          { num: '42', tag: 'comment', text: '// telemetry-stream.ts' },
          { num: '43', tag: 'keyword', text: 'pipeline.on("frame", (metrics: WebVitals) => {' },
          { num: '44', tag: 'code',    text: '  assert(metrics.cls === 0 && metrics.ttfb < 95);' },
          { num: '45', tag: 'string',  text: '  emitPulse({ node: "0x7F4A", status: "OPTIMAL" });' },
          { num: '46', tag: 'keyword', text: '});' }
        ]
      },
      {
        xFrac: 0.24,
        yBase: 360,
        depth: 0.11,
        speed: 0.014,
        isWatermark: true,
        lines: [
          { num: '88', tag: 'comment', text: '// architecture/core-router.ts' },
          { num: '89', tag: 'code',    text: 'const router = createEdgeRouter({ hsts: 63072000, csp: "strict" });' },
          { num: '90', tag: 'code',    text: 'router.use("/api/v2/quote", rateLimit({ windowMs: 4000 }));' }
        ]
      },
      {
        xFrac: 0.32,
        yBase: 820,
        depth: 0.13,
        speed: 0.015,
        isWatermark: true,
        lines: [
          { num: '61', tag: 'comment', text: '// build/compiler-target.ts' },
          { num: '62', tag: 'code',    text: 'export type DeliveryModel = { advance: "50%", finalOnApprove: "50%" };' },
          { num: '63', tag: 'code',    text: 'await bundleAssets({ minify: true, target: "es2022" });' }
        ]
      }
    ];

    // 3. Floating Single-Line Code & CLI Micro-Tokens across the canvas
    var tokens = [
      { label: 'const app = createServer({ http3: true });', xFrac: 0.04, yBase: 60, depth: 0.14, tag: 'code' },
      { label: 'git commit -m "feat: deploy production edge"', xFrac: 0.76, yBase: 95, depth: 0.19, tag: 'string' },
      { label: 'export type Ownership = "100%_CLIENT";', xFrac: 0.05, yBase: 410, depth: 0.25, tag: 'keyword' },
      { label: 'await db.transaction(tx => tx.commit());', xFrac: 0.77, yBase: 470, depth: 0.16, tag: 'code' },
      { label: 'Content-Security-Policy: frame-ancestors \'none\'', xFrac: 0.04, yBase: 760, depth: 0.20, tag: 'comment' },
      { label: 'docker build --target=release -t duyvesti:v2 .', xFrac: 0.75, yBase: 870, depth: 0.23, tag: 'string' },
      { label: 'sha256:9f86d081884c7d659a2feaa0c55ad015', xFrac: 0.05, yBase: 1180, depth: 0.17, tag: 'comment' },
      { label: 'LCP: 0.74s | CLS: 0.000 | TBT: 0ms [PASS]', xFrac: 0.74, yBase: 1260, depth: 0.21, tag: 'keyword' },
      { label: 'fn verify_ed25519(sig: &[u8], pubkey: &Key) -> bool', xFrac: 0.18, yBase: 670, depth: 0.12, tag: 'code' },
      { label: 'SELECT COUNT(*) FROM leads WHERE bot_score = 0;', xFrac: 0.56, yBase: 280, depth: 0.13, tag: 'comment' }
    ];

    // 4. Subtle Floating Constellation Micro-Nodes
    var NODES_COUNT = 26;
    var nodes = [];
    for (var n = 0; n < NODES_COUNT; n++) {
      var seed = (n + 1) * 29.41;
      var rawX = (Math.sin(seed * 1.7) * 0.5 + 0.5);
      var xFrac = rawX < 0.5 ? rawX * 0.55 : 0.72 + (rawX - 0.5) * 0.55;
      nodes.push({
        xFrac: xFrac,
        yBase: ((Math.cos(seed * 2.3) * 0.5 + 0.5) * 1800),
        depth: 0.12 + (n % 5) * 0.06,
        radius: n % 4 === 0 ? 2.0 : 1.3,
        isAccent: n % 3 === 0
      });
    }

    var startTime = performance.now();

    function getSyntaxColor(tag, alpha, isLight) {
      var a = Math.max(0, Math.min(1, alpha)).toFixed(3);
      if (tag === 'keyword') {
        // Brand vibrant orange (#FF6A13)
        return isLight ? 'rgba(217, 78, 6, ' + a + ')' : 'rgba(255, 118, 38, ' + a + ')';
      }
      if (tag === 'string') {
        // Futuristic cyan/emerald (#38BDF8 / #10B981)
        return isLight ? 'rgba(2, 132, 199, ' + a + ')' : 'rgba(56, 189, 248, ' + a + ')';
      }
      if (tag === 'comment') {
        // Muted technical slate
        return isLight ? 'rgba(100, 116, 139, ' + a + ')' : 'rgba(148, 163, 184, ' + a + ')';
      }
      // Default code identifier color
      return isLight ? 'rgba(30, 41, 59, ' + a + ')' : 'rgba(203, 213, 225, ' + a + ')';
    }

    function renderFrame(now) {
      var t = (now || performance.now()) - startTime;

      // Smooth damping for pointer and scroll
      state.mouseX += (state.targetMouseX - state.mouseX) * 0.08;
      state.mouseY += (state.targetMouseY - state.mouseY) * 0.08;
      state.scrollY += (state.targetScrollY - state.scrollY) * 0.1;

      var isLight = state.isLight;
      ctx.clearRect(0, 0, width, height);

      var scrollOffset = state.scrollY * 0.22;
      var gridOffsetY = -(scrollOffset % GRID_STEP);

      // -----------------------------------------------------------------------
      // LAYER 1: Ultra-Subtle Architectural Software Grid
      // -----------------------------------------------------------------------
      var baseGridAlpha = isLight ? 0.032 : 0.035;
      ctx.strokeStyle = isLight
        ? 'rgba(15, 23, 42, ' + baseGridAlpha + ')'
        : 'rgba(148, 163, 184, ' + baseGridAlpha + ')';
      ctx.lineWidth = 1;

      ctx.beginPath();
      for (var gx = GRID_STEP; gx < width; gx += GRID_STEP) {
        var distFromCenter = Math.abs(gx - width * 0.5) / (width * 0.5);
        if (distFromCenter > 0.32) {
          ctx.moveTo(gx + 0.5, 0);
          ctx.lineTo(gx + 0.5, height);
        }
      }
      for (var gy = gridOffsetY; gy < height; gy += GRID_STEP) {
        if (gy >= 0) {
          ctx.moveTo(0, Math.floor(gy) + 0.5);
          ctx.lineTo(width, Math.floor(gy) + 0.5);
        }
      }
      ctx.stroke();

      // -----------------------------------------------------------------------
      // LAYER 2: Interactive Cursor Spotlight on Micro-Crosshairs (+)
      // -----------------------------------------------------------------------
      var spotlightRadius = 300;
      if (state.mouseX > -200 && state.mouseY > -200) {
        var minCol = Math.max(1, Math.floor((state.mouseX - spotlightRadius) / GRID_STEP));
        var maxCol = Math.min(
          Math.floor(width / GRID_STEP),
          Math.ceil((state.mouseX + spotlightRadius) / GRID_STEP)
        );
        var minRow = Math.floor((state.mouseY - spotlightRadius - gridOffsetY) / GRID_STEP);
        var maxRow = Math.ceil((state.mouseY + spotlightRadius - gridOffsetY) / GRID_STEP);

        var grad = ctx.createRadialGradient(
          state.mouseX,
          state.mouseY,
          0,
          state.mouseX,
          state.mouseY,
          spotlightRadius
        );
        grad.addColorStop(0, isLight ? 'rgba(255, 106, 19, 0.05)' : 'rgba(255, 106, 19, 0.065)');
        grad.addColorStop(0.55, isLight ? 'rgba(56, 189, 248, 0.022)' : 'rgba(56, 189, 248, 0.03)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(
          state.mouseX - spotlightRadius,
          state.mouseY - spotlightRadius,
          spotlightRadius * 2,
          spotlightRadius * 2
        );

        for (var c = minCol; c <= maxCol; c++) {
          var cx = c * GRID_STEP;
          for (var r = minRow; r <= maxRow; r++) {
            var cy = Math.floor(r * GRID_STEP + gridOffsetY);
            if (cy < 0 || cy > height) continue;
            var dx = cx - state.mouseX;
            var dy = cy - state.mouseY;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < spotlightRadius) {
              var factor = 1 - dist / spotlightRadius;
              var alpha = factor * factor * (isLight ? 0.28 : 0.36);
              ctx.strokeStyle = 'rgba(255, 106, 19, ' + alpha.toFixed(3) + ')';
              ctx.beginPath();
              ctx.moveTo(cx - 3.5, cy + 0.5);
              ctx.lineTo(cx + 4.5, cy + 0.5);
              ctx.moveTo(cx + 0.5, cy - 3.5);
              ctx.lineTo(cx + 0.5, cy + 4.5);
              ctx.stroke();
            }
          }
        }
      }

      // -----------------------------------------------------------------------
      // LAYER 3: Fiber-Optic Data Pulses (Sleek Peripheral Telemetry Beams)
      // -----------------------------------------------------------------------
      ctx.lineWidth = 1.5;
      for (var p = 0; p < pulses.length; p++) {
        var pulse = pulses[p];
        pulse.pos += pulse.speed * pulse.dir;

        var maxCoord = pulse.isVertical ? height : width;
        if (pulse.dir > 0 && pulse.pos - pulse.length > maxCoord) {
          pulses[p] = spawnPulse(p, false);
          continue;
        } else if (pulse.dir < 0 && pulse.pos + pulse.length < 0) {
          pulses[p] = spawnPulse(p, false);
          continue;
        }

        var headX, headY, tailX, tailY;
        if (pulse.isVertical) {
          var px = pulse.col * GRID_STEP + 0.5;
          if (width >= 960 && Math.abs(px - width * 0.5) < width * 0.28) continue;
          headX = px;
          tailX = px;
          headY = pulse.pos;
          tailY = pulse.pos - pulse.length * pulse.dir;
        } else {
          var py = Math.floor(pulse.row * GRID_STEP + gridOffsetY) + 0.5;
          if (py < 0 || py > height) continue;
          headY = py;
          tailY = py;
          headX = pulse.pos;
          tailX = pulse.pos - pulse.length * pulse.dir;
        }

        var rgb = pulse.isCyan ? '56, 189, 248' : '255, 106, 19';
        var peakAlpha = isLight ? 0.26 : 0.34;

        var beamGrad = ctx.createLinearGradient(tailX, tailY, headX, headY);
        beamGrad.addColorStop(0, 'rgba(' + rgb + ', 0)');
        beamGrad.addColorStop(0.85, 'rgba(' + rgb + ', ' + (peakAlpha * 0.7).toFixed(3) + ')');
        beamGrad.addColorStop(1, 'rgba(' + rgb + ', ' + peakAlpha.toFixed(3) + ')');

        ctx.strokeStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(' + rgb + ', ' + (peakAlpha * 1.2).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(headX, headY, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // -----------------------------------------------------------------------
      // LAYER 4: Constellation Micro-Nodes
      // -----------------------------------------------------------------------
      var nodePositions = [];
      for (var i = 0; i < nodes.length; i++) {
        var nd = nodes[i];
        var nx = nd.xFrac * width;
        var ny = ((nd.yBase - state.scrollY * nd.depth) % (height + 200));
        if (ny < -50) ny += height + 200;
        nodePositions.push({ x: nx, y: ny, isAccent: nd.isAccent, radius: nd.radius });

        ctx.fillStyle = nd.isAccent
          ? isLight
            ? 'rgba(255, 106, 19, 0.22)'
            : 'rgba(255, 106, 19, 0.28)'
          : isLight
            ? 'rgba(100, 116, 139, 0.18)'
            : 'rgba(148, 163, 184, 0.22)';
        ctx.beginPath();
        ctx.arc(nx, ny, nd.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.lineWidth = 0.75;
      for (var a = 0; a < nodePositions.length; a++) {
        for (var b = a + 1; b < nodePositions.length; b++) {
          var dxNode = nodePositions[a].x - nodePositions[b].x;
          var dyNode = nodePositions[a].y - nodePositions[b].y;
          var dNode = Math.sqrt(dxNode * dxNode + dyNode * dyNode);
          if (dNode < 145) {
            var lineAlpha = (1 - dNode / 145) * (isLight ? 0.07 : 0.09);
            ctx.strokeStyle = isLight
              ? 'rgba(71, 85, 105, ' + lineAlpha.toFixed(3) + ')'
              : 'rgba(148, 163, 184, ' + lineAlpha.toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(nodePositions[a].x, nodePositions[a].y);
            ctx.lineTo(nodePositions[b].x, nodePositions[b].y);
            ctx.stroke();
          }
        }
      }

      // -----------------------------------------------------------------------
      // LAYER 5: Multi-Line Syntax-Highlighted Code Blocks & Live Typing Stream
      // -----------------------------------------------------------------------
      var fontSize = width < 768 ? 10 : 11.5;
      var lineHeight = width < 768 ? 15 : 17;
      ctx.font = '500 ' + fontSize + 'px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

      var wrapHeight = Math.max(height + 420, 1350);
      var blinkOn = Math.floor(t / 520) % 2 === 0;

      for (var cb = 0; cb < codeBlocks.length; cb++) {
        var block = codeBlocks[cb];
        // On small mobile screens, skip right-column blocks that could clip awkwardly
        if (width < 640 && cb % 2 === 1 && !block.isWatermark) continue;

        var bx = width < 960
          ? (cb % 2 === 0 ? 16 : Math.max(24, width * 0.42))
          : block.xFrac * width;

        var by = ((block.yBase - state.scrollY * block.depth) % wrapHeight);
        if (by < -140) by += wrapHeight;
        if (by > height + 40) continue;

        // Calculate proximity to cursor so the code block illuminates when hovered nearby
        var blockCenterX = bx + 140;
        var blockCenterY = by + (block.lines.length * lineHeight) * 0.5;
        var dxB = blockCenterX - state.mouseX;
        var dyB = blockCenterY - state.mouseY;
        var distB = Math.sqrt(dxB * dxB + dyB * dyB);
        var hoverBoost = distB < 340 ? Math.pow(1 - distB / 340, 1.5) * 0.26 : 0;

        var baseAlpha = block.isWatermark
          ? (isLight ? 0.095 : 0.11)
          : (width < 960 ? (isLight ? 0.14 : 0.16) : (isLight ? 0.22 : 0.25));
        var blockAlpha = Math.min(0.55, baseAlpha + hoverBoost);

        // Subtle vertical code gutter guide line on the left of each snippet
        ctx.strokeStyle = isLight
          ? 'rgba(255, 106, 19, ' + (blockAlpha * 0.55).toFixed(3) + ')'
          : 'rgba(255, 106, 19, ' + (blockAlpha * 0.65).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx - 8, by - 10);
        ctx.lineTo(bx - 8, by + (block.lines.length - 1) * lineHeight + 4);
        ctx.stroke();

        // Live typing progress on the last non-closing line of the block
        var totalChars = 0;
        for (var l = 0; l < block.lines.length; l++) {
          totalChars += block.lines[l].text.length;
        }
        var cycleChars = Math.floor((t * block.speed + cb * 45) % (totalChars + 60));

        var charBudget = cycleChars;
        for (var ln = 0; ln < block.lines.length; ln++) {
          var lineObj = block.lines[ln];
          var ly = by + ln * lineHeight;

          // Line number in subtle muted slate
          ctx.fillStyle = getSyntaxColor('comment', blockAlpha * 0.65, isLight);
          ctx.fillText(lineObj.num, bx, ly);

          // Determine visible characters for live typing effect
          var fullText = lineObj.text;
          var visibleText = fullText;
          var isTypingLine = false;
          if (!state.reducedMotion) {
            if (charBudget <= 0) {
              visibleText = '';
            } else if (charBudget < fullText.length) {
              visibleText = fullText.slice(0, charBudget);
              isTypingLine = true;
            }
            charBudget -= fullText.length;
          }

          if (visibleText.length > 0) {
            ctx.fillStyle = getSyntaxColor(lineObj.tag, blockAlpha, isLight);
            var codeX = bx + 24;
            ctx.fillText(visibleText, codeX, ly);

            // Blinking developer cursor at the active typing point
            if (isTypingLine && blinkOn) {
              var textW = ctx.measureText(visibleText).width;
              ctx.fillStyle = isLight
                ? 'rgba(255, 106, 19, ' + Math.min(0.65, blockAlpha * 1.6).toFixed(3) + ')'
                : 'rgba(56, 189, 248, ' + Math.min(0.75, blockAlpha * 1.7).toFixed(3) + ')';
              ctx.fillRect(codeX + textW + 2, ly - fontSize + 2, 5.5, fontSize);
            }
          }
        }
      }

      // -----------------------------------------------------------------------
      // LAYER 6: Floating Single-Line Code & Telemetry Expressions
      // -----------------------------------------------------------------------
      ctx.font = '500 ' + (fontSize - 1) + 'px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      for (var k = 0; k < tokens.length; k++) {
        var tk = tokens[k];
        if (width < 768 && k % 2 === 1) continue;
        var tx = tk.xFrac * width;
        var ty = ((tk.yBase - state.scrollY * tk.depth) % (height + 340));
        if (ty < -40) ty += height + 340;

        var dxT = (tx + 90) - state.mouseX;
        var dyT = ty - state.mouseY;
        var distT = Math.sqrt(dxT * dxT + dyT * dyT);
        var tokenBoost = distT < 260 ? (1 - distT / 260) * 0.22 : 0;
        var tokenAlpha = (isLight ? 0.16 : 0.19) + tokenBoost;

        ctx.fillStyle = getSyntaxColor(tk.tag || 'code', tokenAlpha, isLight);
        ctx.fillText(tk.label, tx, ty);
      }

      if (!state.reducedMotion && !document.hidden) {
        window.requestAnimationFrame(renderFrame);
      }
    }

    renderFrame(performance.now());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFuturisticTechExperience);
  } else {
    initFuturisticTechExperience();
  }
})();
