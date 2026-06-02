
document.addEventListener('DOMContentLoaded', () => {
    /*==================== LANGUAGE ====================*/
    const langBtn = document.getElementById('lang-btn');
    const langElements = document.querySelectorAll('[data-lang]');
    let currentLang = localStorage.getItem('gao_lang') || 'en';

    function updateLanguage() {
        document.documentElement.lang = currentLang === 'pt' ? 'pt-BR' : 'en';
        langElements.forEach(el => {
            el.style.display = (el.dataset.lang === currentLang) ? '' : 'none';
        });
    }

    if(langBtn){
        langBtn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'pt' : 'en';
            localStorage.setItem('gao_lang', currentLang);
            updateLanguage();
        });
    }
    updateLanguage();

    /*==================== HERO PARTICLES ====================*/
    const particlesContainer = document.getElementById('particles-container');
    if(particlesContainer){
        for (let i = 0; i < 40; i++) {
            const particle = document.createElement('div');
            particle.classList.add('hero-particle');
            const size = Math.random() * 4 + 1;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particle.style.animationDuration = Math.random() * 10 + 5 + 's';
            particlesContainer.appendChild(particle);
        }
    }

    /*==================== GALLERY FROM gallery-data.js ====================*/
    const videoGallery = document.getElementById('video-gallery');
    const designGallery = document.getElementById('design-gallery');

    function youtubeToEmbed(url){
        if(!url) return '';
        let id = '';
        const patterns = [
            /youtube\.com\/watch\?v=([^&]+)/,
            /youtu\.be\/([^?&]+)/,
            /youtube\.com\/embed\/([^?&]+)/,
            /youtube\.com\/shorts\/([^?&]+)/
        ];
        for(const p of patterns){
            const m = url.match(p);
            if(m){ id = m[1]; break; }
        }
        if(!id && /^[a-zA-Z0-9_-]{8,}$/.test(url.trim())) id = url.trim();
        return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    function createVideoCard(item){
        const embed = youtubeToEmbed(item.url || item);
        const id = embed.split('/embed/')[1] || '';
        const cleanId = id.split('?')[0];
        const card = document.createElement('div');
        card.className = 'work__card reveal';
        card.dataset.videoUrl = embed;
        card.innerHTML = `
            <iframe class="work__img" style="pointer-events:none;transform:scale(1.05);"
                src="${embed}?autoplay=1&mute=1&controls=0&loop=1&playlist=${cleanId}&playsinline=1"
                frameborder="0" loading="lazy" allow="autoplay; encrypted-media"></iframe>
            <div class="work__overlay"><i class="fas fa-play"></i></div>`;
        return card;
    }

    function createImageCard(item){
        const card = document.createElement('div');
        card.className = 'work__card reveal';
        card.dataset.imageUrl = item.src;
        card.innerHTML = `
            <img src="${item.src}" alt="${item.alt || 'Design project by Gao'}" class="work__img" loading="lazy">
            <div class="work__overlay"><i class="fas fa-eye"></i></div>`;
        return card;
    }

    if(videoGallery && window.GAO_VIDEOS){
        window.GAO_VIDEOS.forEach(v => videoGallery.appendChild(createVideoCard(v)));
    }
    if(designGallery && window.GAO_IMAGES){
        window.GAO_IMAGES.forEach(img => designGallery.appendChild(createImageCard(img)));
    }

    /*==================== CUSTOM CURSOR ====================*/
    const cursor = document.getElementById('custom-cursor');
    const hoverables = document.querySelectorAll('a, button, .work__card');

    if(cursor){
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            if (Math.random() > 0.3) return;
            const particle = document.createElement('div');
            particle.classList.add('cursor-trail-particle');
            document.body.appendChild(particle);
            particle.style.left = (e.clientX - 4) + 'px';
            particle.style.top = (e.clientY - 4) + 'px';
            setTimeout(() => {
                particle.style.transform = `translate(${(Math.random()-0.5)*80}px, ${(Math.random()-0.5)*80}px) scale(0)`;
                particle.style.opacity = '0';
            }, 10);
            setTimeout(() => particle.remove(), 600);
        });

        hoverables.forEach(link => {
            link.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            link.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
    }

    /*==================== LIGHTBOX ====================*/
    const lightbox = document.getElementById('lightbox');
    const lightboxBody = document.getElementById('lightbox-body');
    const lightboxClose = document.getElementById('lightbox-close');

    function openLightbox(videoUrl, imageUrl) {
        if(!lightbox || !lightboxBody) return;
        lightboxBody.innerHTML = '';
        if (videoUrl) {
            const finalUrl = videoUrl.includes('?') ? videoUrl + '&autoplay=1' : videoUrl + '?autoplay=1';
            const videoContainer = document.createElement('div');
            videoContainer.classList.add('video-container');
            videoContainer.innerHTML = `<iframe src="${finalUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
            const fallbackLink = document.createElement('a');
            fallbackLink.href = videoUrl.replace('/embed/', '/watch?v=');
            fallbackLink.target = '_blank';
            fallbackLink.classList.add('fallback-btn');
            fallbackLink.innerHTML = '<i class="fas fa-external-link-alt"></i> Open video';
            lightboxBody.appendChild(videoContainer);
            lightboxBody.appendChild(fallbackLink);
        } else if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            lightboxBody.appendChild(img);
        }
        lightbox.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function bindWorkCards(){
        document.querySelectorAll('.work__card').forEach(card => {
            if(card.dataset.bound === 'true') return;
            card.dataset.bound = 'true';
            card.addEventListener('click', () => openLightbox(card.dataset.videoUrl, card.dataset.imageUrl));
        });
    }
    bindWorkCards();

    function closeLightbox() {
        if(!lightbox) return;
        lightbox.classList.remove('show');
        document.body.style.overflow = '';
        setTimeout(() => { if(lightboxBody) lightboxBody.innerHTML = ''; }, 300);
    }

    if(lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if(lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    /*==================== CONTACT CHOICE MODAL ====================*/
    const contactModal = document.getElementById('contact-choice-modal');
    const contactClose = document.getElementById('contact-choice-close');
    const contactTriggers = document.querySelectorAll('.contact-choice-trigger');
    const discordCopy = document.querySelector('.discord-copy');

    function openContactChoice(e){
        if(e) e.preventDefault();
        if(!contactModal) return;
        contactModal.classList.add('show');
        contactModal.setAttribute('aria-hidden','false');
        document.body.style.overflow = 'hidden';
    }
    function closeContactChoice(){
        if(!contactModal) return;
        contactModal.classList.remove('show');
        contactModal.setAttribute('aria-hidden','true');
        document.body.style.overflow = '';
    }

    contactTriggers.forEach(trigger => trigger.addEventListener('click', openContactChoice));
    if(contactClose) contactClose.addEventListener('click', closeContactChoice);
    if(contactModal) contactModal.addEventListener('click', e => { if(e.target === contactModal) closeContactChoice(); });

    if(discordCopy){
        discordCopy.addEventListener('click', async () => {
            const discord = discordCopy.dataset.discord || 'gaojoia';
            try{
                await navigator.clipboard.writeText(discord);
                discordCopy.classList.add('copied');
                const label = discordCopy.querySelector('span[data-lang="' + currentLang + '"]');
                if(label){
                    const old = label.textContent;
                    label.textContent = currentLang === 'pt' ? 'Copiado: ' + discord : 'Copied: ' + discord;
                    setTimeout(() => { label.textContent = old; discordCopy.classList.remove('copied'); }, 1800);
                }
            }catch(err){ alert('Discord: ' + discord); }
        });
    }

    /*==================== EASTER EGGS ====================*/
    let keyBuffer = '';
    const overrideScreen = document.getElementById('system-override');
    const overrideText = document.getElementById('override-text');

    window.addEventListener('keydown', (e) => {
        if(e.key === 'Escape'){
            closeLightbox();
            closeContactChoice();
            return;
        }
        if(e.key.length > 1) return;
        keyBuffer += e.key.toLowerCase();
        if (keyBuffer.length > 15) keyBuffer = keyBuffer.slice(-15);
        if (keyBuffer.includes('aiden')) { triggerEasterEgg('// OVERRIDE // HACKER_DOG_ACTIVE', '#0f0'); keyBuffer = ''; }
        else if (keyBuffer.includes('primus')) { triggerEasterEgg('// PRIMUS_ONLINE // WELCOME_CREATOR', '#0ff'); keyBuffer = ''; }
        else if (keyBuffer.includes('parkour')) { document.body.style.animation = "barrelRoll 1s ease-in-out"; setTimeout(() => document.body.style.animation = "", 1000); keyBuffer = ''; }
        else if (keyBuffer.includes('watchdogs')) { triggerEasterEgg('// DEDSEC_ACCESS_GRANTED // CTOS_COMPROMISED', '#f0f'); keyBuffer = ''; }
    });

    function triggerEasterEgg(msg, color) {
        if(!overrideText || !overrideScreen) return;
        overrideText.innerText = msg;
        overrideText.style.color = color;
        overrideText.style.textShadow = `0 0 20px ${color}`;
        overrideScreen.classList.remove('hidden');
        setTimeout(() => overrideScreen.classList.add('hidden'), 2500);
    }

    /*==================== SCROLL REVEAL ====================*/
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        document.querySelectorAll('.reveal').forEach(el => {
            if (el.getBoundingClientRect().top < windowHeight - 100) el.classList.add('active');
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    /*==================== PARALLAX DEPTH ====================*/
    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.glow-orb').forEach((orb, index) => {
            const speed = (index + 1) * 0.01;
            const x = (window.innerWidth / 2 - e.clientX) * speed;
            const y = (window.innerHeight / 2 - e.clientY) * speed;
            orb.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
});
