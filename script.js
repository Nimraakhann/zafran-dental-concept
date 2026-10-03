(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reveals = [...document.querySelectorAll('.reveal')];
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
  const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"], .mobile-nav-panel a[href^="#"]')];
  const sections = [...document.querySelectorAll('main section[id]')];
  let revealObserver;
  let ticking = false;

  document.querySelectorAll('.hero-media, .intro-visual, .doctor-visual, .case-media, .editorial-gallery figure').forEach(el => {
    el.dataset.reveal = 'image';
  });

  function updateRevealDelays() {
    reveals.forEach(el => el.style.setProperty('--reveal-delay', el.classList.contains('delay-1') ? '120ms' : '0ms'));
    document.querySelectorAll('.service-grid, .footer-content').forEach(group => {
      const columns = group.classList.contains('service-grid')
        ? (window.innerWidth > 980 ? 3 : window.innerWidth > 640 ? 2 : 1)
        : (window.innerWidth > 1100 ? 4 : window.innerWidth > 480 ? 2 : 1);
      [...group.children].filter(el => el.classList.contains('reveal')).forEach((el, i) => {
        el.style.setProperty('--reveal-delay', `${i % columns * 110}ms`);
      });
    });
  }

  function showAllContent() {
    root.classList.remove('motion-ready');
    reveals.forEach(el => el.classList.add('visible'));
    if (revealObserver) revealObserver.disconnect();
  }

  function startReveals() {
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      showAllContent();
      return;
    }
    const pending = reveals.filter(el => !el.classList.contains('visible'));
    if (!pending.length) return;
    try {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: .16, rootMargin: '0px 0px -40px 0px' });
      root.classList.add('motion-ready');
      pending.forEach(el => revealObserver.observe(el));
    } catch {
      showAllContent();
    }
  }

  function updatePage() {
    ticking = false;
    const distance = Math.max(0, root.scrollHeight - window.innerHeight);
    const progress = distance ? Math.max(0, Math.min(1, window.scrollY / distance)) : 0;
    root.style.setProperty('--scroll-progress', progress.toFixed(4));
    let active = '';
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= window.innerHeight * .32) active = section.id;
    });
    navLinks.forEach(link => {
      const current = link.getAttribute('href') === `#${active}`;
      link.classList.toggle('is-active', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (!reducedMotion.matches && finePointer.matches) {
      parallaxEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          const speed = Number.parseFloat(el.dataset.parallax || '0');
          const offset = Math.max(-18, Math.min(18, (window.innerHeight / 2 - rect.top - rect.height / 2) * speed));
          el.style.transform = `translate3d(0, ${offset}px, 0)`;
        }
      });
    }
  }

  function schedulePageUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updatePage);
    }
  }

  updateRevealDelays();
  startReveals();
  root.classList.add('page-ready');
  updatePage();
  window.addEventListener('scroll', schedulePageUpdate, { passive: true });
  window.addEventListener('resize', () => { updateRevealDelays(); schedulePageUpdate(); });
  window.addEventListener('load', schedulePageUpdate, { once: true });

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
      showAllContent();
      document.querySelectorAll('[data-parallax], .tilt-card, .magnetic').forEach(el => { el.style.transform = ''; });
    } else startReveals();
    schedulePageUpdate();
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
