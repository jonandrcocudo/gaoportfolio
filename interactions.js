/*
  GAO — interaction layer (added on top of the existing script.js).
  Custom cursor, magnetic buttons, real perspective 3D tilt on the
  gallery + hero deck, a live running timecode, and a generated
  waveform track. Everything here checks for reduced-motion / touch
  and quietly no-ops instead of breaking anything.
*/
(function () {
  'use strict';
  const root = document.documentElement;
  const $ = (sel, p = document) => p.querySelector(sel);
  const $$ = (sel, p = document) => [...p.querySelectorAll(sel)];

  const isTouch = matchMedia('(pointer:coarse)').matches;
  const isMobile = matchMedia('(max-width:900px)').matches;
  const reduced = () => root.dataset.motion === 'off' || root.classList.contains('motion-reduced') || matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- live timecode (header HUD + hero deck) ---------------- */
  function pad(n, len) { return String(Math.floor(n)).padStart(len, '0'); }
  const start = performance.now();
  const tcTargets = [$('#hud-timecode b'), $('#deck-timecode')].filter(Boolean);
  if (tcTargets.length && !reduced()) {
    function tick() {
      const elapsed = (performance.now() - start) / 1000;
      const h = Math.floor(elapsed / 3600);
      const m = Math.floor((elapsed % 3600) / 60);
      const s = Math.floor(elapsed % 60);
      const f = Math.floor((elapsed % 1) * 24);
      const str = `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}:${pad(f, 2)}`;
      tcTargets.forEach(el => { el.textContent = str; });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------------- generated waveform track in the hero deck ---------------- */
  const wave = $('#deck-wave');
  if (wave && !reduced()) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 46; i++) {
      const bar = document.createElement('span');
      bar.className = 'deck__wave-bar';
      bar.style.animationDelay = `${(Math.random() * -1.6).toFixed(2)}s`;
      bar.style.animationDuration = `${(1.1 + Math.random() * 1.1).toFixed(2)}s`;
      frag.appendChild(bar);
    }
    wave.appendChild(frag);
  }

  /* ---------------- background particle field: depth without distraction -- */
  const particleField = $('#bg-particles');
  if (particleField && !reduced()) {
    const particleCount = isMobile ? 42 : 108;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('i');
      const roll = Math.random();
      particle.className = roll > 0.78 ? 'particle particle--violet' : roll > 0.42 ? 'particle particle--dust' : 'particle';
      const size = roll > 0.86 ? 2 + Math.random() * 2.4 : 0.8 + Math.random() * 1.6;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.setProperty('--particle-size', `${size.toFixed(2)}px`);
      particle.style.setProperty('--particle-alpha', (0.28 + Math.random() * 0.56).toFixed(2));
      particle.style.setProperty('--particle-speed', `${(8 + Math.random() * 14).toFixed(1)}s`);
      particle.style.setProperty('--particle-delay', `${(-Math.random() * 16).toFixed(1)}s`);
      particle.style.setProperty('--particle-drift-x', `${(-28 + Math.random() * 56).toFixed(0)}px`);
      particle.style.setProperty('--particle-drift-y', `${(-50 + Math.random() * 74).toFixed(0)}px`);
      frag.appendChild(particle);
    }
    particleField.appendChild(frag);
  }

  if (isTouch || isMobile || reduced()) return; // everything below is desktop-only flourish

  /* ---------------- decorative cursor ring (native cursor stays visible) --- */
  try {
  root.classList.add('cursor-ready');
  const cursor = document.createElement('div');
  cursor.className = 'gao-cursor';
  const dot = document.createElement('div');
  dot.className = 'gao-cursor__dot';
  const tag = document.createElement('div');
  tag.className = 'gao-cursor__tag';
  tag.textContent = 'VIEW';
  document.body.append(cursor, dot, tag);

  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
    tag.style.transform = `translate3d(${mx}px,${my}px,0)`;
  }, { passive: true });

  (function loop() {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    requestAnimationFrame(loop);
  })();

  const hotSelectors = '.work__card,.btn,.filter-chip,.nav__link,.lang,.contact-option,button,a';
  document.addEventListener('pointerover', e => {
    const hit = e.target.closest(hotSelectors);
    root.classList.toggle('cursor-hot', !!hit);
    if (hit && hit.classList.contains('work__card')) tag.textContent = 'ASSISTIR';
    else tag.textContent = 'ABRIR';
  });

  /* ---------------- magnetic buttons ---------------- */
  $$('.btn, .nav__cta, .float-quote, .filter-chip').forEach(el => {
    el.classList.add('magnetic');
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `translate3d(${px * 10}px,${py * 8}px,0)`;
    }, { passive: true });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; }, { passive: true });
  });

  /* ---------------- real 3D tilt: gallery cards ---------------- */
  function attachTilt(el, { maxDeg = 10, tz = 26 } = {}) {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--rx', `${(0.5 - py) * maxDeg}deg`);
      el.style.setProperty('--ry', `${(px - 0.5) * maxDeg}deg`);
      el.style.setProperty('--tz', `${tz}px`);
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
    }, { passive: true });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--tz', '0px');
    }, { passive: true });
  }

  function bindGalleryTilt() {
    $$('.work__card:not([data-tilt-bound])').forEach(card => {
      card.dataset.tiltBound = '1';
      attachTilt(card);
    });
  }
  bindGalleryTilt();
  new MutationObserver(bindGalleryTilt).observe(document.body, { childList: true, subtree: true });

  /* ---------------- hero deck: subtle parallax tilt ---------------- */
  const deck = $('#hero-deck');
  if (deck) attachTilt(deck, { maxDeg: 5, tz: 0 });

  /* ---------------- scene parallax: foreground reel + distant particles ---- */
  const heroReel = $('#hero-reel');
  if (heroReel || particleField) {
    let sceneFrame = 0;
    let sceneX = 0;
    let sceneY = 0;
    const paintScene = () => {
      if (heroReel) {
        heroReel.style.setProperty('--hero-x', `${(sceneX * 18).toFixed(1)}px`);
        heroReel.style.setProperty('--hero-y', `${(sceneY * 12).toFixed(1)}px`);
      }
      if (particleField) {
        particleField.style.setProperty('--field-x', `${(sceneX * -11).toFixed(1)}px`);
        particleField.style.setProperty('--field-y', `${(sceneY * -8).toFixed(1)}px`);
      }
      sceneFrame = 0;
    };
    addEventListener('pointermove', e => {
      sceneX = e.clientX / innerWidth - 0.5;
      sceneY = e.clientY / innerHeight - 0.5;
      if (!sceneFrame) sceneFrame = requestAnimationFrame(paintScene);
    }, { passive: true });
  }

  /* ---------------- edit signal wall: the archive shifts as one reel --- */
  const reelStage = $('#reel-stage');
  if (reelStage) {
    let reelFrame = 0;
    let reelX = 0;
    let reelY = 0;
    const paintReel = () => {
      reelStage.style.setProperty('--reel-x', `${reelX.toFixed(2)}deg`);
      reelStage.style.setProperty('--reel-y', `${reelY.toFixed(2)}deg`);
      reelFrame = 0;
    };
    reelStage.addEventListener('pointermove', e => {
      const r = reelStage.getBoundingClientRect();
      reelX = ((e.clientX - r.left) / r.width - 0.5) * 8;
      reelY = ((e.clientY - r.top) / r.height - 0.5) * -5;
      if (!reelFrame) reelFrame = requestAnimationFrame(paintReel);
    }, { passive: true });
    reelStage.addEventListener('pointerleave', () => {
      reelX = 0;
      reelY = 0;
      if (!reelFrame) reelFrame = requestAnimationFrame(paintReel);
    }, { passive: true });
  }

  /* ---------------- craft cards: a local light follows each decision ---- */
  $$('.craft-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty('--spot-y', `${((e.clientY - r.top) / r.height) * 100}%`);
    }, { passive: true });
  });

  if (reduced()) {
    document.body.classList.add('no-cursor-fx');
  }
  } catch (err) {
    // Any failure here must never cost the person their cursor or
    // basic interactivity — just drop the decorative layer.
    document.documentElement.classList.remove('cursor-ready');
    console.warn('Gao interactions layer: decorative fx skipped', err);
  }
})();
