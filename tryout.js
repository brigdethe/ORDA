(function fixRelativeImagePaths() {
  try {
    const replace = (s) => s.replace(/\.\.\/images\//g, 'images/');
    document.querySelectorAll('[src]').forEach(el => {
      const v = el.getAttribute('src');
      if (v && v.includes('../images/')) el.setAttribute('src', replace(v));
    });
    document.querySelectorAll('[style]').forEach(el => {
      const v = el.getAttribute('style');
      if (v && v.includes('../images/')) el.setAttribute('style', replace(v));
    });
    document.querySelectorAll('[data-full]').forEach(el => {
      const v = el.getAttribute('data-full');
      if (v && v.includes('../images/')) el.setAttribute('data-full', replace(v));
    });
  } catch (_) {}
})();

(function () {
  const gallery = document.querySelector('.mission-section .flex-gallery');
  if (!gallery) return;
  const cards = Array.from(gallery.querySelectorAll('.card'));
  if (cards.length === 0) return;
  cards.forEach(card => card.classList.add('is-active'));
  gallery.addEventListener('mouseenter', event => {
    const card = event.target.closest('.card');
    if (card && gallery.contains(card)) {
      cards.forEach(c => c.classList.remove('is-active'));
      card.classList.add('is-active');
    }
  }, true);
  gallery.addEventListener('mouseleave', () => {
    const anyExpanded = cards.some(c => c.classList.contains('is-expanded'));
    if (!anyExpanded) {
      cards.forEach(c => c.classList.add('is-active'));
    }
  }, true);
  gallery.addEventListener('click', event => {
    const card = event.target.closest('.card');
    if (!card || !gallery.contains(card)) return;
    const wasExpanded = card.classList.contains('is-expanded');
    cards.forEach(c => {
      c.classList.remove('is-expanded');
      c.classList.remove('is-active');
    });
    if (!wasExpanded) {
      card.classList.add('is-expanded');
      card.classList.add('is-active');
    } else {
      cards.forEach(c => c.classList.add('is-active'));
    }
  });
})();

// Features section GSAP animations
(function () {
  if (typeof window === 'undefined') return;
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const section = document.querySelector('.features-section');
  if (!section || prefersReduced) return;

  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  // Removed GSAP scroll-in animations for features section content (intro, cards, parallax, reveals, hover tilt)

  // Features/services carousel (GSAP-driven)
  const carouselRoot = document.querySelector('.features-carousel');
  if (carouselRoot) {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const track = carouselRoot.querySelector('.carousel-track');
    const slides = Array.from(carouselRoot.querySelectorAll('.carousel-slide'));
    const prevBtn = carouselRoot.querySelector('.carousel-btn.prev');
    const nextBtn = carouselRoot.querySelector('.carousel-btn.next');
    const dotsWrap = carouselRoot.querySelector('.carousel-dots');

    let index = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));
    let autoTween = null;
    const autoplaySeconds = 5.5;
    let activeObserver = null;

    // Build dots
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === index) dot.setAttribute('aria-selected', 'true');
      const prog = document.createElement('span');
      prog.className = 'dot-progress';
      dot.appendChild(prog);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function updateDots(i) {
      Array.from(dotsWrap.children).forEach((d, di) => {
        if (di === i) d.setAttribute('aria-selected', 'true');
        else d.removeAttribute('aria-selected');
        let p = d.querySelector('.dot-progress');
        if (!p) {
          p = document.createElement('span');
          p.className = 'dot-progress';
          d.appendChild(p);
        }
        if (window.gsap) {
          gsap.set(p, { transformOrigin: 'left center', scaleX: 0 });
        } else {
          p.style.transformOrigin = 'left center';
          p.style.transform = 'scaleX(0)';
        }
      });
    }

    function setTrackHeight(el, animate) {
      const isMobile = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
      if (!isMobile) return; // desktop uses fixed CSS height
      const targetHeight = el.offsetHeight;
      if (prefersReduced || !animate) {
        gsap.set(track, { height: targetHeight });
      } else {
        gsap.to(track, { height: targetHeight, duration: 0.5, ease: 'power3.inOut' });
      }
    }

    function observeActiveSlide(el) {
      if (activeObserver) activeObserver.disconnect();
      if (!('ResizeObserver' in window)) return;
      activeObserver = new ResizeObserver(() => setTrackHeight(el, false));
      activeObserver.observe(el);
    }

    // Prepare initial state
    slides.forEach((s, i) => { if (i !== index) s.classList.remove('is-active'); });
    slides[index].classList.add('is-active');
    setTrackHeight(slides[index], false);
    observeActiveSlide(slides[index]);

    function animateInElements(container) {
      const elements = [
        container.querySelector('.slide-kicker'),
        container.querySelector('.slide-title'),
        container.querySelector('.slide-desc'),
        ...Array.from(container.querySelectorAll('.slide-list li')),
        container.querySelector('.slide-more'),
        container.querySelector('.slide-cta')
      ].filter(Boolean);
      if (elements.length === 0 || prefersReduced) return null;
      return gsap.from(elements, {
        opacity: 0,
        y: 18,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.07
      });
    }

    function goTo(newIndex) {
      if (newIndex === index || newIndex < 0 || newIndex >= slides.length) return;
      const fromEl = slides[index];
      const toEl = slides[newIndex];
      const direction = newIndex > index ? 1 : -1;

      // Pause autoplay while transitioning
      stopAutoplay();

      if (prefersReduced) {
        fromEl.classList.remove('is-active');
        toEl.classList.add('is-active');
        index = newIndex;
        setTrackHeight(toEl, true);
        observeActiveSlide(toEl);
        updateDots(index);
        startAutoplay();
        return;
      }

      // Stack for crossfade/slide
      gsap.set(toEl, { position: 'absolute', inset: 0, opacity: 0, x: 40 * direction });
      toEl.classList.add('is-active');

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        onComplete: () => {
          fromEl.classList.remove('is-active');
          gsap.set(toEl, { position: 'relative', clearProps: 'position,inset' });
          observeActiveSlide(toEl);
          startAutoplay();
        }
      });

      tl.add(() => setTrackHeight(toEl, true), 0)
        .to(fromEl, { opacity: 0, x: -40 * direction, duration: 0.45 }, 0)
        .to(toEl, { opacity: 1, x: 0, duration: 0.5 }, 0)
        .add(animateInElements(toEl), '>-0.25');

      index = newIndex;
      updateDots(index);
    }

    function startAutoplay() {
      if (prefersReduced) return;
      if (autoTween) autoTween.kill();
      autoTween = gsap.delayedCall(autoplaySeconds, () => goTo((index + 1) % slides.length));
    }

    function stopAutoplay() {
      if (autoTween) { autoTween.kill(); autoTween = null; }
    }

    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));

    // Pause/resume on hover/focus
    carouselRoot.addEventListener('mouseenter', stopAutoplay);
    carouselRoot.addEventListener('mouseleave', startAutoplay);
    carouselRoot.addEventListener('focusin', stopAutoplay);
    carouselRoot.addEventListener('focusout', startAutoplay);

    // Resize handling
    window.addEventListener('resize', () => setTrackHeight(slides[index], false));
    window.addEventListener('load', () => setTrackHeight(slides[index], false));

    // Recompute on breakpoint changes explicitly
    if (window.matchMedia) {
      const mq = window.matchMedia('(max-width: 640px)');
      const handler = () => setTrackHeight(slides[index], false);
      mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
    }

    // Start autoplay only when in view
    if (window.gsap && window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: carouselRoot,
        start: 'top 85%',
        end: 'bottom 15%',
        onEnter: startAutoplay,
        onEnterBack: startAutoplay,
        onLeave: stopAutoplay,
        onLeaveBack: stopAutoplay
      });
    } else {
      startAutoplay();
    }
  }

  // Landing full-bleed hero carousel
  (function initLandingCarousel() {
    const root = document.querySelector('.landing-carousel');
    if (!root) return;
    const track = root.querySelector('.landing-track');
    const slides = Array.from(root.querySelectorAll('.landing-slide'));
    const prev = root.querySelector('.landing-btn.prev');
    const next = root.querySelector('.landing-btn.next');
    const dotsWrap = root.querySelector('.landing-dots');
    if (slides.length <= 1) return;

    let index = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));
    let timer = null;
    let progressTween = null;
    let progressElapsed = 0;
    let lastProgressIndex = index;
    const autoplaySeconds = 6;
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Build dots
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === index) dot.setAttribute('aria-selected', 'true');
      const prog = document.createElement('span');
      prog.className = 'dot-progress';
      dot.appendChild(prog);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function updateDots(i) {
      Array.from(dotsWrap.children).forEach((d, di) => {
        if (di === i) d.setAttribute('aria-selected', 'true');
        else d.removeAttribute('aria-selected');
        let p = d.querySelector('.dot-progress');
        if (!p) {
          p = document.createElement('span');
          p.className = 'dot-progress';
          d.appendChild(p);
        }
        if (window.gsap) {
          gsap.set(p, { transformOrigin: 'left center', scaleX: 0 });
        } else {
          p.style.transformOrigin = 'left center';
          p.style.transform = 'scaleX(0)';
        }
      });
    }

    function goTo(newIndex) {
      if (newIndex === index || newIndex < 0 || newIndex >= slides.length) return;
      const from = slides[index];
      const to = slides[newIndex];
      const dir = newIndex > index ? 1 : -1;

      stop();

      if (prefersReduced || !window.gsap) {
        from.classList.remove('is-active');
        to.classList.add('is-active');
        index = newIndex;
        updateDots(index);
        start();
        return;
      }

      gsap.set(to, { position: 'absolute', inset: 0, opacity: 0, x: 60 * dir, zIndex: 2 });
      to.classList.add('is-active');
      gsap.set(from, { zIndex: 1 });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        onComplete: () => {
          from.classList.remove('is-active');
          // Keep slides absolutely positioned to layer content over background without reflow
          gsap.set(to, { position: 'absolute', inset: 0, clearProps: 'zIndex' });
          start();
        }
      });

      tl.to(from, { opacity: 0, x: -60 * dir, duration: 0.5 }, 0)
        .to(to, { opacity: 1, x: 0, duration: 0.6 }, 0);

      index = newIndex;
      updateDots(index);
      // restart progress for new active dot
      if (!prefersReduced) {
        const activeDot = dotsWrap.children[index];
        const prog = activeDot && activeDot.querySelector('.dot-progress');
        if (prog && window.gsap) {
          if (progressTween) { progressTween.kill(); }
          progressTween = gsap.fromTo(prog, { scaleX: 0 }, { scaleX: 1, duration: autoplaySeconds, ease: 'linear' });
        }
      }
    }

    function start() {
      if (prefersReduced) return;
      stop();
      // animate progress on active dot
      const activeDot = dotsWrap.children[index];
      const prog = activeDot && activeDot.querySelector('.dot-progress');
      const remaining = (lastProgressIndex === index ? (autoplaySeconds - progressElapsed) : autoplaySeconds);
      progressElapsed = 0;
      lastProgressIndex = index;
      if (prog && window.gsap) {
        progressTween = gsap.fromTo(prog, { scaleX: 0 }, { scaleX: 1, duration: remaining, ease: 'linear', onUpdate: () => { /* track elapsed via totalProgress */ }, onComplete: () => { progressElapsed = 0; } });
      }
      timer = setTimeout(() => goTo((index + 1) % slides.length), remaining * 1000);
    }

    function stop() {
      if (timer) { clearTimeout(timer); timer = null; }
      if (progressTween) {
        try {
          progressElapsed = (progressTween.totalProgress ? progressTween.totalProgress() : 0) * autoplaySeconds;
        } catch (e) { progressElapsed = 0; }
        progressTween.kill();
        progressTween = null;
      }
    }

    prev.addEventListener('click', () => goTo((index - 1 + slides.length) % slides.length));
    next.addEventListener('click', () => goTo((index + 1) % slides.length));
    
    // Also allow clicking dots to restart progress immediately
    dotsWrap.addEventListener('click', () => {
      stop();
      start();
    });
          root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', start);
      root.addEventListener('focusin', stop);
      root.addEventListener('focusout', start);

      // Swipe/drag gesture support to navigate slides
      (function initSwipe() {
        const swipeThresholdPx = 40;
        const quickSwipeTimeMs = 250;
        const rootEl = root;

        if ('PointerEvent' in window) {
          let isPointerDown = false;
          let startX = 0;
          let startY = 0;
          let isHorizontal = null;
          let pointerId = null;
          let startTime = 0;

          rootEl.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            isPointerDown = true;
            pointerId = e.pointerId;
            startX = e.clientX;
            startY = e.clientY;
            isHorizontal = null;
            startTime = performance.now();
            stop();
            try { rootEl.setPointerCapture(pointerId); } catch (_) {}
          });

          rootEl.addEventListener('pointermove', (e) => {
            if (!isPointerDown) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (isHorizontal === null) {
              if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
                isHorizontal = Math.abs(dx) >= Math.abs(dy);
              }
            }
            if (isHorizontal) {
              e.preventDefault();
            }
          }, { passive: false });

          const endPointer = (e) => {
            if (!isPointerDown) return;
            isPointerDown = false;
            try { rootEl.releasePointerCapture(pointerId); } catch (_) {}
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const elapsed = performance.now() - startTime;
            const horizontalSwipe = (Math.abs(dx) > swipeThresholdPx && Math.abs(dx) > Math.abs(dy)) || (elapsed < quickSwipeTimeMs && Math.abs(dx) > 20);
            if (isHorizontal && horizontalSwipe) {
              if (dx < 0) goTo((index + 1) % slides.length);
              else goTo((index - 1 + slides.length) % slides.length);
            } else {
              start();
            }
          };

          rootEl.addEventListener('pointerup', endPointer);
          rootEl.addEventListener('pointercancel', () => { isPointerDown = false; start(); });
        } else {
          let startX = 0, startY = 0, startTime = 0, dragging = false;
          rootEl.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) return;
            const t = e.touches[0];
            startX = t.clientX; startY = t.clientY; startTime = performance.now();
            dragging = true;
            stop();
          }, { passive: true });

          rootEl.addEventListener('touchmove', (e) => {
            if (!dragging) return;
            const t = e.touches[0];
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;
            if (Math.abs(dx) > Math.abs(dy)) e.preventDefault();
          }, { passive: false });

          const handleTouchEnd = (e) => {
            if (!dragging) return;
            dragging = false;
            const t = e.changedTouches[0];
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;
            const elapsed = performance.now() - startTime;
            const horizontalSwipe = (Math.abs(dx) > swipeThresholdPx && Math.abs(dx) > Math.abs(dy)) || (elapsed < quickSwipeTimeMs && Math.abs(dx) > 20);
            if (horizontalSwipe) {
              if (dx < 0) goTo((index + 1) % slides.length);
              else goTo((index - 1 + slides.length) % slides.length);
            } else {
              start();
            }
          };

          rootEl.addEventListener('touchend', handleTouchEnd, { passive: true });
          rootEl.addEventListener('touchcancel', () => { dragging = false; start(); }, { passive: true });
        }
      })();

      // Start when in view
    if (window.gsap && window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: root,
        start: 'top 85%',
        end: 'bottom 15%',
        onEnter: start,
        onEnterBack: start,
        onLeave: stop,
        onLeaveBack: stop
      });
    } else {
      start();
    }
  })();

})(); 

