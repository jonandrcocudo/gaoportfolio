
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const motionParam = params.get('motion');

  /*
    Motion is ON by default.
    Some desktop systems/browsers report prefers-reduced-motion and the old version
    respected that globally, which made the PC version look completely static.
    Use ?motion=off only when you intentionally want a still/accessibility mode.
  */
  const reduced = motionParam === 'off';
  root.classList.toggle('motion-on', !reduced);
  root.classList.toggle('motion-reduced', reduced);
  root.dataset.motion = reduced ? 'off' : 'on';

  const isMobile = matchMedia('(max-width: 768px)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;

  const storage = {
    get(key){ try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key, value){ try { sessionStorage.setItem(key, value); } catch {} }
  };

  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

  /* Language: default English, supports ?lang=pt and session storage */
  const langBtn = $('#lang-btn');
  const langElements = $$('[data-lang]');
  const urlLang = params.get('lang');

  function displayFor(el){
    const tag = el.tagName.toLowerCase();
    if(['span','strong','b','em','small','i'].includes(tag)) return 'inline';
    if(tag === 'li') return 'list-item';
    return 'block';
  }

  function updateMetaForLang(lang){
    const isPt = lang === 'pt';
    document.title = isPt
      ? 'Gao | Editor de Vídeo para YouTube, TikTok, Gaming, Motion Manga e VFX'
      : 'Gao | Video Editor for YouTube, TikTok, Motion Manga, Gaming & VFX';
    const desc = document.querySelector('meta[name="description"]');
    if(desc){
      desc.content = isPt
        ? 'Contrate Gao (@gaoeditor) para vídeos, shorts, gaming, motion, VFX e thumbnails. Escopo após briefing.'
        : 'Hire Gao (@gaoeditor) for videos, shorts, gaming, motion, VFX and thumbnails. Scope after brief.';
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
    storage.set('gao_lang', safe);
    updateMetaForLang(safe);
  }

  const savedLang = storage.get('gao_lang');
  setLang(urlLang || savedLang || 'pt');
  langBtn?.addEventListener('click', () => setLang((root.dataset.currentLang || 'pt') === 'en' ? 'pt' : 'en'));

  /* Language gate: first thing visitors choose when entering */
  const languageGate = $('#language-gate');
  const languageChoices = $$('[data-choose-lang]');

  function openLanguageGate(){
    if(!languageGate) return;
    languageGate.classList.add('show');
    languageGate.setAttribute('aria-hidden','false');
    document.body.classList.add('language-gate-open');
  }

  function closeLanguageGate(){
    languageGate?.classList.remove('show');
    languageGate?.setAttribute('aria-hidden','true');
    document.body.classList.remove('language-gate-open');
  }

  if(!urlLang && !savedLang){
    setTimeout(openLanguageGate, 620);
  }

  languageChoices.forEach(btn => {
    btn.addEventListener('click', () => {
      setLang(btn.dataset.chooseLang === 'en' ? 'en' : 'pt');
      closeLanguageGate();
    });
  });

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
  const phrases = ['editing hooks...', 'reading brief...', 'syncing motion...', 'building retention...', 'polishing thumbnails...', 'rendering premium visuals...'];
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

  function escapeHTML(value){
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function makeVideoCard(item, index){
    const url = item.url || item;
    const id = youtubeId(url);
    const embed = embedUrl(url);
    const title = escapeHTML(item.title || `Video edit ${index + 1}`);
    const rawCategory = item.category || 'shorts';
    const categories = Array.isArray(item.categories) && item.categories.length ? item.categories : [rawCategory];
    const category = escapeHTML(rawCategory);
    const platform = escapeHTML(item.platform || 'Video edit');
    const caption = escapeHTML(item.caption || 'Click to watch the full edit.');
    const isFeatured = categories.includes('featured');
    const skillTags = Array.isArray(item.skills) ? item.skills.slice(0, 5).map(skill => `<span>${escapeHTML(skill)}</span>`).join('') : '';
    const card = document.createElement('article');
    card.className = 'work__card video-card reveal' + (isFeatured ? ' video-card--featured' : '');
    card.dataset.videoUrl = embed;
    card.dataset.category = category;
    card.dataset.categories = categories.map(c => String(c).trim()).join(' ');
    card.style.setProperty('--idle-delay', String((index % 6) * 115));
    if(id){
      card.dataset.youtubeId = id;
      card.dataset.previewSrc = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&playlist=${id}&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0`;
    }
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-label', `Open ${title}`);

    const thumb = id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : '';
    const thumbFallback = id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
    const loading = index < 3 ? 'eager' : 'lazy';
    const fetchPriority = index < 3 ? 'high' : 'auto';
    const featuredBadge = isFeatured ? '<div class="video-featured-badge">Best proof</div>' : '';
    const skills = skillTags ? `<div class="video-skill-row">${skillTags}</div>` : '';

    card.innerHTML = id ? `
      <div class="video-preview-media work__img" aria-hidden="true">
        <img class="video-thumb" src="${thumb}" alt="" loading="${loading}" decoding="async" fetchpriority="${fetchPriority}" onerror="this.onerror=null;this.src='${thumbFallback}'">
        <div class="video-preview-player"></div>
      </div>
      <div class="video-card__scan"></div>
      <div class="video-card__label">${platform}</div>
      ${featuredBadge}
      <div class="portfolio-card-copy">
        <strong>${title}</strong>
        <span>${caption}</span>
        ${skills}
      </div>
      <div class="big-play" aria-hidden="true"><i class="fas fa-play"></i></div>
      <div class="work__overlay"></div>
    ` : `
      <div class="work__img"></div>
      ${featuredBadge}
      <div class="portfolio-card-copy"><strong>${title}</strong><span>${caption}</span>${skills}</div>
      <div class="big-play" aria-hidden="true"><i class="fas fa-play"></i></div>
      <div class="work__overlay"></div>
    `;
    return card;
  }

  function makeImageCard(item, index){
    const card = document.createElement('article');
    card.className = 'work__card design-card reveal';
    card.dataset.imageUrl = item.src;
    card.dataset.category = item.category || 'thumbnail';
    card.style.setProperty('--idle-delay', String((index % 7) * 95));
    if(item.fallback) card.dataset.fallbackImage = item.fallback;
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-label', `Open ${item.title || 'design portfolio item'} ${index + 1}`);
    const alt = escapeHTML(item.alt && !item.alt.includes(' - ') ? item.alt : cleanAlt(item.fallback || item.src));
    const title = escapeHTML(item.title || cleanAlt(item.fallback || item.src, 'Design'));
    const label = escapeHTML(item.label || item.category || 'Design');
    const desc = escapeHTML(item.description || 'Visual asset by Gao');
    const src = escapeHTML(item.src);
    const fallback = escapeHTML(item.fallback || item.src);
    const sizeAttrs = item.width && item.height ? ` width="${escapeHTML(item.width)}" height="${escapeHTML(item.height)}"` : '';
    card.innerHTML = `
      <img src="${src}" alt="${alt}" class="work__img" loading="lazy" decoding="async"${sizeAttrs} onerror="this.onerror=null;this.src='${fallback}'">
      <div class="design-card__label">${label}</div>
      <div class="portfolio-card-copy portfolio-card-copy--design">
        <strong>${title}</strong>
        <span>${desc}</span>
      </div>
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


  function setupPortfolioFilters(){
    $$('[data-gallery-filter]').forEach(group => {
      const galleryId = group.dataset.galleryFilter;
      const gallery = document.getElementById(galleryId);
      if(!gallery) return;
      const buttons = $$('[data-filter]', group);
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const filter = btn.dataset.filter || 'all';
          buttons.forEach(b => b.classList.toggle('active', b === btn));
          $$('.work__card', gallery).forEach(card => {
            const cardCategories = (card.dataset.categories || card.dataset.category || '').split(/\s+/);
            const match = filter === 'all' || card.dataset.category === filter || cardCategories.includes(filter);
            card.classList.toggle('is-filtered-out', !match);
            if(match){
              requestAnimationFrame(() => card.classList.add('active'));
            }
          });
        });
      });
    });
  }

  setupPortfolioFilters();


  /* Smooth optimized video previews
     - Real muted YouTube preview, not low-FPS thumbnail cycling.
     - Lazy-loaded only when cards are visible or hovered.
     - Limits active players to keep desktop/mobile fast.
  */
  function setupOptimizedVideoPreviews(){
    const cards = $$('.video-card[data-youtube-id]');
    if(!cards.length) return;

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = !!connection?.saveData;
    const slowConnection = /^(slow-2g|2g)$/.test(connection?.effectiveType || '');

    // Keep the site optimized on weak connections. Poster still works instantly.
    if(reduced || saveData || slowConnection){
      cards.forEach(card => card.classList.add('poster-only'));
      return;
    }

    const maxActive = isMobile ? 1 : 4;
    const active = new Map();
    const visible = new Set();
    let hoverCard = null;
    let refreshTimer = 0;

    function unloadPreview(card){
      const holder = card.querySelector('.video-preview-player');
      if(holder) holder.textContent = '';
      active.delete(card);
      card.classList.remove('preview-ready','preview-loading');
    }

    function unloadOldest(except){
      let candidate = null;
      let oldest = Infinity;
      active.forEach((time, card) => {
        if(card === except || card === hoverCard) return;
        if(time < oldest){
          oldest = time;
          candidate = card;
        }
      });
      if(!candidate && active.size){
        candidate = active.keys().next().value;
      }
      if(candidate) unloadPreview(candidate);
    }

    function loadPreview(card, priority = false){
      if(!card?.dataset.previewSrc || active.has(card)) return;
      while(active.size >= maxActive) unloadOldest(card);

      const holder = card.querySelector('.video-preview-player');
      if(!holder) return;
      card.classList.add('preview-loading');
      const iframe = document.createElement('iframe');
      iframe.src = card.dataset.previewSrc;
      iframe.title = 'Muted optimized video preview';
      iframe.loading = priority ? 'eager' : 'lazy';
      iframe.tabIndex = -1;
      iframe.setAttribute('aria-hidden', 'true');
      iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      iframe.addEventListener('load', () => {
        card.classList.remove('preview-loading');
        card.classList.add('preview-ready');
      }, {once:true});
      holder.replaceChildren(iframe);
      active.set(card, performance.now());
    }

    function refreshVisiblePreviews(){
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        const sorted = [...visible]
          .filter(card => card.isConnected)
          .sort((a, b) => Math.abs(a.getBoundingClientRect().top) - Math.abs(b.getBoundingClientRect().top));

        sorted.slice(0, maxActive).forEach((card, index) => {
          const load = () => loadPreview(card, index === 0);
          if('requestIdleCallback' in window){
            requestIdleCallback(load, {timeout: 900});
          }else{
            setTimeout(load, index * 120);
          }
        });

        active.forEach((_, card) => {
          if(!visible.has(card) && card !== hoverCard) unloadPreview(card);
        });
      }, 80);
    }

    if('IntersectionObserver' in window){
      const previewObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const card = entry.target;
          if(entry.isIntersecting){
            visible.add(card);
            card.classList.add('preview-in-view');
          }else{
            visible.delete(card);
            card.classList.remove('preview-in-view');
            if(card !== hoverCard){
              setTimeout(() => {
                if(!visible.has(card) && card !== hoverCard) unloadPreview(card);
              }, 450);
            }
          }
        });
        refreshVisiblePreviews();
      }, {threshold:.25, rootMargin:'180px 0px'});
      cards.forEach(card => previewObserver.observe(card));
    }else{
      // Fallback: no observer, only load on hover/focus.
      cards.forEach(card => card.classList.add('poster-only'));
    }

    if(finePointer){
      cards.forEach(card => {
        card.addEventListener('pointerenter', () => {
          hoverCard = card;
          loadPreview(card, true);
        }, {passive:true});
        card.addEventListener('pointerleave', () => {
          hoverCard = null;
          refreshVisiblePreviews();
        }, {passive:true});
        card.addEventListener('focus', () => {
          hoverCard = card;
          loadPreview(card, true);
        });
        card.addEventListener('blur', () => {
          hoverCard = null;
          refreshVisiblePreviews();
        });
      });
    }
  }

  setupOptimizedVideoPreviews();


  /* Presentation YouTube video: autoplay muted when it enters the screen */
  const presentationBox = $('#presentation-youtube');
  let presentationLoaded = false;

  function loadPresentationVideo(){
    if(!presentationBox || presentationLoaded) return;
    const id = youtubeId(presentationBox.dataset.youtubeUrl || '');
    if(!id) return;
    presentationLoaded = true;
    presentationBox.classList.add('is-loaded');
    presentationBox.innerHTML = `<iframe title="Gao presentation video" src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=1&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${id}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  }

  if(presentationBox){
    if('IntersectionObserver' in window){
      const presentationObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if(entry.isIntersecting && entry.intersectionRatio > 0.35){
            loadPresentationVideo();
            presentationObserver.disconnect();
          }
        });
      }, {threshold:[0,.35,.65], rootMargin:'80px 0px'});
      presentationObserver.observe(presentationBox);
    }else{
      presentationBox.addEventListener('click', loadPresentationVideo, {once:true});
    }
  }

  /* Reveal observer after dynamic gallery exists */
  const reveals = $$('.reveal');
  if(reduced){
    reveals.forEach(el => el.classList.add('active'));
  }else{
    const activateVisible = () => {
      reveals.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if(r.top < innerHeight * 0.92 && r.bottom > 0){
          el.style.transitionDelay = `${Math.min(i % 5, 4) * 38}ms`;
          el.classList.add('active');
        }
      });
    };

    if('IntersectionObserver' in window){
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            entry.target.classList.add('active');
            io.unobserve(entry.target);
          }
        });
      }, {threshold:.04, rootMargin:'0px 0px -20px 0px'});
      reveals.forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i % 5, 4) * 38}ms`;
        io.observe(el);
      });
    }

    requestAnimationFrame(activateVisible);
    addEventListener('scroll', activateVisible, {passive:true});
    addEventListener('resize', activateVisible, {passive:true});

    // Watchdog: if a desktop browser fails the observer, the site still animates in.
    setTimeout(activateVisible, 260);
    setTimeout(() => reveals.forEach(el => el.classList.add('active')), 1600);
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
      const fallback = document.querySelector(`.work__card[data-image-url="${CSS.escape(imageUrl)}"]`)?.dataset.fallbackImage || imageUrl;
      lightboxBody.innerHTML = `<img src="${imageUrl}" alt="Design preview by Gao" onerror="this.onerror=null;this.src='${fallback}'">`;
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
      closeLanguageGate();
    }
  });

  if(reduced) return;

  /* Desktop motion that stays cheap: transform, opacity and CSS variables only */
  root.classList.add('motion-ready');

  // Extra guaranteed desktop motion layer: pure CSS particles added by JS.
  const desktopFx = !isMobile ? document.createElement('div') : null;
  if(desktopFx){
    desktopFx.className = 'desktop-fx';
    desktopFx.setAttribute('aria-hidden', 'true');
    const frag = document.createDocumentFragment();
    for(let i = 0; i < 28; i++){
      const dot = document.createElement('span');
      dot.style.setProperty('--x', `${Math.random() * 100}%`);
      dot.style.setProperty('--y', `${Math.random() * 100}%`);
      dot.style.setProperty('--d', `${7 + Math.random() * 10}s`);
      dot.style.setProperty('--delay', `${-Math.random() * 10}s`);
      dot.style.setProperty('--s', `${0.6 + Math.random() * 1.8}`);
      frag.appendChild(dot);
    }
    desktopFx.appendChild(frag);
    document.body.appendChild(desktopFx);
  }

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

  $$('.price-card, .micro-offer, .step, .stat, .faq__item, .conversion-card, .conversion-list').forEach(card => {
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

    $$('.price-card, .micro-offer, .step, .stat, .terminal, .contact__box, .conversion-card, .conversion-list').forEach(card => {
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
