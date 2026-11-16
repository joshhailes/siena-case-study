import { animate, scroll, inView, stagger } from 'https://cdn.jsdelivr.net/npm/motion@11.18.2/+esm';

// Their testimonials, word for word from siena.cx
const TESTIMONIALS = [
  // [photo, quote, name, role · company, story title]; portraits re-lit to sit with the page
  [
    'kylah.jpg',
    'Siena felt like a girlfriend from day one. It handles 50% of our conversations at 90%+ CSAT, cut handle time in half, and customers ask for it by name. I’m winning budget conversations against marketing because I can tie CX directly to revenue.',
    'Kylah Field',
    'VP of Global CX & Insights · SPANX',
    'How Spanx Turned CX Into a Business Driver and Cut Handle Time in Half',
  ],
  [
    'paige.jpg',
    'With Siena, we’ve shifted CX from being a cost center to a revenue driver. That transformation has been a game-changing unlock for our business.',
    'Paige Zachs',
    'VP Supply Chain, Operations & Customer · Coterie',
    'Coterie Turns CX into a Revenue Engine with 65% AI Automation',
  ],
  [
    'jessica.jpg',
    'The quality of response that Siena comes up with is phenomenal. We’ve even taken inspiration from her responses and added them to our existing customer-facing communications.',
    'Jessica Weiss',
    'CX Lead Product Partner · Prose',
    'Prose’s Perfect Formula: Personalized Beauty Products and AI-Powered Empathic Support',
  ],
  [
    'beatriz.jpg',
    'Siena’s unique responses are what people love most. We’ve had customers say her answers inspired them to purchase, because they just felt so comfortable with her. They feel that safety with Siena, which helps them purchase.',
    'Beatriz Lopes',
    'Head of Customer Experience · Everyday Dose',
    'Everyday Dose automates over 70% of shopper inquiries with Siena',
  ],
  [
    'cate.jpg',
    'Since implementing Siena, we’ve taken back the time we spent on high ticket volume and expanded our team’s roles across marketing and product development. It’s transformed how we operate.',
    'Cate Marques',
    'CXO · Terra Kaffe',
    'How Siena helps Terra Kaffe expand CX capacity, improve CX metrics, save over $3,000 per month',
  ],
  [
    'luka.jpg',
    'We nailed the marketing engine, but we had a massive gap understanding the customer after the order hit the door. Fifteen minutes with Ask Siena told us what people actually wanted: to try other flavors without committing to a full jar. That became a sampler stick pack. It’s now going into Whole Foods, Target, and Sprouts.',
    'Luka K.',
    'CMO · True Sea Moss',
  ],
  [
    'jeremy.jpg',
    'We found Siena to be the most powerful solution for AI customer support. The nice thing is that we were able to take Siena and all the training we did with it and move it to a more enterprise CX platform that better suited our needs.',
    'Jeremy Thurswell',
    'COO · Kitsch',
    'How Kitsch automates over 68% of their customer support using Siena',
  ],
  [
    'andrew.jpg',
    'As Global Head of Customer Support at HexClad, my bar for AI is simple: it must scale without sacrificing experience. During our Q4 volume surge, Siena AI handled high-ticket volume while staying on-brand, helping us maintain quality and protect CSAT when it mattered most. Siena is a true force multiplier for modern support.',
    'Andrew Jobson',
    'Global Head of Customer Support · HexClad',
    'HexClad Boosts CX Efficiency 65% with Customer Service Automation',
  ],
];

const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = [0.16, 1, 0.3, 1];
const isPhone = () => innerWidth <= 860;
// narrow screens: measure the hero's words and buttons so the circle can leave room for them
{
  const heroEl = $('#hero'),
    cs = ['#cornerL', '#cornerR'].map((s) => $(s)).filter(Boolean);
  const fitCorner = () => {
    if (!heroEl) return;
    const h = isPhone() ? cs.reduce((a, c) => a + c.offsetHeight, 0) + 24 : 0;
    heroEl.style.setProperty('--cornerH', h + 'px');
  };
  const ro = new ResizeObserver(fitCorner);
  cs.forEach((c) => ro.observe(c));
  addEventListener('resize', fitCorner);
  fitCorner();
}
// hero cards: split each memory line into words so they can fade up in turn
$$('.pin.card .memo > span').forEach((s) => {
  const words = s.textContent.trim().split(/\s+/),
    inner = document.createElement('span');
  words.forEach((w, i) => {
    const e = document.createElement('span');
    e.className = 'w';
    e.style.setProperty('--i', i);
    e.textContent = w;
    inner.append(e, i < words.length - 1 ? ' ' : '');
  });
  s.replaceChildren(inner);
});

/* ---- Nav: bar on scroll ---- */
const nav = $('#nav');
// light text over the photo and the dark sections, ink text over plain paper, and a solid bar only once
// the bar is properly over something busy (the stories and the feature grid)
const busy = $$('[data-busy]'),
  dark = $$('.manifesto, .order, .foot'),
  flyEl = $('#fly');
let navQueued = false;
const navMode = () => {
  navQueued = false;
  const h = nav.offsetHeight,
    over = (el, inset = 0) => {
      const r = el.getBoundingClientRect();
      return r.top < h - inset && r.bottom > h * 0.5;
    };
  let mode = 'ink';
  if (busy.some((el) => over(el, -innerHeight * 0.12))) mode = 'solid';
  else if (dark.some((el) => over(el))) mode = 'light';
  else if (over(flyEl) && flyEl.getBoundingClientRect().bottom > innerHeight * 0.9) mode = 'light';
  nav.classList.toggle('scrolled', mode === 'solid');
  nav.classList.toggle('ink', mode === 'ink');
};
addEventListener(
  'scroll',
  () => {
    if (!navQueued) {
      navQueued = true;
      requestAnimationFrame(navMode);
    }
  },
  { passive: true },
);
addEventListener('resize', navMode);
navMode();

/* ---- Mega menu ---- */
const mega = $('#mega'),
  megaIn = $('.mega-in', mega);
let openKey = null,
  closeTimer;
const openMenu = (key) => {
  clearTimeout(closeTimer);
  $$('.nl[data-m]').forEach((b) => b.setAttribute('aria-expanded', b.dataset.m === key));
  $$('.mp', mega).forEach((p) => p.classList.toggle('on', p.dataset.p === key));
  if (!openKey) {
    mega.classList.add('open');
    animate(megaIn, { opacity: [0, 1], y: [-8, 0], scale: [0.985, 1] }, { duration: 0.35, ease: ease });
  } else animate($$('.mp.on', mega)[0], { opacity: [0, 1], x: [6, 0] }, { duration: 0.25 });
  openKey = key;
};
const closeMenu = () => {
  closeTimer = setTimeout(() => {
    if (!openKey) return;
    openKey = null;
    $$('.nl[data-m]').forEach((b) => b.setAttribute('aria-expanded', false));
    animate(megaIn, { opacity: 0, y: -6 }, { duration: 0.18 }).finished.then(() => {
      if (!openKey) mega.classList.remove('open');
    });
  }, 140);
};
$$('.nl[data-m]').forEach((b) => {
  b.addEventListener('mouseenter', () => openMenu(b.dataset.m));
  b.addEventListener('click', () => (openKey === b.dataset.m ? closeMenu() : openMenu(b.dataset.m)));
});
$$('.links > a, .nav-r').forEach((el) => el.addEventListener('mouseenter', closeMenu));
nav.addEventListener('mouseleave', closeMenu);
mega.addEventListener('mouseenter', () => clearTimeout(closeTimer));
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});
// the Resources menu's blog thumbnails are lazy in the markup, so they stay out of the first load;
// once the page has loaded they're fetched anyway, so they are already there the first time the menu opens
addEventListener('load', () => $$('.post img', mega).forEach((img) => (img.loading = 'eager')));

