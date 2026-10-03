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


  // the admin stick beside the Manage clip: out, slides in at its plug time, back out at unplug
  const ease = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  function placeStick(g, t) {
    const d = g.dataset, show = +d.show, plug = +d.plug, unplug = +d.unplug, hide = +d.hide, OUT = -170;
    const on = t >= show && t <= hide;
    const x = t < unplug ? OUT * (1 - ease((t - plug) / 0.6)) : OUT * ease((t - unplug) / 0.6);
    g.setAttribute('transform', `translate(${on ? x.toFixed(1) : OUT} 0)`);
    g.style.opacity = on ? Math.min(1, (t - show) / 0.3, (hide - t) / 0.4).toFixed(2) : 0;
  }

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
    const sticks = [...frame.querySelectorAll('.stick')];
    const paint = () => {
      const t = v.currentTime;
      for (const [g, a, b] of notes) g.classList.toggle('on', t >= a && t < b);
      for (const g of sticks) placeStick(g, t);
    };
    const loop = () => { paint(); raf = v.paused ? 0 : requestAnimationFrame(loop); };
    if (notes.length) {
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
