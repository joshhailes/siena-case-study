// Siena hero: scroll flies the camera up through the oculus.
// The Gaussian splat renderer it uses (createWorker, the shaders, the matrix helpers) is in vendor/splat.js.
//
// Switches for testing, in the URL:
//   ?q=full   the 3D on a phone or tablet too        ?q=lite  the flat photo on desktop too
//   ?stats    frame rate and sort time, bottom right  ?tick    frames on a timer, for a hidden tab
//             (where requestAnimationFrame pauses)
(function () {
  const $ = (s) => document.querySelector(s),
    $$ = (s) => [...document.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const qs = new URLSearchParams(location.search);
  // phones and tablets skip the 3D (too heavy): the photo itself flies up into the oculus instead
  const phone = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) <= 900;
  const lite = qs.get('q') === 'lite' || (phone && qs.get('q') !== 'full');
  const SPLAT = 'splat/oculus.splat';
  const stat = { fps: 0, p95: 0, sortMs: 0, splats: 0, file: SPLAT, loadMs: 0 },
    times = [],
    sorts = [];
  const raf = qs.has('tick') ? (cb) => setTimeout(() => cb(performance.now()), 33) : (cb) => requestAnimationFrame(cb);
  const fly = $('#fly'),
    hero = $('#hero'),
    stage = $('#stage'),
    canvas = $('#gl');
  const edgeEl = document.querySelector('.edgefade'),
    sky = $('#sky'),
    ktc = $('#ktc'),
    cl = $('#cornerL'),
    cr = $('#cornerR'),
    tofade = $('#tofade'),
    skyfill = $('#skyfill'),
    skyback = $('#skyback');
  const pins = $$('.pin'),
    frameEl = $('.frame'),
    plate = $('#plate'),
    ring = $('#ring');
  const pinsBox = $('.pins');
  const ktcIn = $('#ktc > div');
  // clouds: where they sit in the picture (a, fractions of the stage). As you fly up each one travels straight outwards,
  // along the line from the centre of the oculus through the cloud, until 40% of it is off the screen (any screen size)
  const OCULUS = [0.5, 0.5],
    CLOUD_OUT = 0.4;
  const CLOUDS = [
    { el: $('#cloudA'), a: [0.413, 0.223], s: 1.9 },
    { el: $('#cloudB'), a: [0.664, 0.691], s: 2.1 },
  ];
  // sizes, read once per resize (never in the middle of a frame's style writes)
  const SZ = { W: 1, H: 1, heroH: 1, stageH: 1, fh: 1, ft: 0 };
  const measure = () => {
    SZ.W = pinsBox.clientWidth || 1;
    SZ.H = pinsBox.clientHeight || 1;
    SZ.heroH = hero.clientHeight;
    SZ.stageH = stage.clientHeight || 1;
    SZ.fh = frameEl.offsetHeight;
    SZ.ft = frameEl.offsetTop;
    // where each cloud must move (in stage px) so its centre ends on its viewport target: undo the frame's end-of-flight
    // transform (the same numbers overlays() uses once the zoom has finished), measured afresh on every resize
    const vw = hero.clientWidth || 1,
      vh = SZ.heroH || 1,
      fw = frameEl.offsetWidth,
      fh = SZ.fh,
      fl = frameEl.offsetLeft,
      ft = SZ.ft;
    const sw = stage.clientWidth || 1,
      sh = SZ.stageH,
      sl = stage.offsetLeft,
      st = stage.offsetTop;
    let k, ty;
    if (innerWidth <= 860) {
      k = vh / (fh * 1.03);
      ty = vh / 2 - (ft + fh / 2);
    } else {
      k = Math.max((vh + 2) / sh, 1.04);
      ty = -30;
    }
    // stage px -> screen px once the zoom has finished, and back
    const fwd = (x, y) => [fl + fw / 2 + (sl + x - fw / 2) * k, ft + fh / 2 + ty + (st + y - fh / 2) * k];
    const back = (X, Y) => [fw / 2 + (X - fl - fw / 2) / k - sl, fh / 2 + (Y - ft - ty - fh / 2) / k - st];
    const O = fwd(OCULUS[0] * sw, OCULUS[1] * sh);
    for (const c of CLOUDS) {
      if (!c.el || !c.el.offsetWidth) continue;
      const C = fwd(c.a[0] * sw, c.a[1] * sh),
        w = c.el.offsetWidth * c.s * k,
        h = c.el.offsetHeight * c.s * k;
      let dx = C[0] - O[0],
        dy = C[1] - O[1];
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      // distance along the ray until 40% of the cloud's width (or height) is past the edge it is heading for
      const keep = 0.5 - CLOUD_OUT,
        ts = [];
      if (dx < -1e-3) ts.push((C[0] - keep * w) / -dx);
      if (dx > 1e-3) ts.push((vw - keep * w - C[0]) / dx);
      if (dy < -1e-3) ts.push((C[1] - keep * h) / -dy);
      if (dy > 1e-3) ts.push((vh - keep * h - C[1]) / dy);
      const t = Math.max(0, Math.min(...ts)),
        P = back(C[0] + dx * t, C[1] + dy * t);
      c.d = [P[0] - c.a[0] * sw, P[1] - c.a[1] * sh];
    }
  };
  measure();
  CLOUDS.forEach((c) => c.el && c.el.addEventListener('load', measure));
  new ResizeObserver(measure).observe(pinsBox);
  new ResizeObserver(measure).observe(hero);
  const put = (el, k, v) => {
    const c = el._s || (el._s = {});
    if (c[k] !== v) {
      c[k] = v;
      el.style[k] = v;
    }
  };
  const ss = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  // The flight is timed on a 0..1 scale, but the hero lets go at .8 of it, so there's no long hold after
  // "Know thy customer" lands (the #fly section is sized to match)
  const PEND = 0.8;
  const progress = () => {
    const r = fly.getBoundingClientRect(),
      tot = fly.offsetHeight - innerHeight;
    return tot > 0 ? PEND * Math.min(1, Math.max(0, -r.top / tot)) : 0;
  };

  // SHARP's camera for this image (written by convert.py)
  let CAM = { width: 1672, height: 941, fx: 1330.3, fy: 1330.3, cx: 836, cy: 470.5 };
  const TRAVEL = 3.0; // metres the camera rises; ceiling ~2.2 m, people 2.3–2.8 m, sky far beyond
  const anchorDepth = new Map(); // per pin, the depth of the person it belongs to

  if (reduce) pins.forEach((p) => (p.dataset.shown = 1));
  else
    pins.forEach((p, i) =>
      setTimeout(
        () => {
          p.dataset.shown = 1;
          p._shownAt = performance.now();
        },
        +p.dataset.delay || (p.classList.contains('halo') ? 1000 : 1600 + (i % 6) * 260),
      ),
    );
  // hovering (or tapping) a card lights up that person's halo
  const cardsEl = $$('.pin.card');
  cardsEl.forEach((c, i) => {
    const h = $(`.halo[data-who="${c.dataset.who}"]`);
    const on = () => h && h.classList.add('lit'),
      off = () => {
        if (h && !c.classList.contains('open')) h.classList.remove('lit');
      };
    c.addEventListener('mouseenter', on);
    c.addEventListener('mouseleave', off);
    c.addEventListener('focus', on);
    c.addEventListener('blur', off);
    c.addEventListener('click', () => {
      const open = !c.classList.contains('open');
      cardsEl.forEach((o) => {
        o.classList.remove('open');
        const oh = $(`.halo[data-who="${o.dataset.who}"]`);
        if (oh) oh.classList.remove('lit');
      });
      if (open) {
        c.classList.add('open');
        on();
      }
    });
  });
  // hovering someone's face (or halo) opens their card; tapping it toggles it
  $$('.pin.hit').forEach((hz) => {
    const c = $(`.pin.card[data-who="${hz.dataset.who}"]`),
      h = $(`.halo[data-who="${hz.dataset.who}"]`);
    if (!c) return;
    hz.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      c.classList.add('hov');
      if (h) h.classList.add('lit');
    });
    hz.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse') return;
      c.classList.remove('hov');
      if (h && !c.classList.contains('open') && !c.matches(':hover')) h.classList.remove('lit');
    });
    hz.addEventListener('click', () => c.click());
  });

  // ---- card tint: a small, pre-blurred copy of the picture; each card samples the patch behind it
  let tintPx = null;
  const TW = 96,
    TH = 54;
  (() => {
    const img = new Image();
    img.src = plate.currentSrc || plate.src;
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = TW;
      c.height = TH;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.filter = 'blur(2px)';
      x.drawImage(img, -4, -4, TW + 8, TH + 8);
      tintPx = x.getImageData(0, 0, TW, TH).data;
    };
  })();
  const cardSize = new Map();
  const ro = new ResizeObserver((es) =>
    es.forEach((e) => cardSize.set(e.target, [e.target.offsetWidth, e.target.offsetHeight])),
  );
  $$('.pin.card').forEach((c) => ro.observe(c));
  const sample = (u, v) => {
    const x = Math.min(TW - 1, Math.max(0, Math.round(u * TW))),
      y = Math.min(TH - 1, Math.max(0, Math.round(v * TH))),
      i = (y * TW + x) * 4;
    return `rgb(${tintPx[i]},${tintPx[i + 1]},${tintPx[i + 2]})`;
  };
  function tint(el, r, zb, travel, al) {
    if (!tintPx) return;
    const sz = cardSize.get(el);
    if (!sz) return;
    const W = SZ.W,
      H = SZ.H;
    const w = (sz[0] * r.s) / W,
      h = (sz[1] * r.s) / H;
    const x0 = r.x - (al === 'r' ? w : al === 'l' ? 0 : w / 2),
      y0 = r.y - (al === 'a' ? h : al === 'b' ? 0 : h / 2);
    // screen point -> picture point at the depth of the wall/person behind the card (inverse of project())
    const cx = CAM.cx / CAM.width,
      cy = CAM.cy / CAM.height,
      k = 1 - travel / zb;
    const U = (xs) => cx + (xs - cx) * k,
      V = (ys) => cy + (ys - cy) * k;
    const ym = V(y0 + h * 0.35),
      yb = V(y0 + h * 1.1);
    const key = [
      sample(U(x0 - w * 0.05), ym),
      sample(U(x0 + w * 0.5), ym),
      sample(U(x0 + w * 1.05), ym),
      sample(U(x0 + w * 0.5), yb),
    ];
    const s = key.join();
    if (el._tint === s) return;
    el._tint = s;
    el.style.setProperty('--g0', key[0]);
    el.style.setProperty('--g1', key[1]);
    el.style.setProperty('--g2', key[2]);
    el.style.setProperty('--gb', key[3]);
  }

  const project = (u, v, z, travel) => {
    const X = ((u * CAM.width - CAM.cx) / CAM.fx) * z,
      Y = ((v * CAM.height - CAM.cy) / CAM.fy) * z,
      dz = z - travel;
    return {
      x: ((CAM.fx * X) / Math.max(dz, 0.05) + CAM.cx) / CAM.width,
      y: ((CAM.fy * Y) / Math.max(dz, 0.05) + CAM.cy) / CAM.height,
      s: z / Math.max(dz, 0.05),
      vis: dz > 0.25,
    };
  };

  function overlays(p, travel) {
    // every write goes through put(): it only touches the style when the value actually changed
    const hs = 2.6 / Math.max(0.05, 2.6 - travel * 0.9),
      f = (x) => (+x).toFixed(3);
    put(sky, 'opacity', f(1 - ss(0.02, 0.2, p)));
    put(sky, 'transform', `translate(-50%, -50%) scale(${f(hs)})`);
    const k = ss(0, 0.07, p);
    for (const c of [cl, cr]) {
      put(c, 'opacity', f(1 - k));
      put(c, 'transform', `translateY(${f(k * 20)}px)`);
    }
    // Know thy customer: in the scene behind the people; from the start of the camera move it rises from below and settles in the middle
    const ke = ss(0.03, 0.64, p); // even rise across the whole camera move
    put(ktc, 'opacity', f(ss(0.03, 0.2, p)));
    // on phones the whole frame zooms ~2x to fill the screen (below), so undo that zoom for the words or they run off the sides
    const zoom = innerWidth <= 860 ? 1 + (SZ.heroH / (SZ.fh * 1.03) - 1) * ss(0, 0.3, p) : 1;
    put(ktcIn, 'transform', `translateY(${f((1 - ke) * SZ.H * 0.55)}px) scale(${f((0.8 + 0.2 * ke) / zoom)})`); // flat; grows a little as you rise towards it
    // clouds drift out to the edges and grow as you rise towards them
    const cg = ss(0.06, 0.75, p),
      ce = cg * cg * (3 - 2 * cg);
    for (const c of CLOUDS)
      if (c.el && c.d)
        put(c.el, 'transform', `translate(${f(c.d[0] * ce)}px, ${f(c.d[1] * ce)}px) scale(${f(1 + (c.s - 1) * ce)})`);
    put(skyfill, 'opacity', f(ss(0.5, 0.78, p)));
    // the plaster edge belongs to the picture: it fades away as you fly into the sky
    if (edgeEl) put(edgeEl, 'opacity', f(1 - ss(0.08, 0.3, p)));
    // a custom property on the hero restyles everything inside it, so only set it when it changes
    const sc = f(1 - ss(0.04, 0.3, p));
    if (hero._scrim !== sc) {
      hero._scrim = sc;
      hero.style.setProperty('--scrim', sc);
    }
    put(tofade, 'opacity', f(ss(0.95, 1, p)));
    put(skyback, 'transform', `scale(${(170 / (170 - travel)).toFixed(4)})`);
    if (innerWidth <= 860) {
      const g = ss(0, 0.3, p),
        fh = SZ.fh,
        ft = SZ.ft;
      const kk = 1 + (SZ.heroH / (fh * 1.03) - 1) * g,
        dy = (SZ.heroH / 2 - (ft + fh / 2)) * g;
      put(frameEl, 'transform', `translateY(${f(dy)}px) scale(${kk.toFixed(4)})`);
    } else {
      const g = ss(0, 0.18, p),
        cover = (SZ.heroH + 2) / SZ.stageH;
      put(frameEl, 'transformOrigin', '50% 50%');
      put(
        frameEl,
        'transform',
        g > 0 ? `translateY(${f(-30 * g)}px) scale(${(1 + (Math.max(cover, 1.04) - 1) * g).toFixed(4)})` : '',
      );
    }
    // on smaller screens each card sits just below the person's head (above it for the two at the bottom) and opens
    // downwards (upwards), centred, kept inside the frame, so it is never cut off at the side
    const small = innerWidth <= 1280;
    for (const el of pins) {
      const isCard = el.classList.contains('card');
      let u = +el.dataset.u,
        v = +el.dataset.v,
        al = el.dataset.al;
      if (small && isCard) {
        const dv = +el.dataset.dv,
          below = dv < 0.65;
        u = +el.dataset.du;
        v = dv + (below ? 0.1 : -0.1);
        al = below ? 'b' : 'a';
      }
      const z0 = anchorDepth.get(el) || 2.45,
        z = isCard ? Math.min(1.7, z0 * 0.62) : z0;
      const r = project(u, v, z, travel);
      const tx = al === 'l' ? '0%' : al === 'r' ? '-100%' : '-50%',
        ty = al === 'a' ? '-100%' : al === 'b' ? '0%' : '-50%';
      let X = r.x * SZ.W;
      if (al === 'a' || al === 'b') {
        const sz = cardSize.get(el);
        if (sz) {
          const hw = (sz[0] * r.s) / 2 + 10;
          X = Math.min(SZ.W - hw, Math.max(hw, X));
        }
      }
      if (isCard)
        put(
          el,
          'transformOrigin',
          al === 'l'
            ? 'left center'
            : al === 'r'
              ? 'right center'
              : al === 'a'
                ? 'center bottom'
                : al === 'b'
                  ? 'center top'
                  : 'center',
        );
      put(
        el,
        'transform',
        `translate(${X.toFixed(1)}px, ${(r.y * SZ.H).toFixed(1)}px) translate(${tx}, ${ty}) scale(${r.s.toFixed(4)})`,
      );
      const big = el.classList.contains('halo') ? 1 - ss(1.1, 1.45, r.s) : 1 - ss(1.6, 2.6, r.s);
      const fadeIn = el._shownAt ? ss(0, 600, performance.now() - el._shownAt) : el.dataset.shown ? 1 : 0;
      const op = r.vis ? big * fadeIn : 0;
      put(el, 'opacity', op.toFixed(3));
      // a faded card isn't drawn at all, and a card that's flying at the camera drops its (costly) glass blur
      // stays visible at opacity 0, so the browser keeps it ready (hiding it meant redrawing all 12 when they came back)
      put(el, 'pointerEvents', op < 0.01 ? 'none' : '');
      if (isCard && op > 0.01) tint(el, { x: X / SZ.W, y: r.y, s: r.s }, z0, travel, al);
    }
  }

  let travel = 0,
    live = false;
  const still = () => {
    if (live) return;
    const p = progress();
    if (lite && !reduce) {
      // the same camera rise as the 3D, faked by zooming the photo about the oculus at the people's depth
      const target = TRAVEL * eio(Math.min(1, p / PEND));
      travel += (target - travel) * 0.25;
      const k = Math.min(6, 2.45 / Math.max(0.4, 2.45 - travel));
      put(ring, 'transform', `scale(${k.toFixed(4)})`);
      put(ring, 'opacity', (1 - ss(2.5, 5, k)).toFixed(3));
      overlays(p, travel);
    } else overlays(p, 0);
    raf(still);
  };
  raf(still);

  async function start() {
    if (reduce) return;
    try {
      CAM = { ...CAM, ...(await (await fetch('splat/camera.json')).json()) };
    } catch {}
    if (lite) {
      // the cut-out rim and people (transparent sky), only fetched here
      ring.onload = () => hero.classList.add('lite');
      ring.src = 'flat/oculus-ring-2600.webp';
      return;
    }
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: true, premultipliedAlpha: true });
    if (!gl) return;
    const tLoad = performance.now(),
      req = await fetch(SPLAT);
    if (!req.ok) return;
    const rowLength = 32;
    // Content-Length is only the true size when the file isn't compressed in transit (Vercel compresses it),
    // so start from it when it's trustworthy and grow the buffer as the data arrives.
    const len = req.headers.get('content-encoding') ? 0 : +req.headers.get('content-length');
    let splatData = new Uint8Array(len > 0 ? len : 16 * 1024 * 1024);

    const worker = new Worker(
      URL.createObjectURL(new Blob(['(', createWorker.toString(), ')(self)'], { type: 'application/javascript' })),
    );
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
      return s;
    };
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShaderSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShaderSource));
    gl.linkProgram(program);
    gl.useProgram(program);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE_MINUS_DST_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE);
    gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
    gl.clearColor(0, 0, 0, 0);
    const u_projection = gl.getUniformLocation(program, 'projection'),
      u_viewport = gl.getUniformLocation(program, 'viewport');
    const u_focal = gl.getUniformLocation(program, 'focal'),
      u_view = gl.getUniformLocation(program, 'view');
    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-2, -2, 2, -2, 2, 2, -2, 2]), gl.STATIC_DRAW);
    const a_position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);
    const ib = gl.createBuffer(),
      a_index = gl.getAttribLocation(program, 'index');
    gl.enableVertexAttribArray(a_index);
    gl.bindBuffer(gl.ARRAY_BUFFER, ib);
    gl.vertexAttribIPointer(a_index, 1, gl.INT, false, 0, 0);
    gl.vertexAttribDivisor(a_index, 1);

    // The stage box has the image's aspect, so the splat's own camera maps straight onto it.
    let projectionMatrix,
      dirty = true;
    // resizing the canvas clears it, and the new projection needs a fresh depth sort, so always redraw after a resize
    const resize = () => {
      const w = stage.clientWidth,
        h = stage.clientHeight,
        k = w / CAM.width,
        dpr = Math.min(devicePixelRatio, phone ? 1.25 : 1.6, (phone ? 1400 : 2600) / w);
      gl.uniform2fv(u_focal, new Float32Array([CAM.fx * k, CAM.fy * k]));
      projectionMatrix = getProjectionMatrix(CAM.fx * k, CAM.fy * k, w, h);
      gl.uniform2fv(u_viewport, new Float32Array([w, h]));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniformMatrix4fv(u_projection, false, projectionMatrix);
      dirty = true;
    };
    // the stage can change size without the window doing so (breakpoints, scrollbars), so watch the stage itself
    let rsT = 0;
    const onResize = () => {
      cancelAnimationFrame(rsT);
      rsT = requestAnimationFrame(resize);
    };
    addEventListener('resize', onResize);
    new ResizeObserver(onResize).observe(stage);
    resize();

    let vertexCount = 0;
    worker.onmessage = (e) => {
      if (e.data.texdata) {
        const { texdata, texwidth, texheight } = e.data;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32UI, texwidth, texheight, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT, texdata);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
      } else if (e.data.depthIndex) {
        gl.bindBuffer(gl.ARRAY_BUFFER, ib);
        gl.bufferData(gl.ARRAY_BUFFER, e.data.depthIndex, gl.DYNAMIC_DRAW);
        vertexCount = e.data.vertexCount;
        dirty = true;
        if (e.data.sortMs != null) {
          sorts.push(e.data.sortMs);
          if (sorts.length > 30) sorts.shift();
        }
      }
    };

    // Camera: straight up the axis, plus a tiny slow drift so the scene breathes in real 3D while you read
    let t0 = performance.now(),
      last = t0,
      lastP = -1;
    const frame = (now) => {
      times.push(now - last);
      if (times.length > 120) times.shift();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = progress(),
        target = TRAVEL * eio(Math.min(1, p / PEND));
      if (window.__snapTravel) {
        travel = target;
        window.__snapTravel = false;
      } // a jump behind the veil: no visible rewind
      else travel += (target - travel) * Math.min(1, dt * 7);
      const s = (now - t0) / 1000,
        idle = 1 - ss(0, 0.15, p);
      const dx = 0,
        dy = 0;
      // drift: a few pixels of slow sway on the whole frame, done by the compositor, not by redrawing the 3D
      frameEl.style.translate =
        idle > 0.01
          ? `${(Math.sin(s * 0.21) * 5 * idle).toFixed(2)}px ${(Math.cos(s * 0.17) * 3.5 * idle).toFixed(2)}px`
          : '0 0';
      const view = getViewMatrix({
        position: [dx, dy, travel],
        rotation: [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1],
        ],
      });
      const moving = p !== lastP || Math.abs(target - travel) > 1e-4;
      lastP = p;
      if (!moving && !dirty) {
        overlays(p, travel);
        raf(frame);
        return;
      }
      dirty = false;
      if (fly.getBoundingClientRect().bottom > 0) {
        worker.postMessage({ view: multiply4(projectionMatrix, view) });
        gl.uniformMatrix4fv(u_view, false, view);
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (vertexCount > 0) gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, vertexCount);
      }
      overlays(p, travel);
      raf(frame);
    };

    // Stream the file in; the biggest splats come first, so the picture fills in quickly
    const reader = req.body.getReader();
    let bytesRead = 0,
      posted = -1;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (bytesRead + value.length > splatData.length) {
        const grown = new Uint8Array(Math.ceil(Math.max(splatData.length * 1.5, bytesRead + value.length) / 32) * 32);
        grown.set(splatData.subarray(0, bytesRead));
        splatData = grown;
      }
      splatData.set(value, bytesRead);
      bytesRead += value.length;
      const n = Math.floor(bytesRead / rowLength);
      if (n - posted > 150000) {
        worker.postMessage({ buffer: splatData.buffer, vertexCount: n });
        posted = n;
      }
    }
    worker.postMessage({ buffer: splatData.buffer, vertexCount: Math.floor(bytesRead / rowLength) });

    // depth of each person under their pin: median depth of splats that land near the anchor
    const f32 = new Float32Array(splatData.buffer),
      N = Math.floor(bytesRead / rowLength),
      near = pins.map(() => []);
    for (let i = 0; i < N; i += 3) {
      const x = f32[i * 8],
        y = f32[i * 8 + 1],
        z = f32[i * 8 + 2];
      if (z > 20) continue;
      const u = ((CAM.fx * x) / z + CAM.cx) / CAM.width,
        v = ((CAM.fy * y) / z + CAM.cy) / CAM.height;
      pins.forEach((el, k) => {
        if (Math.abs(u - el.dataset.du) < 0.012 && Math.abs(v - el.dataset.dv) < 0.02) near[k].push(z);
      });
    }
    pins.forEach((el, k) => {
      const a = near[k].sort((m, n) => m - n);
      if (a.length) anchorDepth.set(el, a[a.length >> 1]);
    });

    stat.splats = N;
    stat.loadMs = Math.round(performance.now() - tLoad);
    if (qs.has('stats'))
      setInterval(() => {
        const s = [...times].sort((a, b) => a - b);
        stat.fps = Math.round(1000 / (times.reduce((a, b) => a + b, 0) / Math.max(1, times.length)));
        stat.p95 = +(s[Math.floor(s.length * 0.95)] || 0).toFixed(1);
        stat.sortMs = Math.round(sorts.reduce((a, b) => a + b, 0) / Math.max(1, sorts.length));
        let el = document.getElementById('splatstats');
        if (!el) {
          el = document.createElement('div');
          el.id = 'splatstats';
          el.style.cssText =
            'position:fixed;right:8px;bottom:8px;z-index:99;font:11px/1.4 ui-monospace,monospace;background:rgba(0,0,0,.7);color:#fff;padding:6px 8px;border-radius:6px;white-space:pre';
          document.body.appendChild(el);
        }
        el.textContent = `${stat.file.split('/').pop()} · ${(stat.splats / 1000).toFixed(0)}k · load ${(stat.loadMs / 1000).toFixed(1)}s\n${stat.fps} fps · p95 ${stat.p95} ms · sort ${stat.sortMs} ms`;
      }, 500);
    live = true;
    raf(frame);
    setTimeout(() => hero.classList.add('gl'), 250);
  }
  start().catch((err) => console.warn('Splat hero unavailable, showing the still image', err));
})();