/* ---- Phone menu ---- */
const sheet = $('#sheet');
// mobile menu sections open and close smoothly: the height glides, the links rise in one after another
$$('.sheet details').forEach((d) => {
  const s = $('summary', d),
    links = () => $$('a', d);
  s.addEventListener('click', (e) => {
    e.preventDefault();
    if (reduce) {
      d.open = !d.open;
      d.classList.toggle('on', d.open);
      return;
    }
    if (d.anim) d.anim.stop();
    const from = d.offsetHeight;
    if (!d.open) {
      d.open = true;
      d.classList.add('on');
      const to = d.offsetHeight;
      d.classList.add('anim');
      d.anim = animate(d, { height: [from + 'px', to + 'px'] }, { duration: 0.5, ease: [0.22, 1, 0.36, 1] });
      d.anim.finished.then(() => {
        d.style.height = '';
        d.classList.toggle('anim', false);
      });
      animate(
        links(),
        { opacity: [0, 1], y: [8, 0] },
        { duration: 0.45, delay: stagger(0.04, { startDelay: 0.06 }), ease: [0.22, 1, 0.36, 1] },
      );
    } else {
      d.classList.toggle('on', false);
      d.classList.add('anim');
      d.anim = animate(d, { height: [from + 'px', s.offsetHeight + 'px'] }, { duration: 0.38, ease: [0.4, 0, 0.2, 1] });
      d.anim.finished.then(() => {
        d.open = false;
        d.style.height = '';
        d.classList.toggle('anim', false);
      });
    }
  });
});
$('#menuBtn').addEventListener('click', () => {
  sheet.classList.add('open');
  sheet.setAttribute('aria-hidden', 'false');
  animate(sheet, { opacity: [0, 1], y: [12, 0] }, { duration: 0.35, ease: ease });
  animate(
    $$('details, .solo, .sheet .btn', sheet),
    { opacity: [0, 1], y: [10, 0] },
    { delay: stagger(0.04, { startDelay: 0.08 }), duration: 0.4 },
  );
});
$('#sheetClose').addEventListener('click', () =>
  animate(sheet, { opacity: 0 }, { duration: 0.2 }).finished.then(() => {
    sheet.classList.remove('open');
    sheet.setAttribute('aria-hidden', 'true');
  }),
);

/* ---- Count-ups ---- */
const countUp = (el) =>
  animate(0, +el.dataset.to, { duration: 1.6, ease: ease, onUpdate: (v) => (el.textContent = Math.round(v)) });

if (reduce) {
  $$('.intro, [data-reveal]').forEach((el) => {
    el.style.opacity = 1;
    el.style.transform = 'none';
  });
} else {
  /* ---- Hero intro: the plate settles, the words rise, the halo draws round Sarah ---- */
  animate('#plate', { opacity: [0, 1] }, { duration: 1.4, ease: ease });
  animate(
    'h1 .w',
    { opacity: [0, 1], y: [28, 0], filter: ['blur(6px)', 'blur(0px)'] },
    { delay: stagger(0.08, { startDelay: 0.7 }), duration: 1.1, ease: ease },
  );
  animate(
    '.corner .intro',
    { opacity: [0, 1], y: [16, 0] },
    { delay: stagger(0.1, { startDelay: 1.2 }), duration: 0.9, ease: ease },
  );
  animate(
    '.nav > :not(.mega)',
    { opacity: [0, 1], y: [-8, 0] },
    { delay: stagger(0.06, { startDelay: 0.9 }), duration: 0.7, ease: ease },
  );
  setTimeout(() => countUp($('.hero .count')), 1400);

  /* ---- Reveals ---- */
  inView(
    '[data-reveal]',
    ({ target }) => {
      const sibs = target.parentElement.hasAttribute('data-stagger') ? [...target.parentElement.children] : [target];
      const i = Math.max(0, sibs.indexOf(target));
      animate(target, { opacity: [0, 1], y: [28, 0] }, { duration: 1, delay: i * 0.07, ease: ease });
      $$('.count', target).forEach(countUp);
    },
    { amount: 0.25 },
  );

  /* ---- Closing art drifts ---- */
  scroll(animate('#ctaArt', { y: ['-6%', '6%'], scale: [1.1, 1] }, { ease: 'linear' }), {
    target: $('#cta'),
    offset: ['start end', 'end start'],
  });
}

/* ---- Stories rail: render, drag with a mouse, progress bar ---- */
const trail = $('#trail');
// each story carries its company's logo; the job title keeps just the role
const STORY_SLUGS = {
  SPANX: 'spanx-turned-cx-business-driver-brand-experience',
  Coterie: 'siena-ai-customer-service-automation-coterie',
  Prose: 'prose',
  'Everyday Dose': 'everday-dose',
  'Terra Kaffe': 'terra-kaffe',
  'True Sea Moss': 'true-sea-moss-response-time-improvement',
  Kitsch: 'kitsch',
  HexClad: 'hexclad-customer-service-automation',
};
const STORY_LOGOS = {
  SPANX: 'marquee/06.png',
  Coterie: 'marquee/05.png',
  Prose: 'marquee/18.png',
  'Everyday Dose': 'testi/logos/everyday-dose.svg',
  'Terra Kaffe': 'marquee/35.png',
  'True Sea Moss': 'marquee/13.png',
  Kitsch: 'marquee/04.png',
  HexClad: 'marquee/07.png',
};
trail.innerHTML = TESTIMONIALS.map(([img, q, name, role0, story]) => {
  const [role, co] = role0.split(' · '),
    lg = STORY_LOGOS[co],
    slug = STORY_SLUGS[co];
  const logo = lg ? `<img class="lg" src="brand/site/${lg}" alt="${co}" loading="lazy" draggable="false">` : '';
  const link = slug
    ? `<a href="https://www.siena.cx/customer-stories/${slug}"${story ? ` title="${story}"` : ''}>Read the story →</a>`
    : '';
  return [
    `<figure class="tcard">`,
    `<img src="brand/site/testi/${img}" alt="Photo of ${name}" loading="lazy" draggable="false">`,
    `<div class="tq"><blockquote>“${q}”</blockquote>`,
    `<figcaption class="tw">${logo}<b>${name}</b><span>${lg ? role : role0}</span>${link}</figcaption>`,
    `</div></figure>`,
  ].join('');
}).join('');
let dragStartX = null,
  dragStartScroll = 0,
  moved = 0;
