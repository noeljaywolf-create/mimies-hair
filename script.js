(() => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const hasGSAP = !!(window.gsap && window.ScrollTrigger);

    /* ============================================================
       PRELOADER
       ============================================================ */
    const preloader = document.getElementById('preloader');
    if (preloader) {
        const hide = () => preloader.classList.add('hidden');
        if (prefersReducedMotion) hide();
        else window.addEventListener('load', () => setTimeout(hide, 500));
        setTimeout(hide, 3500);
    }

    /* ============================================================
       CUSTOM CURSOR
       ============================================================ */
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!isTouch && dot && ring) {
        let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.transform = `translate(${mouseX - 3.5}px, ${mouseY - 3.5}px)`;
        });
        const loop = () => {
            ringX += (mouseX - ringX) * 0.16;
            ringY += (mouseY - ringY) * 0.16;
            ring.style.transform = `translate(${ringX - 19}px, ${ringY - 19}px)`;
            requestAnimationFrame(loop);
        };
        loop();
        document.querySelectorAll('a, button, .gallery-item, .gg-item, .svc-card, .price-card, .info-card, input, select, textarea, .logo').forEach((el) => {
            el.addEventListener('mouseenter', () => ring.classList.add('grow'));
            el.addEventListener('mouseleave', () => ring.classList.remove('grow'));
        });
    }

    /* ============================================================
       NAVBAR
       ============================================================ */
    const header = document.getElementById('header');
    const onScrollNav = () => {
        if (header) header.classList.toggle('scrolled', window.scrollY > 40);
    };
    onScrollNav();
    window.addEventListener('scroll', onScrollNav, { passive: true });

    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        const closeMenu = () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.classList.remove('menu-open');
            document.documentElement.style.overflow = '';
            hamburger.setAttribute('aria-expanded', 'false');
        };
        hamburger.addEventListener('click', () => {
            const open = navLinks.classList.toggle('open');
            hamburger.classList.toggle('active', open);
            document.body.classList.toggle('menu-open', open);
            document.documentElement.style.overflow = open ? 'hidden' : '';
            hamburger.setAttribute('aria-expanded', String(open));
        });
        navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
        window.addEventListener('resize', () => {
            if (window.innerWidth > 900 && navLinks.classList.contains('open')) closeMenu();
        });
    }

    /* ============================================================
       HERO — MOUSE-TRACKED 3D SCENE
       ============================================================ */
    const scene = document.querySelector('[data-scene]');
    if (scene && !isTouch && !prefersReducedMotion) {
        const depthEls = Array.from(scene.querySelectorAll('[data-depth]')).filter(
            (el) => el.tagName !== 'VIDEO'
        );
        window.addEventListener('mousemove', (e) => {
            const nx = (e.clientX / window.innerWidth - 0.5) * 2;
            const ny = (e.clientY / window.innerHeight - 0.5) * 2;
            depthEls.forEach((el) => {
                const d = parseFloat(el.dataset.depth) || 0;
                el.style.transform = `translate3d(${(nx * d * 34).toFixed(2)}px, ${(ny * d * 22).toFixed(2)}px, 0)`;
            });
        });
    }

    /* ============================================================
       HERO — GOLD PARTICLES (custom canvas)
       ============================================================ */
    const pCanvas = document.getElementById('heroParticles');
    if (pCanvas && !prefersReducedMotion) {
        const ctx = pCanvas.getContext('2d');
        let W, H, particles;
        const resize = () => {
            W = pCanvas.width = pCanvas.offsetWidth;
            H = pCanvas.height = pCanvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize, { passive: true });

        const COUNT = Math.min(90, Math.floor(window.innerWidth / 14));
        particles = Array.from({ length: COUNT }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            r: 0.6 + Math.random() * 1.9,
            vy: -(0.15 + Math.random() * 0.45),
            vx: (Math.random() - 0.5) * 0.18,
            twinkle: Math.random() * Math.PI * 2,
            twSpeed: 0.02 + Math.random() * 0.05
        }));

        const draw = () => {
            ctx.clearRect(0, 0, W, H);
            particles.forEach((p) => {
                p.y += p.vy;
                p.x += p.vx;
                p.twinkle += p.twSpeed;
                if (p.y < -12) { p.y = H + 12; p.x = Math.random() * W; }
                if (p.x < -12) p.x = W + 12;
                if (p.x > W + 12) p.x = -12;
                const alpha = 0.2 + Math.abs(Math.sin(p.twinkle)) * 0.65;
                const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.2);
                g.addColorStop(0, `rgba(240, 212, 138, ${alpha})`);
                g.addColorStop(1, 'rgba(240, 212, 138, 0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(draw);
        };
        draw();
    }

    /* ============================================================
       SCROLL REVEAL (3D entrances)
       ============================================================ */
    const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    if (prefersReducedMotion) {
        revealEls.forEach((el) => el.classList.add('visible'));
    } else if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    entry.target.style.transitionDelay = `${delay * 0.12}s`;
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach((el) => revealObserver.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('visible'));
    }

    /* ============================================================
       3D TILT + GLARE
       ============================================================ */
    const tiltEls = document.querySelectorAll('[data-tilt]');
    if (!prefersReducedMotion && !isTouch) {
        tiltEls.forEach((el) => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width;
                const py = (e.clientY - rect.top) / rect.height;
                const x = px - 0.5;
                const y = py - 0.5;
                el.style.transition = 'transform 0.08s linear';
                el.style.transform = `rotateY(${(x * 12).toFixed(2)}deg) rotateX(${(y * -12).toFixed(2)}deg)`;
                el.style.setProperty('--mx', `${px * 100}%`);
                el.style.setProperty('--my', `${py * 100}%`);
            });
            el.addEventListener('mouseleave', () => {
                el.style.transition = 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
                el.style.transform = 'rotateY(0deg) rotateX(0deg)';
            });
        });
    }

    /* ============================================================
       PARALLAX LAYERS
       ============================================================ */
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    if (!prefersReducedMotion && !isTouch && parallaxEls.length) {
        let ticking = false;
        const applyParallax = () => {
            parallaxEls.forEach((el) => {
                const speed = parseFloat(el.dataset.parallax) || 0.3;
                const parent = el.parentElement || el;
                const rect = parent.getBoundingClientRect();
                const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -speed;
                el.style.translate = `0px ${offset.toFixed(1)}px`;
            });
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(applyParallax);
            }
        }, { passive: true });
        applyParallax();
    }

    /* ============================================================
       ANIMATED COUNTER
       ============================================================ */
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
        const animateCounter = (el) => {
            const target = parseFloat(el.dataset.count) || 0;
            const suffix = el.dataset.suffix || '';
            const duration = 1600;
            const start = performance.now();
            const tick = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(target * eased) + suffix;
                if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        counters.forEach((el) => counterObserver.observe(el));
    }

    /* ============================================================
       LIGHTBOX
       ============================================================ */
    const lightboxItems = Array.from(document.querySelectorAll('.gallery-item, .gg-item'));
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    let currentIndex = 0;

    if (lightbox && lightboxImg && lightboxItems.length) {
        const show = (index) => {
            currentIndex = (index + lightboxItems.length) % lightboxItems.length;
            const img = lightboxItems[currentIndex].querySelector('img');
            lightboxImg.src = img.currentSrc || img.src;
            lightboxImg.alt = img.alt || '';
            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
        };
        const close = () => {
            lightbox.classList.remove('open');
            lightbox.setAttribute('aria-hidden', 'true');
        };
        lightboxItems.forEach((item) => item.addEventListener('click', () => {
            show(lightboxItems.indexOf(item));
        }));
        const closeBtn = document.getElementById('lightboxClose');
        const prevBtn = document.getElementById('lightboxPrev');
        const nextBtn = document.getElementById('lightboxNext');
        if (closeBtn) closeBtn.addEventListener('click', close);
        if (prevBtn) prevBtn.addEventListener('click', () => show(currentIndex - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => show(currentIndex + 1));
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) close();
        });
        window.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft') show(currentIndex - 1);
            if (e.key === 'ArrowRight') show(currentIndex + 1);
        });
    }

    /* ============================================================
       GALLERY PAGE — FILTERING
       ============================================================ */
    const filterButtons = Array.from(document.querySelectorAll('.gallery-filter'));
    const ggGroups = Array.from(document.querySelectorAll('.gg-group'));
    if (filterButtons.length && ggGroups.length) {
        const revealItems = () => {
            ggGroups.forEach((group) => {
                if (group.classList.contains('hidden')) return;
                group.querySelectorAll('.gg-item:not(.in-view)').forEach((item, i) => {
                    setTimeout(() => item.classList.add('in-view'), i * 35);
                });
            });
        };
        const applyFilter = (active) => {
            const filter = active.dataset.filter || 'all';
            filterButtons.forEach((btn) => btn.classList.toggle('active', btn === active));
            ggGroups.forEach((group) => {
                const show = filter === 'all' || group.dataset.group === filter;
                group.classList.toggle('hidden', !show);
            });
            revealItems();
        };
        filterButtons.forEach((btn) => btn.addEventListener('click', () => applyFilter(btn)));
        const initial = filterButtons.find((btn) => btn.classList.contains('active')) || filterButtons[0];
        applyFilter(initial);
    }

    /* ============================================================
       CATEGORY CAROUSELS — build 3D sliding strips
       ============================================================ */
    const carouselData = {
        braids: { count: 9, label: 'Braids' },
        nails:  { count: 9, label: 'Nails' },
        makeup: { count: 9, label: 'Makeup' }
    };
    document.querySelectorAll('.slide-track[data-carousel]').forEach((track) => {
        const key = track.dataset.carousel;
        const cfg = carouselData[key];
        if (!cfg) return;
        let items = '';
        for (let i = 1; i <= cfg.count; i++) {
            const num = String(i).padStart(2, '0');
            items += `
                <figure class="slide-card" data-index="${i - 1}">
                    <img src="gallery/${key}/${key}-${i}.jfif" alt="${cfg.label} look ${num} by Mimies Hair" loading="lazy">
                    <figcaption>${cfg.label} — ${num}</figcaption>
                </figure>`;
        }
        track.innerHTML = items + items;
    });

    /* ============================================================
       GSAP — 3D COVERFLOW GALLERY + SCROLL MAGIC
       ============================================================ */
    const coverflow = document.getElementById('coverflow');
    const track = document.getElementById('coverflowTrack');
    const viewport = document.getElementById('coverflowViewport');
    const items = track ? Array.from(track.querySelectorAll('.gallery-item')) : [];

    if (hasGSAP && track && viewport && !prefersReducedMotion && window.innerWidth > 640) {
        gsap.registerPlugin(ScrollTrigger);

        const getAmount = () => track.scrollWidth - window.innerWidth;

        const setCards = () => {
            const center = window.innerWidth / 2;
            items.forEach((item) => {
                const rect = item.getBoundingClientRect();
                const offset = (rect.left + rect.width / 2 - center) / window.innerWidth;
                const abs = Math.abs(offset);
                gsap.set(item, {
                    rotationY: offset * -48,
                    z: abs > 1 ? -260 : 0,
                    scale: 1 - Math.min(abs * 0.32, 0.42),
                    opacity: 1 - Math.min(abs * 1.15, 0.8),
                    transformPerspective: 1200
                });
            });
        };

        document.body.classList.add('coverflow-pinned');
        gsap.to(track, {
            x: () => -getAmount(),
            ease: 'none',
            scrollTrigger: {
                trigger: coverflow,
                start: 'top top',
                end: () => '+=' + Math.round(getAmount() * 0.72),
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: setCards,
                onRefresh: setCards,
                onLeave: () => document.body.classList.remove('coverflow-pinned'),
                onEnterBack: () => document.body.classList.add('coverflow-pinned')
            }
        });
        setCards();

        /* Section heading 3D parallax — soft depth while scrolling */
        gsap.utils.toArray('.section-heading').forEach((heading) => {
            gsap.fromTo(heading, {
                rotationX: -18,
                transformOrigin: '50% 100%',
                transformPerspective: 800
            }, {
                rotationX: 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: heading.parentElement,
                    start: 'top 90%',
                    end: 'top 45%',
                    scrub: true
                }
            });
        });

        window.addEventListener('resize', () => {
            ScrollTrigger.refresh();
            setCards();
        });
    }

    /* ============================================================
       BOOKING FORM - sends booking via WhatsApp
       ============================================================ */
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = form.name.value.trim() || 'Guest';
            const phone = form.phone.value.trim();
            const service = form.service.value;
            const date = form.date.value;
            const message = form.message.value.trim();

            const lines = [
                'Hello Mimies Hair! I would like to book an appointment.',
                '',
                'Name: ' + name,
                phone ? 'Phone/WhatsApp: ' + phone : '',
                service ? 'Service: ' + service : '',
                date ? 'Preferred date: ' + date : '',
                message ? 'Notes: ' + message : ''
            ].filter(Boolean).join('\n');

            window.open('https://wa.me/27753032625?text=' + encodeURIComponent(lines), '_blank', 'noopener');

            const note = form.querySelector('.form-note');
            if (note) {
                note.textContent = 'Opening WhatsApp with your booking...';
                note.style.color = 'var(--gold-light)';
            }
        });
    }
})();

// Register service worker for offline + installability
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () {});
    });
}
