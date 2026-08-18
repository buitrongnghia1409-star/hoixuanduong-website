/* Supabase Dynamic Content Loader */
(function () {
  "use strict";

  if (!window.supabase) {
    console.error('Supabase library not loaded');
    return;
  }

  const supabaseClient = window.supabase.createClient(
    'https://epdjnjcfzxhllklusmet.supabase.co',
    'sb_publishable_pIjbFKuEUhUGxoMZvB6AsQ_dlpJUSO_'
  );

  // ===== HERO SECTION =====
  async function loadHeroSection() {
    try {
      const { data } = await supabaseClient
        .from('hero_section')
        .select('*')
        .eq('id', 1)
        .single();

      if (data) {
        const eyebrow = document.querySelector('.cover-text .eyebrow');
        const p = document.querySelector('.cover-text p');
        const ctaBtn = document.querySelector('.hero-cta .btn-gold');
        const ctaSecondary = document.querySelector('.hero-cta .btn-outline');

        if (eyebrow) eyebrow.textContent = data.eyebrow || '';
        if (p) p.textContent = data.description || '';
        if (ctaBtn) ctaBtn.textContent = data.primary_cta_text || 'Đặt lịch tư vấn miễn phí';
        if (ctaSecondary) ctaSecondary.textContent = data.secondary_cta_text || 'Xem sản phẩm';
      }
    } catch (err) {
      console.error('Error loading hero section:', err.message);
    }
  }

  // ===== SERVICES =====
  async function loadServices() {
    try {
      const { data } = await supabaseClient
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (data && data.length > 0) {
        const servicesGrid = document.querySelector('.services-grid');
        if (!servicesGrid) return;

        let html = '';
        data.forEach((service, index) => {
          const serviceNum = String(index + 1).padStart(2, '0');
          html += `
            <div class="service-card reveal">
              <div class="service-media">
                <span class="service-num">${serviceNum}</span>
                ${service.image_url
                    ? `<img src="${service.image_url}" alt="${service.service_name}" loading="lazy">`
                    : `<div class="service-media-empty"><span>${service.icon_emoji || '🏥'}</span></div>`}
              </div>
              <div class="service-body">
                <h3>${service.service_name}</h3>
                <p>${service.description}</p>
                <a href="#lien-he" class="service-link">Đặt lịch →</a>
              </div>
            </div>
          `;
        });

        servicesGrid.innerHTML = html;
      }
    } catch (err) {
      console.error('Error loading services:', err.message);
    }
  }

  // ===== PRODUCTS =====
  async function loadProducts() {
    try {
      const { data } = await supabaseClient
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (data && data.length > 0) {
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;

        let html = '';
        data.forEach(product => {
          const categoryMap = {
            'tra': 'trà thảo dược',
            'tinhdau': 'tinh dầu',
            'cao': 'cao & viên',
            'cskh': 'chăm sóc da'
          };

          html += `
            <div class="product-card reveal" data-cat="${product.category}">
              <div class="product-media">
                ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ''}
                ${product.image_url ? `<img src="${product.image_url}" alt="${product.product_name}" loading="lazy">` : '<svg class="ph-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 8h13a3 3 0 010 6h-1M4 8v9a2 2 0 002 2h8a2 2 0 002-2V8M4 8l1-4h10l1 4"/></svg>'}
              </div>
              <div class="product-body">
                <div class="product-cat">${categoryMap[product.category] || product.category}</div>
                <h3>${product.product_name}</h3>
                <p>${product.description}</p>
                <div class="product-foot">
                  <div class="product-price">${product.price.toLocaleString()}đ<small>${product.unit}</small></div>
                  <button type="button" class="add-cart-btn" data-name="${product.product_name}" data-price="${product.price}" aria-label="Thêm vào giỏ">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                  </button>
                </div>
              </div>
            </div>
          `;
        });

        productsGrid.innerHTML = html;

        // Reinit cart buttons
        if (window.initCartButtons) window.initCartButtons();
      }
    } catch (err) {
      console.error('Error loading products:', err.message);
    }
  }

  // ===== BRANCHES =====
  async function loadBranches() {
    try {
      const { data } = await supabaseClient
        .from('branches')
        .select('*')
        .eq('is_active', true)
        .order('branch_number');

      if (data) {
        // Update topbar with first branch
        if (data.length > 0) {
          const topbarAddress = document.getElementById('topbarAddress');
          const topbarPhone = document.getElementById('topbarPhone');
          if (topbarAddress) topbarAddress.textContent = '📍 CS1: ' + data[0].address;
          if (topbarPhone) {
            const phoneFormatted = data[0].phone?.replace(/(\d)(\d{3})(\d{3})(\d{3})/, '$1$2 $3 $4') || '0912 994 888';
            topbarPhone.textContent = '☎ ' + phoneFormatted;
            topbarPhone.href = 'tel:' + (data[0].phone?.replace(/\s/g, '') || '0912994888');
          }
        }

        // Update contact section
        const infoList = document.querySelector('.info-list');
        if (infoList) {
          let html = '';
          data.forEach((branch, index) => {
            html += `
              <div class="info-item">
                <span class="icon reveal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg></span>
                <div><strong>${branch.branch_name}</strong><span>${branch.address}</span></div>
              </div>
            `;
          });
          infoList.innerHTML = html;
        }

        // Update footer
        const footerAddress = document.getElementById('footerAddress');
        if (footerAddress && data.length > 0) {
          footerAddress.textContent = 'CS1: ' + data[0].address;
        }
      }
    } catch (err) {
      console.error('Error loading branches:', err.message);
    }
  }

  // ===== TEAM =====
  async function loadTeam() {
    try {
      const { data } = await supabaseClient
        .from('team')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (data && data.length > 0) {
        // Currently only showing first team member (leader)
        const leader = data[0];
        const leaderCard = document.querySelector('.leader-card');

        if (leaderCard) {
          const leaderName = leaderCard.querySelector('h2');
          const leaderRole = leaderCard.querySelector('.leader-role');
          const leaderBio = leaderCard.querySelector('p:not(.leader-role)');

          if (leaderName) leaderName.textContent = leader.team_name;
          if (leaderRole) leaderRole.textContent = leader.position;
          if (leaderBio) leaderBio.textContent = leader.bio;
        }
      }
    } catch (err) {
      console.error('Error loading team:', err.message);
    }
  }

  // ===== CONTACT INFO =====
  async function loadContactInfo() {
    try {
      const { data } = await supabaseClient
        .from('contact_links')
        .select('*')
        .eq('id', 1)
        .single();

      if (data) {
        // Update contact section
        const contactPhone = document.getElementById('contactPhone');
        const contactEmail = document.getElementById('contactEmail');
        const footerPhone = document.getElementById('footerPhone');
        const footerEmail = document.getElementById('footerEmail');

        if (contactPhone && data.zalo_number) {
          const phoneFormatted = data.zalo_number.replace(/(\d)(\d{3})(\d{3})(\d{3})/, '$1$2 $3 $4');
          contactPhone.textContent = phoneFormatted;
          contactPhone.href = 'tel:' + data.zalo_number.replace(/\s/g, '');
        }

        if (footerPhone && data.zalo_number) {
          const phoneFormatted = data.zalo_number.replace(/(\d)(\d{3})(\d{3})(\d{3})/, '$1$2 $3 $4');
          footerPhone.textContent = phoneFormatted;
          footerPhone.href = 'tel:' + data.zalo_number.replace(/\s/g, '');
        }

        // Update social links
        const facebookLink = document.querySelector('a[href*="facebook"]');
        const zaloLink = document.querySelector('a[href*="zalo"]');
        const youtubeLink = document.querySelector('a[href*="youtube"]');

        if (facebookLink && data.facebook_url) facebookLink.href = data.facebook_url;
        if (youtubeLink && data.youtube_url) youtubeLink.href = data.youtube_url;
        if (zaloLink && data.zalo_number) zaloLink.href = `https://zalo.me/${data.zalo_number.replace(/\s/g, '')}`;
      }
    } catch (err) {
      console.error('Error loading contact info:', err.message);
    }
  }

  // ===== CLINIC INFO =====
  async function loadClinicInfo() {
    try {
      const { data } = await supabaseClient
        .from('clinic_info')
        .select('*')
        .eq('id', 1)
        .single();

      if (data) {
        const topbarHours = document.getElementById('topbarHours');
        const contactHours = document.getElementById('contactHours');

        if (topbarHours) topbarHours.textContent = '🕗 ' + (data.business_hours || '8:00 – 20:00');
        if (contactHours) contactHours.textContent = data.business_hours || '8:00 – 20:00';
      }
    } catch (err) {
      console.error('Error loading clinic info:', err.message);
    }
  }

  // ===== INIT ALL =====
  async function initAllContent() {
    await Promise.all([
      loadClinicInfo(),
      loadHeroSection(),
      loadServices(),
      loadProducts(),
      loadBranches(),
      loadTeam(),
      loadContactInfo()
    ]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllContent);
  } else {
    initAllContent();
  }
})();
