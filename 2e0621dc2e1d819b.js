/* GSAP/ScrollTrigger + optional desktop Lenis. No content splitting or WebGL. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1000px)');
  const all = (selector) => [...document.querySelectorAll(selector)];
  let context, lenis, ticker, observer;
  let scrollFrame;
  const scrollItems = [];
  const clamp = n => Math.min(1, Math.max(0, n));
  function renderScroll() {
    scrollFrame = null;
    if (reduce.matches) return;
    const vh = innerHeight;
    scrollItems.forEach(({el, kind, index}) => {
      const box = el.getBoundingClientRect();
      if (box.bottom < -150 || box.top > vh + 180) return;
      const p = clamp((vh * .92 - box.top) / (vh * .48));
      if (kind === 'title') {
        el.style.setProperty('--read', `${(35 + p * 65).toFixed(1)}%`);
        el.style.translate = `0 ${(1-p)*22}px`;
      } else if (kind === 'visual') {
        const amount = fine.matches ? 1 : .45;
        el.style.transform = `perspective(1400px) translateY(${(1-p)*65*amount}px) scale(${1-(1-p)*.065*amount}) rotateX(${(1-p)*5*amount}deg)`;
        el.style.clipPath = `inset(${(1-p)*4*amount}% ${(1-p)*3*amount}% round ${(1-p)*22}px)`;
      } else {
        const q = clamp(p*1.25 - (index%3)*.10);
        el.style.translate = `0 ${(1-q)*48}px`;
        el.style.opacity = String(.45+q*.55);
      }
    });
  }
  const queueScroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(renderScroll); };
  function editorialScroll() {
    all('main .head .display, main .cta-copy .display').forEach(el => {
      el.classList.add('scroll-title'); scrollItems.push({el,kind:'title',index:0});
    });
    all('.project-visual, .ba').forEach(el => {
      el.classList.add('scroll-visual'); scrollItems.push({el,kind:'visual',index:0});
    });
    all('.arg, .member, .step').forEach((el,index) => scrollItems.push({el,kind:'card',index}));
    window.addEventListener('scroll', queueScroll, {passive:true});
    window.addEventListener('resize', queueScroll, {passive:true});
    renderScroll();
  }
  const pending = new Set();
  const managed = [];
  const reveal = element => {
    element.classList.add('is-in');
    if (!element.animate || reduce.matches) return;
    const animation = element.animate([
      { opacity: .25, transform: 'translateY(24px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 850, easing: 'cubic-bezier(.16,1,.3,1)' });
    pending.add(animation);
    animation.onfinish = () => pending.delete(animation);
  };
  function fallback() {
    if (!('IntersectionObserver' in window) || reduce.matches) return;
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { reveal(entry.target); observer.unobserve(entry.target); }
    }), { threshold: .12 });
    all('.project-meta, .cta-side').forEach(el => {
      if (el.getBoundingClientRect().top > innerHeight) observer.observe(el);
    });
  }
  function load(src, global) {
    return new Promise((resolve, reject) => {
      if (window[global]) return resolve(window[global]);
      const script = document.createElement('script');
      const timer = setTimeout(() => { script.remove(); reject(new Error('timeout')); }, 4500);
      script.src = src; script.async = true;
      script.onload = () => { clearTimeout(timer); window[global] ? resolve(window[global]) : reject(new Error(global)); };
      script.onerror = () => { clearTimeout(timer); reject(new Error('offline')); };
      document.head.append(script);
    });
  }
  function stopLenis() {
    if (ticker && window.gsap) gsap.ticker.remove(ticker);
    if (lenis) lenis.destroy();
    lenis = null; ticker = null;
  }
  async function smoothScroll() {
    if (!fine.matches || reduce.matches || navigator.connection?.saveData || !window.gsap) return;
    try {
      await load('https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.min.js', 'Lenis');
      if (!fine.matches || reduce.matches || lenis) return;
      lenis = new Lenis({ lerp: .11, smoothWheel: true, syncTouch: false,
        prevent: node => !!node.closest('.menu, .lang-menu, textarea, select') });
      lenis.on('scroll', ScrollTrigger.update);
      ticker = time => lenis?.raf(time * 1000);
      gsap.ticker.add(ticker);
    } catch (_) { /* Native scrolling remains fully usable. */ }
  }
  async function enhance() {
    editorialScroll();
    fallback();
    try {
      await load('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js', 'gsap');
      await load('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js', 'ScrollTrigger');
      if (reduce.matches) return;
      observer?.disconnect();
      pending.forEach(a => a.cancel()); pending.clear();
      gsap.registerPlugin(ScrollTrigger);
      context = gsap.context(() => {
        // One entrance per block; do not reanimate content already read.
        all('main .project-meta, main .cta-side').forEach(el => {
          if (el.getBoundingClientRect().top < innerHeight * .9) return;
          el.classList.add('motion-managed'); managed.push(el);
          const project = el.matches('.project');
          gsap.fromTo(el, { y: project ? 46 : 28, opacity: 0 }, {
            y: 0, opacity: 1, duration: project ? 1.25 : 1, ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true }
          });
        });
      });
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
      smoothScroll();
    } catch (_) { /* Native reveal fallback stays active. */ }
  }
  const hoverTargets = all('.arg, .member-photo, .svc-row, .btn--ghost');
  hoverTargets.forEach(el => {
    let frame;
    el.addEventListener('pointermove', event => {
      if (!fine.matches || reduce.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        el.style.setProperty('--my', `${event.clientY - rect.top}px`);
      });
    }, { passive: true });
    el.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame); el.style.removeProperty('--mx'); el.style.removeProperty('--my');
    });
  });
  function cleanup() {
    cancelAnimationFrame(scrollFrame); scrollFrame = null;
    window.removeEventListener('scroll', queueScroll);
    window.removeEventListener('resize', queueScroll);
    scrollItems.forEach(({el}) => {
      el.classList.remove('scroll-title','scroll-visual');
      ['--read','translate','transform','clip-path','opacity'].forEach(p=>el.style.removeProperty(p));
    });
    scrollItems.length = 0;
    observer?.disconnect(); context?.revert(); context = null;
    managed.forEach(el => el.classList.remove('motion-managed')); managed.length = 0;
    pending.forEach(a => a.cancel()); pending.clear(); stopLenis();
  }
  reduce.addEventListener('change', () => { cleanup(); if (!reduce.matches) enhance(); });
  fine.addEventListener('change', () => { cleanup(); if (!reduce.matches) enhance(); });
  if (!reduce.matches) enhance();
})();