trail.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse') return;
  dragStartX = e.clientX;
  dragStartScroll = trail.scrollLeft;
  moved = 0;
});
addEventListener('pointermove', (e) => {
  if (dragStartX === null) return;
  const d = e.clientX - dragStartX;
  moved = Math.abs(d);
  if (moved > 4) trail.classList.add('drag');
  trail.scrollLeft = dragStartScroll - d;
});
addEventListener('pointerup', () => {
  if (dragStartX === null) return;
  dragStartX = null;
  const x = trail.scrollLeft;
  trail.classList.remove('drag');
  trail.scrollLeft = x;
});
/* ---- Feature grid: Siena's own animations play while they're on screen; the inbox card takes new conversations ---- */
$$('.fc-vis.lot').forEach((el) => {
  let anim = null;
  inView(
    el,
    () => {
      if (!window.lottie) return;
      if (!anim)
        anim = lottie.loadAnimation({
          container: el,
          renderer: 'svg',
          loop: !reduce,
          autoplay: !reduce,
          path: el.dataset.lottie,
          rendererSettings: { preserveAspectRatio: 'xMidYMax meet' },
        });
      else if (!reduce) anim.play();
      return () => anim && anim.pause();
    },
    { amount: 0.2 },
  );
});
// built the first time the card comes into view: by then the chat's helpers (defined further down) all exist
let finBuilt = false;
const buildFin = () => {
  if (finBuilt) return;
  finBuilt = true;
  const FEATURE_ROWS = [
    ['Jess Moreno', '#c27c4a', 'ig', 'Linen dress, M, held for 24h', 's', 'Sold · $148'],
    ['Owen Hart', '#6b7fd7', 'mail', 'Arrived cracked, needs it Saturday', 'p', 'Jordan · Care'],
    ['Rosa Lindqvist', '#2f8f83', 'tt', 'Swapped to the slim cut', 's', 'Resolved'],
    ['Priya Shah', '#b04fc4', 'chat', 'Sage shirt + the linen trousers', 's', 'Sold · $186'],
    ['Hana Sato', '#3d8fb0', 'phone', 'Courier delayed, new ETA Thursday', 's', 'Resolved'],
    ['Marco Bellini', '#5b6b8a', 'chat', 'Exchange to size S', 'p', 'Sam · Returns'],
    ['Leo Brandt', '#7a5c9e', 'fb', 'Shipping to Canada, duties included', 's', 'Resolved'],
    ['Tess Avery', '#d0675b', 'ig', 'Restock alert set', 's', 'Resolved'],
  ];
  const box = $('#fInboxRows'),
    VISIBLE_ROWS = 5;
  const row = ([name, col, ch, preview, kind, label], fresh) => {
    // who has it: "New" at first, then Siena's spark or the teammate's portrait, with the outcome
    const owner = () =>
      kind === 's'
        ? `<span class="siena-av">${ICONS.spark}</span>`
        : avatar(label.split(' ')[0] === 'Jordan' ? 'Jordan' : 'Sam', '#3557c5');
    return html(
      [
        `<div class="tl-row">${avatar(name, col)}`,
        `<div><div class="nm">${name}${ICONS[ch]}</div><div class="pv">${preview}</div></div>`,
        `<span class="who ${fresh ? 'n' : kind}">${fresh ? 'New' : owner() + label}</span>`,
        `</div>`,
      ].join(''),
    );
  };
  if (box) {
    let next = 0;
    for (; next < VISIBLE_ROWS; next++) box.appendChild(row(FEATURE_ROWS[next], false));
    let timer = 0;
    const tick = () => {
      if (document.hidden) return;
      const item = FEATURE_ROWS[next++ % FEATURE_ROWS.length],
        el = row(item, true),
        kids = [...box.children],
        before = kids.map((k) => k.getBoundingClientRect().top);
      box.prepend(el);
      kids.forEach((k, i) => {
        const d = before[i] - k.getBoundingClientRect().top;
        animate(k, { y: [d, 0] }, { duration: 0.7, ease: ease });
      });
      animate(el, { opacity: [0, 1], y: [-10, 0] }, { duration: 0.7, ease: ease });
      // keep at most VISIBLE_ROWS + 1 rows: anything older goes now (waiting on the fade let rows pile up while the tab was hidden)
      while (box.children.length > VISIBLE_ROWS + 2) box.lastElementChild.remove();
      const last = box.lastElementChild;
      if (box.children.length > VISIBLE_ROWS + 1 && !last._going) {
        last._going = true;
        animate(last, { opacity: 0 }, { duration: 0.3 });
        setTimeout(() => last.remove(), 320);
      }
      // a moment later Siena (or a teammate) picks it up
      setTimeout(() => {
        const w = $('.who', el),
          nw = row(item, false).querySelector('.who');
        w.replaceWith(nw);
        animate(nw, { opacity: [0, 1], scale: [0.9, 1] }, { duration: 0.5, ease: ease });
      }, 1100);
    };
    if (!reduce)
      inView(
        '#fInbox',
        () => {
          timer = setInterval(tick, 2600);
          return () => clearInterval(timer);
        },
        { amount: 0.3 },
      );
  }
};
inView(
  '#fInbox',
  () => {
    buildFin();
  },
  { margin: '0px 0px 600px 0px' },
);
{
  const feedC = $('#fChatFeed');
  const CHAT = [
    ['c', 'hiya, is there an actual person i can talk to about my order lol'],
    [
      's',
      'Hey Marco! I’m Siena, resident order-fixer. I can sort this in about four seconds, or fetch a human if you’d rather. Let me guess: the linen shirt from Tuesday?',
    ],
    ['c', 'oh ok you’ll do 😅 yeah the M is massive on me'],
    [
      's',
      'Ah, the classic “ordered an M, received a tent”. A small is on its way today and the return label for the tent is in your inbox. Also, the sage one in S is down to its last two. Between us, it’s the better colour. Want me to hold one?',
    ],
    ['c', 'ok you’re good at this. yes pls'],
    ['e', 'Exchange sent · sage shirt in S held for 24h · <b>via Shopify</b>'],
  ];
  const SOFTC = [0.22, 1, 0.36, 1];
  const bubble = ([k, txt]) => {
    if (k === 'e') return html(`<div class="fcm-ev">${txt}</div>`);
    if (k === 'c')
      return html(
        `<div class="fcm"><span class="av ph" style="background-image:url(avatars/marco.jpg)"></span><div class="bd"><p>${txt}</p></div></div>`,
      );
    return html(
      `<div class="fcm me"><span class="siena-av">${ICONS.spark}</span><div class="bd"><p>${txt}</p><span class="by">Siena</span></div></div>`,
    );
  };
  // same glide as the main chat: what's there slides up by exactly the new message's height
  const add = (el, swap) => {
    const kids = [...feedC.children],
      before = kids.map((k) => k.getBoundingClientRect().top);
    swap ? swap.replaceWith(el) : feedC.appendChild(el);
    kids.forEach((k, i) => {
      if (!k.isConnected) return;
      const d = before[i] - k.getBoundingClientRect().top;
      if (Math.abs(d) > 0.5) animate(k, { y: [d, 0] }, { duration: 0.75, ease: SOFTC });
    });
    el.style.transformOrigin = el.classList.contains('me') ? '100% 100%' : '0 100%';
    animate(
      el,
      { opacity: [0, 1], y: [12, 0], scale: [0.97, 1] },
      { duration: 0.75, ease: SOFTC, opacity: { duration: 0.35 } },
    );
  };
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  let run = 0;
  async function playChat(my) {
    while (my === run) {
      feedC.innerHTML = '';
      for (const m of CHAT) {
        if (my !== run) return;
        if (m[0] === 's') {
          const tp = html(
            `<div class="fcm me"><span class="siena-av">${ICONS.spark}</span><div class="bd"><div class="dots"><i></i><i></i><i></i></div></div></div>`,
          );
          add(tp);
          await pause(900);
          if (my !== run) return;
          await Promise.race([animate(tp, { opacity: 0 }, { duration: 0.2 }).finished, pause(260)]);
          add(bubble(m), tp);
        } else add(bubble(m));
        await pause(m[0] === 'e' ? 1100 : m[1].length > 60 ? 2100 : 1300);
      }
      await pause(3200);
      if (my !== run) return;
      const fo = animate(feedC, { opacity: [1, 0] }, { duration: 0.5 });
      await Promise.race([fo.finished, pause(600)]);
      fo.cancel();
      feedC.style.opacity = ''; // cancel, so a late-finishing fade can't leave the next loop invisible
    }
  }
  if (feedC) {
    if (reduce)
      inView(
        '#fChat',
        () => {
          if (!feedC.children.length) CHAT.forEach((m) => feedC.appendChild(bubble(m)));
        },
        { margin: '0px 0px 600px 0px' },
      );
    else
      inView(
        '#fChat',
        () => {
          const my = ++run;
          playChat(my);
          return () => {
            run++;
          };
        },
        { amount: 0.35 },
      );
  }
}
if (!reduce)
  inView(
    '#trail',
    () =>
      animate(
        $$('.tcard', trail).slice(0, 5),
        { opacity: [0, 1], x: [40, 0] },
        { duration: 0.7, delay: stagger(0.07), ease: ease },
      ),
    { amount: 0.2 },
  );

/* ---- Product: the conversation is built at real size (480 x 600) and scaled to its column ---- */
const stageWrap = $('#stage-app'),
  scalerEl = $('#scaler');
const APPW = 480,
  APPH = 600;
const fit = () => {
  const scale = stageWrap.clientWidth / APPW;
  scalerEl.style.transform = `scale(${scale})`;
  stageWrap.style.height = APPH * scale + 'px';
};
addEventListener('resize', fit);
fit();

