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

  const pill = section.querySelector('.pill');
  const title = section.querySelector('.section-title');
  const sub = section.querySelector('.section-sub');
  const grid = section.querySelector('.features-grid');
  const featureCards = grid ? Array.from(grid.querySelectorAll('.feature-card')) : [];

  // Intro text animation
  if (pill || title || sub) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'top 20%',
        toggleActions: 'play none none reverse'
      }
    });

    if (pill) tl.from(pill, { y: 24, opacity: 0, duration: 0.5, ease: 'power3.out' });
    if (title) tl.from(title, { y: 28, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.2');
    if (sub) tl.from(sub, { y: 20, opacity: 0, duration: 0.5, ease: 'power3.out' }, '-=0.25');
  }

  // Cards entrance animation
  if (featureCards.length) {
    gsap.set(featureCards, { transformPerspective: 800, transformOrigin: '50% 60%' });
    gsap.from(featureCards, {
      opacity: 0,
      y: 80,
      rotateX: -18,
      rotateY: 8,
      scale: 0.94,
      filter: 'blur(4px)',
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: grid,
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      }
    });

    // Parallax on icons inside cards during scroll
    featureCards.forEach((card) => {
      const icon = card.querySelector('.feature-icon');
      if (!icon) return;
      gsap.fromTo(icon, { y: 0 }, {
        y: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });

    // Reveal inner content per card
    featureCards.forEach((card) => {
      const titleEl = card.querySelector('.feature-title');
      const descEl = card.querySelector('.feature-desc');
      const points = Array.from(card.querySelectorAll('.feature-points li'));
      const cta = card.querySelector('.feature-cta');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 78%',
          toggleActions: 'play none none reverse'
        }
      });

      if (titleEl) tl.from(titleEl, { y: 16, opacity: 0, duration: 0.35, ease: 'power2.out' });
      if (descEl) tl.from(descEl, { y: 14, opacity: 0, duration: 0.35, ease: 'power2.out' }, '-=0.1');
      if (points.length) tl.from(points, { y: 10, opacity: 0, duration: 0.25, stagger: 0.08, ease: 'power2.out' }, '-=0.05');
      if (cta) tl.from(cta, { y: 10, opacity: 0, duration: 0.3, ease: 'power2.out' }, '-=0.05');
    });

    // Hover tilt interaction
    featureCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, {
          rotateY: relX * 8,
          rotateX: -relY * 8,
          translateZ: 0,
          boxShadow: '0 18px 40px rgba(13,23,54,0.14)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          boxShadow: '0 10px 24px rgba(0,0,0,0.06)',
          duration: 0.5,
          ease: 'power3.out'
        });
      });
    });
  }

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

  const mapBlock = document.querySelector('.features-map .map-img');
  const mapWrap = document.querySelector('.features-map');
  if (mapBlock && mapWrap) {
    gsap.set(mapBlock, { scale: 0.9, filter: 'blur(2px)', opacity: 0.9 });
    gsap.to(mapBlock, {
      scale: 1,
      filter: 'blur(0px)',
      opacity: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: mapWrap,
        start: 'top bottom',
        end: 'center center',
        scrub: true
      }
    });
  }
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

// Waitlist animations (GSAP)
(function () {
  if (typeof window === 'undefined' || !window.gsap) return;
  const section = document.querySelector('.waitlist-section');
  if (!section) return;

  const cards = Array.from(section.querySelectorAll('.wl-card'));
  const title = section.querySelector('.waitlist-title, .inquiry-title');
  gsap.registerPlugin(ScrollTrigger);

  if (title) {
    gsap.from(title, {
      y: 24,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
      }
    });
  }

  if (cards.length) {
    gsap.from(cards, {
      y: 40,
      opacity: 0,
      rotateX: -10,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: section,
        start: 'top 75%'
      }
    });

    // subtle parallax on icons
    cards.forEach((card) => {
      const icon = card.querySelector('.wl-icon');
      if (!icon) return;
      gsap.fromTo(icon, { y: 0 }, {
        y: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }
  // Form fields reveal
  const form = section.querySelector('.inq-form');
  if (form) {
    const fields = Array.from(form.querySelectorAll('.field, .form-row, textarea'));
    gsap.from(fields, {
      y: 18,
      opacity: 0,
      duration: 0.5,
      stagger: 0.06,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: form,
        start: 'top 85%'
      }
    });
  }

  // Phone mockup float-in
  const phone = section.querySelector('.phone-frame');
  if (phone) {
    gsap.from(phone, {
      x: 40,
      y: 20,
      opacity: 0,
      rotate: -2,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: phone,
        start: 'top 85%'
      }
    });
  }
})();

// Testimonials modal viewer
(function () {
  const gallery = document.querySelector('.testimonials-gallery');
  if (!gallery) return;
  const modal = document.getElementById('testimonialModal');
  const modalImg = document.getElementById('testimonialModalImage');
  if (!modal || !modalImg) return;

  function open(src) {
    modalImg.src = src;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    modal.classList.remove('is-open');
    modalImg.src = '';
    document.body.style.overflow = '';
  }

  gallery.addEventListener('click', (e) => {
    const item = e.target.closest('.tstl-item');
    if (!item || !gallery.contains(item)) return;
    const src = item.getAttribute('data-full');
    if (src) open(src);
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

// Global appear-on-scroll animations
(function () {
  if (typeof window === 'undefined' || !window.gsap) return;
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  gsap.registerPlugin(ScrollTrigger);

  const fadeUpEach = (selector, opts = {}) => {
    gsap.utils.toArray(selector).forEach((el) => {
      gsap.from(el, {
        y: opts.y ?? 24,
        opacity: 0,
        duration: opts.duration ?? 0.6,
        ease: opts.ease ?? 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: el,
          start: opts.start ?? 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });
    });
  };

  // Mission section
  fadeUpEach('#mission .pill, #mission .section-title, #mission .mission-cta', { y: 26 });
  // Mission gallery cards (stagger per row)
  (function () {
    const cards = gsap.utils.toArray('#mission .flex-gallery .card');
    if (cards.length) {
      gsap.from(cards, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: '#mission .flex-gallery', start: 'top 80%', toggleActions: 'play none none reverse' },
        immediateRender: false
      });
    }
  })();

  // Features split
  fadeUpEach('#services .fs-left .fs-tab', { x: -18, y: 0, duration: 0.5 });
  fadeUpEach('#services .fs-right .fs-bubble', { y: 20, duration: 0.5 });

  // Earn subsections: titles, cards, benefits, CTA
  fadeUpEach('.earn-section .earn-content .pill, .earn-section .earn-content .section-title', { y: 20 });
  fadeUpEach('.rfu .rfu-title', { y: 20 });
  fadeUpEach('.rfu .rfu-card', { y: 24 });
  (function () {
    const benefits = gsap.utils.toArray('.rfu .rfu-benefits .benefit');
    if (benefits.length) {
      gsap.from(benefits, {
        y: 16,
        opacity: 0,
        duration: 0.45,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: { trigger: benefits[0].closest('.rfu'), start: 'top 75%' }
      });
    }
  })();
  fadeUpEach('.rfu .rfu-cta', { y: 18, duration: 0.45 });

  // Testimonials
  fadeUpEach('#testimonials .testimonials-header', { y: 20 });
  fadeUpEach('.testimonials-gallery', { y: 20, duration: 0.6 });

  // End hero
  fadeUpEach('.end-section .end-content', { y: 20, duration: 0.6 });

  // Footer
  fadeUpEach('.site-footer .footer-top, .site-footer .footer-bottom', { y: 18, duration: 0.5 });
})();