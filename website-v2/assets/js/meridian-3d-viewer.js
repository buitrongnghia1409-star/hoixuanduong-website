import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// Dữ liệu mặc định nhúng sẵn — dùng khi không truyền danh sách từ ngoài vào
// (hoặc khi Supabase lỗi). Nạp kèm ?v= của file này để tránh cache cũ.
const { ACUPOINTS, VIEW_ANGLES } = await import('./acupoints-data.js' + new URL(import.meta.url).search);
export { ACUPOINTS as DEFAULT_ACUPOINTS, VIEW_ANGLES };

const BODY_H = 1.7;          // model auto-scale về chiều cao này (mét)
const DOT_PX = 13;           // đường kính chấm huyệt trên màn hình (px) — không đổi khi zoom

// Bảng màu lấy từ style.css của website-v2
const C_CRIMSON = 0xff1744;  // --c-crimson : huyệt đang chọn
const C_GOLD    = 0xb8912f;  // --c-gold    : huyệt chưa chọn
const C_GOLD_LT = 0xcba646;  // --c-gold-light
const C_GREEN   = 0x2f4a26;  // --c-primary-green

export class Meridian3DViewer {
  /**
   * @param containerId  id của thẻ chứa khung 3D
   * @param modelPath    đường dẫn file .glb
   * @param acupoints    danh sách huyệt (từ Supabase); bỏ trống thì dùng bản nhúng sẵn
   */
  constructor(containerId, modelPath, acupoints) {
    this.container = document.getElementById(containerId);
    this.modelPath = modelPath;
    this.acupoints = acupoints?.length ? acupoints : ACUPOINTS;
    this.bodyMeshes = [];
    this.markers = [];
    this.selectedId = null;
    this.calibrateMode = false;

    this.orb = { theta: 0, phi: Math.PI / 2, radius: BODY_H * 1.15 };
    this.target = new THREE.Vector3(0, BODY_H * 0.52, 0);
    this.goal = { theta: 0, phi: Math.PI / 2, radius: BODY_H * 1.15, target: this.target.clone() };

    this._setupScene();
    this._setupInput();
    this._loadModel();
    this._animate();
  }