// FAQ accordion (progressively enhanced)
(function () {
  const list = document.querySelector('.faq-list');
  if (!list) return;
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-question');
    if (!btn || !list.contains(btn)) return;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const answer = document.getElementById(btn.getAttribute('aria-controls'));
    if (!answer) return;

    // Measure content for smooth height animation
    const setOpen = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        answer.hidden = false;
        const contentHeight = answer.scrollHeight;
        answer.classList.add('is-open');
        answer.style.maxHeight = contentHeight + 'px';
      } else {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        requestAnimationFrame(() => {
          answer.classList.remove('is-open');
          answer.style.maxHeight = '0px';
        });
        answer.addEventListener('transitionend', function onEnd() {
          answer.hidden = true;
          answer.removeEventListener('transitionend', onEnd);
        });
      }
    };

    setOpen(!expanded);
  });
})();


// Testimonials modal viewer (text-based)
(function () {
  const gallery = document.querySelector('.testimonials-gallery');
  if (!gallery) return;
  const modal = document.getElementById('testimonialModal');
  const quoteEl = document.getElementById('testimonialModalQuote');
  const nameEl = document.getElementById('testimonialModalName');
  const roleEl = document.getElementById('testimonialModalRole');
  if (!modal || !quoteEl || !nameEl || !roleEl) return;

  function open({ quote, name, role }) {
    quoteEl.textContent = `“${quote}”`;
    nameEl.textContent = name || '';
    roleEl.textContent = role || '';
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    modal.classList.remove('is-open');
    quoteEl.textContent = '';
    nameEl.textContent = '';
    roleEl.textContent = '';
    document.body.style.overflow = '';
  }

  function handleActivate(target) {
    const item = target.closest('.tstl-item');
    if (!item || !gallery.contains(item)) return;
    const quote = item.getAttribute('data-quote');
    const name = item.getAttribute('data-name');
    const role = item.getAttribute('data-role');
    if (quote) open({ quote, name, role });
  }

  gallery.addEventListener('click', (e) => handleActivate(e.target));
  gallery.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActivate(e.target);
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-close]') || e.target === modal) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
})();

