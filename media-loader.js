/* Shared media lifecycle: lazy previews and one responsive background source. */
(() => {
  'use strict';
  let disposePortfolio = () => {};
  window.dcSetupPortfolioMedia = (rows, {labels, reduce, reset}) => {
    disposePortfolio();
    const controller = new AbortController();
    const options = {signal: controller.signal};
    const visible = row => {
      const r = row.getBoundingClientRect();
      return row.isConnected && !document.hidden && r.width > 0 && r.bottom > 0 && r.top < innerHeight;
    };
    const state = row => {
      const b = row.querySelector('.play-toggle');
      const active = [...row.querySelectorAll('video')].some(v => !v.paused);
      if (b) { b.textContent = labels[active ? 4 : 3]; b.setAttribute('aria-pressed', String(active)); }
    };
    const stop = (row, rewind = false) => {
      row.dataset.playing = 'false';
      row.querySelectorAll('video').forEach(v => {
        v.pause();
        if (rewind && v.readyState) try { v.currentTime = 0; } catch {}
      });
      state(row);
    };
    const start = (row, rewind = false) => {
      if (!visible(row) || row.dataset.userPaused === 'true') return;
      row.dataset.playing = 'true';
      row.querySelectorAll('video').forEach(v => {
        if (!v.getClientRects().length) return;
        v.muted = true; v.defaultMuted = true;
        if (!v.getAttribute('src')) v.src = v.dataset.src;
        else if (v.error) v.load();
        if (rewind && v.readyState) try { v.currentTime = 0; } catch {}
        v.play().then(() => {
          if (!visible(row) || row.dataset.playing !== 'true') v.pause();
          state(row);
        }).catch(() => state(row));
      });
    };
    rows.forEach(row => {
      const button = row.querySelector('.play-toggle');
      if (button) button.onclick = () => {
        if ([...row.querySelectorAll('video')].some(v => !v.paused)) {
          row.dataset.userPaused = 'true'; stop(row);
        } else { row.dataset.userPaused = 'false'; start(row); }
      };
      row.querySelectorAll('video').forEach(v => {
        v.addEventListener('play', () => state(row), options);
        v.addEventListener('pause', () => state(row), options);
        // Keep the poster visible on network failure and allow a manual retry.
        v.addEventListener('error', () => { row.dataset.playing = 'false'; state(row); }, options);
      });
    });
    const automatic = () => !reduce.matches && !navigator.connection?.saveData;
    const sync = () => rows.forEach(row => {
      if (visible(row) && automatic()) start(row); else stop(row);
    });
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting && automatic()) start(e.target, reset);
        else { stop(e.target, reset); if (reset) e.target.dataset.userPaused = 'false'; }
      }), {threshold: reset ? .15 : .12});
      rows.forEach(row => observer.observe(row));
    } else { addEventListener('scroll', sync, {...options, passive:true}); sync(); }
    document.addEventListener('visibilitychange', sync, options);
    addEventListener('pageshow', sync, options);
    addEventListener('pagehide', () => rows.forEach(row => stop(row)), options);
    reduce.addEventListener('change', sync, options);
    disposePortfolio = () => {controller.abort(); observer?.disconnect(); rows.forEach(row => stop(row));};
    return observer;
  };
  const background = document.querySelector('video[data-background]');
  if (!background) return;
  const small = matchMedia('(max-width:700px)');
  const desktop3D = matchMedia('(min-width:701px) and (hover:hover) and (pointer:fine)');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  let retry = 0;
  const play = () => {
    if (document.hidden || desktop3D.matches || reduce.matches) {background.pause(); return;}
    background.muted = true; background.defaultMuted = true;
    background.play().catch(() => {});
  };
  const select = () => {
    if(desktop3D.matches){background.pause();if(background.hasAttribute('src')){background.removeAttribute('src');background.load();}return;}
    if (small.matches && navigator.connection?.saveData) return;
    if (reduce.matches) {background.pause(); return;}
    const name = small.matches ? '88a042ce0a37b7d8' : '35c9305efc575716';
    const src = {"88a042ce0a37b7d8": "88a042ce0a37b7d8.webm", "35c9305efc575716": "35c9305efc575716.webm"}[name];
    if (background.getAttribute('src') !== src) {
      retry = 0;
      background.poster = name + '-poster.webp';
      background.src = src;
      background.preload = 'auto';
      background.load();
    }
    play();
  };
  background.addEventListener('canplay', play);
  background.addEventListener('error', () => {
    if (retry++ < 1) setTimeout(() => {background.load(); play();}, 1000);
  });
  small.addEventListener('change', select);
  desktop3D.addEventListener('change',select);
  reduce.addEventListener('change', select);
  document.addEventListener('visibilitychange', play);
  addEventListener('pageshow', select);
  addEventListener('pagehide', () => background.pause());
  // Retry autoplay after a user gesture on devices that initially block it.
  document.addEventListener('pointerdown', play, {passive:true});
  select();
})();
