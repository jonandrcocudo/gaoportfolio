
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const isMobile = matchMedia('(max-width: 768px)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Language: default English always, unless user changes it */
  const langBtn = document.getElementById('lang-btn');
  const langElements = [...document.querySelectorAll('[data-lang]')];

  function displayFor(el){
    const tag = el.tagName.toLowerCase();
    if(['span','strong','b','em','small'].includes(tag)) return 'inline';
    if(tag === 'li') return 'list-item';
    return 'block';
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
  }

  setLang(sessionStorage.getItem('gao_lang') || 'en');

  if(langBtn){
    langBtn.addEventListener('click', () => {
      setLang((root.dataset.currentLang || 'en') === 'en' ? 'pt' : 'en');
    });
  }

  /* Mobile menu */
  const navMenu = document.getElementById('nav-menu');
  const navToggle = document.getElementById('nav-toggle');
  const navClose = document.getElementById('nav-close');

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
  document.querySelectorAll('.nav__link').forEach(a => a.addEventListener('click', closeMenu));

  /* Typing animation: tiny, no layout spam */
  const typingLine = document.getElementById('typing-line');
  const phrases = ['editing hooks...', 'syncing motion...', 'building retention...', 'rendering premium visuals...'];
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
  const videoGallery = document.getElementById('video-gallery');
  const designGallery = document.getElementById('design-gallery');

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
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }

  function makeVideoCard(item){
    const url = item.url || item;
    const id = youtubeId(url);
    const embed = embedUrl(url);
    const card = document.createElement('article');
    card.className = 'work__card reveal';
    card.dataset.videoUrl = embed;

    /* Thumbnail previews are way smoother than many YouTube iframes */
    const thumb = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
    card.innerHTML = `
      ${thumb ? `<img src="${thumb}" class="work__img" alt="Video preview by Gao" loading="lazy">` : `<div class="work__img"></div>`}
      <div class="work__overlay"><i class="fas fa-play"></i></div>
    `;
    return card;
  }

  function makeImageCard(item){
    const card = document.createElement('article');
    card.className = 'work__card reveal';
    card.dataset.imageUrl = item.src;
    card.innerHTML = `
      <img src="${item.src}" alt="${item.alt || 'Design project by Gao'}" class="work__img" loading="lazy">
      <div class="work__overlay"><i class="fas fa-eye"></i></div>
    `;
    return card;
  }

  if(videoGallery && window.GAO_VIDEOS){
    const frag = document.createDocumentFragment();
    window.GAO_VIDEOS.forEach(v => frag.appendChild(makeVideoCard(v)));
    videoGallery.appendChild(frag);
  }

  if(designGallery && window.GAO_IMAGES){
    const frag = document.createDocumentFragment();
    window.GAO_IMAGES.forEach(img => frag.appendChild(makeImageCard(img)));
    designGallery.appendChild(frag);
  }

  /* Reveal */
  const reveals = [...document.querySelectorAll('.reveal')];
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
    }, {threshold:.08, rootMargin:'0px 0px -40px 0px'});
    reveals.forEach(el => io.observe(el));
  }

  /* Smooth magnetic buttons/cards desktop only */
  if(!isMobile && !reduced){
    document.querySelectorAll('.btn, .price-card, .work__card').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `translate3d(${x * 5}px, ${y * 5 - 3}px, 0)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* Modals */
  const lightbox = document.getElementById('lightbox');
  const lightboxBody = document.getElementById('lightbox-body');
  const lightboxClose = document.getElementById('lightbox-close');
  const contactModal = document.getElementById('contact-choice-modal');
  const contactClose = document.getElementById('contact-choice-close');

  function openLightbox(videoUrl, imageUrl){
    if(!lightbox || !lightboxBody) return;
    lightboxBody.innerHTML = '';

    if(videoUrl){
      const url = videoUrl.includes('?') ? videoUrl + '&autoplay=1' : videoUrl + '?autoplay=1';
      lightboxBody.innerHTML = `<div class="video-container"><iframe src="${url}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
    }else if(imageUrl){
      lightboxBody.innerHTML = `<img src="${imageUrl}" alt="Design preview">`;
    }

    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(){
    lightbox?.classList.remove('show');
    document.body.style.overflow = '';
    setTimeout(() => { if(lightboxBody) lightboxBody.innerHTML = ''; }, 180);
  }

  document.querySelectorAll('.work__card').forEach(card => {
    card.addEventListener('click', () => openLightbox(card.dataset.videoUrl, card.dataset.imageUrl));
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

  document.querySelectorAll('.contact-choice-trigger').forEach(el => el.addEventListener('click', openContact));
  contactClose?.addEventListener('click', closeContact);
  contactModal?.addEventListener('click', e => { if(e.target === contactModal) closeContact(); });

  const discordCopy = document.querySelector('.discord-copy');
  discordCopy?.addEventListener('click', async () => {
    const discord = discordCopy.dataset.discord || 'gaojoia';
    try{
      await navigator.clipboard.writeText(discord);
      discordCopy.classList.add('copied');
      setTimeout(() => discordCopy.classList.remove('copied'), 1200);
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


/* =========================================================
   ANIMATION BOOST JS — light, requestAnimationFrame based
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = matchMedia('(max-width: 768px)').matches;

  /* Scroll progress */
  const progress = document.getElementById('scroll-progress');
  let ticking = false;

  function updateProgress(){
    if(!progress) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? (scrollY / max) * 100 : 0;
    progress.style.width = pct + '%';
    ticking = false;
  }

  addEventListener('scroll', () => {
    if(!ticking){
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, {passive:true});
  updateProgress();

  if(reduced) return;

  /* Star field, desktop only */
  const starLayer = document.getElementById('bg-stars');
  if(starLayer && !isMobile){
    const frag = document.createDocumentFragment();
    for(let i = 0; i < 42; i++){
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

  /* Mouse light follows cards, cheap CSS variables */
  document.querySelectorAll('.price-card, .step, .stat, .faq__item').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    }, {passive:true});
  });

  /* Parallax hero shapes desktop only */
  if(!isMobile){
    const shapes = document.querySelectorAll('.shape');
    let raf = null;
    addEventListener('pointermove', e => {
      if(raf) return;
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / innerWidth - .5);
        const y = (e.clientY / innerHeight - .5);
        shapes.forEach((shape, index) => {
          const depth = (index + 1) * 14;
          shape.style.translate = `${x * depth}px ${y * depth}px`;
        });
        raf = null;
      });
    }, {passive:true});
  }
});
