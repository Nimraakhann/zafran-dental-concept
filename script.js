(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reveals = [...document.querySelectorAll('.reveal')];
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
  let revealObserver;
  let ticking = false;

  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-ready');
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -20px' });
    reveals.forEach(el => revealObserver.observe(el));
  }

  function parallax() {
    ticking = false;
    if (reducedMotion.matches || !finePointer.matches) return;
    parallaxEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const speed = Number.parseFloat(el.dataset.parallax || '0');
        const offset = Math.max(-18, Math.min(18, (window.innerHeight / 2 - rect.top - rect.height / 2) * speed));
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      }
    });
  }
  window.addEventListener('scroll', () => {
    if (!ticking && !reducedMotion.matches && finePointer.matches) {
      ticking = true;
      window.requestAnimationFrame(parallax);
    }
  }, { passive: true });
  parallax();

  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      if (reducedMotion.matches || !finePointer.matches) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(800px) rotateX(${y * -3}deg) rotateY(${x * 4}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      if (reducedMotion.matches || !finePointer.matches) return;
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .08}px, ${(e.clientY - r.top - r.height / 2) * .12}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      document.documentElement.classList.remove('motion-ready');
      if (revealObserver) revealObserver.disconnect();
      document.querySelectorAll('[data-parallax], .tilt-card, .magnetic').forEach(el => { el.style.transform = ''; });
    }
  });

  const menu = document.querySelector('.mobile-nav-menu');
  if (menu) {
    const summary = menu.querySelector('summary');
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => { menu.open = false; });
    });
    document.addEventListener('click', e => {
      if (menu.open && !menu.contains(e.target)) menu.open = false;
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.open) {
        menu.open = false;
        summary.focus();
      }
    });
    window.matchMedia('(min-width: 981px)').addEventListener('change', e => {
      if (e.matches) menu.open = false;
    });
  }
})();
