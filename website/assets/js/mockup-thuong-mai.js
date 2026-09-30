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
        if (cloud && cloud.services) {
          const bundled = await loadBundledData();
          return Object.assign({}, bundled, cloud);
        }
      } catch (error) {
        console.warn('Hồi Xuân Đường: Supabase không phản hồi, dùng dữ liệu dự phòng.', error);
      }
    }
    return loadBundledData();
  }

  let _services = [];
  let _locations = [];

  function renderServices(services = []) {
    _services = services;
    const grid = document.querySelector('.service-grid');
    if (!grid || !services.length) return;
    grid.innerHTML = services.map((item, i) => `
      <article class="service-card" data-category="${esc(item.category)}" data-hot="${item.hot ? 'true' : 'false'}" data-svc="${i}" style="cursor:pointer">
        <div class="service-image">
          <img src="${esc(item.image)}" loading="lazy" alt="${esc(item.alt)}">
          <span class="image-label">${esc(item.label)}</span>
        </div>
        <div class="card-body">
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.description)}</p>
          <div class="card-bottom">
            <span class="price"><small>${esc(item.priceLabel || 'GIÁ DỊCH VỤ')}</small>${esc(item.price || 'Liên hệ báo giá')}</span>
            <button class="round-link" data-svc="${i}" aria-label="Xem chi tiết ${esc(item.title)}">Chi tiết${tapIcon}</button>
          </div>
        </div>
      </article>`).join('');

    grid.addEventListener('click', e => {
      const card = e.target.closest('[data-svc]');
      if (card && !e.target.closest('[href]')) openServiceModal(Number(card.dataset.svc));
    });
  }

  function openServiceModal(idx) {
    const item = _services[idx];
    if (!item) return;
    const overlay = document.getElementById('svc-overlay');
    const body = document.getElementById('svc-modal-body');
    if (!overlay || !body) return;

    const parsePackages = txt => (txt || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => {
      const [name, price, note = ''] = l.split('|').map(s => s.trim());
      return { name, price, note };
    });
    const pkgs = parsePackages(item.packagesText);

    const section = (cls, icon, title, text) => text
      ? `<div class="svc-section"><p class="svc-section-label ${cls}">${icon} ${esc(title)}</p><div class="svc-section-body">${esc(text)}</div></div>`
      : '';

    const pkgHtml = pkgs.length ? `<div class="svc-packages">
      <p class="svc-packages-title">Chọn gói phù hợp</p>
      <div class="pkg-list">${pkgs.map((p, i) => `
        <div class="pkg-card${p.note ? ' popular' : ''}" data-pkg="${i}">
          <div class="pkg-info">
            <span class="pkg-name">${esc(p.name)}</span>
            ${p.note ? `<span class="pkg-note">⭐ ${esc(p.note)}</span>` : ''}
          </div>
          <span class="pkg-price">${esc(p.price)}</span>
          <button class="pkg-book-btn" data-pkg="${i}">Đặt lịch →</button>
        </div>`).join('')}
      </div></div>` : '';

    body.innerHTML = `
      <div class="svc-modal-header">
        ${item.image ? `<img class="svc-modal-img" src="${esc(item.image)}" alt="${esc(item.alt)}">` : ''}
        <div class="svc-modal-header-text">
          <span class="label">${esc(item.label)}</span>
          <h2 id="svc-modal-title">${esc(item.title)}</h2>
          <p>${esc(item.description)}</p>
        </div>
      </div>
      ${section('causes', '⚡', 'Nguyên nhân', item.causes)}
      ${section('common', '⚠️', 'Các phương pháp thông thường', item.commonMethods)}
      ${section('hxd', '✅', 'Sự khác biệt tại Hồi Xuân Đường', item.hxdDifference)}
      ${pkgHtml}`;

    // Branch selector
    const branches = _locations.filter(l => !l.future && l.hotline).map(l => ({
      name: l.name, number: (l.hotline || '').replace(/\D/g, ''), address: l.address
    }));

    body.querySelectorAll('.pkg-book-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const pkg = pkgs[Number(btn.dataset.pkg)];
        showBranchSelector(body, item.title, pkg, branches);
      });
    });

    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
  }

  function showBranchSelector(body, svcTitle, pkg, branches) {
    const sel = document.createElement('div');
    sel.className = 'svc-branch-selector';
    const msg = `Tôi muốn đặt lịch dịch vụ: ${svcTitle}${pkg ? ' — ' + pkg.name + ' (' + pkg.price + ')' : ''}`;
    sel.innerHTML = `
      <p class="svc-branch-title">Chọn cơ sở bạn muốn đến</p>
      <p class="svc-branch-subtitle">Chúng tôi sẽ chuyển bạn sang Zalo để xác nhận lịch hẹn</p>
      ${branches.length ? branches.map(b => `
        <button class="svc-branch-btn" data-zalo="${b.number}" data-msg="${esc(msg)}">
          ${esc(b.name)}<small>${esc(b.address || '')}</small>
        </button>`).join('') : `<a class="svc-branch-btn" href="https://zalo.me/0931879222" target="_blank" rel="noopener">Zalo Hồi Xuân Đường</a>`}
      <button class="svc-branch-back">← Quay lại</button>`;

    sel.querySelectorAll('[data-zalo]').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = `https://zalo.me/${btn.dataset.zalo}`;
        window.open(url, '_blank', 'noopener');
        closeServiceModal();
      });
    });
    sel.querySelector('.svc-branch-back').addEventListener('click', () => sel.remove());

    const modal = body.closest('.svc-modal');
    modal.style.position = 'relative';
    modal.appendChild(sel);
  }

  function closeServiceModal() {
    const overlay = document.getElementById('svc-overlay');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { overlay.hidden = true; }, 280);
  }

  function renderHero(slides = []) {
    const wrapper = document.querySelector('.hero-slides');
    if (!wrapper || !slides.length) return;
    wrapper.innerHTML = slides.map((item, index) => `
      <article class="hero-slide${index === 0 ? ' active' : ''}${item.wide ? ' hero-slide-wide' : ''}" data-slide="${index}">
        <img src="${esc(item.image)}" alt="${esc(item.alt)}"${index === 0 ? ' fetchpriority="high"' : ''}${item.imgPosition ? ` style="object-position:${esc(item.imgPosition)}"` : ''}>
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
      document.querySelectorAll('.sc-btn.yt').forEach(el => { el.href = settings.youtube; });
    }
    if (settings.tiktok) {
      document.querySelectorAll('.sc-btn.tt').forEach(el => { el.href = settings.tiktok; });
    }
    if (settings.experienceVideoRatio) {
      document.querySelectorAll('.experience-video-wrap').forEach(el => {
        el.dataset.ratio = settings.experienceVideoRatio;
      });
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
    _locations = locations;
    const grid = document.querySelector('.locations');
    if (!grid || !locations.length) return;
    const active = locations.filter(item => !item.future);
    if (!active.length) return;
    grid.innerHTML = active.map(item => `
      <article>
        <span class="location-number">${esc(item.number)}</span>
        <h3>${esc(item.name)}</h3>
        <p>${lines(item.address)}</p>
        ${item.hotline ? `<p class="location-hotline"><a href="tel:${esc(item.hotline.replace(/\D/g, ''))}">${esc(item.hotline)}</a></p>` : ''}
        <div>
          <a class="text-link" href="${esc(item.map)}" target="_blank" rel="noopener">Chỉ đường ↗</a>
          <a href="#dat-lich" data-branch="${esc(item.branch || item.name)}" class="button outline small">Chọn cơ sở này</a>
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
    const placeholder = document.querySelector('.testimonial-placeholder');
    if (placeholder) placeholder.style.display = 'none';
    grid.innerHTML = items.map(item => {
      const n = Math.min(5, Math.max(1, parseInt(item.rating) || 5));
      const stars = '★'.repeat(n);
      const initial = (item.name || 'K').trim().charAt(0).toUpperCase();
      const meta = [esc(item.service), esc(item.location)].filter(Boolean).join(' · ');
      const imgHtml = item.image
        ? `<div class="testimonial-image-wrap"><img class="testimonial-image" src="${esc(item.image)}" alt="Ảnh xác thực từ ${esc(item.name)}" loading="lazy" data-lightbox="${esc(item.image)}"></div>`
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

    // Lightbox: click ảnh để phóng to
    grid.addEventListener('click', function(e) {
      const img = e.target.closest('[data-lightbox]');
      if (!img) return;
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:16px';
      const big = document.createElement('img');
      big.src = img.dataset.lightbox;
      big.style.cssText = 'max-width:100%;max-height:90vh;border-radius:10px;box-shadow:0 8px 40px rgba(0,0,0,.6)';
      overlay.appendChild(big);
      overlay.addEventListener('click', () => overlay.remove());
      document.body.appendChild(overlay);
    });
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
      const checked = [...form.querySelectorAll('input[name="issue"]:checked')].map(el => el.value);
      const topic = checked.length ? checked.join(', ') : service.value;
      const day = date.value ? `, dự kiến ngày ${date.value.split('-').reverse().join('/')}` : '';
      message.textContent = `Chào Hồi Xuân Đường, tôi muốn được tư vấn về: ${topic} tại cơ sở ${branch.value}${day}. Vui lòng cho tôi biết giá, thời lượng và lịch trống phù hợp. Cảm ơn!`;
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

  function initServiceModal() {
    const overlay = document.getElementById('svc-overlay');
    const closeBtn = document.getElementById('svc-close');
    if (!overlay) return;
    closeBtn && closeBtn.addEventListener('click', closeServiceModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeServiceModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeServiceModal(); });
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

  function applySectionVisibility(vis) {
    if (!vis || typeof vis !== 'object') return;
    Object.entries(vis).forEach(([id, visible]) => {
      const el = document.getElementById(id);
      if (el) el.style.display = visible === false ? 'none' : '';
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const data = await loadSiteData();
    if (data) {
      applySettings(data.settings);
      applySectionVisibility(data.section_visibility);
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
    initServiceModal();
    initChatWidget();
    initTestimonialLightbox();
    initVideoModal();
    initInlineVideos();
    initSymptomModal();
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
    const frames = document.querySelectorAll('.offer-video-frame[data-src], .experience-video-frame[data-src]');
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

  // ===== SYMPTOM EDUCATION MODAL =====
  const SYMPTOMS = {
    'co-vai-gay': {
      title: 'Đau mỏi Cổ Vai Gáy', sub: 'Tê bì, cứng cơ, nhức đầu vùng gáy',
      cam_nhan: 'Sáng ngủ dậy cổ cứng không quay được. Ngồi máy tính hay cầm điện thoại lâu là vai mỏi rã rời. Lúc đầu xoa dầu nóng hoặc đấm lưng thì tạm đỡ, nhưng vài hôm lại tái. Nhiều lúc tê nhức lan lên đầu, mắt mờ, căng cứng hai bên thái dương mà không rõ lý do.',
      dong_y: 'Đây là dấu hiệu kinh lạc vùng cổ gáy bị tắc nghẽn do ngồi sai tư thế lâu ngày hoặc phong hàn xâm nhập. Đông y gọi là "khí huyết ứ trệ tại kinh Thái Dương" — không phải chỉ mỏi cơ thông thường mà là toàn bộ đường dẫn khí huyết từ vai lên đầu đang bị cản trở.',
      hau_qua: 'Để lâu không can thiệp: thoái hóa đốt sống cổ C4–C6, hẹp ống sống, chèn ép rễ thần kinh → tê liệt tay, đau đầu mãn tính, nguy cơ rối loạn tuần hoàn não.'
    },
    'that-lung': {
      title: 'Đau thắt lưng', sub: 'Thoái hóa cột sống, đau khi cúi ngửa',
      cam_nhan: 'Ngồi lâu rồi đứng dậy thấy đau nhói ở lưng dưới. Cúi xuống nhặt đồ hoặc mặc quần cũng khó khăn. Nhiều người phải kê gối dưới lưng lúc nằm mới dễ chịu. Nghỉ ngơi vài ngày thì tạm ổn, nhưng làm việc lại hoặc trời lạnh là đau ngay trở lại.',
      dong_y: 'Thắt lưng là "phủ của Thận" — khi Thận suy, cột sống thiếu nơi nương tựa, đĩa đệm suy yếu sớm. Hàn thấp xâm nhập vào các huyệt Thận Du, Mệnh Môn làm khí huyết tắc nghẽn. Đây là lý do nhiều người đau lưng tái đi tái lại dù uống thuốc giảm đau — vì gốc ở Thận chưa được bổ.',
      hau_qua: 'Thoát vị đĩa đệm L4–L5, L5–S1 chèn ép thần kinh tọa, đau lan xuống mông và chân. Thận hư kéo dài còn kéo theo suy giảm sinh lý, tiểu đêm nhiều, loãng xương sớm.'
    },
    'mat-ngu': {
      title: 'Mất ngủ', sub: 'Khó đi vào giấc, hay thức giữa đêm',
      cam_nhan: 'Nằm xuống là đầu óc quay tít, suy nghĩ lung tung không tắt được. Có người ngủ được nhưng 2–3 giờ sáng tỉnh dậy rồi không ngủ lại được. Uống thuốc ngủ thì có giấc nhưng sáng dậy vẫn mệt, bải hoải cả ngày. Lâu dần hay quên, khó tập trung, hay cáu gắt vô cớ.',
      dong_y: 'Đông y xác định mất ngủ xuất phát từ Tâm Thần bất an — do căng thẳng lâu ngày làm Can uất hóa hỏa nhiễu lên Tâm, hoặc do cơ thể suy yếu khiến huyết không đủ nuôi Tâm thần. Điều này giải thích vì sao thuốc ngủ chỉ "che" triệu chứng mà không giải quyết được gốc rễ.',
      hau_qua: 'Mất ngủ mãn tính làm khí huyết suy kiệt toàn thân, hệ miễn dịch giảm mạnh, lão hóa nhanh. Nguy cơ trầm cảm, rối loạn nội tiết tố — đặc biệt nguy hiểm với phụ nữ tuổi tiền mãn kinh.'
    },
    'dau-dau': {
      title: 'Đau đầu, hoa mắt', sub: 'Chóng mặt, đau nửa đầu, ù tai',
      cam_nhan: 'Hay bị đau nửa đầu bên phải hoặc sau gáy, nhức như búa gõ. Căng thẳng hay thiếu ngủ là hôm sau đau ngay. Đứng dậy nhanh thấy hoa mắt, choáng váng. Có lúc ù tai đột ngột, mắt mờ rồi tự hết. Uống panadol thì đỡ vài tiếng rồi lại đau — cứ lặp đi lặp lại.',
      dong_y: 'Đau đầu tái phát thường do Can Dương vượng hoặc khí huyết không đủ lên nuôi não — hai nguyên nhân hoàn toàn khác nhau, cần chẩn đoán riêng. Đây là lý do thuốc giảm đau chỉ giải quyết cơn đau tức thời mà không ngăn được tái phát.',
      hau_qua: 'Can Dương vượng kéo dài dẫn đến tăng huyết áp mãn tính, nguy cơ đột quỵ. Thiếu máu não lâu ngày gây suy giảm trí nhớ, mất khả năng tập trung.'
    },
    'han-am': {
      title: 'Nhiễm hàn ẩm', sub: 'Lạnh tay chân, cơ thể hay mỏi mệt',
      cam_nhan: 'Tay chân lạnh quanh năm dù trời không lạnh. Sáng ngủ dậy cứ thấy người nặng nề, mỏi mệt như chưa ngủ. Hay bị đau bụng khi ăn lạnh, bụng thường ùng ục. Phụ nữ hay bị đau bụng kinh, kinh nguyệt không đều. Trời trở lạnh hoặc ngồi phòng điều hòa lâu là người khó chịu hẳn.',
      dong_y: 'Đây là biểu hiện cơ thể tích tụ hàn khí và thủy thấp lâu ngày — thường do ăn uống đồ lạnh, ngồi điều hòa nhiều, hay sau sinh không giữ ấm đúng cách. Dương khí suy yếu không đủ đẩy hàn ra ngoài, hàn ứ lại trong kinh lạc và tạng phủ.',
      hau_qua: 'Hàn thấp lâu ngày gây viêm khớp mãn tính, phù nề, tiêu hóa yếu. Phụ nữ dễ rối loạn kinh nguyệt, vô sinh. Dương khí suy toàn thân — hay ốm vặt, sức đề kháng kém.'
    },
    'ngu-tang': {
      title: 'Dưỡng sinh ngũ tạng', sub: 'Điều hòa khí huyết, bồi bổ tạng phủ',
      cam_nhan: 'Không có bệnh rõ ràng nhưng cứ thấy người mệt mỏi, không có sức. Ăn uống bình thường nhưng tiêu hóa hay trục trặc. Hồi hộp, khó thở nhẹ khi leo cầu thang. Hay lo lắng vô cớ, cảm xúc thất thường, ngủ chập chờn. Cảm giác cơ thể đang "xuống dốc" dù chưa đến 50 tuổi.',
      dong_y: 'Đây là dấu hiệu ngũ tạng (Can–Tâm–Tỳ–Phế–Thận) đang suy yếu đồng loạt — giai đoạn trước khi bệnh hình thành rõ ràng. Đông y gọi là "chính khí hư" — cơ thể thiếu nội lực. Đây là thời điểm tốt nhất để can thiệp, trước khi thành bệnh mãn tính.',
      hau_qua: 'Không bổ dưỡng ngũ tạng đúng lúc — sức đề kháng sụp đổ toàn diện, bệnh mãn tính như tiểu đường, huyết áp, tim mạch hình thành sớm hơn 10–15 năm so với người dưỡng sinh đúng cách.'
    },
    'voc-dang': {
      title: 'Chăm sóc vóc dáng', sub: 'Tái tạo hình thể, làn da tươi sáng',
      cam_nhan: 'Ăn không nhiều nhưng vẫn tăng cân, đặc biệt ở bụng và đùi. Da dạo này sạm hơn, hay nổi mụn dù đã chăm rửa mặt. Cảm giác người hay phù nề, sáng ngủ dậy mặt sưng húp. Đã thử nhiều loại kem, thực phẩm chức năng nhưng không giữ được kết quả lâu dài.',
      dong_y: 'Theo Đông y, vóc dáng và làn da phản chiếu tình trạng khí huyết và tạng phủ bên trong. Da sạm, phù nề, tăng cân khó kiểm soát thường do Tỳ Vị hư — cơ thể không vận hóa được dinh dưỡng và thủy thấp. Điều trị từ bên trong mới giữ được kết quả bền.',
      hau_qua: 'Tỳ hư thấp trệ kéo dài — tăng cân khó kiểm soát dù ăn ít, da lão hóa sớm, thiếu đàn hồi. Khí huyết ứ trệ còn ảnh hưởng tâm lý: lo âu, tự ti về ngoại hình.'
    },
    'te-bi': {
      title: 'Tê bì tay chân', sub: 'Tê buốt ngón tay, khó giơ tay cao',
      cam_nhan: 'Ngủ dậy hay thấy tay tê, phải vẩy vẩy mạnh mới hết. Ngồi lâu một tư thế là chân tê cứng. Đôi khi tê đột ngột cả bàn tay khi đang cầm đồ, hay tê buốt ngón út và áp út. Giơ tay cao lâu (chải đầu, lấy đồ trên cao) thấy mỏi và tê rất nhanh.',
      dong_y: 'Tê bì tay chân là dấu hiệu khí huyết không lưu thông đến tứ chi — do kinh lạc bị tắc hoặc gân cốt thiếu dưỡng. Thường liên quan đến tình trạng cổ vai gáy hoặc cột sống cổ, không phải chỉ vấn đề tuần hoàn máu đơn thuần. Cần xác định chính xác đường kinh nào bị ảnh hưởng.',
      hau_qua: 'Tiến triển thành hội chứng ống cổ tay, viêm dây thần kinh ngoại biên, liệt dây thần kinh khó hồi phục. Tê bì mãn tính làm giảm lực cầm nắm, ảnh hưởng nặng đến sinh hoạt và lao động hằng ngày.'
    }
  };

  function openSymptomModal(key) {
    const data = SYMPTOMS[key];
    if (!data) return;
    const overlay = document.getElementById('sym-overlay');
    const body = document.getElementById('sym-modal-body');
    if (!overlay || !body) return;
    body.innerHTML = `
      <h2 id="sym-modal-title">${esc(data.title)}</h2>
      <p class="sym-modal-sub">${esc(data.sub)}</p>
      <hr class="sym-divider">
      <div class="sym-section">
        <p class="sym-label">💬 Bạn có đang gặp tình trạng này không?</p>
        <p>${esc(data.cam_nhan)}</p>
      </div>
      <div class="sym-section sym-section-dongY">
        <p class="sym-label">🌿 Đông y lý giải điều gì đang xảy ra</p>
        <p>${esc(data.dong_y)}</p>
      </div>
      <div class="sym-section">
        <p class="sym-label sym-label-hq">⚠️ Để lâu có thể dẫn đến</p>
        <p>${esc(data.hau_qua)}</p>
      </div>
      <div class="sym-cta">
        <a href="#dat-lich" class="sym-cta-main" data-service="${esc(data.title)}">Tư vấn trực tiếp tại Hồi Xuân Đường →</a>
        <button type="button" class="sym-cta-dismiss" id="sym-dismiss">Tôi muốn tìm hiểu thêm trước</button>
      </div>`;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    const closeBtn = document.getElementById('sym-close');
    const dismissBtn = document.getElementById('sym-dismiss');
    const ctaLink = body.querySelector('.sym-cta-main');
    const close = () => { overlay.hidden = true; document.body.style.overflow = ''; };
    closeBtn && closeBtn.addEventListener('click', close, { once: true });
    dismissBtn && dismissBtn.addEventListener('click', close, { once: true });
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); }, { once: true });
    ctaLink && ctaLink.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); }, { once: true });
  }

  function initSymptomModal() {
    document.querySelectorAll('.hp-card[data-symptom]').forEach(btn => {
      btn.addEventListener('click', () => openSymptomModal(btn.dataset.symptom));
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
      applySectionVisibility(data.section_visibility);
      applyTapIcons();
      var active = document.querySelector('[data-filter].active') || document.querySelector('[data-filter]');
      if (active) active.click();
      initBooking();
    } catch (err) { /* xem trước lỗi thì bỏ qua, không làm hỏng gì */ }
  });
})();
