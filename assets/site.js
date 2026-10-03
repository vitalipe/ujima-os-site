// Videos play while on screen; screenshots open full size; the bar solidifies on scroll.
(() => {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const icons = {
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',
  };

  const top = document.querySelector('.top');
  const onScroll = () => top.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  for (const v of document.querySelectorAll('video[data-src]')) {
    const frame = v.closest('.screen');
    const btn = document.createElement('button');
    btn.className = 'play';
    btn.type = 'button';
    frame.appendChild(btn);

    let held = still;
    const load = () => { if (!v.src) { v.src = v.dataset.src; } };
    const sync = () => {
      btn.innerHTML = v.paused ? icons.play : icons.pause;
      btn.setAttribute('aria-label', v.paused ? 'Play video' : 'Pause video');
      frame.classList.toggle('paused', v.paused);
    };
    v.addEventListener('play', sync);
    v.addEventListener('pause', sync);
    sync();

    const notes = [...frame.querySelectorAll('.note')].map(g => [g, +g.dataset.t0, +g.dataset.t1]);
    let raf = 0;
    const name = (v.dataset.src.match(/video\/([a-z]+)\.mp4/) || [])[1];
    const steps = document.querySelector(`.howto[data-for="${name}"]`);
    const cards = steps ? [...steps.querySelectorAll('.howstep')].map(c => [c, +c.dataset.from, +c.dataset.to, +(c.dataset.seek || c.dataset.from)]) : [];
    const paint = () => {
      const t = v.currentTime;
      for (const [g, a, b] of notes) g.classList.toggle('on', t >= a && t < b);
      let lit = false;
      for (const [c, a, b] of cards) { const on = t >= a && t < b; c.classList.toggle('active', on); lit = lit || on; }
      if (steps) steps.classList.toggle('live', lit);
    };
    const loop = () => { paint(); raf = v.paused ? 0 : requestAnimationFrame(loop); };
    for (const [c, , , from] of cards) {
      const go = () => {
        load();
        held = false;
        frame.scrollIntoView({ block: 'nearest', behavior: still ? 'auto' : 'smooth' });
        // preload="none": nothing loads until play(), so play first and seek once the metadata is in
        if (v.readyState >= 1) v.currentTime = from;
        else v.addEventListener('loadedmetadata', () => { v.currentTime = from; }, { once: true });
        v.play().catch(() => {});
      };
      c.addEventListener('click', go);
      c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    }
    if (notes.length || cards.length) {
      v.addEventListener('play', () => { if (!raf) raf = requestAnimationFrame(loop); });
      v.addEventListener('seeked', paint);
      v.addEventListener('pause', paint);
    }

    btn.addEventListener('click', () => {
      load();
      if (v.paused) { held = false; v.play(); } else { held = true; v.pause(); }
    });

    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        load();
        if (!held) v.play().catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    }, { threshold: 0.35 }).observe(v);
  }

  const box = document.createElement('dialog');
  box.className = 'lightbox';
  box.innerHTML = '<img alt="">';
  document.body.appendChild(box);
  const big = box.querySelector('img');
  box.addEventListener('click', () => box.close());

  for (const fig of document.querySelectorAll('.screen.zoom')) {
    const img = fig.querySelector('img');
    fig.tabIndex = 0;
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', 'Show full size: ' + img.alt);
    const open = () => {
      big.src = fig.dataset.full || img.currentSrc || img.src;
      big.alt = img.alt;
      box.showModal();
    };
    fig.addEventListener('click', open);
    fig.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  }
})();
