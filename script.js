document.addEventListener('DOMContentLoaded', () => {

    /*==================== HERO PARTICLES SYSTEM ====================*/
    const particlesContainer = document.getElementById('particles-container');
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
        let particle = document.createElement('div');
        particle.classList.add('hero-particle');
        
        let size = Math.random() * 4 + 1; // 1px a 5px
        let posX = Math.random() * 100; // 0% a 100% vh
        let delay = Math.random() * 10; // 0s a 10s delay
        let duration = Math.random() * 10 + 5; // 5s a 15s duração
        
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = posX + 'vw';
        particle.style.animationDelay = delay + 's';
        particle.style.animationDuration = duration + 's';
        
        particlesContainer.appendChild(particle);
    }

    /*==================== CUSTOM CURSOR AURA & TRAIL ====================*/
    const cursor = document.getElementById('custom-cursor');
    const links = document.querySelectorAll('a, button, .work__card');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        createTrail(e.clientX, e.clientY);
    });

    links.forEach(link => {
        link.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        link.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    function createTrail(x, y) {
        if (Math.random() > 0.3) return; // Controla a quantidade de quadrados soltos

        const particle = document.createElement('div');
        particle.classList.add('cursor-trail-particle');
        document.body.appendChild(particle);
        
        particle.style.left = (x - 4) + 'px'; 
        particle.style.top = (y - 4) + 'px';

        setTimeout(() => {
            particle.style.transform = `translate(${(Math.random() - 0.5) * 80}px, ${(Math.random() - 0.5) * 80}px) scale(0)`;
            particle.style.opacity = '0';
        }, 10);

        setTimeout(() => { particle.remove(); }, 600);
    }

    /*==================== EASTER EGGS / KEYLOGGER ====================*/
    let keyBuffer = '';
    const overrideScreen = document.getElementById('system-override');
    const overrideText = document.getElementById('override-text');

    window.addEventListener('keydown', (e) => {
        if(e.key.length > 1) return; 

        keyBuffer += e.key.toLowerCase();
        if (keyBuffer.length > 15) keyBuffer = keyBuffer.slice(-15);

        if (keyBuffer.includes('aiden')) {
            triggerEasterEgg('// OVERRIDE // HACKER_DOG_ACTIVE', '#0f0');
            keyBuffer = '';
        } else if (keyBuffer.includes('primus')) {
            triggerEasterEgg('// PRIMUS_ONLINE // WELCOME_CREATOR', '#0ff');
            keyBuffer = '';
        } else if (keyBuffer.includes('parkour')) {
            document.body.style.animation = "barrelRoll 1s ease-in-out";
            setTimeout(() => { document.body.style.animation = ""; }, 1000);
            keyBuffer = '';
        } else if (keyBuffer.includes('watchdogs')) {
            triggerEasterEgg('// DEDSEC_ACCESS_GRANTED // CTOS_COMPROMISED', '#f0f');
            keyBuffer = '';
        }
    });

    function triggerEasterEgg(msg, color) {
        overrideText.innerText = msg;
        overrideText.style.color = color;
        overrideText.style.textShadow = `0 0 20px ${color}`;
        overrideScreen.style.backgroundColor = `rgba(0,0,0,0.9)`;
        overrideScreen.classList.remove('hidden');

        let glitchCount = 0;
        let flashInterval = setInterval(() => {
            if(glitchCount % 2 === 0) {
                overrideScreen.style.backgroundColor = `rgba(${color === '#0f0' ? '0,255,0' : color === '#0ff' ? '0,255,255' : '255,0,255'}, 0.2)`;
            } else {
                overrideScreen.style.backgroundColor = 'rgba(0,0,0,0.9)';
            }
            glitchCount++;
        }, 80);

        setTimeout(() => {
            clearInterval(flashInterval);
            overrideScreen.classList.add('hidden');
        }, 2500);
    }

    /*==================== IDIOMA ====================*/
    const langBtn = document.getElementById('lang-btn');
    const langElements = document.querySelectorAll('[data-lang]');
    let currentLang = 'en';

    function updateLanguage() {
        langElements.forEach(el => {
            el.style.display = (el.dataset.lang === currentLang) ? '' : 'none';
        });
    }

    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'pt' : 'en';
        updateLanguage();
    });
    updateLanguage();

    /*==================== LIGHTBOX (PLAYER DE VÍDEO CORRIGIDO) ====================*/
    const lightbox = document.getElementById('lightbox');
    const lightboxBody = document.getElementById('lightbox-body');
    const lightboxClose = document.getElementById('lightbox-close');
    const workCards = document.querySelectorAll('.work__card');

    function openLightbox(videoUrl, imageUrl) {
        lightboxBody.innerHTML = ''; 

        if (videoUrl) {
            const videoContainer = document.createElement('div');
            videoContainer.classList.add('video-container');
            
            // Força o Autoplay
            let finalUrl = videoUrl;
            if (finalUrl.includes('?')) {
                finalUrl += '&autoplay=1';
            } else {
                finalUrl += '?autoplay=1';
            }

            videoContainer.innerHTML = `
                <iframe 
                    src="${finalUrl}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen>
                </iframe>`;
            
            // Botão Backup
            const fallbackLink = document.createElement('a');
            let watchUrl = videoUrl.replace('/embed/', '/watch?v=');
            if(watchUrl.includes('?si=')){ watchUrl = watchUrl.replace('?si=', '&si='); }
            
            fallbackLink.href = watchUrl;
            fallbackLink.target = '_blank';
            fallbackLink.classList.add('fallback-btn');
            fallbackLink.innerHTML = '<i class="fas fa-external-link-alt"></i> Abrir vídeo em nova aba';

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

    function closeLightbox() {
        lightbox.classList.remove('show');
        document.body.style.overflow = ''; 
        setTimeout(() => { lightboxBody.innerHTML = ''; }, 300); 
    }

    workCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoUrl = card.getAttribute('data-video-url');
            const imageUrl = card.getAttribute('data-image-url');
            openLightbox(videoUrl, imageUrl);
        });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    /*==================== SCROLL REVEAL ANIMATION ====================*/
    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;

        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                el.classList.add('active');
            }
        });
    };
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); 
});