// Navbar scroll shadow and active link highlighting
(function () {
  const nav = document.querySelector('.site-nav');
  const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (!nav || links.length === 0) return;

  // Shadow on scroll for sticky nav
  const onScroll = () => {
    if (window.scrollY > 4) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active link highlighting
  const idToLink = new Map();
  const observeTargets = [];
  links.forEach(link => {
    const id = link.getAttribute('href').slice(1);
    const sec = document.getElementById(id);
    if (sec) {
      idToLink.set(id, link);
      observeTargets.push(sec);
    }
  });

  let currentId = null;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      if (entry.isIntersecting) {
        currentId = id;
      }
    });
    if (currentId) {
      links.forEach(a => a.classList.remove('is-active'));
      const active = idToLink.get(currentId);
      if (active) active.classList.add('is-active');
    }
  }, { root: null, rootMargin: '0px 0px -60% 0px', threshold: 0.2 });

  observeTargets.forEach(sec => io.observe(sec));
})();

// Mobile nav toggle
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('mobileNav');
  const panel = nav ? nav.querySelector('.mobile-nav-panel') : null;
  if (!toggle || !nav || !panel) return;

  const open = () => {
    nav.classList.add('is-open');
    nav.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    nav.classList.remove('is-open');
    nav.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('is-open');
    isOpen ? close() : open();
  });

  nav.addEventListener('click', (e) => {
    if (e.target === nav || e.target.matches('[data-close]')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) close();
  });

  // Close when a link is clicked
  nav.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', close));
})();

