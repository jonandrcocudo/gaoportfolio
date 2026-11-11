
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
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reduced = motionParam === 'off' || (motionParam !== 'on' && prefersReducedMotion);
  root.classList.toggle('motion-on', !reduced);
  root.classList.toggle('motion-reduced', reduced);
  root.dataset.motion = reduced ? 'off' : 'on';

  const isMobile = matchMedia('(max-width: 768px)').matches;

  const storage = {
    get(key){ try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value){ try { localStorage.setItem(key, value); } catch {} }
  };

  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

  /* Language: English by default, supports ?lang=pt and remembers the visitor's choice. */
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
  setLang(urlLang || savedLang || 'en');
  langBtn?.addEventListener('click', () => setLang((root.dataset.currentLang || 'pt') === 'en' ? 'pt' : 'en'));

  function syncScrollLock(){
    document.body.style.overflow = document.querySelector('.nav__menu.show-menu,.contact-choice-modal.show,.lightbox.show') ? 'hidden' : '';
  }

  /* Header + mobile menu */
  const header = $('.header');
  const navMenu = $('#nav-menu');
  const navToggle = $('#nav-toggle');
  const navClose = $('#nav-close');

  const openMenu = () => {
    if(!navMenu) return;
    navMenu.classList.add('show-menu');
    navToggle?.setAttribute('aria-expanded','true');
    syncScrollLock();
  };

  const closeMenu = () => {
    if(!navMenu) return;
    navMenu.classList.remove('show-menu');
    navToggle?.setAttribute('aria-expanded','false');
    syncScrollLock();
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
    const loading = index === 0 ? 'eager' : 'lazy';
    const fetchPriority = index === 0 ? 'high' : 'auto';
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


  /* Video previews: load only on desktop hover/focus.
     Mobile and data-saver connections keep lightweight thumbnails and open
     the full video only after a deliberate tap/click.
  */
  function setupOptimizedVideoPreviews(){
    const cards = $$('.video-card[data-youtube-id]');
    if(!cards.length) return;

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = !!connection?.saveData;
    const slowConnection = /^(slow-2g|2g)$/.test(connection?.effectiveType || '');

    if(isMobile || reduced || saveData || slowConnection){
      cards.forEach(card => card.classList.add('poster-only'));
      return;
    }

    let activeCard = null;
    let leaveTimer = 0;

    function unload(card){
      if(!card) return;
      const holder = card.querySelector('.video-preview-player');
      if(holder) holder.replaceChildren();
      card.classList.remove('preview-ready','preview-loading');
      if(activeCard === card) activeCard = null;
    }

    function load(card){
      if(!card?.dataset.previewSrc || activeCard === card) return;
      window.clearTimeout(leaveTimer);
      if(activeCard) unload(activeCard);

      const holder = card.querySelector('.video-preview-player');
      if(!holder) return;

      card.classList.add('preview-loading');
      const iframe = document.createElement('iframe');
      const title = card.querySelector('.portfolio-card-copy strong')?.textContent || 'video';
      iframe.src = card.dataset.previewSrc;
      iframe.title = 'Muted preview: ' + title;
      iframe.loading = 'eager';
      iframe.tabIndex = -1;
      iframe.setAttribute('aria-hidden','true');
      iframe.setAttribute('allow','autoplay; encrypted-media; picture-in-picture');
      iframe.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
      iframe.addEventListener('load', () => {
        card.classList.remove('preview-loading');
        card.classList.add('preview-ready');
      }, {once:true});
      iframe.addEventListener('error', () => unload(card), {once:true});
      holder.replaceChildren(iframe);
      activeCard = card;
    }

    function scheduleUnload(card){
      window.clearTimeout(leaveTimer);
      leaveTimer = window.setTimeout(() => {
        if(activeCard === card && document.activeElement !== card && !card.matches(':hover')) unload(card);
      }, 240);
    }

    cards.forEach(card => {
      card.addEventListener('pointerenter', () => load(card), {passive:true});
      card.addEventListener('pointerleave', () => scheduleUnload(card), {passive:true});
      card.addEventListener('focusin', () => load(card));
      card.addEventListener('focusout', () => scheduleUnload(card));
    });
  }

  setupOptimizedVideoPreviews();




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
    syncScrollLock();
  }

  function closeLightbox(){
    lightbox?.classList.remove('show');
    lightbox?.setAttribute('aria-hidden','true');
    syncScrollLock();
    setTimeout(() => { if(lightboxBody) lightboxBody.replaceChildren(); }, 180);
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
    syncScrollLock();
  }

  function closeContact(){
    contactModal?.classList.remove('show');
    contactModal?.setAttribute('aria-hidden','true');
    syncScrollLock();
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


});