/* ---- Inbox: three conversations, each building itself one message at a time ---- */
const ICONS = {
  ig: '<svg class="ico" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/></svg>',
  fb: '<svg class="ico" viewBox="0 0 24 24"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"/></svg>',
  tt: '<svg class="ico" viewBox="0 0 24 24"><path d="M14 3c.4 2.6 2 4 4.5 4.2v3c-1.7 0-3.2-.5-4.5-1.4V15a5.5 5.5 0 1 1-5.5-5.5v3.1A2.5 2.5 0 1 0 11 15V3z"/></svg>',
  chat: '<svg class="ico" viewBox="0 0 24 24"><path d="M5 5h14v10H9l-4 4z"/></svg>',
  mail: '<svg class="ico" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  phone:
    '<svg class="ico" viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  assign:
    '<svg class="ico" viewBox="0 0 24 24"><circle cx="10" cy="8" r="4"/><path d="M3 20a7 7 0 0 1 14 0M19 8v6M16 11h6"/></svg>',
  look: '<svg class="ico" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  mem: '<svg class="ico" viewBox="0 0 24 24"><path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-2zM15 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/></svg>',
  cart: '<svg class="ico" viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  spark:
    '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"/></svg>',
};
// new people, so the stories don't repeat the hero
const CASES = {
  jess: {
    name: 'Jess Moreno',
    col: '#c27c4a',
    ch: 'ig',
    title: 'Instagram',
    feed: [
      ['ev', 'look', 'Jess asked about sizing on the summer collection post, 12 days ago · <u>via Memory</u>'],
      ['ev', 'cart', 'Linen dress in M back in stock · 9:01 AM'],
      [
        'siena',
        'Hi Jess! You asked about sizing on our summer post – the linen dress just came back in M, and I’ve held one for you for 24 hours 💛 It runs true to size, so M is right.',
        '',
        true,
      ],
      ['cust', 'omg yes!! I thought I’d missed it 😭'],
      ['siena', 'Here’s your link. For evenings, the sage overshirt goes with it, and it’s in M too.'],
      ['cust', 'ok you got me. both please'],
      ['ev', 'cart', 'Order #14420 · 2 items · $186 · <u>via Shopify</u> · 9:04 AM'],
    ],
  },
  rosa: {
    name: 'Rosa Lindqvist',
    col: '#2f8f83',
    ch: 'chat',
    title: 'Live chat',
    feed: [
      ['ev', 'mail', 'Email · “Return for the cream knit” · 6 days ago'],
      ['ev', 'tt', 'TikTok comment · “love the colour but it’s a bit boxy” · 4 days ago'],
      ['ev', 'mem', 'All three matched to one profile · 3 orders · <u>via Identity merge</u>'],
      ['cust', 'Hi! I emailed last week about a return and commented on TikTok too 😅 any news?'],
      [
        'siena',
        'Hi Rosa, I’ve got both here, so no need to repeat anything. The knit arrived back yesterday and your $94 refund went out this morning.',
        '',
        true,
      ],
      [
        'siena',
        'You mentioned it felt boxy. The ribbed version is cut slimmer, in the same cream, if you’d like to try it.',
      ],
      ['cust', 'ooh yes, send me the link'],
    ],
  },
  owen: {
    name: 'Owen Hart',
    col: '#6b7fd7',
    ch: 'mail',
    title: 'Email',
    feed: [
      ['cust', 'My order arrived with a cracked lid 😩 It’s a wedding gift for Saturday.'],
      [
        'ev',
        'look',
        'Siena checked Shopify · delivered yesterday, $212 · navy out of stock in the warehouse · <u>via Order lookup</u>',
      ],
      [
        'siena',
        'I’m so sorry, Owen. The navy is out of stock in our warehouse, so I’ve asked Jordan on our care team to find you the quickest way to get one by Saturday. She has the photos and your order, so you won’t need to explain again.',
        '',
        true,
      ],
      ['ev', 'assign', 'Assigned to Jordan Lee · <u>via Contextual routing</u> “Damaged orders over $150 go to @Care”'],
      [
        'agent',
        'Hi Owen, Jordan here. I’ve sent a navy one from our NYC store by express, so it’ll be with you Friday. No need to send the damaged one back.',
        'Jordan Lee',
        '#3557c5',
        'Care',
      ],
    ],
  },
};
// the Inbox list: the three conversations above, then everyone else
const INBOX_ROWS = [
  ['jess', 'Jess Moreno', '#c27c4a', 'ig', 'does the linen dress run small? usually an M', '1m'],
  ['owen', 'Owen Hart', '#6b7fd7', 'mail', 'Arrived cracked 😩 It’s a wedding gift for Saturday', '2m'],
  ['rosa', 'Rosa Lindqvist', '#2f8f83', 'tt', 'love the colour, bit boxy though', '3m'],
  ['', 'Priya Shah', '#b04fc4', 'chat', 'what goes with the sage shirt?', '4m'],
  ['', 'Nia Okafor', '#8a6d3b', 'mail', 'Help with a note for mum’s 60th?', '6m'],
  ['', 'Tess Avery', '#d0675b', 'ig', 'restock when 🙏', '7m'],
  ['', 'Dev Patel', '#4a7c59', 'phone', 'Voicemail · “Hi, it’s Dev, about a birthday gift…”', '9m'],
  ['', 'Marco Bellini', '#5b6b8a', 'chat', 'can I swap to a size S?', '11m'],
  ['', 'Leo Brandt', '#7a5c9e', 'fb', 'do you ship to canada??', '12m'],
  ['', 'Hana Sato', '#3d8fb0', 'phone', 'where’s my order? it said tuesday', '14m'],
];
const ORDER = ['jess', 'rosa', 'owen'];

const app = $('#app'),
  feed = $('#feed');

// avatars: generated portraits (avatars/), and Nia and Dev cut from the hero so they're the same people
const PORTRAITS = new Set(['jess', 'owen', 'rosa', 'priya', 'tess', 'marco', 'leo', 'hana', 'jordan']),
  OCULUS_AVATAR = { nia: 'p5', dev: 'p3' };
