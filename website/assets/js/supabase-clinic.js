/* Supabase Clinic Data Loader */
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

  async function loadClinicData() {
    try {
      const { data, error } = await supabaseClient
        .from('clinic_data')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;

      if (data) {
        const phone = data.phone || '0912 994 888';
        const businessHours = data.business_hours || '8:00 – 20:00, Thứ 2 – Chủ nhật';
        const address = data.address || '955, Tổ 2 Khu 10, Bãi Cháy, Hạ Long, Quảng Ninh';
        const email = data.email || 'contact@hoixuanduong.vn';

        const formatPhone = (p) => p.replace(/(\d)(\d{3})(\d{3})(\d{3})/, '$1$2 $3 $4');
        const phoneFormatted = formatPhone(phone.replace(/\s/g, ''));
        const phoneRaw = phone.replace(/\s/g, '');

        // Topbar
        const topbarAddress = document.getElementById('topbarAddress');
        const topbarHours = document.getElementById('topbarHours');
        const topbarPhone = document.getElementById('topbarPhone');

        if (topbarAddress) topbarAddress.textContent = '📍 CS1: ' + address;
        if (topbarHours) topbarHours.textContent = '🕗 ' + businessHours;
        if (topbarPhone) {
          topbarPhone.textContent = '☎ ' + phoneFormatted;
          topbarPhone.href = 'tel:' + phoneRaw;
        }

        // Contact section
        const contactPhone = document.getElementById('contactPhone');
        const contactEmail = document.getElementById('contactEmail');
        const contactHours = document.getElementById('contactHours');

        if (contactPhone) {
          contactPhone.textContent = phoneFormatted;
          contactPhone.href = 'tel:' + phoneRaw;
        }
        if (contactEmail) {
          contactEmail.textContent = email;
          contactEmail.href = 'mailto:' + email;
        }
        if (contactHours) contactHours.textContent = businessHours;

        // Footer
        const footerAddress = document.getElementById('footerAddress');
        const footerAddress2 = document.getElementById('footerAddress2');
        const footerPhone = document.getElementById('footerPhone');
        const footerEmail = document.getElementById('footerEmail');

        if (footerAddress) footerAddress.textContent = 'CS1: ' + address;
        if (footerAddress2) footerAddress2.style.display = 'none';
        if (footerPhone) {
          footerPhone.textContent = phoneFormatted;
          footerPhone.href = 'tel:' + phoneRaw;
        }
        if (footerEmail) {
          footerEmail.textContent = email;
          footerEmail.href = 'mailto:' + email;
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu từ Supabase:', err.message);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadClinicData);
  } else {
    loadClinicData();
  }
})();
