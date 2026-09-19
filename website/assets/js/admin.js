(() => {
  const root = document.querySelector('#editor-root');
  const status = document.querySelector('#status');
  const downloadButton = document.querySelector('#download-json');
  const uploadInput = document.querySelector('#json-upload');
  let siteData = {};

  const labels = {
    settings: 'Thông tin thương hiệu',
    hero: 'Hero / ảnh chuyển động đầu trang',
    services: 'Dịch vụ',
    offers: 'Ưu đãi, voucher, sự kiện',
    products: 'Sản phẩm',
    locations: 'Cơ sở',
    faqs: 'Câu hỏi thường gặp',
    brandName: 'Tên thương hiệu',
    brandTagline: 'Dòng mô tả logo',
    phone: 'Hotline',
    zalo: 'Link Zalo',
    workingHours: 'Giờ làm việc',
    image: 'Ảnh',
    alt: 'Mô tả ảnh',
    eyebrow: 'Nhãn nhỏ',
    title: 'Tiêu đề',
    slogan: 'Slogan / dòng vàng',
    description: 'Mô tả',
    category: 'Nhóm',
    label: 'Nhãn trên ảnh',
    detailTitle: 'Tiêu đề chi tiết',
    detail: 'Nội dung chi tiết',
    priceLabel: 'Nhãn giá',
    price: 'Giá',
    featured: 'Ưu đãi nổi bật',
    tag: 'Tag',
    service: 'Tên khi gửi tư vấn',
    cta: 'Nút kêu gọi',
    icon: 'Biểu tượng',
    number: 'Số cơ sở',
    name: 'Tên',
    address: 'Địa chỉ',
    map: 'Link chỉ đường',
    branch: 'Tên cơ sở trong form',
    future: 'Cơ sở sắp cập nhật',
    question: 'Câu hỏi',
    answer: 'Câu trả lời'
  };

  const descriptions = {
    settings: 'Số điện thoại, Zalo và thông tin dùng chung trên toàn website.',
    hero: 'Mỗi mục là một trang ảnh trong hero. Có thể đổi ảnh, tiêu đề, slogan và mô tả.',
    services: 'Thêm/bỏ dịch vụ, đổi ảnh, nhóm lọc, mô tả và giá.',
    offers: 'Khu vực chương trình trải nghiệm, voucher, sự kiện hoặc khuyến mãi.',
    products: 'Danh mục sản phẩm hiển thị trên website. Có thể sửa tên, giá và nhóm.',
    locations: 'Danh sách chi nhánh. Bật “sắp cập nhật” nếu chưa có địa chỉ chính thức.',
    faqs: 'Những câu hỏi thường gặp dưới trang.'
  };

  const templates = {
    hero: { image: 'assets/images/dms07238.jpg', alt: '', eyebrow: 'NHÃN HERO', title: 'Tiêu đề hero', slogan: 'Slogan nổi bật.', description: 'Mô tả ngắn cho ảnh hero.' },
    services: { category: 'tri-lieu', image: 'assets/images/phong-tri-lieu-2.jpg', alt: '', label: 'DỊCH VỤ', title: 'Tên dịch vụ mới', description: 'Mô tả ngắn.', detailTitle: 'Thông tin liệu trình', detail: 'Nội dung chi tiết.', priceLabel: 'GIÁ DỊCH VỤ', price: 'Liên hệ báo giá' },
    offers: { tag: 'ƯU ĐÃI', title: 'Tên chương trình mới', description: 'Mô tả chương trình.', service: 'Tên chương trình mới', cta: 'Nhận tư vấn ↗' },
    products: { category: 'NHÓM SẢN PHẨM', title: 'Tên sản phẩm mới', price: 'Liên hệ báo giá', service: 'Tên sản phẩm mới', icon: 'tea' },
    locations: { number: 'CƠ SỞ MỚI', name: 'Tên cơ sở', address: 'Địa chỉ sẽ cập nhật', map: '', branch: 'Tên cơ sở', future: true },
    faqs: { question: 'Câu hỏi mới?', answer: 'Câu trả lời.' }
  };

  function setStatus(message) {
    status.textContent = message;
  }

  function fieldType(key, value) {
    if (typeof value === 'boolean') return 'checkbox';
    if (['description', 'detail', 'address', 'answer', 'alt'].includes(key)) return 'textarea';
    if (key === 'category') return 'category';
    if (key === 'icon') return 'icon';
    return 'text';
  }

  function inputFor(path, key, value) {
    const id = path.join('__');
    const label = labels[key] || key;
    const type = fieldType(key, value);
    const full = type === 'textarea' || ['image', 'map', 'zalo'].includes(key) ? ' full' : '';
    if (type === 'checkbox') {
      return `<div class="field"><label for="${id}">${label}</label><select id="${id}" data-path="${path.join('.')}"><option value="true"${value ? ' selected' : ''}>Có</option><option value="false"${!value ? ' selected' : ''}>Không</option></select></div>`;
    }
    if (type === 'textarea') {
      return `<div class="field${full}"><label for="${id}">${label}</label><textarea id="${id}" data-path="${path.join('.')}">${escapeHtml(value)}</textarea></div>`;
    }
    if (type === 'category') {
      return `<div class="field"><label for="${id}">${label}</label><select id="${id}" data-path="${path.join('.')}"><option value="tri-lieu"${value === 'tri-lieu' ? ' selected' : ''}>Chăm sóc cơ thể</option><option value="duong-sinh"${value === 'duong-sinh' ? ' selected' : ''}>Dưỡng sinh thảo dược</option><option value="sac-dep"${value === 'sac-dep' ? ' selected' : ''}>Chăm sóc sắc đẹp</option></select></div>`;
    }
    if (type === 'icon') {
      return `<div class="field"><label for="${id}">${label}</label><select id="${id}" data-path="${path.join('.')}"><option value="tea"${value === 'tea' ? ' selected' : ''}>Trà</option><option value="oil"${value === 'oil' ? ' selected' : ''}>Tinh dầu</option><option value="box"${value === 'box' ? ' selected' : ''}>Hộp/cao</option><option value="serum"${value === 'serum' ? ' selected' : ''}>Serum</option></select></div>`;
    }
    const hint = key === 'image' ? '<small>Nhập đường dẫn ảnh, ví dụ: assets/images/ten-anh.jpg</small>' : '';
    return `<div class="field${full}"><label for="${id}">${label}</label><input id="${id}" data-path="${path.join('.')}" value="${escapeHtml(value)}">${hint}</div>`;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function getByPath(path) {
    return path.split('.').reduce((target, key) => target?.[key], siteData);
  }

  function setByPath(path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((obj, key) => obj[key], siteData);
    const oldValue = target[last];
    target[last] = typeof oldValue === 'boolean' ? value === 'true' : value;
  }

  function renderSettings() {
    const entries = Object.entries(siteData.settings || {});
    return `<section class="group"><div class="group-head"><div><h2>${labels.settings}</h2><p>${descriptions.settings}</p></div></div><div class="items"><article class="item"><div class="fields">${entries.map(([key, value]) => inputFor(['settings', key], key, value)).join('')}</div></article></div></section>`;
  }

  function renderArrayGroup(key) {
    const items = siteData[key] || [];
    return `<section class="group" data-group="${key}">
      <div class="group-head"><div><h2>${labels[key] || key}</h2><p>${descriptions[key] || ''}</p></div><button class="add-btn" type="button" data-add="${key}">Thêm mục</button></div>
      <div class="items">${items.map((item, index) => `
        <article class="item">
          <div class="item-title"><strong>${escapeHtml(item.title || item.name || item.question || `${labels[key]} ${index + 1}`)}</strong><button class="remove-btn" type="button" data-remove="${key}" data-index="${index}">Xóa</button></div>
          <div class="fields">${Object.entries(item).map(([field, value]) => inputFor([key, index, field], field, value)).join('')}</div>
        </article>`).join('')}</div>
    </section>`;
  }

  function render() {
    root.innerHTML = [
      renderSettings(),
      renderArrayGroup('hero'),
      renderArrayGroup('services'),
      renderArrayGroup('offers'),
      renderArrayGroup('products'),
      renderArrayGroup('locations'),
      renderArrayGroup('faqs'),
      `<section class="group"><div class="group-head"><div><h2>Xem nhanh file dữ liệu</h2><p>Phần này để kiểm tra tổng thể trước khi tải file.</p></div></div><div class="items"><pre class="json-preview">${escapeHtml(JSON.stringify(siteData, null, 2))}</pre></div></section>`
    ].join('');
  }

  root.addEventListener('input', event => {
    const control = event.target.closest('[data-path]');
    if (!control) return;
    setByPath(control.dataset.path, control.value);
    const preview = document.querySelector('.json-preview');
    if (preview) preview.textContent = JSON.stringify(siteData, null, 2);
    setStatus('Đã cập nhật trong trình duyệt. Bấm “Tải file dữ liệu” để lưu ra file.');
  });

  root.addEventListener('change', event => {
    const control = event.target.closest('[data-path]');
    if (!control) return;
    setByPath(control.dataset.path, control.value);
    render();
  });

  root.addEventListener('click', event => {
    const add = event.target.closest('[data-add]');
    const remove = event.target.closest('[data-remove]');
    if (add) {
      const key = add.dataset.add;
      siteData[key].push(JSON.parse(JSON.stringify(templates[key])));
      render();
      setStatus(`Đã thêm mục mới vào ${labels[key]}.`);
    }
    if (remove) {
      const key = remove.dataset.remove;
      siteData[key].splice(Number(remove.dataset.index), 1);
      render();
      setStatus(`Đã xóa một mục khỏi ${labels[key]}.`);
    }
  });

  downloadButton.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(siteData, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'site-data.json';
    link.click();
    URL.revokeObjectURL(url);
    setStatus('Đã tải file site-data.json. Thay file này trong website/assets/data/ để cập nhật website.');
  });

  uploadInput.addEventListener('change', async () => {
    const file = uploadInput.files[0];
    if (!file) return;
    try {
      siteData = JSON.parse(await file.text());
      render();
      setStatus('Đã nạp file dữ liệu mới.');
    } catch {
      setStatus('File vừa chọn không đúng định dạng JSON. Vui lòng kiểm tra lại.');
    }
  });

  async function init() {
    try {
      const response = await fetch('assets/data/site-data.json', { cache: 'no-cache' });
      siteData = await response.json();
      render();
      setStatus('Đã tải dữ liệu hiện tại. Bạn có thể bắt đầu chỉnh sửa.');
    } catch {
      setStatus('Không tải được dữ liệu hiện tại. Hãy nạp file site-data.json thủ công.');
    }
  }

  init();
})();