const avatar = (name, col) => {
  const k = name.split(' ')[0].toLowerCase();
  if (OCULUS_AVATAR[k]) return `<span class="av lg ${OCULUS_AVATAR[k]}"></span>`;
  if (PORTRAITS.has(k)) return `<span class="av ph" style="background-image:url(avatars/${k}.jpg)"></span>`;
  return `<span class="av init" style="background:${col}">${name[0]}</span>`;
};
// one thread item: ['ev', icon, text] | ['siena', text, _, showReasoning] | ['cust', text] | ['agent', text, name, colour, team]
const item = (k, c) => {
  const [t, a, b, d, e] = k;
  if (t === 'ev') return `<div class="ev">${ICONS[a]}<span>${b}</span></div>`;
  if (t === 'siena')
    return [
      `<div class="msg me"><span class="siena-av">${ICONS.spark}</span>`,
      `<div class="body"><p>${a}</p><span class="by">Siena${d ? ' · <u>See reasoning</u>' : ''}</span></div>`,
      `</div>`,
    ].join('');
  if (t === 'cust') return `<div class="msg">${avatar(c.name, c.col)}<div class="body"><p>${a}</p></div></div>`;
  if (t === 'agent')
    return [
      `<div class="msg me agent">${avatar(b, d)}`,
      `<div class="body"><p>${a}</p><span class="by">${b} · ${e}</span></div>`,
      `</div>`,
    ].join('');
};
const typing = [
  `<div class="msg typing"><span class="siena-av">${ICONS.spark}</span>`,
  `<div class="body"><div class="dots"><i></i><i></i><i></i></div></div>`,
  `</div>`,
].join('');
const html = (s) => {
  const d = document.createElement('div');
  d.innerHTML = s.trim();
  return d.firstChild;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let token = 0,
  touched = false,
  current = null,
  cycleTimer;

// the Inbox list, which the people from the manifesto land on
const listEl = $('#tlist');
let listing = true;
const listHead = () => {
  $('#thTitle').innerHTML =
    `<svg class="ico" viewBox="0 0 24 24"><path d="M3 13h5l2 3h4l2-3h5M5 5h14l2 8v6H3v-6z"/></svg>Inbox <small>· ${INBOX_ROWS.length} open, all channels</small>`;
};
listEl.innerHTML = INBOX_ROWS.map(([key, name, col, ch, preview, time]) =>
  [
    `<div class="tl-row"${key ? ` data-k="${key}"` : ''}>${avatar(name, col)}`,
    `<div><div class="nm">${name}${ICONS[ch]}</div><div class="pv">${preview}</div></div>`,
    `<div class="tm">${time}<i></i></div>`,
    `</div>`,
  ].join(''),
).join('');
app.classList.add('listing');
listHead();
const listRows = $$('.tl-row', listEl);
function showList() {
  if (listing) return;
  listing = true;
  ++token;
  current = null;
  clearTimeout(cycleTimer);
  listRows.forEach((r) => r.classList.remove('press'));
  app.classList.add('listing');
  listHead();
  if (!reduce) animate(listEl, { opacity: [0, 1], x: [-30, 0] }, { duration: 0.3, ease: ease });
}
// every change to the thread glides: what's already there slides up by exactly the space the new message
// takes (FLIP), and the new one rises and settles with the same easing as the rest of the site
const SOFT = [0.22, 1, 0.36, 1]; // a quick start and a long, soft landing
function glide(mutate, el, fromY) {
  const kids = [...feed.children],
    before = kids.map((k) => k.getBoundingClientRect().top),
    appScale = app.getBoundingClientRect().width / app.offsetWidth || 1;
  mutate();
  kids.forEach((k, i) => {
    if (!k.isConnected) return;
    const d = (before[i] - k.getBoundingClientRect().top) / appScale;
    if (Math.abs(d) > 0.5) animate(k, { y: [d, 0] }, { duration: 0.75, ease: SOFT });
  });
  if (!el) return Promise.resolve();
  el.style.transformOrigin = el.classList.contains('me') ? '100% 100%' : '0 100%';
  return animate(
    el,
    { opacity: [0, 1], y: [fromY, 0], scale: [0.97, 1] },
    { duration: 0.75, ease: SOFT, opacity: { duration: 0.35, ease: 'easeOut' } },
  ).finished;
}
// open a conversation: from the Inbox list, tap its row and slide the thread in, then play it one item at a time
async function play(key) {
  if (key === current && touched) return;
  const my = ++token;
  current = key;
  clearTimeout(cycleTimer);
  const c = CASES[key];
  if (listing) {
    const r = listRows.find((r) => r.dataset.k === key);
    if (r && !reduce) {
      r.classList.add('press');
      animate(r, { scale: [1, 0.975, 1] }, { duration: 0.4, ease: ease });
      await wait(380);
      if (my !== token) return;
      animate(listEl, { opacity: [1, 0], x: [0, -24] }, { duration: 0.38, ease: ease });
      await wait(260);
      if (my !== token) return;
    }
    listing = false;
    app.classList.remove('listing');
    if (!reduce) animate('#feed, .composer', { opacity: [0, 1], x: [24, 0] }, { duration: 0.5, ease: ease });
  }
  $('#thTitle').innerHTML = `${avatar(c.name, c.col)}${c.name} <small>· ${c.title}</small>${ICONS[c.ch]}`;
  $('#ph').textContent = 'Message…';
  feed.innerHTML = '';
  if (reduce) {
    c.feed.forEach((k) => feed.appendChild(html(item(k, c))));
    return;
  }
  await wait(250);
  // strictly one thing at a time: each item lands (most of the motion is done in the first third) before the next starts
  for (const k of c.feed) {
    if (my !== token) return;
    if (k[0] === 'siena') {
      const tp = html(typing);
      tp.classList.add('me');
      glide(() => feed.appendChild(tp), tp, 8);
      await wait(800);
      if (my !== token) return;
      await animate(tp, { opacity: 0, scale: 0.9 }, { duration: 0.2, ease: 'easeIn' }).finished;
      if (my !== token) return;
      const el = html(item(k, c));
      glide(() => tp.replaceWith(el), el, 10);
    } else {
      const el = html(item(k, c));
      glide(() => feed.appendChild(el), el, k[0] === 'ev' ? 6 : 12);
    }
    await wait(k[0] === 'ev' ? 520 : 900);
  }
  if (!touched) cycleTimer = setTimeout(() => !touched && play(ORDER[(ORDER.indexOf(key) + 1) % ORDER.length]), 6500);
}

// first reveal: the rows are revealed by the people landing on them, so this only starts the caption's story
let started = false;
const start = () => {
  if (started) return;
  started = true;
  if (step >= 0) setTimeout(() => play(steps[step].dataset.case), reduce ? 0 : 700);
};

/* ---- Manifesto: the words light up as you read down ---- */
$$('.manifesto .mf').forEach((pp) => {
  const walk = (n) =>
    [...n.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const f = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) f.append(w);
          else {
            const s = document.createElement('span');
            s.className = 'mw';
            s.textContent = w;
            f.append(s);
          }
        });
        c.replaceWith(f);
      } else if (c.nodeType === 1) walk(c);
    });
  walk(pp);
});
const manifestoWords = $$('.manifesto .mw');
let litFrac = 0;
// set by the "From chaos, orders" scene below: shows its people as the manifesto is read
let spawn = () => {};
// how far "From chaos," has come to its landing (0 to 1), set by that scene; -1 until it first renders
let chaosL = -1;
if (reduce) {
  manifestoWords.forEach((w) => w.classList.add('on'));
  litFrac = 1;
} else {
  // read aloud as you scroll: each word gets a little time (longer words a little more, the headline slower), with
  // short pauses at commas, longer ones at full stops and longer still between paragraphs. That reading timeline is
  // spread over the scroll from the first word reaching 72% of the way down the screen to the last reaching 42%,
  // so words light one at a time, in phrases, never a whole line at once.
  // one reading timeline per manifesto block, each spread over its own scroll range
  const groups = $$('.manifesto')
    .map((sec) => ({ ws: $$('.mw', sec), T: 0, ts: [], a: 0, b: 1, n: -1 }))
    .filter((g) => g.ws.length);
  groups.forEach((g) =>
    g.ws.forEach((w, i) => {
      const p = w.closest('.mf'),
        lead = p.classList.contains('lead'),
        txt = w.textContent;
      g.ts.push(g.T);
      g.T += (lead ? 1.5 : 1) * (0.75 + Math.min(txt.replace(/[^\p{L}\p{N}]/gu, '').length, 12) * 0.05);
      const last = !g.ws[i + 1] || g.ws[i + 1].closest('.mf') !== p;
      if (last) g.T += lead ? 3.2 : 3.8;
      else if (/[.!?…]["”’)]?$/.test(txt)) g.T += 2.2;
      else if (/[,;:—–]["”’)]?$/.test(txt)) g.T += 0.9;
    }),
  );
  const measureRead = () =>
    groups.forEach((g) => {
      const f = g.ws[0].getBoundingClientRect(),
        l = g.ws[g.ws.length - 1].getBoundingClientRect();
      g.a = f.top + scrollY - innerHeight * 0.72;
      g.b = l.top + scrollY - innerHeight * 0.42;
    });
  let lightQueued = false;
  const light = () => {
    lightQueued = false;
    groups.forEach((g, gi) => {
      const q = Math.min(1, Math.max(0, (scrollY - g.a) / Math.max(1, g.b - g.a))),
        now = q * g.T;
      let n = 0;
      while (n < g.ws.length && g.ts[n] <= now) n++;
      if (n !== g.n) {
        g.ws.forEach((w, i) => w.classList.toggle('on', i < n));
        g.n = n;
      }
      if (gi === groups.length - 1) litFrac = q; // the people arrive with the block just before "From chaos,"
    });
    spawn();
  };
  addEventListener(
    'scroll',
    () => {
      if (!lightQueued) {
        lightQueued = true;
        requestAnimationFrame(light);
      }
    },
    { passive: true },
  );
  addEventListener('resize', () => {
    measureRead();
    light();
  });
  document.fonts.ready.then(() => {
    measureRead();
    light();
  });
  measureRead();
  light();
}

/* ---- From chaos, orders ----
       One continuous motion driven by the scroll position. Messages from every channel (and what Siena remembers
       about each person) appear around the manifesto as you read it. "From chaos," is the next line of the text and
       scrolls up with it, then eases to a stop above the app; the messages pull in to it and drop into the Inbox as it
       lands, the app rises underneath, and "orders." fades up as it settles. The captions then scroll by as ordinary text. */
const orderEl = $('#order'),
  manifestoEl = $('#manifesto'),
  pinEl = $('#orderPin'),
  headEl = $('#orderH'),
  ordersEl = $('.hb', headEl),
  uiEl = $('#ui'),
  steps = $$('.step'),
  stepsEl = $('#steps'),
  maskEl = $('#orderMask');
// one person per Inbox row that's on screen when they land; positions alternate left/right around the text
const SIDES = [
    [0.04, 0.1, 0.9],
    [0.8, 0.2, 0.75],
    [0.07, 0.45, 0.7],
    [0.83, 0.52, 0.95],
    [0.03, 0.76, 0.85],
    [0.79, 0.82, 0.65],
  ],
  NSIDE = SIDES.length;
// 7th person on: the same size, with their message, spread across the bottom half under "From chaos,"
const SLOTS = [...SIDES, [0.25, 0.66, 0.8], [0.42, 0.84, 0.7], [0.6, 0.7, 0.9], [0.73, 0.9, 0.75]];
const CHANNEL_NAMES = {
  ig: 'Instagram',
  mail: 'Email',
  tt: 'TikTok',
  chat: 'Shopping chat',
  phone: 'Phone',
  fb: 'Messenger',
};
const OCULUS_FACE = { nia: [0.664, 0.531], dev: [0.443, 0.745] };
const fragsEl = $('#frags');
const frags = INBOX_ROWS.slice(0, SLOTS.length).map(([, name, col, ch, preview], i) => {
  const who = name.split(' ')[0].toLowerCase(),
    [x, y, z] = SLOTS[i],
    el = document.createElement('div');
  el.className = 'frag pp' + (i < NSIDE && x > 0.5 ? ' r' : '');
  let photoStyle;
  if (OCULUS_FACE[who]) {
    const size = 104,
      bgW = (520 * size) / 36,
      bgH = (293 * size) / 36;
    photoStyle = [
      `background-image:url(oculus-hero.jpg)`,
      `background-size:${bgW}px ${bgH}px`,
      `background-position:${size / 2 - bgW * OCULUS_FACE[who][0]}px ${size / 2 + 1 - bgH * OCULUS_FACE[who][1]}px`,
    ].join(';');
  } else if (PORTRAITS.has(who)) photoStyle = `background-image:url(avatars/${who}.jpg)`;
  else photoStyle = `background:${col}`;
  // each person sways at their own pace: --d is the duration, --dl a negative delay so they start out of step
  const sway = `--d:${(7 + ((i * 1.7) % 3)).toFixed(1)}s;--dl:-${((i * 1.3) % 4).toFixed(1)}s`;
  el.innerHTML = [
    `<div class="pp-in" style="${sway}">`,
    `<span class="ph" style="${photoStyle}"></span>`,
    `<span class="bb"><i>${ICONS[ch] || ''}${CHANNEL_NAMES[ch] || ''} · ${name.split(' ')[0]}</i>${preview}</span>`,
    `</div>`,
  ].join('');
  fragsEl.appendChild(el);
  return {
    el,
    i,
    x,
    y,
    z,
    under: i >= NSIDE,
    at: i < NSIDE ? 0.1 + i * 0.085 : 0.86 + (i - NSIDE) * 0.03,
    ph: $('.ph', el),
    bb: $('.bb', el),
  };
});
const smoothstep = (a, b, x) => {
  const v = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return v * v * (3 - 2 * v);
};
const lerp = (a, b, k) => a + (b - a) * k;
const manifestoParas = $$('.manifesto .mf');
let scene = {},
  step = -1,
  appStarted = false;
// which fragments are showing: by how much of the manifesto has been read (on phones, only once it's nearly all read)
spawn = () =>
  frags.forEach((f) => {
    // phones: the people wait until the manifesto has mostly faded, so they never sit on top of the words
    const at = scene.phone ? 0.8 + f.i * 0.025 : f.at,
      show = f.i < (scene.peopleCount || 0) && litFrac >= at && (!scene.phone || chaosL > 0.78);
    if (f.el.classList.contains('in') !== show) f.el.classList.toggle('in', show);
  });
const deskEl = $('#desk'),
  deskHEl = $('#deskH');
{
  $('#deskList').innerHTML =
    `<div class="dl-h">Inbox <small>${INBOX_ROWS.length} open · all channels</small></div>` +
    INBOX_ROWS.map(([key, name, col, ch, preview, time]) =>
      [
        `<div class="tl-row${key === 'owen' ? ' on' : ''}">${avatar(name, col)}`,
        `<div><div class="nm">${name}${ICONS[ch]}</div><div class="pv">${preview}</div></div>`,
        `<div class="tm">${time}${key === 'owen' ? '' : '<i></i>'}</div>`,
        `</div>`,
      ].join(''),
    ).join('');
  const card = (icon, title, body) => `<div class="dp-card"><h4>${icon}${title}</h4>${body}</div>`;
  const purpleSpark = ICONS.spark.replace('fill="#fff"', 'fill="#b04fc4"').replace('<svg', '<svg class="ico"');
  $('#deskProf').innerHTML = [
    `<div class="dp-who"><span class="ph" style="background-image:url(avatars/owen.jpg)"></span>` +
      `<div><b>Owen Hart</b><small>owen.hart@gmail.com · Brooklyn, NY</small></div></div>`,
    `<div class="dp-stats"><span><b>7</b> orders</span><span><b>$1,240</b> lifetime</span><span>Customer <b>3 yrs</b></span></div>`,
    card(
      purpleSpark,
      'Customer intelligence',
      `<p>Buying a wedding gift for Saturday. Prefers navy. Replies within minutes by email, so keep it short.</p>`,
    ),
    card(
      ICONS.look,
      'Latest order',
      `<p><b>#14420</b> · Ceramic dinner set, navy · $212<br>Delivered yesterday · arrived damaged</p>`,
    ),
    card(
      ICONS.assign,
      'Routing',
      `<p>Damaged orders over $150 go to @Care.</p><span class="rt">Jordan Lee · Care</span>`,
    ),
    card(
      ICONS.mem,
      'Memories <span style="margin-left:auto">4</span>',
      `<p>Sent a gift to the same address last December.</p>`,
    ),
  ].join('\n        '); // the blocks were written one per line, so the same line breaks sit between them
}
const docY = (el) => el.getBoundingClientRect().top + scrollY;
const layout = () => {
  fit();
  const viewW = pinEl.clientWidth,
    viewH = innerHeight,
    phone = isPhone(),
    navH = nav.offsetHeight;
  // the order section starts at the top of the manifesto
  const manifestoTop = docY(manifestoEl),
    manifestoH = manifestoEl.offsetHeight;
  orderEl.style.marginTop = -manifestoH + 'px';
  orderEl.style.setProperty('--mfh', manifestoH + 'px');
  const headFont = parseFloat(getComputedStyle(headEl).fontSize),
    manifestoFont = parseFloat(getComputedStyle($('.manifesto .mf')).fontSize);
  const inTextScale = manifestoFont / headFont,
    landedScale = Math.max(inTextScale, phone ? 0.5 : 0.42),
    headH = headEl.offsetHeight * landedScale;
  const uiW = uiEl.offsetWidth,
    uiH = uiEl.offsetHeight,
    gap = phone ? 18 : 28,
    groupTop = phone ? navH + 24 : Math.max(navH + 16, (viewH - (headH + gap + uiH)) / 2),
    uiTop = groupTop + headH + gap;
  const margin = Math.max(24, viewW * 0.045),
    captionW = stepsEl.offsetWidth,
    asideScale = phone ? 1 : Math.min(1, (viewW - 2 * margin - captionW - 112) / uiW),
    asideY = phone ? 0 : Math.max(0, (viewH - uiTop - uiH * asideScale) / 2 - 24);
  // the conversation and its caption sit together as one centred pair
  const pairW = uiW * asideScale + 112 + captionW,
    pairLeft = Math.max(margin, (viewW - pairW) / 2);
  const asideX = phone ? 0 : pairLeft + (uiW * asideScale) / 2 - viewW / 2;
  uiEl.style.top = uiTop + 'px';
  // "From chaos," sits where the next paragraph would, and lands centred on headLandY
  const lastPara = $$('.manifesto .mf').pop();
  const headTextY =
    docY(lastPara) + lastPara.offsetHeight + manifestoFont * 1.1 + (headEl.offsetHeight * inTextScale) / 2;
  const headLandY = groupTop + headH / 2,
    easeDist = viewH * (phone ? 0.5 : 0.6);
  const landScroll = headTextY - headLandY + easeDist / 2,
    asideFrom = landScroll + viewH * 0.12,
    asideTo = asideFrom + viewH * 0.5;
  scene = {
    viewW,
    viewH,
    phone,
    landedScale,
    inTextScale,
    headH,
    headNaturalH: headEl.offsetHeight,
    uiW,
    uiH,
    uiTop,
    asideScale,
    asideX,
    asideY,
    ordersW: ordersEl.offsetWidth + headFont * 0.25,
    headTextY,
    headLandY,
    easeDist,
    landScroll,
    asideFrom,
    asideTo,
    manifestoTop,
  };
  // captions: ordinary blocks that scroll up past the pinned app, the first coming in as the app slides aside
  const captionsLeft = phone ? Math.max(16, (viewW - uiW) / 2) : pairLeft + uiW * asideScale + 112;
  // desktop: the first caption only comes up from the bottom once the app has finished sliding aside, so they never cross
  const captionsTop = phone ? asideFrom + viewH * 0.92 : asideTo + viewH * 0.98;
  stepsEl.style.left = captionsLeft + 'px';
  stepsEl.style.top = captionsTop - manifestoTop + 'px';
  scene.captionsTop = captionsTop;
  // the pinned app lets go the moment the last caption reaches the middle of the app (phones: of the space under it),
  // so from there the app, the headline and the caption all scroll on together as one
  const lastStep = steps[steps.length - 1],
    line = phone ? viewH * 0.66 : uiTop + asideY + (uiH * asideScale) / 2;
  const release = captionsTop + lastStep.offsetTop + lastStep.offsetHeight / 2 - line;
  // then (desktop) the conversation settles into the full desktop app under a big line, and only then does it all scroll on
  let end = release;
  if (!phone) {
    const winW = 656 + uiW,
      winH = 40 + uiH;
    deskEl.style.width = winW + 'px';
    deskEl.style.height = winH + 'px';
    // the line and the app are one block, centred vertically (never tucked under the nav)
    const deskHeadH = deskHEl.offsetHeight,
      deskScale = Math.min(1, (viewW - 2 * margin) / winW, (viewH - 2 * (navH + 16) - deskHeadH - 30) / winH); // equal room above and below
    const deskHeadTop = Math.max(navH + 16, (viewH - (deskHeadH + 30 + winH * deskScale)) / 2);
    deskHEl.style.top = deskHeadTop + 'px';
    const deskTop = deskHeadTop + deskHeadH + 30;
    const deskX = (viewW - winW * deskScale) / 2;
    Object.assign(scene, {
      deskScale,
      deskX,
      deskY: deskTop,
      cardLeft: deskX + 356 * deskScale,
      cardTop: deskTop + 40 * deskScale,
      deskFrom: release + viewH * 0.05,
      deskTo: release + viewH * 0.95,
    });
    end = scene.deskTo + viewH * 0.45;
  } else {
    scene.deskFrom = 0;
  }
  orderEl.style.height = end + viewH - manifestoTop + 'px';
  // how many Inbox rows are on screen when the people land: that's how many people there are
  const listH = listEl.clientHeight;
  scene.peopleCount = Math.min(frags.length, listRows.filter((r) => r.offsetTop + r.offsetHeight <= listH + 2).length);
  if (phone) scene.peopleCount = Math.min(scene.peopleCount, 6); // everyone you'll see in the Inbox arrives as a person first (phones: the first six)
  frags.forEach((f) => {
    f.el.style.display = f.i < scene.peopleCount ? '' : 'none';
    f.w = f.el.firstElementChild.offsetWidth;
    f.h = f.el.firstElementChild.offsetHeight;
  });
  spawn();
  render();
};
function setStep(s) {
  if (s === step) return;
  step = s;
  steps.forEach((el, i) => el.classList.toggle('on', i === s));
  if (s >= 0) {
    touched = true;
    play(steps[s].dataset.case);
  } else showList();
}
function render() {
  if (!scene.viewH) return;
  const sy = scrollY,
    { viewW, viewH, landedScale, ordersW, asideScale, asideX, asideY, easeDist } = scene;
  const pinRect = pinEl.getBoundingClientRect();
  // the headline's travel: at its natural place in the text until R px before landing, then easing to a stop
  const toLanding = (scene.landScroll - sy) / easeDist;
  const headOffset =
    toLanding >= 1 ? easeDist * (toLanding - 0.5) : toLanding > 0 ? (easeDist * toLanding * toLanding) / 2 : 0;
  const landProgress = 1 - Math.min(1, Math.max(0, toLanding)),
    landEased = smoothstep(0, 1, landProgress);
  if (scene.phone && chaosL !== landProgress) {
    chaosL = landProgress;
    spawn();
  }
  const headY = scene.headLandY + headOffset;
  const headScale = lerp(scene.inTextScale, landedScale, landEased),
    settle = smoothstep(0.8, 1, landProgress);
  headEl.style.transform = `translate(calc(-50% + ${(ordersW / 2) * headScale * (1 - settle)}px), calc(-50% + ${headY - pinRect.top - viewH / 2}px)) scale(${headScale})`;
  headEl.style.opacity = lerp(0.22, 1, smoothstep(viewH * 0.6, viewH * 0.5, headY));
  ordersEl.style.opacity = settle;
  ordersEl.style.transform = `translateY(${(1 - settle) * 0.3}em)`;
  // the manifesto softens as the headline takes over
  const away = smoothstep(0.45, 0.95, landProgress);
  manifestoParas.forEach((el) => {
    el.style.opacity = 1 - away;
    el.style.filter = away > 0.01 ? `blur(${away * 6}px)` : '';
  });
  // the app rises in under the headline, then slides aside for the captions
  const side = smoothstep(scene.asideFrom, scene.asideTo, sy);
  uiEl.style.opacity = smoothstep(0.35, 0.85, landProgress);
  // desktop phase: deskMove moves the conversation into its column, deskGrow grows the rest of the app out around it
  let deskMove = 0,
    deskGrow = 0;
  if (scene.deskFrom) {
    const deskSpan = scene.deskTo - scene.deskFrom;
    deskMove = smoothstep(scene.deskFrom, scene.deskFrom + deskSpan * 0.5, sy);
    deskGrow = smoothstep(scene.deskFrom + deskSpan * 0.5, scene.deskTo, sy);
  }
  let uiX = asideX * side,
    uiY = (1 - landEased) * 90 + asideY * side,
    uiScale = lerp(0.94, 1, landEased) * lerp(1, asideScale, side);
  if (deskMove > 0) {
    uiX = lerp(uiX, scene.cardLeft + (scene.uiW * scene.deskScale) / 2 - viewW / 2, deskMove);
    uiY = lerp(uiY, scene.cardTop - scene.uiTop, deskMove);
    uiScale = lerp(uiScale, scene.deskScale, deskMove);
  }
  uiEl.style.transform = `translateX(calc(-50% + ${uiX}px)) translateY(${uiY}px) scale(${uiScale})`;
  // the chat keeps its round corners and shadow until the app window starts opening around it
  app.style.borderRadius = deskGrow > 0 ? (22 * (1 - deskGrow)).toFixed(2) + 'px' : ''; // 22px is the chat's own corner
  app.style.boxShadow =
    deskGrow > 0
      ? `0 0 0 1px rgba(18,32,35,.07), 0 40px 90px -30px rgba(10,30,80,${(0.55 * (1 - deskGrow)).toFixed(3)})`
      : '';
  if (scene.deskFrom) {
    deskEl.style.opacity = deskGrow > 0 ? 1 : 0;
    deskEl.style.transform = `translate(${scene.deskX}px, ${scene.deskY}px) scale(${scene.deskScale})`;
    // the app grows out of the conversation: clipped to the conversation's column, opening to the whole window
    deskEl.style.clipPath = `inset(${(40 * (1 - deskGrow)).toFixed(1)}px ${(300 * (1 - deskGrow)).toFixed(1)}px 0 ${(356 * (1 - deskGrow)).toFixed(1)}px round ${(16 * deskGrow).toFixed(1)}px)`;
    deskHEl.style.opacity = smoothstep(0.35, 1, deskGrow);
    deskHEl.style.transform = `translateX(-50%) translateY(${((1 - deskGrow) * 26).toFixed(1)}px)`;
    if (deskMove > 0)
      headEl.style.opacity = (parseFloat(headEl.style.opacity) * (1 - smoothstep(0, 0.6, deskMove))).toFixed(3);
  }
  // a band of blue above the app (phones: down to the app's bottom edge) that the captions scroll under
  const maskBottom = scene.phone
    ? stageWrap.getBoundingClientRect().bottom - pinRect.top + 30
    : scene.uiTop + asideY * side + 40;
  maskEl.style.height = maskBottom + 'px';
  maskEl.style.opacity = scene.phone ? smoothstep(scene.asideFrom, scene.asideFrom + viewH * 0.2, sy) : side;
  // fragments: float with depth, pull towards the headline, then drop into the Inbox (memories into the profile)
  const feedRect = feed.getBoundingClientRect();
  const pull = smoothstep(0, 0.6, landProgress);
  frags.forEach((f, i) => {
    if (i >= scene.peopleCount) return;
    const fragW = f.w || 240,
      fragH = f.h || 160,
      right = !f.under && f.x > 0.5;
    const floatScale = (0.78 + 0.28 * f.z) * (scene.phone ? 0.7 : Math.min(1, 0.55 + viewW / 3200));
    const floatX = f.under
      ? f.x * viewW
      : right
        ? viewW - fragW * floatScale - Math.max(12, (1 - f.x - 0.14) * viewW)
        : Math.max(12, f.x * viewW);
    const floatY =
      Math.min(
        viewH - fragH * floatScale - 12,
        Math.max(scene.phone ? 70 : 84, f.y * viewH - (fragH * floatScale) / 2),
      ) +
      (scene.landScroll - sy) * (0.02 + 0.04 * f.z);
    const pulledX = lerp(floatX, viewW / 2 + (floatX - viewW / 2) * 0.75, pull),
      pulledY = lerp(floatY, scene.headLandY + (floatY - scene.headLandY) * 0.82 + viewH * 0.1, pull);
    // land with the portrait exactly on the row's avatar (portrait is at the frag's top-left; the bubble fades on the way)
    let rowX,
      rowY,
      rowScale = 0.35;
    const row = listRows[i],
      avatarEl = row && $('.av', row);
    if (avatarEl && listing) {
      const avatarRect = avatarEl.getBoundingClientRect();
      rowScale = avatarRect.width / 104;
      rowX = avatarRect.left - pinRect.left;
      rowY = avatarRect.top - pinRect.top;
      if (right) rowX -= (fragW - 104) * rowScale;
    } else {
      rowX = feedRect.left - pinRect.left + 8;
      rowY = feedRect.top - pinRect.top + ((i % 6) * feedRect.height) / 6;
    }
    const drop = scene.phone
      ? smoothstep(0.8 + i * 0.02, 0.97, landProgress)
      : smoothstep(0.3 + i * 0.025, 0.74 + i * 0.02, landProgress);
    f.el.style.transform = `translate(${lerp(pulledX, rowX, drop)}px, ${lerp(pulledY - pinRect.top, rowY, drop)}px) scale(${lerp(floatScale, rowScale, drop)})`;
    f.el.classList.toggle('fly', drop > 0.001);
    // the white ring and shadow belong to the floating portrait, not the Inbox avatar: they fade out on the way in
    f.ph.style.boxShadow =
      drop > 0.001
        ? `0 0 0 3px rgba(255,255,255,${(0.9 * (1 - drop)).toFixed(3)}), 0 18px 40px -16px rgba(10,30,80,${(0.55 * (1 - drop)).toFixed(3)})`
        : '';
    // the portrait stays fully visible until it is exactly on the avatar, then the two swap in the same frame
    const landed = drop >= 0.999;
    f.el.style.opacity = landed ? 0 : 1;
    f.bb.style.opacity = f.el.classList.contains('in') ? 1 - smoothstep(0.05, 0.45, drop) : '';
    f.el.style.filter = '';
    if (row && landProgress > 0) {
      row.style.opacity = smoothstep(0.5, 0.95, drop);
      if (avatarEl) avatarEl.style.opacity = landed ? '' : 0;
    } else if (row) {
      row.style.opacity = '';
      if (avatarEl) avatarEl.style.opacity = '';
    }
  });
  if (!scene.phone)
    stepsEl.style.opacity =
      side > 0.98
        ? scene.deskFrom
          ? (1 - smoothstep(scene.deskFrom, scene.deskFrom + viewH * 0.3, sy)).toFixed(3)
          : ''
        : 0;
  // scrolled back above the landing: put the app back on the Inbox list, so the people always land on their rows
  if (appStarted && landProgress < 0.95) {
    appStarted = false;
    showList();
  }
  if (landProgress > 0.97 && !appStarted) {
    appStarted = true;
    start();
  }
  // the caption nearest the middle of the app (phones: of the space under it) is the one in focus
  let nearest = -1;
  if (sy > scene.asideFrom) {
    const line = scene.phone ? (maskBottom + viewH) / 2 - 40 : scene.uiTop + asideY + (scene.uiH * asideScale) / 2;
    let best = 1e9;
    steps.forEach((el, i) => {
      const r = el.getBoundingClientRect(),
        mid = (r.top + r.bottom) / 2,
        dist = Math.abs(mid - line);
      if (r.top < viewH * 0.85 && dist < best) {
        best = dist;
        nearest = i;
      }
    });
  }
  setStep(nearest);
}
if (!reduce) listRows.forEach((el) => (el.style.opacity = 0));
let renderQueued = false;
addEventListener(
  'scroll',
  () => {
    if (!renderQueued) {
      renderQueued = true;
      requestAnimationFrame(() => {
        renderQueued = false;
        render();
      });
    }
  },
  { passive: true },
);
// off-screen sections stop painting, so Chrome can release their graphics memory
const offscreen = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      e.target.style.visibility = e.isIntersecting ? '' : 'hidden';
    }),
  { rootMargin: '30% 0px' },
);
[$('#order'), $('#hero')].forEach((el) => offscreen.observe(el));
addEventListener('resize', layout);
{
  const veil = document.createElement('div');
  veil.style.cssText = 'position:fixed;inset:0;z-index:300;background:var(--paper);opacity:0;pointer-events:none';
  document.body.appendChild(veil);
  // fade to paper, jump, fade back: used by "See it work" and the logo (so the 3D never visibly rewinds)
  const done = (a, ms) => Promise.race([a.finished, new Promise((r) => setTimeout(r, ms))]);
  let jumping = false;
  async function veilJump(top) {
    if (jumping) return;
    jumping = true;
    veil.style.pointerEvents = 'auto';
    if (!reduce) await done(animate(veil, { opacity: [0, 1] }, { duration: 0.45, ease: [0.4, 0, 0.2, 1] }), 600);
    window.__snapTravel = true; // the hero camera jumps straight to where it should be, behind the veil
    scrollTo({ top, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 140));
    if (!reduce) await done(animate(veil, { opacity: [1, 0] }, { duration: 0.7, ease: [0.22, 1, 0.36, 1] }), 900);
    veil.style.opacity = 0;
    veil.style.pointerEvents = 'none';
    jumping = false;
  }
  $('#seeIt')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (scene.viewH) veilJump(Math.round(scene.landScroll + scene.viewH * 0.03));
  });
  $$('a.wordmark[href="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (scrollY < 4) return;
      veilJump(0);
    }),
  );
}
document.fonts.ready.then(layout);
layout();
addEventListener('load', layout);
