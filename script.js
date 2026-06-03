
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const isMobile = matchMedia('(max-width: 768px)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

  /* Language: default English, supports ?lang=pt and session storage */
  const langBtn = $('#lang-btn');
  const langElements = $$('[data-lang]');
  const urlLang = new URLSearchParams(location.search).get('lang');

  function displayFor(el){
    const tag = el.tagName.toLowerCase();
    if(['span','strong','b','em','small','i'].includes(tag)) return 'inline';
    if(tag === 'li') return 'list-item';
    return 'block';
  }

  function updateMetaForLang(lang){
    const isPt = lang === 'pt';
    document.title = isPt
      ? 'Gao | Editor de Vídeo de Alta Retenção para Criadores e Marcas'
      : 'Gao | High-Retention Video Editor for Creators & Brands';
    const desc = document.querySelector('meta[name="description"]');
    if(desc){
      desc.content = isPt
        ? 'Contrate Gao, editor de vídeo e motion designer focado em retenção para YouTube, TikTok, Reels, thumbnails, motion graphics e sistemas mensais de conteúdo.'
        : 'Hire Gao, a retention-focused video editor and motion designer for YouTube, TikTok, Reels, thumbnails, motion graphics and monthly content systems for creators, brands and agencies.';
    }
  }

  function setLang(lang){
    const safe = lang === 'pt' ? 'pt' : 'en';
    root.dataset.currentLang = safe;
    root.lang = safe === 'pt' ? 'pt-BR' : 'en';

    langElements.forEach(el => {
      el.style.display = el.dataset.lang === safe ? displayFor(el) : 'none';
    });

    if(langBtn) langBtn.textContent = safe === 'pt' ? 'PT/EN' : 'EN/PT';
    sessionStorage.setItem('gao_lang', safe);
    updateMetaForLang(safe);
  }

  setLang(urlLang || sessionStorage.getItem('gao_lang') || 'en');
  langBtn?.addEventListener('click', () => setLang((root.dataset.currentLang || 'en') === 'en' ? 'pt' : 'en'));

  /* Header + mobile menu */
  const header = $('.header');
  const navMenu = $('#nav-menu');
  const navToggle = $('#nav-toggle');
  const navClose = $('#nav-close');

  const openMenu = () => {
    if(!navMenu) return;
    navMenu.classList.add('show-menu');
    navToggle?.setAttribute('aria-expanded','true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    if(!navMenu) return;
    navMenu.classList.remove('show-menu');
    navToggle?.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  };

  navToggle?.addEventListener('click', openMenu);
  navClose?.addEventListener('click', closeMenu);
  $$('.nav__link').forEach(a => a.addEventListener('click', closeMenu));

  /* Scroll progress + header state */
  const progress = $('#scroll-progress');
  let progressTicking = false;
  function updateScrollUI(){
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? (scrollY / max) * 100 : 0;
    if(progress) progress.style.width = pct + '%';
    header?.classList.toggle('scrolled', scrollY > 24);
    progressTicking = false;
  }
  addEventListener('scroll', () => {
    if(!progressTicking){
      requestAnimationFrame(updateScrollUI);
      progressTicking = true;
    }
  }, {passive:true});
  updateScrollUI();

  /* Loader */
  const loader = $('#page-loader');
  setTimeout(() => loader?.classList.add('hidden'), 520);

  /* Typing animation */
  const typingLine = $('#typing-line');
  const phrases = ['editing hooks...', 'syncing motion...', 'building retention...', 'polishing thumbnails...', 'rendering premium visuals...'];
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function typeLoop(){
    if(!typingLine || reduced) return;
    const phrase = phrases[phraseIndex];
    typingLine.textContent = deleting ? phrase.slice(0, charIndex--) : phrase.slice(0, charIndex++);
    if(!deleting && charIndex > phrase.length + 8) deleting = true;
    if(deleting && charIndex < 0){
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
    setTimeout(typeLoop, deleting ? 34 : 48);
  }
  typeLoop();

  /* Gallery */
  const videoGallery = $('#video-gallery');
  const designGallery = $('#design-gallery');

  function youtubeId(url){
    url = String(url || '').trim();
    const patterns = [/watch\?v=([^&]+)/,/youtu\.be\/([^?&]+)/,/embed\/([^?&]+)/,/shorts\/([^?&]+)/];
    for(const p of patterns){
      const m = url.match(p);
      if(m) return m[1];
    }
    return /^[a-zA-Z0-9_-]{8,}$/.test(url) ? url : '';
  }

  function embedUrl(url){
    const id = youtubeId(url);
    return id ? `https://www.youtube.com/embed/${id}` : String(url || '').trim();
  }

  function cleanAlt(src, fallback = 'Design project by Gao'){
    const name = decodeURIComponent(String(src || '').split('/').pop() || '')
      .replace(/\.[a-z0-9]+$/i,'')
      .replace(/[\-_]+/g,' ')
      .replace(/\s*\(\d+\)\s*/g,' ')
      .replace(/\s+/g,' ')
      .trim();
    return name ? `${fallback}: ${name}` : fallback;
  }

  function makeVideoCard(item, index){
    const url = item.url || item;
    const id = youtubeId(url);
    const embed = embedUrl(url);
    const card = document.createElement('article');
    card.className = 'work__card video-card reveal';
    card.dataset.videoUrl = embed;
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-label', `Open video portfolio item ${index + 1}`);

    const thumbs = id ? [
      `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
      `https://img.youtube.com/vi/${id}/0.jpg`,
      `https://img.youtube.com/vi/${id}/1.jpg`
    ] : [];

    card.innerHTML = thumbs.length ? `
      <div class="video-preview-stack work__img" aria-hidden="true">
        ${thumbs.map((src, i) => `<img src="${src}" alt="" loading="lazy" decoding="async">`).join('')}
      </div>
      <div class="video-card__scan"></div>
      <div class="video-card__label">LOW-FPS PREVIEW</div>
      <div class="big-play" aria-hidden="true"><i class="fas fa-play"></i></div>
      <div class="work__overlay"></div>
    ` : `
      <div class="work__img"></div>
      <div class="big-play" aria-hidden="true"><i class="fas fa-play"></i></div>
      <div class="work__overlay"></div>
    `;
    return card;
  }

  function makeImageCard(item, index){
    const card = document.createElement('article');
    card.className = 'work__card reveal';
    card.dataset.imageUrl = item.src;
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-label', `Open design portfolio item ${index + 1}`);
    card.innerHTML = `
      <img src="${item.src}" alt="${item.alt && !item.alt.includes(' - ') ? item.alt : cleanAlt(item.src)}" class="work__img" loading="lazy" decoding="async">
      <div class="work__overlay"><i class="fas fa-eye" aria-hidden="true"></i></div>
    `;
    return card;
  }

  if(videoGallery && window.GAO_VIDEOS){
    const frag = document.createDocumentFragment();
    window.GAO_VIDEOS.forEach((v, i) => frag.appendChild(makeVideoCard(v, i)));
    videoGallery.appendChild(frag);
  }

  if(designGallery && window.GAO_IMAGES){
    const frag = document.createDocumentFragment();
    window.GAO_IMAGES.forEach((img, i) => frag.appendChild(makeImageCard(img, i)));
    designGallery.appendChild(frag);
  }

  /* Reveal observer after dynamic gallery exists */
  const reveals = $$('.reveal');
  if(reduced){
    reveals.forEach(el => el.classList.add('active'));
  }else{
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('active');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.08, rootMargin:'0px 0px -42px 0px'});
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 5, 4) * 38}ms`;
      io.observe(el);
    });
  }

  /* Modal and lightbox */
  const lightbox = $('#lightbox');
  const lightboxBody = $('#lightbox-body');
  const lightboxClose = $('#lightbox-close');
  const contactModal = $('#contact-choice-modal');
  const contactClose = $('#contact-choice-close');

  function openLightbox(videoUrl, imageUrl){
    if(!lightbox || !lightboxBody) return;
    lightboxBody.innerHTML = '';

    if(videoUrl){
      const url = videoUrl.includes('?') ? videoUrl + '&autoplay=1&rel=0&modestbranding=1' : videoUrl + '?autoplay=1&rel=0&modestbranding=1';
      lightboxBody.innerHTML = `<div class="video-container"><iframe src="${url}" title="Gao portfolio video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
    }else if(imageUrl){
      lightboxBody.innerHTML = `<img src="${imageUrl}" alt="Design preview by Gao">`;
    }

    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(){
    lightbox?.classList.remove('show');
    lightbox?.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    setTimeout(() => { if(lightboxBody) lightboxBody.innerHTML = ''; }, 180);
  }

  document.addEventListener('click', e => {
    const card = e.target.closest('.work__card');
    if(card) openLightbox(card.dataset.videoUrl, card.dataset.imageUrl);
  });

  document.addEventListener('keydown', e => {
    if((e.key === 'Enter' || e.key === ' ') && e.target.matches('.work__card')){
      e.preventDefault();
      openLightbox(e.target.dataset.videoUrl, e.target.dataset.imageUrl);
    }
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', e => { if(e.target === lightbox) closeLightbox(); });

  function openContact(e){
    e?.preventDefault();
    contactModal?.classList.add('show');
    contactModal?.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }

  function closeContact(){
    contactModal?.classList.remove('show');
    contactModal?.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  $$('.contact-choice-trigger').forEach(el => el.addEventListener('click', openContact));
  contactClose?.addEventListener('click', closeContact);
  contactModal?.addEventListener('click', e => { if(e.target === contactModal) closeContact(); });

  const discordCopy = $('.discord-copy');
  discordCopy?.addEventListener('click', async () => {
    const discord = discordCopy.dataset.discord || 'gaojoia';
    try{
      await navigator.clipboard.writeText(discord);
      discordCopy.classList.add('copied');
      setTimeout(() => discordCopy.classList.remove('copied'), 1300);
    }catch{
      alert('Discord: ' + discord);
    }
  });

  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      closeMenu();
      closeLightbox();
      closeContact();
    }
  });

  if(reduced) return;

  /* Desktop motion that stays cheap: transform, opacity and CSS variables only */
  const starLayer = $('#bg-stars');
  if(starLayer && !isMobile){
    const frag = document.createDocumentFragment();
    for(let i = 0; i < 48; i++){
      const s = document.createElement('span');
      s.className = 'star';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.animationDuration = (8 + Math.random() * 12) + 's';
      s.style.animationDelay = (-Math.random() * 12) + 's';
      frag.appendChild(s);
    }
    starLayer.appendChild(frag);
  }

  const comets = $('#bg-comets');
  if(comets && !isMobile){
    const frag = document.createDocumentFragment();
    for(let i = 0; i < 7; i++){
      const c = document.createElement('span');
      c.className = 'comet';
      c.style.top = (12 + Math.random() * 76) + '%';
      c.style.left = (-20 - Math.random() * 50) + '%';
      c.style.animationDuration = (6 + Math.random() * 9) + 's';
      c.style.animationDelay = (-Math.random() * 10) + 's';
      frag.appendChild(c);
    }
    comets.appendChild(frag);
  }

  $$('.price-card, .step, .stat, .faq__item, .conversion-card, .conversion-list').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    }, {passive:true});
  });

  if(!isMobile && finePointer){
    const shapes = $$('.shape');
    let shapeRaf = null;
    addEventListener('pointermove', e => {
      if(shapeRaf) return;
      shapeRaf = requestAnimationFrame(() => {
        const x = (e.clientX / innerWidth - .5);
        const y = (e.clientY / innerHeight - .5);
        shapes.forEach((shape, index) => {
          const depth = (index + 1) * 14;
          shape.style.translate = `${x * depth}px ${y * depth}px`;
        });
        shapeRaf = null;
      });
    }, {passive:true});

    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    let raf = null;
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let gx = x;
    let gy = y;

    addEventListener('pointermove', e => {
      x = e.clientX;
      y = e.clientY;
      if(!raf) raf = requestAnimationFrame(loop);
    }, {passive:true});

    function loop(){
      gx += (x - gx) * .12;
      gy += (y - gy) * .12;
      glow.style.left = gx + 'px';
      glow.style.top = gy + 'px';
      if(Math.abs(x - gx) > .5 || Math.abs(y - gy) > .5){
        raf = requestAnimationFrame(loop);
      }else{
        raf = null;
      }
    }

    $$('.price-card, .step, .stat, .terminal, .contact__box, .conversion-card, .conversion-list').forEach(card => {
      card.classList.add('tilted');
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        card.style.rotate = `${py * -4}deg ${px * 5}deg`;
      }, {passive:true});
      card.addEventListener('pointerleave', () => { card.style.rotate = ''; }, {passive:true});
    });
  }
});
