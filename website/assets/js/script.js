/* ===== Hồi Xuân Đường — site script ===== */
(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var navLinks = document.getElementById("navLinks");
  var siteHeader = document.querySelector(".site-header");
  function syncMobileNavOffset() {
    if (siteHeader && navLinks) {
      navLinks.style.top = siteHeader.getBoundingClientRect().bottom + "px";
    }
  }
  if (menuToggle && navLinks) {
    syncMobileNavOffset();
    window.addEventListener("resize", syncMobileNavOffset);
    menuToggle.addEventListener("click", function () {
      syncMobileNavOffset();
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
      });
    });
  }

  /* ---------- Scroll reveal with stagger (replays both scroll directions) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealTimers = new WeakMap();
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var pending = revealTimers.get(entry.target);
          if (pending) clearTimeout(pending);

          if (entry.isIntersecting) {
            var siblings = Array.prototype.slice.call(entry.target.parentNode.querySelectorAll(".reveal"));
            var index = siblings.indexOf(entry.target);
            var timer = setTimeout(function () {
              entry.target.classList.add("in");
            }, Math.min(index * 70, 480));
            revealTimers.set(entry.target, timer);
          } else {
            // left the viewport (either direction) - reset so it replays on re-entry
            entry.target.classList.remove("in");
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------- Toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- Cart ---------- */
  var CART_KEY = "hxd_cart_v1";
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  function formatVND(n) {
    return n.toLocaleString("vi-VN") + "đ";
  }

  var cart = loadCart();

  var cartCountEl = document.getElementById("cartCount");
  var cartItemsEl = document.getElementById("cartItems");
  var cartTotalEl = document.getElementById("cartTotal");
  var cartDrawer = document.getElementById("cartDrawer");
  var cartOverlay = document.getElementById("cartOverlay");

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  function renderCart() {
    if (!cartItemsEl) return;
    var count = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    if (cartCountEl) cartCountEl.textContent = count;

    if (cart.length === 0) {
      cartItemsEl.innerHTML =
        '<div class="cart-empty">Giỏ hàng của bạn đang trống.<br>Hãy chọn vài sản phẩm thảo dược nhé!</div>';
      if (cartTotalEl) cartTotalEl.textContent = formatVND(0);
      return;
    }

    var total = 0;
    var html = "";
    cart.forEach(function (item, idx) {
      total += item.price * item.qty;
      html +=
        '<div class="cart-item" data-idx="' + idx + '">' +
        '<div class="thumb"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3c-3 3-5 6-5 9a5 5 0 0010 0c0-3-2-6-5-9z"/></svg></div>' +
        '<div class="cart-item-info">' +
        "<strong>" + item.name + "</strong>" +
        "<span>" + formatVND(item.price) + "</span>" +
        '<div class="cart-qty">' +
        '<button type="button" data-action="dec" aria-label="Giảm số lượng">−</button>' +
        '<span>' + item.qty + '</span>' +
        '<button type="button" data-action="inc" aria-label="Tăng số lượng">+</button>' +
        '</div></div>' +
        '<button type="button" class="cart-remove" data-action="remove">Xóa</button>' +
        "</div>";
    });
    cartItemsEl.innerHTML = html;
    if (cartTotalEl) cartTotalEl.textContent = formatVND(total);
  }

  function addToCart(name, price) {
    var found = cart.find(function (i) { return i.name === name; });
    if (found) {
      found.qty += 1;
    } else {
      cart.push({ name: name, price: price, qty: 1 });
    }
    saveCart(cart);
    renderCart();
    showToast('Đã thêm "' + name + '" vào giỏ hàng');
  }

  document.querySelectorAll(".add-cart-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = btn.getAttribute("data-name");
      var price = parseInt(btn.getAttribute("data-price"), 10) || 0;
      addToCart(name, price);
      openCart();
    });
  });

  if (cartItemsEl) {
    cartItemsEl.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-action]");
      if (!btn) return;
      var itemEl = e.target.closest(".cart-item");
      var idx = parseInt(itemEl.getAttribute("data-idx"), 10);
      var action = btn.getAttribute("data-action");
      if (action === "inc") cart[idx].qty += 1;
      if (action === "dec") {
        cart[idx].qty -= 1;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
      }
      if (action === "remove") cart.splice(idx, 1);
      saveCart(cart);
      renderCart();
    });
  }

  var cartBtn = document.getElementById("cartBtn");
  if (cartBtn) cartBtn.addEventListener("click", openCart);
  var cartCloseBtn = document.getElementById("cartClose");
  if (cartCloseBtn) cartCloseBtn.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

  var checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      if (cart.length === 0) {
        showToast("Giỏ hàng đang trống");
        return;
      }
      var lines = cart.map(function (i) {
        return "- " + i.name + " x" + i.qty + " = " + formatVND(i.price * i.qty);
      });
      var total = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
      var body =
        "Xin chào Hồi Xuân Đường, tôi muốn đặt mua:%0D%0A" +
        encodeURIComponent(lines.join("\n")) +
        "%0D%0A%0D%0ATổng cộng: " + encodeURIComponent(formatVND(total)) +
        "%0D%0A%0D%0AHọ tên: %0D%0ASố điện thoại: %0D%0AĐịa chỉ giao hàng: ";
      var mailto =
        "mailto:contact@hoixuanduong.vn?subject=" +
        encodeURIComponent("Đặt hàng từ website Hồi Xuân Đường") +
        "&body=" + body;
      window.location.href = mailto;
    });
  }

  var clearCartBtn = document.getElementById("clearCartBtn");
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", function () {
      cart = [];
      saveCart(cart);
      renderCart();
    });
  }

  renderCart();

  /* ---------- Product filter ---------- */
  var chips = document.querySelectorAll(".filter-chip");
  var productCards = document.querySelectorAll(".product-card");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      var cat = chip.getAttribute("data-filter");
      productCards.forEach(function (card) {
        var show = cat === "all" || card.getAttribute("data-cat") === cat;
        card.style.display = show ? "" : "none";
      });
    });
  });

  /* ---------- Booking form -> mailto ---------- */
  var bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(bookingForm);
      var name = data.get("name") || "";
      var phone = data.get("phone") || "";
      var service = data.get("service") || "";
      var date = data.get("date") || "";
      var note = data.get("note") || "";
      var body =
        "Họ tên: " + name + "%0D%0A" +
        "Số điện thoại: " + phone + "%0D%0A" +
        "Dịch vụ quan tâm: " + service + "%0D%0A" +
        "Ngày mong muốn: " + date + "%0D%0A" +
        "Ghi chú: " + note;
      var mailto =
        "mailto:contact@hoixuanduong.vn?subject=" +
        encodeURIComponent("Yêu cầu đặt lịch - " + name) +
        "&body=" + body;
      window.location.href = mailto;
      showToast("Đang mở ứng dụng email để gửi yêu cầu đặt lịch…");
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Meridian interactive diagram ---------- */
  var meridianFrame = document.getElementById("meridianFrame");
  var meridianScan = document.getElementById("meridianScan");
  if (meridianFrame && meridianScan) {
    var meridianPoints = Array.prototype.slice.call(
      meridianFrame.querySelectorAll(".meridian-point")
    );

    // position each point from its data-top / data-left (keeps HTML free of inline styles)
    meridianPoints.forEach(function (pt) {
      var top = pt.getAttribute("data-top");
      var left = pt.getAttribute("data-left");
      if (top) pt.style.top = top + "%";
      if (left) pt.style.left = left + "%";
    });

    var HOVER_RADIUS_PERCENT = 8; // % of frame size around cursor to activate points (desktop hover fine-control)
    var REFERENCE_RATIO = 0.42; // fixed reference line at 42% of viewport height
    var SCAN_THRESHOLD = 5; // % tolerance around the reference line for scroll-driven activation

    function activateNearbyPoints(clientX, clientY) {
      var rect = meridianFrame.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var xPercent = ((clientX - rect.left) / rect.width) * 100;
      var yPercent = ((clientY - rect.top) / rect.height) * 100;
      meridianPoints.forEach(function (pt) {
        var ptLeft = parseFloat(pt.getAttribute("data-left"));
        var ptTop = parseFloat(pt.getAttribute("data-top"));
        var distance = Math.sqrt(Math.pow(xPercent - ptLeft, 2) + Math.pow(yPercent - ptTop, 2));
        pt.classList.toggle("active", distance <= HOVER_RADIUS_PERCENT);
      });
    }

    // --- Scroll-driven: works identically on mobile (touch) and desktop.
    // A fixed reference line sits at 42% of the viewport height; whichever
    // acupoint the image scrolls past that line lights up automatically.
    function updateScrollScan() {
      var rect = meridianFrame.getBoundingClientRect();
      var refY = window.innerHeight * REFERENCE_RATIO;

      if (rect.bottom < 0 || rect.top > window.innerHeight || rect.height === 0) {
        meridianFrame.classList.remove("scanning");
        return;
      }

      var relPercent = ((refY - rect.top) / rect.height) * 100;

      if (relPercent < 0 || relPercent > 100) {
        meridianFrame.classList.remove("scanning");
        meridianPoints.forEach(function (pt) {
          pt.classList.remove("active");
        });
        return;
      }

      meridianFrame.classList.add("scanning");
      meridianScan.style.top = relPercent + "%";

      meridianPoints.forEach(function (pt) {
        var ptTop = parseFloat(pt.getAttribute("data-top"));
        pt.classList.toggle("active", Math.abs(ptTop - relPercent) <= SCAN_THRESHOLD);
      });
    }

    window.addEventListener("scroll", updateScrollScan, { passive: true });
    window.addEventListener("resize", updateScrollScan);
    updateScrollScan();

    // --- Mouse hover: bonus fine-control override on desktop only.
    // Reverts back to the scroll-driven state once the pointer leaves.
    meridianFrame.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      activateNearbyPoints(e.clientX, e.clientY);
    });

    meridianFrame.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "touch") return;
      updateScrollScan();
    });
  }

  /* ---------- 3D tilt on hover (service & product cards) ---------- */
  function enableTilt(selector) {
    document.querySelectorAll(selector).forEach(function (card) {
      var rect = null;
      card.addEventListener("pointermove", function (e) {
        if (e.pointerType === "touch") return;
        if (!rect) rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var rotateY = (x - 0.5) * 14;
        var rotateX = (0.5 - y) * 10;
        card.style.transform =
          "perspective(700px) rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg) translateY(-6px)";
      });
      card.addEventListener("pointerleave", function (e) {
        if (e.pointerType === "touch") return;
        card.style.transform = "";
        rect = null;
      });
    });
  }
  enableTilt(".svc-item");
  enableTilt(".product-card");

  /* ---------- Scroll progress bar + hero parallax ---------- */
  var scrollProgressEl = document.getElementById("scrollProgress");
  var heroSection = document.querySelector(".cover-hero");
  var bannerImg = document.querySelector(".cover-banner img");

  function updateScrollFx() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;

    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollProgressEl) {
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgressEl.style.width = pct + "%";
    }

    if (bannerImg && heroSection) {
      var heroRect = heroSection.getBoundingClientRect();
      if (heroRect.bottom > 0 && heroRect.top < window.innerHeight) {
        var shift = Math.min(scrollTop * 0.1, 26);
        bannerImg.style.transform = "scale(1.12) translateY(" + shift + "px)";
      }
    }
  }

  window.addEventListener("scroll", updateScrollFx, { passive: true });
  window.addEventListener("resize", updateScrollFx);
  updateScrollFx();
})();