  // ---------------- scene ----------------
  _setupScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.01, 100);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);
    Object.assign(this.renderer.domElement.style,
      { display: 'block', width: '100%', height: '100%', touchAction: 'none' });

    // Nền để trong suốt → lộ video ao sen + lớp phủ kem của website phía sau
    this.scene.background = null;

    // Ánh sáng ấm, hợp tông kem–vàng kim của thương hiệu
    this.scene.add(new THREE.HemisphereLight(0xfffdf8, 0xdfe8d4, 1.05));
    const key = new THREE.DirectionalLight(0xfff4e0, 1.45); key.position.set(2.2, 3.6, 3.0);
    const rim = new THREE.DirectionalLight(0xcba646, 0.75); rim.position.set(-3, 2, -2.6);
    const bot = new THREE.DirectionalLight(0xeef4e7, 0.45); bot.position.set(0, -3, 2);
    this.scene.add(key, rim, bot);

    this._resize();
    new ResizeObserver(() => this._resize()).observe(this.container);
    addEventListener('resize', () => this._resize());
  }

  _resize() {
    const w = this.container.clientWidth || 1, h = this.container.clientHeight || 1;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  // ---------------- model ----------------
  _loadModel() {
    const loader = new GLTFLoader();
    // Model đã nén Draco → cần bộ giải mã kèm theo
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/');
    loader.setDRACOLoader(draco);

    loader.load(this.modelPath, (gltf) => {
      const root = gltf.scene;
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const s = BODY_H / (size.y || 1);
      root.scale.setScalar(s);
      root.position.set(-center.x * s, -box.min.y * s, -center.z * s);

      this.model = new THREE.Group();
      this.model.add(root);
      this.scene.add(this.model);

      this.bodySize = size.clone().multiplyScalar(s);
      root.traverse(o => {
        if (!o.isMesh) return;
        // Model Hi3D có pháp tuyến không nhất quán → tia bắn vào bị lọt qua mặt ngoài.
        // DoubleSide vừa sửa việc bám huyệt, vừa tránh thủng mặt khi xoay.
        for (const m of [].concat(o.material)) if (m) m.side = THREE.DoubleSide;
        this.bodyMeshes.push(o);
      });

      this._buildMarkers();
      this._snapToSkin();
      this.resetView(true);

      this._emit('modelLoaded', {
        meshes: this.bodyMeshes.length,
        size: this.bodySize.toArray().map(n => +n.toFixed(3))
      });
    },
    p => { if (p.total) this._emit('loadProgress', { percent: Math.round(p.loaded / p.total * 100) }); },
    err => this._emit('loadError', { message: String(err) }));
  }

  _toWorld([nx, ny, nz]) {
    return new THREE.Vector3(
      nx * (this.bodySize?.x || BODY_H * 0.45),
      ny * BODY_H,
      nz * (this.bodySize?.z || BODY_H * 0.2)
    );
  }
  _toNorm(v) {
    return [
      +(v.x / (this.bodySize.x || 1)).toFixed(3),
      +(v.y / BODY_H).toFixed(3),
      +(v.z / (this.bodySize.z || 1)).toFixed(3)
    ];
  }

  /** khung ngắm 4 góc (giống chỉ dấu huyệt trên website-v2) */
  static _reticleGeometry() {
    const s = 1.55, a = 0.62, p = [];
    const corner = (sx, sy) => {
      p.push(sx * s, sy * s, 0, sx * (s - a), sy * s, 0);
      p.push(sx * s, sy * s, 0, sx * s, sy * (s - a), 0);
    };
    corner(-1, 1); corner(1, 1); corner(1, -1); corner(-1, -1);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(p), 3));
    return g;
  }

  _buildMarkers() {
    const dot = new THREE.CircleGeometry(0.5, 24);
    const ring = new THREE.RingGeometry(0.78, 0.95, 40);
    const reticleGeo = Meridian3DViewer._reticleGeometry();

    this.acupoints.forEach((acu, i) => {
      const g = new THREE.Group();
      g.position.copy(this._toWorld(acu.pos));
      g.renderOrder = 999;

      const core = new THREE.Mesh(dot, new THREE.MeshBasicMaterial({
        color: C_GOLD, depthTest: false, transparent: true, opacity: 0.95
      }));
      const halo = new THREE.Mesh(ring, new THREE.MeshBasicMaterial({
        color: C_GOLD_LT, depthTest: false, transparent: true, opacity: 0.55, side: THREE.DoubleSide
      }));
      const reticle = new THREE.LineSegments(reticleGeo, new THREE.LineBasicMaterial({
        color: C_CRIMSON, depthTest: false, transparent: true, opacity: 0
      }));
      g.add(core, halo, reticle);
      g.userData = { index: i, id: acu.id, core, halo, reticle };

      this.model.add(g);
      this.markers.push(g);
    });
  }

  /**
   * Bám marker vào da bằng cách bắn tia từ ngoài vào theo hướng của acu.snap.
   * Cách này giữ nguyên 2 trục còn lại (vd 'front' giữ đúng x,y — chỉ dò z),
   * nên huyệt giữa trán vẫn nằm giữa trán thay vì bị kéo lệch sang bên.
   */
  _snapToSkin() {
    const AXES = {
      front:  new THREE.Vector3(0, 0, 1),
      back:   new THREE.Vector3(0, 0, -1),
      top:    new THREE.Vector3(0, 1, 0),
      bottom: new THREE.Vector3(0, -1, 0),
      side:   new THREE.Vector3(1, 0, 0)
    };
    const OFF = BODY_H * 0.004;   // nhô khỏi da ~7mm
    const FAR = BODY_H * 1.2;
    const ray = new THREE.Raycaster();

    // BẮT BUỘC: hàm này chạy trước khung hình đầu tiên nên ma trận thế giới của
    // mesh chưa được cập nhật — không có dòng này thì mọi tia bắn đều trượt.
    this.model.updateMatrixWorld(true);

    const apply = (k, point, axis) => {
      const local = point.clone().addScaledVector(axis, OFF);
      this.markers[k].position.copy(local);
      this.markers[k].userData.normal = axis.clone();
      this.acupoints[k].pos = this._toNorm(local);
    };

    // --- 1. front / back / side: bắn tia từ ngoài vào, giữ nguyên 2 trục kia ---
    const vertexJobs = [];
    this.acupoints.forEach((acu, k) => {
      const mode = acu.snap || 'front';
      const p = this.markers[k].position.clone();

      // Huyệt đã được hiệu chỉnh tay: GIỮ NGUYÊN toạ độ, chỉ dò pháp tuyến
      // bề mặt để camera 'auto' biết đứng vuông góc với da.
      if (acu.calibrated) {
        let axis = AXES[mode] || AXES.front;
        if (mode === 'side' && p.x < 0) axis = axis.clone().negate();
        const origin = this.model.localToWorld(p.clone().addScaledVector(axis, FAR));
        ray.set(origin, this.model.localToWorld(p.clone()).sub(origin).normalize());
        const hit = ray.intersectObjects(this.bodyMeshes, true)[0];
        this.markers[k].userData.surfaceNormal = (hit && hit.face)
          ? hit.face.normal.clone()
              .applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld))
              .normalize()
          : axis.clone();
        return;
      }

      if (mode === 'top' || mode === 'bottom') { vertexJobs.push({ k, mode, p, r: acu.snapR ?? 0.045 }); return; }

      let axis = AXES[mode] || AXES.front;
      if (mode === 'side' && p.x < 0) axis = axis.clone().negate();

      const origin = this.model.localToWorld(p.clone().addScaledVector(axis, FAR));
      ray.set(origin, this.model.localToWorld(p.clone()).sub(origin).normalize());
      const hit = ray.intersectObjects(this.bodyMeshes, true)[0];
      if (!hit) return;
      apply(k, this.model.worldToLocal(hit.point.clone()), axis);

      // lưu pháp tuyến bề mặt để camera có thể căn vuông góc với da (view: 'auto')
      if (hit.face) {
        this.markers[k].userData.surfaceNormal = hit.face.normal.clone()
          .applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld))
          .normalize();
      }
    });

    // --- 2. top / bottom: quét đỉnh cao nhất (hoặc thấp nhất) quanh trục dọc ---
    // Bắn tia dọc dễ lọt qua lỗ nhỏ ở chỏm đầu / gan bàn chân, nên dùng cách quét đỉnh.
    if (vertexJobs.length) {
      const best = vertexJobs.map(j => ({ y: j.mode === 'top' ? -Infinity : Infinity, p: null }));
      const v = new THREE.Vector3();

      for (const mesh of this.bodyMeshes) {
        const pos = mesh.geometry?.attributes?.position;
        if (!pos) continue;
        mesh.updateWorldMatrix(true, false);
        const mat = mesh.matrixWorld;
        const step = pos.count > 400000 ? 2 : 1;

        for (let i = 0; i < pos.count; i += step) {
          v.fromBufferAttribute(pos, i).applyMatrix4(mat);
          this.model.worldToLocal(v);
          for (let j = 0; j < vertexJobs.length; j++) {
            const job = vertexJobs[j];
            if ((v.x - job.p.x) ** 2 + (v.z - job.p.z) ** 2 > job.r * job.r) continue;
            if (job.mode === 'top' ? v.y > best[j].y : v.y < best[j].y) {
              best[j] = { y: v.y, p: v.clone() };
            }
          }
        }
      }
      vertexJobs.forEach((job, j) => {
        if (best[j].p) apply(job.k, best[j].p, AXES[job.mode]);
      });
    }
  }

  // ---------------- input ----------------
  _setupInput() {
    const el = this.renderer.domElement;
    const ptrs = new Map();
    let pinch = 0, moved = 0;

    el.addEventListener('pointerdown', e => {
      el.setPointerCapture(e.pointerId);
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved = 0;
    });

    el.addEventListener('pointermove', e => {
      const prev = ptrs.get(e.pointerId);
      if (!prev) return;
      const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved += Math.abs(dx) + Math.abs(dy);

      if (ptrs.size === 1) {
        this.goal.theta -= dx * 0.008;
        this.goal.phi = clamp(this.goal.phi - dy * 0.006, 0.12, Math.PI - 0.12);
      } else if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) this.goal.radius = clamp(this.goal.radius * (pinch / d), BODY_H * 0.16, BODY_H * 2.4);
        pinch = d;
      }
    });

    const end = e => {
      ptrs.delete(e.pointerId);
      if (ptrs.size < 2) pinch = 0;
      if (moved < 6) this._pick(e);
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', e => ptrs.delete(e.pointerId));

    el.addEventListener('wheel', e => {
      e.preventDefault();
      this.goal.radius = clamp(this.goal.radius * (e.deltaY > 0 ? 1.12 : 0.89), BODY_H * 0.16, BODY_H * 2.4);
    }, { passive: false });
  }

  _pick(e) {
    if (!this.model) return;
    const r = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);

    if (!this.calibrateMode) {
      const hit = ray.intersectObjects(this.markers, true)[0];
      if (hit) {
        let o = hit.object;
        while (o && !o.userData?.id) o = o.parent;
        if (o) return this.focus(o.userData.id);
      }
      return;
    }

    const hit = ray.intersectObjects(this.bodyMeshes, true)[0];
    if (!hit) return;
    const local = this.model.worldToLocal(hit.point.clone());
    this._emit('calibratePick', { pos: this._toNorm(local), id: this.selectedId });
  }

  // ---------------- API ----------------
  focus(id) {
    const i = this.acupoints.findIndex(a => a.id === id);
    if (i < 0) return;
    const acu = this.acupoints[i];
    this.selectedId = id;

    const n = this.markers[i].userData.surfaceNormal;
    let theta, phi;
    if (acu.view === 'auto' && n) {
      // camera đứng vuông góc với mặt da tại huyệt → luôn nhìn thẳng vào huyệt
      theta = Math.atan2(n.x, n.z);
      phi = Math.acos(clamp(n.y, -1, 1));
    } else {
      [theta, phi] = VIEW_ANGLES[acu.view] || VIEW_ANGLES.front;
      theta += acu.pos[0] * 0.9;                  // chếch nhẹ về bên có huyệt
    }
    this.goal.target.copy(this.markers[i].position);
    this.goal.theta = theta;
    this.goal.phi = phi;
    this.goal.radius = BODY_H * (acu.zoom || 0.4);

    this.markers.forEach((m, k) => {
      const on = k === i;
      m.userData.core.material.color.set(on ? C_CRIMSON : C_GOLD);
      m.userData.halo.material.color.set(on ? C_CRIMSON : C_GOLD_LT);
      m.userData.halo.material.opacity = on ? 0.95 : 0.5;
      m.userData.reticle.material.opacity = on ? 1 : 0;
    });

    this._emit('acupointSelected', { acupoint: acu });
  }

  resetView(silent = false) {
    this.selectedId = null;
    this.goal.target.set(0, BODY_H * 0.52, 0);
    this.goal.radius = BODY_H * 1.15;
    this.goal.theta = 0;
    this.goal.phi = Math.PI / 2;
    this.markers.forEach(m => {
      m.userData.core.material.color.set(C_GOLD);
      m.userData.halo.material.color.set(C_GOLD_LT);
      m.userData.halo.material.opacity = 0.5;
      m.userData.reticle.material.opacity = 0;
    });
    if (!silent) this._emit('viewReset', {});
  }

  setCalibrateMode(on) { this.calibrateMode = on; }

  /** Thay toàn bộ danh sách huyệt rồi dựng lại chấm trên mô hình */
  setAcupoints(list) {
    this.acupoints = list || [];
    this.markers.forEach(m => {
      this.model.remove(m);
      m.children.forEach(c => c.material?.dispose());
    });
    this.markers = [];
    if (!this.model) return;
    this._buildMarkers();
    this._snapToSkin();
    const keep = this.acupoints.some(a => a.id === this.selectedId);
    if (keep) this.focus(this.selectedId); else this.resetView(true);
  }

  /** Thêm 1 huyệt mới, mặc định đặt ở giữa ngực để người dùng bấm chọn lại vị trí */
  addAcupoint(acu) {
    const item = {
      id: acu.id, code: acu.code || '', name: acu.name || 'Huyệt mới',
      channel: acu.channel || '', pos: acu.pos || [0, 0.72, 0.38],
      snap: acu.snap || 'front', view: acu.view || 'front', zoom: acu.zoom ?? 0.42,
      indication: acu.indication || '', technique: acu.technique || '', caution: acu.caution || '',
      calibrated: true
    };
    this.setAcupoints([...this.acupoints, item]);
    return item;
  }

  removeAcupoint(id) {
    if (this.selectedId === id) this.selectedId = null;
    this.setAcupoints(this.acupoints.filter(a => a.id !== id));
  }

  getAcupoint(id) { return this.acupoints.find(a => a.id === id); }

  updatePos(id, pos) {
    const i = this.acupoints.findIndex(a => a.id === id);
    if (i < 0) return;
    this.acupoints[i].pos = pos;
    this.markers[i].position.copy(this._toWorld(pos));
  }

  exportPositions() {
    return JSON.stringify(
      this.acupoints.map(a => ({ id: a.id, code: a.code, pos: a.pos, snap: a.snap, view: a.view, zoom: a.zoom })),
      null, 2
    );
  }

  // ---------------- loop ----------------
  _animate = () => {
    requestAnimationFrame(this._animate);
    this._step();
    this.renderer.render(this.scene, this.camera);
  };

  /** cập nhật camera + marker; tách riêng để test được khi rAF không chạy */
  _step(k = 0.12) {
    this.orb.theta += (this.goal.theta - this.orb.theta) * k;
    this.orb.phi += (this.goal.phi - this.orb.phi) * k;
    this.orb.radius += (this.goal.radius - this.orb.radius) * k;
    this.target.lerp(this.goal.target, k);

    const { theta, phi, radius } = this.orb;
    this.camera.position.set(
      this.target.x + radius * Math.sin(phi) * Math.sin(theta),
      this.target.y + radius * Math.cos(phi),
      this.target.z + radius * Math.sin(phi) * Math.cos(theta)
    );
    this.camera.lookAt(this.target);
    this.camera.updateMatrixWorld();

    // marker luôn quay về camera & giữ nguyên kích thước trên màn hình
    const h = this.container.clientHeight || 1;
    const vFOV = this.camera.fov * Math.PI / 180;
    const t = performance.now() * 0.0035;

    this.markers.forEach((m, i) => {
      m.quaternion.copy(this.camera.quaternion);
      const dist = this.camera.position.distanceTo(m.getWorldPosition(_v));
      const worldPerPx = 2 * Math.tan(vFOV / 2) * dist / h;
      const on = this.acupoints[i].id === this.selectedId;
      m.scale.setScalar(worldPerPx * DOT_PX * (on ? 1.5 : 1));
      m.userData.halo.scale.setScalar(1 + (on ? Math.sin(t) * 0.18 + 0.25 : 0));
      if (on) {
        m.userData.reticle.rotation.z = t * 0.25;
        m.userData.reticle.scale.setScalar(1 + Math.sin(t * 1.3) * 0.06);
      }
    });
  }

  _emit(name, detail) { dispatchEvent(new CustomEvent(`meridian:${name}`, { detail })); }
}

const _v = new THREE.Vector3();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
