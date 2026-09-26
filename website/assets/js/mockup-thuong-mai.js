(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const lines = value => esc(value).replace(/\n/g, '<br>');
  const iconSvg = {
    tea: '<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M35 28h50v76H35zM42 20h36v8M46 54c26-8 34 7 14 28-20-21-17-28-14-28zm14 9v19"/></svg>',
    oil: '<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M49 15h22v18H49zM46 33h28v14l9 12v43H37V59l9-12zM37 66h46M37 89h46M57 76h6"/></svg>',
    box: '<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M32 39h56v12H32zM36 51v47h48V51M36 64h48M36 85h48M52 74h16"/></svg>',
    serum: '<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M51 15h18v25H51zM48 40h24v14l7 8v40H41V62l7-8zM41 72h38M53 83h14"/></svg>'
  };

  const tapIcon = '<span class="tap-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">'
    + '<path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5"/>'
    + '<path d="M11 11.5v-2a1.5 1.5 0 1 1 3 0v2.5"/>'
    + '<path d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5"/>'
    + '<path d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47"/>'
    + '</svg></span>';

  if (location.hash === '#dat-lich') {
    history.replaceState(null, '', location.pathname + location.search);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }

  async function loadBundledData() {
    try {
      const response = await fetch('assets/data/site-data.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Không tải được dữ liệu: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('Hồi Xuân Đường: dùng nội dung dự phòng trong HTML.', error);
      return null;
    }
  }

  async function loadSiteData() {
    // Ưu tiên nội dung mới nhất trên Supabase; nếu chưa cấu hình, lỗi, hoặc
    // trống thì dùng file dữ liệu đóng gói sẵn — web không bao giờ trắng trang.
    if (window.HXD && window.HXD.configured) {
      try {
        const cloud = await window.HXD.loadContent(1500);
        if (cloud && cloud.services) return cloud;
      } catch (error) {
        console.warn('Hồi Xuân Đường: Supabase không phản hồi, dùng dữ liệu dự phòng.', error);
      }
    }
    return loadBundledData();
  }

  function renderServices(services = []) {
    const grid = document.querySelector('.service-grid');
    if (!grid || !services.length) return;
    grid.innerHTML = services.map(item => `
      <article class="service-card" data-category="${esc(item.category)}" data-hot="${item.hot ? 'true' : 'false'}">
        <div class="service-image">
          <img src="${esc(item.image)}" loading="lazy" alt="${esc(item.alt)}">
          <span class="image-label">${esc(item.label)}</span>
        </div>
        <div class="card-body">
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.description)}</p>
          <div class="card-bottom">
            <span class="price"><small>${esc(item.priceLabel || 'GIÁ DỊCH VỤ')}</small>${esc(item.price || 'Liên hệ báo giá')}</span>
            <a href="#dat-lich" data-service="${esc(item.title)}" class="round-link" aria-label="Tư vấn ${esc(item.title)}">Liên hệ${tapIcon}</a>
          </div>
        </div>
      </article>`).join('');
  }

  function renderHero(slides = []) {
    const wrapper = document.querySelector('.hero-slides');
    if (!wrapper || !slides.length) return;
    wrapper.innerHTML = slides.map((item, index) => `
      <article class="hero-slide${index === 0 ? ' active' : ''}${item.wide ? ' hero-slide-wide' : ''}" data-slide="${index}">
        <img src="${esc(item.image)}" alt="${esc(item.alt)}"${index === 0 ? ' fetchpriority="high"' : ''}>
        <div class="hero-shade"></div>
        <div class="wrap hero-slide-content">
          <p class="eyebrow light">${esc(item.eyebrow)}</p>
          ${index === 0 ? `<h1 id="hero-title">${esc(item.title)}<br><em>${esc(item.slogan)}</em></h1>` : `<h2>${esc(item.title)}<br><em>${esc(item.slogan)}</em></h2>`}
          <p class="hero-description">${esc(item.description)}</p>
        </div>
      </article>`).join('');
  }

  function extractVideoSrc(raw) {
    if (!raw) return '';
    const m = String(raw).match(/src=["']([^"']+)["']/);
    return m ? m[1] : raw.trim();
  }

  function renderOffers(offers = []) {
    const panel = document.querySelector('.offer-panel');
    if (!panel || !offers.length) return;
    panel.innerHTML = offers.map(item => {
      const videoSrc = extractVideoSrc(item.video || '');
      const mediaHtml = videoSrc
        ? `<iframe class="offer-video-frame" data-src="${esc(videoSrc)}" src="" title="Video giới thiệu ${esc(item.title)}" frameborder="0" scrolling="no" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen" allowfullscreen></iframe>`
        : item.image
          ? `<img class="offer-poster" src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy">`
          : `<span>${esc(item.tag || 'Ưu đãi')}</span>`;
      return `
      <article class="offer-card${item.image ? ' has-poster' : ''}${videoSrc ? ' has-video' : ''}"${item.image && !videoSrc ? ` style="--offer-image:url('${esc(item.image)}')"` : ''}>
        <div class="offer-media">${mediaHtml}</div>
        <div class="offer-card-content">
          <span class="offer-tag">${esc(item.tag)}</span>
          <h3>${esc(item.title)}</h3>
          ${item.price ? `<strong class="offer-price">${esc(item.price)}</strong>` : ''}
          <p>${lines(item.description)}</p>
          <a class="offer-cta" href="#dat-lich" data-service="${esc(item.service || item.title)}" aria-label="Tư vấn ${esc(item.service || item.title)}">${esc(item.cta || 'Đặt lịch tư vấn ↗')}</a>
        </div>
      </article>`;
    }).join('');
    initInlineVideos();
  }

  function renderSocialChannels(settings = {}) {
    if (settings.youtube) {
      document.querySelectorAll('.social-channel-card.yt').forEach(el => { el.href = settings.youtube; });
    }
    if (settings.tiktok) {
      document.querySelectorAll('.social-channel-card.tt').forEach(el => { el.href = settings.tiktok; });
    }
  }

  function renderProducts(products = []) {
    const grid = document.querySelector('.product-grid');
    if (!grid || !products.length) return;
    grid.innerHTML = products.map(item => `
      <article class="product">
        ${item.image
          ? `<div class="product-placeholder has-photo"><img src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy"></div>`
          : `<div class="product-placeholder">${iconSvg[item.icon] || iconSvg.tea}<span>HÌNH ẢNH SẮP CẬP NHẬT</span></div>`}
        <p class="eyebrow">${esc(item.category)}</p>
        <h3>${esc(item.title)}</h3>
        ${item.description ? `<p class="product-desc">${esc(item.description)}</p>` : ''}
        <div class="product-bottom"><span>${esc(item.price || 'Liên hệ báo giá')}</span><a href="#dat-lich" data-service="${esc(item.service || item.title)}" aria-label="Hỏi về ${esc(item.title)}">Tư vấn</a></div>
      </article>`).join('');
  }

  function renderLocations(locations = []) {
    const grid = document.querySelector('.locations');
    if (!grid || !locations.length) return;
    grid.innerHTML = locations.map(item => `
      <article class="${item.future ? 'location-future' : ''}">
        <span class="location-number">${esc(item.number)}</span>
        <h3>${esc(item.name)}</h3>
        <p>${lines(item.address)}</p>
        <div>
          ${item.future ? '<span class="location-status">Sắp cập nhật</span>' : `<a class="text-link" href="${esc(item.map)}" target="_blank" rel="noopener">Chỉ đường ↗</a>`}
          <a href="#dat-lich" data-branch="${esc(item.branch || item.name)}" class="button outline small">${item.future ? 'Quan tâm cơ sở này' : 'Chọn cơ sở này'}</a>
        </div>
      </article>`).join('');
  }

  function renderFaqs(faqs = []) {
    const list = document.querySelector('.faq-list');
    if (!list || !faqs.length) return;
    list.innerHTML = faqs.map(item => `<details><summary>${esc(item.question)} <span>+</span></summary><p>${esc(item.answer)}</p></details>`).join('');
  }

  function renderTestimonials(items = []) {
    const grid = document.querySelector('.testimonial-grid');
    if (!grid || !items.length) return;
    grid.innerHTML = items.map(item => {
      const n = Math.min(5, Math.max(1, parseInt(item.rating) || 5));
      const stars = '★'.repeat(n);
      const initial = (item.name || 'K').trim().charAt(0).toUpperCase();
      const meta = [esc(item.service), esc(item.location)].filter(Boolean).join(' · ');
      const imgHtml = item.image
        ? `<div class="testimonial-image-wrap"><img class="testimonial-image" src="${esc(item.image)}" alt="Ảnh xác thực từ ${esc(item.name)}" loading="lazy"></div>`
        : '';
      return `<article class="testimonial-card${item.image ? ' has-image' : ''}">`
        + `<div class="testimonial-stars">${stars}</div>`
        + `<p class="testimonial-text">${esc(item.text)}</p>`
        + imgHtml
        + `<div class="testimonial-author">`
        + `<div class="testimonial-avatar">${initial}</div>`
        + `<div class="testimonial-author-info"><strong>${esc(item.name)}</strong><span>${meta}</span></div>`
        + `</div></article>`;
    }).join('');
  }

  function applySettings(settings = {}) {
    if (!settings.phone && !settings.zalo && !settings.workingHours) return;
    const phoneHref = settings.phone ? `tel:${settings.phone.replace(/\D/g, '')}` : null;
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
      if (phoneHref) link.href = phoneHref;
      if (link.classList.contains('booking-phone')) link.textContent = `${settings.phone} ↗`;
      else if (/^[\d\s\+\-\(\)\.]+$/.test(link.textContent.trim())) link.textContent = settings.phone;
    });
    document.querySelectorAll('a[href*="zalo.me"]').forEach(link => {
      if (settings.zalo) link.href = settings.zalo;
    });
    document.querySelectorAll('.social-zalo').forEach(link => {
      if (settings.zalo) link.href = settings.zalo;
    });
    document.querySelectorAll('.social-facebook').forEach(link => {
      if (settings.facebook) link.href = settings.facebook;
    });
    document.querySelectorAll('.booking-copy > span, .footer-grid span').forEach(node => {
      if (node.textContent.includes('08:00') || node.textContent.includes('20:00')) node.textContent = settings.workingHours;
    });
  }

  function fillBookingOptions(data) {
    const serviceSelect = document.querySelector('#booking-service');
    const branchSelect = document.querySelector('#booking-branch');
    if (serviceSelect && data) {
      const names = ['Cần tư vấn lựa chọn'];
      (data.services || []).forEach(item => names.push(item.title));
      (data.offers || []).forEach(item => names.push(item.service || item.title));
      names.push('Sản phẩm thảo dược');
      (data.products || []).forEach(item => names.push(item.service || item.title));
      serviceSelect.innerHTML = [...new Set(names)].map(name => `<option>${esc(name)}</option>`).join('');
    }
    if (branchSelect && data?.locations?.length) {
      branchSelect.innerHTML = data.locations
        .filter(item => !item.future)
        .map(item => `<option>${esc(item.branch || item.name)}</option>`).join('');
    }
  }

  function applyTapIcons() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const targets = [];
    while (walker.nextNode()) {
      if (walker.currentNode.nodeValue.includes('↗')) targets.push(walker.currentNode);
    }
    targets.forEach(node => {
      const frag = document.createDocumentFragment();
      node.nodeValue.split('↗').forEach((part, index) => {
        if (index) {
          const holder = document.createElement('span');
          holder.innerHTML = tapIcon;
          frag.appendChild(holder.firstChild);
        }
        if (part) frag.appendChild(document.createTextNode(part));
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  function initMenu() {
    const menu = document.querySelector('.menu');
    const nav = document.querySelector('#main-nav');
    if (!menu || !nav) return;
    function closeMenu() {
      nav.classList.remove('open');
      document.body.classList.remove('menu-open');
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', 'Mở menu');
      menu.textContent = '☰';
    }
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      document.body.classList.toggle('menu-open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
      menu.textContent = open ? '×' : '☰';
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
  }

  function initHero() {
    const heroSlides = [...document.querySelectorAll('.hero-slide')];
    const heroDots = [...document.querySelectorAll('[data-hero-dot]')];
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
    heroDots.forEach(dot => dot.addEventListener('click', () => { showHeroSlide(Number(dot.dataset.heroDot)); startHeroTimer(); }));
    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
      let touchStartX = 0;
      carousel.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
      carousel.addEventListener('touchend', e => {
        const delta = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) < 40) return;
        showHeroSlide(heroIndex + (delta < 0 ? 1 : -1));
        startHeroTimer();
      }, { passive: true });
    }
    showHeroSlide(0);
    startHeroTimer();
  }

  function initFilters() {
    function filterServices(category) {
      let count = 0;
      document.querySelectorAll('.service-card').forEach(card => {
        const match = category === 'all'
          || (category === 'hot' ? card.dataset.hot === 'true' : card.dataset.category === category);
        card.hidden = !match;
        if (!card.hidden) count++;
      });
      document.querySelectorAll('[data-filter]').forEach(button => {
        const active = button.dataset.filter === category;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      const serviceCount = document.querySelector('#service-count');
      if (serviceCount) serviceCount.textContent = `${count} dịch vụ`;
      const grid = document.querySelector('#dich-vu .service-grid');
      if (grid) grid.scrollLeft = 0;
    }
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => filterServices(button.dataset.filter)));
    document.querySelectorAll('[data-quick]').forEach(link => link.addEventListener('click', () => filterServices(link.dataset.quick)));
    const initial = document.querySelector('[data-filter].active');
    if (initial) filterServices(initial.dataset.filter);
  }

  function initBooking() {
    const form = document.querySelector('#booking-form');
    const service = document.querySelector('#booking-service');
    const branch = document.querySelector('#booking-branch');
    const date = document.querySelector('#booking-date');
    const result = document.querySelector('#booking-result');
    const message = document.querySelector('#request-text');
    const status = document.querySelector('#copy-status');
    const copy = document.querySelector('#copy-request');
    if (!form || !service || !branch || !date || !result || !message || !status || !copy) return;
    const now = new Date();
    date.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    document.querySelectorAll('[data-service],[data-branch]').forEach(link => link.addEventListener('click', () => {
      if (link.dataset.service) service.value = link.dataset.service;
      if (link.dataset.branch) branch.value = link.dataset.branch;
      result.hidden = true;
    }));
    form.addEventListener('change', () => { result.hidden = true; });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const day = date.value ? `, dự kiến ngày ${date.value.split('-').reverse().join('/')}` : '';
      message.textContent = `Chào Hồi Xuân Đường, tôi muốn được tư vấn về ${service.value} tại cơ sở ${branch.value}${day}. Vui lòng cho tôi biết giá, thời lượng và lịch trống phù hợp. Cảm ơn!`;
      status.textContent = 'Nội dung đã sẵn sàng. Sao chép và gửi qua Zalo để được tư vấn.';
      result.hidden = false;
    });
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(message.textContent);
        status.textContent = 'Đã sao chép. Mở Zalo và dán nội dung để gửi tới Hồi Xuân Đường.';
      } catch {
        status.textContent = 'Bạn có thể chọn và sao chép đoạn nội dung phía trên để gửi qua Zalo.';
      }
    });
  }

  function initEffects() {
    document.querySelectorAll('.click-ripple').forEach(item => item.remove());
    const clickableItems = document.querySelectorAll('a, button, summary, .product, .offer-card, .locations article');
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
    const revealItems = document.querySelectorAll('main > section, .offer-card, .product, .locations article, .faq-list details, .booking-grid');
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
  }

  function initChatWidget() {
    const widget = document.querySelector('.chat-widget');
    const toggle = document.querySelector('.chat-toggle');
    const panel = document.querySelector('.chat-panel');
    if (!widget || !toggle || !panel) return;
    function setOpen(open) {
      widget.classList.toggle('open', open);
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    }
    toggle.addEventListener('click', event => {
      event.stopPropagation();
      setOpen(!widget.classList.contains('open'));
    });
    document.addEventListener('click', event => {
      if (!widget.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const data = await loadSiteData();
    if (data) {
      applySettings(data.settings);
      renderHero(data.hero);
      renderServices(data.services);
      renderOffers(data.offers);
      renderProducts(data.products);
      renderLocations(data.locations);
      renderFaqs(data.faqs);
      renderTestimonials(data.testimonials);
      renderSocialChannels(data.settings || {});
      fillBookingOptions(data);
    }
    applyTapIcons();
    initMenu();
    initHero();
    initFilters();
    initBooking();
    initEffects();
    initChatWidget();
    initTestimonialLightbox();
    initVideoModal();
    initInlineVideos();
  });

  function initTestimonialLightbox() {
    document.addEventListener('click', e => {
      const img = e.target.closest('.testimonial-image');
      if (!img) return;
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000c;display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:20px';
      const clone = document.createElement('img');
      clone.src = img.src;
      clone.alt = img.alt;
      clone.style.cssText = 'max-width:90vw;max-height:90vh;border-radius:12px;box-shadow:0 8px 40px #000a';
      overlay.appendChild(clone);
      overlay.addEventListener('click', () => overlay.remove());
      document.body.appendChild(overlay);
    });
  }

  function openVideoModal(src) {
    const existing = document.getElementById('hxd-video-modal');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'hxd-video-modal';
    overlay.className = 'video-modal-overlay';
    const box = document.createElement('div');
    box.className = 'video-modal-box';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'video-modal-close';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Đóng video');
    const frameWrap = document.createElement('div');
    frameWrap.className = 'video-modal-frame';
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share');
    frameWrap.appendChild(iframe);
    box.appendChild(closeBtn);
    box.appendChild(frameWrap);
    overlay.appendChild(box);
    const close = () => { iframe.src = ''; overlay.remove(); };
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); }, { once: true });
    document.body.appendChild(overlay);
  }

  function initInlineVideos() {
    const frames = document.querySelectorAll('.offer-video-frame[data-src]');
    if (!frames.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const frame = entry.target;
        try {
          const url = new URL(frame.dataset.src);
          if (url.hostname.includes('facebook.com')) {
            url.searchParams.set('autoplay', 'true');
            url.searchParams.set('muted', 'true');
          } else {
            url.searchParams.set('autoplay', '1');
            url.searchParams.set('mute', '1');
          }
          frame.src = url.toString();
        } catch (e) {
          frame.src = frame.dataset.src;
        }
        obs.unobserve(frame);
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -60px 0px' });
    frames.forEach(f => obs.observe(f));
  }

  function initVideoModal() {
    document.addEventListener('click', e => {
      const trigger = e.target.closest('[data-video]');
      if (!trigger) return;
      e.preventDefault();
      openVideoModal(trigger.dataset.video);
    });
  }

  // Xem trước sống cho trang admin: nhận dữ liệu qua postMessage và vẽ lại các
  // khối nội dung ngay lập tức. Trên web thật không có ai gửi nên vô hại.
  window.addEventListener('message', function (event) {
    var msg = event.data;
    if (!msg || msg.type !== 'HXD_PREVIEW' || !msg.data) return;
    var data = msg.data;
    try {
      applySettings(data.settings || {});
      renderHero(data.hero || []);
      renderServices(data.services || []);
      renderOffers(data.offers || []);
      renderProducts(data.products || []);
      renderLocations(data.locations || []);
      renderFaqs(data.faqs || []);
      renderTestimonials(data.testimonials || []);
      renderSocialChannels(data.settings || {});
      fillBookingOptions(data);
      applyTapIcons();
      var active = document.querySelector('[data-filter].active') || document.querySelector('[data-filter]');
      if (active) active.click();
      initBooking();
    } catch (err) { /* xem trước lỗi thì bỏ qua, không làm hỏng gì */ }
  });
})();
