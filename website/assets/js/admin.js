(() => {
  const SESSION_KEY = 'hxd_admin_logged_in';
  const loginScreen = document.querySelector('#login-screen');
  const loginForm = document.querySelector('#login-form');
  const loginError = document.querySelector('#login-error');
  const app = document.querySelector('#admin-app');
  const logoutButton = document.querySelector('#logout');
  const root = document.querySelector('#editor-root');
  const status = document.querySelector('#status');
  const downloadButton = document.querySelector('#download-json');
  const saveCloudButton = document.querySelector('#save-cloud');
  const uploadInput = document.querySelector('#json-upload');
  const cloud = window.HXD && window.HXD.configured ? window.HXD : null;
  const previewFrame = document.querySelector('#preview-frame');
  let siteData = {};

  // Gửi dữ liệu hiện tại sang khung xem trước (website thật trong iframe).
  let previewTimer = null;
  function pushPreview() {
    if (!previewFrame || !previewFrame.contentWindow) return;
    clearTimeout(previewTimer);
    previewTimer = setTimeout(function () {
      try {
        previewFrame.contentWindow.postMessage(
          { type: 'HXD_PREVIEW', data: siteData }, '*');
      } catch (e) { /* bỏ qua nếu iframe chưa sẵn sàng */ }
    }, 180);
  }
  if (previewFrame) {
    previewFrame.addEventListener('load', function () { pushPreview(); });
  }

  function showApp() {
    sessionStorage.setItem(SESSION_KEY, '1');
    document.body.classList.add('is-logged-in');
    document.body.classList.remove('is-locked');
    loginScreen.hidden = true;
    app.hidden = false;
  }

  function showLogin() {
    sessionStorage.removeItem(SESSION_KEY);
    document.body.classList.remove('is-logged-in');
    document.body.classList.add('is-locked');
    loginScreen.hidden = false;
    app.hidden = true;
  }

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    loginError.textContent = '';
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;

    // Khi đã kết nối Supabase: đăng nhập thật qua máy chủ (an toàn, không dò
    // được từ mã nguồn). Khi chưa cấu hình: tạm dùng mã băm cũ để không kẹt.
    if (!cloud) {
      loginError.textContent = 'Chưa kết nối Supabase. Kiểm tra cấu hình.';
      return;
    }
    loginError.textContent = 'Đang đăng nhập…';
    const res = await cloud.signIn(username, password);
    if (res.ok) { loginError.textContent = ''; await enterApp(); return; }
    loginError.textContent = 'Email hoặc mật khẩu chưa đúng.';
  });

  logoutButton.addEventListener('click', async () => {
    if (cloud) await cloud.signOut();
    showLogin();
  });

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
    facebook: 'Link Facebook',
    workingHours: 'Giờ làm việc',
    image: 'Ảnh',
    alt: 'Mô tả ảnh',
    eyebrow: 'Nhãn nhỏ',
    title: 'Tiêu đề',
    slogan: 'Slogan / dòng vàng',
    description: 'Mô tả',
    category: 'Nhóm',
    hot: 'Sản phẩm Hot',
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
    video: 'Mã nhúng video (iframe Facebook/YouTube hoặc URL)',
    question: 'Câu hỏi',
    answer: 'Câu trả lời',
    testimonials: 'Đánh giá khách hàng',
    rating: 'Số sao (1–5)',
    location: 'Địa điểm',
    text: 'Nội dung đánh giá',
    image: 'Ảnh xác thực (screenshot Zalo/Facebook)'
  };

  const descriptions = {
    settings: 'Số điện thoại, Zalo và thông tin dùng chung trên toàn website.',
    hero: 'Mỗi mục là một trang ảnh trong hero. Có thể đổi ảnh, tiêu đề, slogan và mô tả.',
    services: 'Thêm/bỏ dịch vụ, đổi ảnh, nhóm lọc, mô tả và giá.',
    offers: 'Khu vực chương trình trải nghiệm, voucher, sự kiện hoặc khuyến mãi.',
    products: 'Danh mục sản phẩm hiển thị trên website. Có thể sửa tên, giá và nhóm.',
    locations: 'Danh sách chi nhánh. Bật “sắp cập nhật” nếu chưa có địa chỉ chính thức.',
    faqs: 'Những câu hỏi thường gặp dưới trang.',
    testimonials: 'Đánh giá thực từ khách hàng – hiển thị trong phần "Khách hàng nói gì".'
  };

  const templates = {
    hero: { image: 'assets/images/dms07238.jpg', alt: '', eyebrow: 'NHÃN HERO', title: 'Tiêu đề hero', slogan: 'Slogan nổi bật.', description: 'Mô tả ngắn cho ảnh hero.' },
    services: { category: 'tri-lieu', image: 'assets/images/phong-tri-lieu-2.jpg', alt: '', label: 'DỊCH VỤ', title: 'Tên dịch vụ mới', description: 'Mô tả ngắn.', detailTitle: 'Thông tin liệu trình', detail: 'Nội dung chi tiết.', priceLabel: '60 phút', price: 'Liên hệ báo giá', hot: false },
    offers: { image: '', tag: 'ƯU ĐÃI', title: 'Tên chương trình mới', price: 'Liên hệ', description: 'Mô tả chương trình.', service: 'Tên chương trình mới', cta: 'Đặt lịch tư vấn ↗', video: '' },
    products: { category: 'NHÓM SẢN PHẨM', image: '', title: 'Tên sản phẩm mới', price: 'Liên hệ báo giá', service: 'Tên sản phẩm mới', icon: 'tea', description: 'Mô tả ngắn.' },
    locations: { number: 'CƠ SỞ MỚI', name: 'Tên cơ sở', address: 'Địa chỉ sẽ cập nhật', map: '', branch: 'Tên cơ sở', future: true },
    faqs: { question: 'Câu hỏi mới?', answer: 'Câu trả lời.' },
    testimonials: { name: 'Tên khách hàng', location: 'Hạ Long', service: 'Tên dịch vụ', rating: 5, text: 'Nội dung đánh giá của khách hàng.', image: '' }
  };

  function setStatus(message) {
    status.textContent = message;
  }

  function fieldType(key, value) {
    if (typeof value === 'boolean') return 'checkbox';
    if (['description', 'detail', 'address', 'answer', 'alt', 'video'].includes(key)) return 'textarea';
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
      return `<div class="field"><label for="${id}">${label}</label><select id="${id}" data-path="${path.join('.')}"><option value="tri-lieu"${value === 'tri-lieu' ? ' selected' : ''}>Trị liệu căn gốc</option><option value="duong-sinh"${value === 'duong-sinh' ? ' selected' : ''}>Dưỡng sinh ngũ tạng</option><option value="tai-tao"${value === 'tai-tao' ? ' selected' : ''}>Tái tạo hình thể</option><option value="bo-sung"${value === 'bo-sung' ? ' selected' : ''}>Dịch vụ bổ sung</option><option value="sac-dep"${value === 'sac-dep' ? ' selected' : ''}>Chăm sóc sắc đẹp</option></select></div>`;
    }
    if (type === 'icon') {
      return `<div class="field"><label for="${id}">${label}</label><select id="${id}" data-path="${path.join('.')}"><option value="tea"${value === 'tea' ? ' selected' : ''}>Trà</option><option value="oil"${value === 'oil' ? ' selected' : ''}>Tinh dầu</option><option value="box"${value === 'box' ? ' selected' : ''}>Hộp/cao</option><option value="serum"${value === 'serum' ? ' selected' : ''}>Serum</option></select></div>`;
    }
    if (key === 'image') {
      const source = String(value || '');
      const canPreview = source.startsWith('assets/') || source.startsWith('data:image') || source.startsWith('http');
      return `<div class="field full image-field">
        <label for="${id}">${label}</label>
        ${canPreview ? `<img class="image-preview" src="${escapeHtml(source)}" alt="Xem trước ảnh">` : ''}
        <input id="${id}" data-path="${path.join('.')}" value="${escapeHtml(value)}">
        <div class="image-actions">
          <label class="image-picker">Chọn ảnh từ máy<input type="file" accept="image/*" data-image-picker="${path.join('.')}"></label>
          <small>Có thể nhập đường dẫn ảnh hoặc chọn ảnh từ máy. Nên dùng ảnh đã nén để file dữ liệu nhẹ.</small>
        </div>
      </div>`;
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
      renderArrayGroup('testimonials'),
      `<section class="group"><div class="group-head"><div><h2>Xem nhanh file dữ liệu</h2><p>Phần này để kiểm tra tổng thể trước khi tải file.</p></div></div><div class="items"><pre class="json-preview">${escapeHtml(JSON.stringify(siteData, null, 2))}</pre></div></section>`
    ].join('');
    pushPreview();
  }

  root.addEventListener('input', event => {
    const control = event.target.closest('[data-path]');
    if (!control) return;
    setByPath(control.dataset.path, control.value);
    const preview = document.querySelector('.json-preview');
    if (preview) preview.textContent = JSON.stringify(siteData, null, 2);
    pushPreview();
    setStatus('Đã cập nhật. Bấm “Lưu lên website” để hiển thị cho khách.');
  });

  root.addEventListener('change', event => {
    const picker = event.target.closest('[data-image-picker]');
    if (picker) {
      const file = picker.files?.[0];
      if (!file) return;
      if (cloud) {
        // Xóa ảnh cũ khỏi Storage (nếu có) trước khi tải ảnh mới lên.
        const oldUrl = getByPath(picker.dataset.imagePicker);
        if (oldUrl && typeof oldUrl === 'string' && oldUrl.startsWith('http')) {
          cloud.deleteImage(oldUrl);
        }
        // Nén trong trình duyệt rồi tải lên kho ảnh Supabase, lưu đường dẫn.
        setStatus(`Đang tải ảnh “${file.name}” lên…`);
        cloud.uploadImage(file, picker.dataset.imagePicker.split('.').pop())
          .then(res => {
            if (!res.ok) {
              setStatus(`Không tải được ảnh: ${res.error}. Hãy chắc bạn đã đăng nhập.`);
              return;
            }
            setByPath(picker.dataset.imagePicker, res.url);
            render();
            setStatus(`Đã tải ảnh lên. Bấm “Lưu lên website” để hiển thị cho khách.`);
          });
        return;
      }
      // Chưa kết nối Supabase: nhúng tạm ảnh vào dữ liệu (dùng cho bản dự phòng).
      if (file.size > 900 * 1024 && !confirm('Ảnh này khá lớn, có thể làm file dữ liệu nặng và website tải chậm. Bạn vẫn muốn dùng ảnh này?')) {
        picker.value = '';
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setByPath(picker.dataset.imagePicker, reader.result);
        render();
        setStatus(`Đã chọn ảnh “${file.name}”. Bấm “Tải file dự phòng” để lưu thay đổi.`);
      }, { once: true });
      reader.readAsDataURL(file);
      return;
    }
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

  if (saveCloudButton) {
    saveCloudButton.addEventListener('click', async () => {
      if (!cloud) {
        setStatus('Chưa kết nối Supabase. Hãy dán khóa vào supabase-config.js, hoặc dùng “Tải file dự phòng”.');
        return;
      }
      saveCloudButton.disabled = true;
      setStatus('Đang lưu lên website…');
      const res = await cloud.saveContent(siteData);
      saveCloudButton.disabled = false;
      if (res.ok) setStatus('Đã lưu. Website sẽ hiển thị nội dung mới trong khoảng 1 phút.');
      else setStatus(`Lưu chưa thành công: ${res.error}. Hãy chắc bạn đang đăng nhập rồi thử lại.`);
    });
  }

  downloadButton.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(siteData, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'site-data.json';
    link.click();
    URL.revokeObjectURL(url);
    setStatus('Đã tải bản dự phòng site-data.json về máy.');
  });

  if (uploadInput) {
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
  }

  async function loadEditorData() {
    // Ưu tiên nội dung đang chạy trên Supabase; nếu trống thì lấy file gốc để
    // lần lưu đầu tiên sẽ đưa toàn bộ nội dung hiện tại lên đám mây.
    if (cloud) {
      const online = await cloud.loadContent(4000);
      if (online && online.services) {
        siteData = online;
        render();
        setStatus('Đã tải nội dung đang chạy trên website. Bạn có thể chỉnh sửa.');
        return;
      }
    }
    try {
      const response = await fetch('assets/data/site-data.json', { cache: 'no-cache' });
      siteData = await response.json();
      render();
      setStatus(cloud
        ? 'Chưa có dữ liệu trên đám mây — đang dùng nội dung gốc. Bấm “Lưu lên website” để đưa lên lần đầu.'
        : 'Đã tải dữ liệu hiện tại. Bạn có thể bắt đầu chỉnh sửa.');
    } catch {
      setStatus('Không tải được dữ liệu hiện tại. Hãy nạp file site-data.json thủ công.');
    }
  }

  async function enterApp() {
    showApp();
    await loadEditorData();
  }

  async function init() {
    if (cloud) {
      // Đăng nhập bằng Supabase: nếu phiên còn hiệu lực thì vào thẳng.
      const user = await cloud.currentUser();
      if (user) { await enterApp(); return; }
      showLogin();
      return;
    }
    if (sessionStorage.getItem(SESSION_KEY) === '1') showApp();
    else showLogin();
    await loadEditorData();
  }

  init();
})();
