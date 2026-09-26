/* Bộ nối Supabase dùng chung cho website và trang admin Hồi Xuân Đường.
   Thiết kế "hỏng thì im lặng": nếu chưa cấu hình khóa, hoặc Supabase lỗi/ngủ,
   mọi hàm trả về null/false và bên gọi tự dùng dữ liệu dự phòng. Website thật
   không bao giờ phụ thuộc cứng vào Supabase. */
(function () {
  'use strict';

  var cfg = window.HXD_SUPABASE || {};
  var configured =
    typeof cfg.url === 'string' && /^https:\/\/.+\.supabase\.co/.test(cfg.url) &&
    typeof cfg.anonKey === 'string' && cfg.anonKey && cfg.anonKey.indexOf('DAN_') !== 0;

  var client = null;
  function getClient() {
    if (!configured) return null;
    if (client) return client;
    if (!window.supabase || !window.supabase.createClient) return null;
    client = window.supabase.createClient(cfg.url, cfg.anonKey);
    return client;
  }

  // Đọc toàn bộ nội dung site (1 dòng, id = 1) — có timeout để không treo web.
  function loadContent(timeoutMs) {
    var sb = getClient();
    if (!sb) return Promise.resolve(null);
    // Dùng limit(1) trả về mảng (rỗng nếu chưa có dữ liệu) — tránh lỗi 406
    // mà .single()/.maybeSingle() sinh ra khi bảng chưa có dòng nào.
    var query = sb.from(cfg.table || 'site_content')
      .select('data').eq('id', 1).limit(1);
    var timeout = new Promise(function (resolve) {
      setTimeout(function () { resolve(null); }, timeoutMs || 3500);
    });
    return Promise.race([
      Promise.resolve(query).then(function (res) {
        var row = res && res.data && res.data[0];
        return row && row.data ? row.data : null;
      }).catch(function () { return null; }),
      timeout
    ]);
  }

  // Ghi toàn bộ nội dung (admin, cần đã đăng nhập). Trả về {ok, error}.
  function saveContent(data) {
    var sb = getClient();
    if (!sb) return Promise.resolve({ ok: false, error: 'Chưa cấu hình Supabase.' });
    return sb.from(cfg.table || 'site_content')
      .upsert({ id: 1, data: data, updated_at: new Date().toISOString() })
      .then(function (res) {
        if (res.error) return { ok: false, error: res.error.message };
        return { ok: true };
      })
      .catch(function (e) { return { ok: false, error: String(e && e.message || e) }; });
  }

  // Nén ảnh trong trình duyệt trước khi tải lên: co cạnh dài về tối đa maxPx,
  // xuất JPEG chất lượng ~0.82. Ảnh 5MB điện thoại → thường còn ~150-300KB.
  function compressImage(file, maxPx) {
    maxPx = maxPx || 1400;
    return new Promise(function (resolve, reject) {
      if (!/^image\//.test(file.type)) { resolve(file); return; }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        var w = img.naturalWidth, h = img.naturalHeight;
        var scale = Math.min(1, maxPx / Math.max(w, h));
        var cw = Math.round(w * scale), ch = Math.round(h * scale);
        var canvas = document.createElement('canvas');
        canvas.width = cw; canvas.height = ch;
        canvas.getContext('2d').drawImage(img, 0, 0, cw, ch);
        canvas.toBlob(function (blob) {
          if (!blob) { reject(new Error('Không nén được ảnh.')); return; }
          resolve(blob);
        }, 'image/jpeg', 0.82);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Không đọc được ảnh.')); };
      img.src = url;
    });
  }

  function slugify(name) {
    return String(name || 'anh').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '').slice(0, 40) || 'anh';
  }

  // Xóa ảnh cũ khỏi Storage nếu URL thuộc cùng bucket (không chặn luồng chính).
  function deleteImage(url) {
    var sb = getClient();
    if (!sb || !url || typeof url !== 'string') return;
    var bucket = cfg.bucket || 'site-images';
    var marker = '/object/public/' + bucket + '/';
    var idx = url.indexOf(marker);
    if (idx === -1) return;
    var path = url.slice(idx + marker.length);
    if (!path) return;
    sb.storage.from(bucket).remove([path]).catch(function () {});
  }

  // Nén + tải ảnh lên Storage, trả về {ok, url, error}. Cần đã đăng nhập.
  function uploadImage(file, hint) {
    var sb = getClient();
    if (!sb) return Promise.resolve({ ok: false, error: 'Chưa cấu hình Supabase.' });
    return compressImage(file).then(function (blob) {
      var path = slugify(hint || file.name) + '-' + Date.now() + '.jpg';
      return sb.storage.from(cfg.bucket || 'site-images')
        .upload(path, blob, { contentType: 'image/jpeg', upsert: true })
        .then(function (res) {
          if (res.error) return { ok: false, error: res.error.message };
          var pub = sb.storage.from(cfg.bucket || 'site-images').getPublicUrl(path);
          return { ok: true, url: pub.data.publicUrl };
        });
    }).catch(function (e) { return { ok: false, error: String(e && e.message || e) }; });
  }

  function signIn(email, password) {
    var sb = getClient();
    if (!sb) return Promise.resolve({ ok: false, error: 'Chưa cấu hình Supabase.' });
    return sb.auth.signInWithPassword({ email: email, password: password })
      .then(function (res) {
        if (res.error) return { ok: false, error: res.error.message };
        return { ok: true };
      });
  }
  function signOut() {
    var sb = getClient();
    return sb ? sb.auth.signOut() : Promise.resolve();
  }
  function currentUser() {
    var sb = getClient();
    if (!sb) return Promise.resolve(null);
    return sb.auth.getUser().then(function (res) {
      return res && res.data ? res.data.user : null;
    }).catch(function () { return null; });
  }

  window.HXD = {
    configured: configured,
    loadContent: loadContent,
    saveContent: saveContent,
    uploadImage: uploadImage,
    deleteImage: deleteImage,
    signIn: signIn,
    signOut: signOut,
    currentUser: currentUser
  };
})();