// Features split interactions
(function () {
  const root = document.querySelector('#services .features-split');
  if (!root) return;
  const tabs = Array.from(root.querySelectorAll('.fs-tab'));
  const panels = Array.from(root.querySelectorAll('.fs-panel'));
  function activate(key) {
    const tab = tabs.find(t => t.dataset.key === key);
    const panel = panels.find(p => p.id === `fs-${key}`);
    if (!tab || !panel) return;
    const previous = panels.find(p => p.classList.contains('is-active'));
    tabs.forEach(t => { t.classList.toggle('is-active', t === tab); t.setAttribute('aria-selected', String(t === tab)); });
    if (previous === panel) return;
    if (window.gsap) {
      if (previous) {
        gsap.to(previous, { opacity: 0, duration: 0.25, onComplete: () => { previous.classList.remove('is-active'); } });
      }
      panel.classList.add('is-active');
      gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    } else {
      if (previous) previous.classList.remove('is-active');
      panel.classList.add('is-active');
    }
  }
  tabs.forEach(t => t.addEventListener('click', () => activate(t.dataset.key)));
})();

// Simple reveal-on-scroll for content below the hero (no GSAP)
(function initSimpleReveal() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const inHero = (el) => !!el.closest('.landing-section');

  const selectors = [
    '#mission .mission-content',
    '#mission .flex-gallery .card',
    '#services .features-split',
    '.earn-section .earn-content',
    '.rfu',
    '.faq-section .faq-item',
    '.waitlist-section .inquiry-wrap',
    '#testimonials .testimonials-header',
    '.testimonials-gallery',
    '.end-section .end-content',
    '.site-footer .footer-top',
    '.site-footer .footer-bottom'
  ];

  const targets = [];
  selectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      if (!inHero(el)) targets.push(el);
    });
  });

  if (targets.length === 0) return;

  if (prefersReduced) {
    targets.forEach((el) => el.classList.add('reveal', 'is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  targets.forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
  });
})();

