(() => {
  const menu = document.querySelector('.menu');
  const nav = document.querySelector('#main-nav');
  function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Mở menu'); }
  menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu'); });
  nav.addEventListener('click', e => { if(e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
  const heroSlides = [...document.querySelectorAll('.hero-slide')];
  const heroDots = [...document.querySelectorAll('[data-hero-dot]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let heroIndex = 0;
  let heroTimer;
  function showHeroSlide(index) {
    if (!heroSlides.length) return;
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, slideIndex) => {
      const active = slideIndex === heroIndex;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    heroDots.forEach((dot, dotIndex) => {
      const active = dotIndex === heroIndex;
      dot.classList.toggle('active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }
  function startHeroTimer() {
    if (reduceMotion || heroSlides.length < 2) return;
    clearInterval(heroTimer);
    heroTimer = setInterval(() => showHeroSlide(heroIndex + 1), 9800);
  }
  heroDots.forEach(dot => dot.addEventListener('click', () => {
    showHeroSlide(Number(dot.dataset.heroDot));
    startHeroTimer();
  }));
  showHeroSlide(0);
  startHeroTimer();
  function filterServices(category) {
    let count = 0;
    document.querySelectorAll('.service-card').forEach(card => { card.hidden = category !== 'all' && card.dataset.category !== category; if(!card.hidden) count++; });
    document.querySelectorAll('[data-filter]').forEach(button => { const active = button.dataset.filter === category; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    const serviceCount = document.querySelector('#service-count');
    if (serviceCount) serviceCount.textContent = `${count} dịch vụ`;
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => filterServices(button.dataset.filter)));
  document.querySelectorAll('[data-quick]').forEach(link => link.addEventListener('click', () => filterServices(link.dataset.quick)));
  const form = document.querySelector('#booking-form');
  const service = document.querySelector('#booking-service');
  const branch = document.querySelector('#booking-branch');
  const date = document.querySelector('#booking-date');
  const result = document.querySelector('#booking-result');
  const message = document.querySelector('#request-text');
  const status = document.querySelector('#copy-status');
  const now = new Date();
  date.min = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  document.querySelectorAll('[data-service],[data-branch]').forEach(link => link.addEventListener('click', () => { if(link.dataset.service) service.value=link.dataset.service; if(link.dataset.branch) branch.value=link.dataset.branch; result.hidden=true; }));
  form.addEventListener('change', () => { result.hidden=true; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const day = date.value ? `, dự kiến ngày ${date.value.split('-').reverse().join('/')}` : '';
    message.textContent = `Chào Hồi Xuân Đường, tôi muốn được tư vấn về ${service.value.toLowerCase()} tại cơ sở ${branch.value}${day}. Vui lòng cho tôi biết giá, thời lượng và lịch trống phù hợp. Cảm ơn!`;
    status.textContent='Nội dung đã sẵn sàng. Sao chép và gửi qua Zalo để được tư vấn.';
    result.hidden=false;
  });
  document.querySelector('#copy-request').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(message.textContent); status.textContent='Đã sao chép. Mở Zalo và dán nội dung để gửi tới Hồi Xuân Đường.'; }
    catch { status.textContent='Bạn có thể chọn và sao chép đoạn nội dung phía trên để gửi qua Zalo.'; }
  });
  const clickableItems = document.querySelectorAll('a, button, summary, .product, .service-card, .offer-card, .locations article');
  clickableItems.forEach(item => {
    item.classList.add('is-clickable');
    item.addEventListener('click', event => {
      const rect = item.getBoundingClientRect();
      item.style.setProperty('--ripple-x', `${event.clientX - rect.left}px`);
      item.style.setProperty('--ripple-y', `${event.clientY - rect.top}px`);
      const ripple = document.createElement('span');
      ripple.className = 'click-ripple';
      item.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });
  });
  const revealItems = document.querySelectorAll('main > section, .service-card, .offer-card, .product, .locations article, .faq-list details, .booking-grid');
  revealItems.forEach((item, index) => {
    item.classList.add('reveal-on-scroll');
    item.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 70}ms`);
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }
})();
