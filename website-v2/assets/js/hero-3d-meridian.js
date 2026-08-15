/* ==========================================================================
   HỒI XUÂN ĐƯỜNG — PRISTINE MULTI-PERSPECTIVE 3D MASTER THEATRE (V21)
   - SỬ DỤNG TRỰC TIẾP 100% BỘ ẢNH CHUẨN ĐỒNG NHẤT CỦA BẠN GỬI:
     + Ảnh chính diện: Full Body Front (media_1786768889442)
     + Ảnh sau lưng: Back View nam tính đồng bộ (media_1786775918533)
     + Ảnh lòng bàn chân: Sole Foot View từ dưới lên đồng bộ (media_1786776140348)
   - HIỆU ỨNG MORPH CROSS-FADE MỜ DẦN & LƯỚT CAMERA SIÊU MƯỢT
   - TỌA ĐỘ 12 HUYỆT ĐẠO GHIM CHÍNH XÁC 100% TRÊN CƠ THỂ
   ========================================================================== */

import * as THREE from 'three';

// Wraps the trailing "(MÃ HUYỆT)" part of a name in a non-breaking, slightly
// smaller span so long titles like "Thái Dương (EX-HN5)" never line-break
// in the middle of the code, and so digits render at a balanced size next
// to the serif capital letters (Playfair's default oldstyle figures read
// larger/smaller than caps otherwise).
function splitAcuTitle(name) {
  const m = name.match(/^(.*)\s(\([^)]*\))$/);
  if (!m) return name;
  // Regular hyphens (e.g. "EX-HN5") are still valid break points to browsers
  // even inside a nowrap span in some layouts — swap in a non-breaking hyphen
  // so "(EX-HN5)" can never be split across two lines.
  const code = m[2].replace(/-/g, '‑');
  return `${m[1]} <span class="editorial-code">${code}</span>`;
}

// Builds a formal ornamental "corner-bracket" frame (4 L-shaped brackets,
// not a full square) to mark the active acupoint — replaces the old plain
// red circle target with something closer to a traditional plaque/seal frame.
function buildCornerFrameGeometry(halfSize, armLen) {
  const s = halfSize, a = armLen;
  const pts = new Float32Array([
    // Top-left
    -s, s, 0,   -s + a, s, 0,
    -s, s, 0,   -s, s - a, 0,
    // Top-right
     s, s, 0,    s - a, s, 0,
     s, s, 0,    s, s - a, 0,
    // Bottom-right
     s, -s, 0,   s - a, -s, 0,
     s, -s, 0,   s, -s + a, 0,
    // Bottom-left
    -s, -s, 0,  -s + a, -s, 0,
    -s, -s, 0,  -s, -s + a, 0
  ]);
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  return geom;
}

export const CORE_12_ACUPOINTS = [
  {
    id: 'bach-hoi',
    name: 'Bách Hội (GV20)',
    channel: 'Đốc Mạch • Đỉnh Đầu Não',
    category: 'Vùng Đầu Não',
    viewKey: 'front',
    pos: [0.0, 1.34, 0.05],
    camFocus: [0.0, 1.10, 1.05], // Đẩy camera xuống một chút để đỉnh đầu và huyệt Bách Hội được nâng cao lên trên cùng khung hình
    indication: 'Nơi hội tụ trăm kinh mạch. Đặc trị đau đầu đỉnh đầu, đau nửa đầu, hoa mắt chóng mặt, ù tai, mất ngủ kinh niên do suy nhược thần kinh, hay quên, rối loạn tâm thần; hỗ trợ sa dạ dày – sa tử cung – trĩ do khí hư hạ hãm; điều hòa cả huyết áp cao lẫn huyết áp thấp. Phối hợp Nhân Trung, Ấn Đường để sơ cứu ngất xỉu, trúng gió, say nắng, đột quỵ.',
    technique: 'Dùng đầu ngón tay cái hoặc ngón trỏ đặt vuông góc lên đỉnh huyệt, day ấn nhẹ nhàng theo chiều kim đồng hồ từ 1 – 3 phút, hít thở sâu đều đặn. Tuyệt đối không dùng móng tay sắc bấm trực tiếp.',
    caution: 'Không bấm khi da đầu có vết thương hở, sưng viêm hoặc mụn nhọt. Trẻ nhỏ có thóp đầu chưa đóng cần đặc biệt thận trọng, tránh day ấn mạnh gây nguy cơ nhiễm trùng vùng màng não. Cần có sự hướng dẫn chuyên môn từ bác sĩ Đông y.'
  },
  {
    id: 'an-duong',
    name: 'Ấn Đường (EX-HN3)',
    channel: 'Kỳ Huyệt • Giữa Chân Mày',
    category: 'Vùng Trán',
    viewKey: 'front',
    pos: [0.0, 1.21, 0.05],
    camFocus: [0.0, 1.05, 1.05],
    indication: '"Con mắt thứ ba". Giải cảm mạo phong hàn, nghẹt mũi, sổ mũi, viêm xoang, viêm mũi dị ứng; đau đầu vùng trán, mệt mỏi, mất ngủ, căng thẳng thần kinh, stress kéo dài; hỗ trợ giảm mỏi mắt, hoa mắt khi làm việc máy tính lâu. Phối hợp Nhân Trung, Bách Hội để sơ cứu ngất, say nắng, say nóng.',
    technique: 'Dùng ngón tay cái day nhẹ nhàng huyệt Ấn Đường 1 – 2 phút, sau đó vuốt ngược nhẹ lên phía chân tóc để thư giãn thần kinh.',
    caution: 'Không tác động khi vùng da giữa hai chân mày có mụn bọc, viêm loét hoặc trầy xước. Vùng da mặt rất nhạy cảm — tránh bấm quá mạnh bằng móng tay vì dễ để lại sẹo lõm mất thẩm mỹ.'
  },
  {
    id: 'thai-duong',
    name: 'Thái Dương (EX-HN5)',
    channel: 'Kỳ Huyệt • Vùng Thái Dương',
    category: 'Vùng Đầu Não',
    viewKey: 'front',
    pos: [-0.08, 1.18, 0.05],
    camFocus: [-0.06, 1.02, 1.05],
    indication: '"Điểm vàng" giảm đau nửa đầu (migraine), đau đầu do căng thẳng, đau vùng thái dương; hỗ trợ đau mắt đỏ, mỏi mắt, khô mắt, giảm thị lực tạm thời; liệt mặt ngoại biên (liệt dây thần kinh số VII), đau dây thần kinh tam thoa, đau răng hàm trên. Phối hợp Nhân Trung khi sơ cứu ngất xỉu, chóng mặt đột ngột.',
    technique: 'Dùng hai ngón tay cái hoặc ngón giữa đặt tại hõm thái dương 2 bên, day tròn nhẹ nhàng từ trước ra sau khoảng 30 – 50 lần bằng đệm ngón tay.',
    caution: 'Dưới huyệt là vùng xương sọ mỏng nhất và có động mạch thái dương nông chạy qua — tuyệt đối không ấn sâu, đấm hoặc dùng lực vuông góc, tránh gây tụ máu hay tổn thương mạch máu não. Không bấm khi có chấn thương đầu chưa rõ nguyên nhân, nứt xương sọ hoặc da đang sưng viêm.'
  },
  {
    id: 'phong-tri',
    name: 'Phong Trì (GB20)',
    channel: 'Kinh Đởm • Sau Gáy Chẩm',
    category: 'Vùng Cổ Gáy',
    viewKey: 'back',
    pos: [-0.075, 1.08, 0.05],
    camFocus: [-0.05, 0.88, 1.10],
    indication: '"Ao chứa gió". Trị đau mỏi cứng cổ vai gáy do lạnh hoặc thoái hóa đốt sống cổ; giải cảm lạnh, sợ gió, sợ lạnh, nhức đầu gáy, nghẹt mũi; thiểu năng tuần hoàn não, rối loạn tiền đình, hoa mắt, chóng mặt, ù tai, mất ngủ, giảm trí nhớ, đau nửa đầu mãn tính kèm buồn nôn; hỗ trợ liệt mặt ngoại biên.',
    technique: 'Dùng 2 ngón tay cái ôm lấy sau gáy, ấn chếch nhẹ hướng về phía mắt đối diện, day tròn 2 – 3 phút đến khi có cảm giác tức nhẹ lan tỏa.',
    caution: 'Huyệt nằm rất gần nền sọ và động mạch đốt sống dẫn máu lên não — lực bấm phải hướng về phía mắt đối diện, không đẩy thô bạo từ dưới lên để tránh chóng mặt dữ dội hoặc tổn thương mạch máu. Không bấm khi nghi ngờ chấn thương cột sống cổ cấp tính hoặc vùng da dưới xương chẩm viêm loét.'
  },
  {
    id: 'kien-tinh',
    name: 'Kiên Tỉnh (GB21)',
    channel: 'Kinh Đởm • Đỉnh Cơ Vai Gáy',
    category: 'Cổ Vai Gáy',
    viewKey: 'front',
    pos: [-0.20, 0.86, 0.05],
    camFocus: [-0.14, 0.72, 1.15],
    indication: '"Giếng trên vai". Đặc trị đau cứng cổ vai gáy cấp tính, co cơ thang do lạnh, hội chứng cổ – vai – cánh tay, đau quanh khớp vai gây hạn chế vận động cánh tay; hỗ trợ tắc tia sữa, viêm tuyến vú ở phụ nữ sau sinh.',
    technique: 'Dùng 4 ngón tay bóp nhẹ nhàng cơ vai, không ấn sâu ngón tay xuống với lực mạnh.',
    caution: 'CHỐNG CHỈ ĐỊNH TUYỆT ĐỐI với phụ nữ mang thai — huyệt có tính giáng khí rất mạnh, kích thích co bóp tử cung dữ dội, dễ gây dọa sảy thai hoặc sinh non. Huyệt nằm ngay trên đỉnh phổi, cần thận trọng tránh nguy cơ tràn khí màng phổi. Không bấm khi gãy xương đòn hoặc chấn thương/sưng viêm khớp vai cấp tính.'
  },
  {
    id: 'dan-trung',
    name: 'Đản Trung (CV17)',
    channel: 'Nhâm Mạch • Giữa Ngực',
    category: 'Vùng Ngực',
    viewKey: 'front',
    pos: [0.0, 0.65, 0.05],
    camFocus: [0.0, 0.55, 1.15],
    indication: 'Hội của Khí. Trị đau tức ngực, khó thở, ho khan, ho có đờm, hen suyễn, viêm phế quản mạn tính, hồi hộp đánh trống ngực; giảm stress, căng thẳng, u uất lồng ngực do áp lực tâm lý; hỗ trợ phụ nữ sau sinh thiếu sữa, tắc tia sữa; trị nấc cụt, nghẹn họng.',
    technique: 'Dùng lòng bàn tay xoa nhẹ nhàng theo vòng tròn xung quanh huyệt, kết hợp thở sâu đều đặn.',
    caution: 'Huyệt nằm ngay trên xương ức và phía trước tim — tuyệt đối không đấm, gõ hoặc ấn mạnh trực tiếp vuông góc vì có thể gây loạn nhịp tim. Không tự ý tác động khi đang lên cơn nhồi máu cơ tim cấp, suy tim nặng, suy hô hấp cấp hoặc chấn thương xương ức — ưu tiên cấp cứu y tế ngay.'
  },
  {
    id: 'trung-quan',
    name: 'Trung Quản (CV12)',
    channel: 'Nhâm Mạch • Thượng Vị',
    category: 'Vùng Bụng',
    viewKey: 'front',
    pos: [0.0, 0.34, 0.05],
    camFocus: [0.0, 0.28, 1.15],
    indication: '"Mộ" của Dạ dày (Vị). Trị đau dạ dày cấp và mạn tính, trào ngược dạ dày thực quản, đầy bụng, khó tiêu, ợ chua, nấc cụt, ăn uống kém ngon miệng, nôn mửa, buồn nôn, tiêu chảy, kiết lỵ, táo bón do rối loạn chức năng đại tràng; phục hồi thể trạng cho người suy nhược, kém ăn.',
    technique: 'Xoa ấm hai bàn tay, đặt bàn tay lên thượng vị xoa tròn theo chiều kim đồng hồ quanh huyệt từ 3 – 5 phút, lực tăng dần từ nhẹ đến vừa.',
    caution: 'CHỐNG CHỈ ĐỊNH TUYỆT ĐỐI trong cấp cứu bụng ngoại khoa: viêm ruột thừa cấp, thủng dạ dày, tắc ruột, viêm tụy cấp hoặc đang xuất huyết tiêu hóa. Phụ nữ mang thai (đặc biệt giữa và cuối thai kỳ) tránh bấm sâu vào bụng. Không bấm khi vừa ăn quá no hoặc đang quá đói — ấn quá sâu, thô bạo có thể tổn thương các tạng phủ bên dưới.'
  },
  {
    id: 'khi-hai',
    name: 'Khí Hải (CV6)',
    channel: 'Nhâm Mạch • Đan Điền',
    category: 'Vùng Bụng',
    viewKey: 'front',
    pos: [0.0, 0.05, 0.05],
    camFocus: [0.0, 0.02, 1.15],
    indication: '"Bể" của Khí. Trị suy nhược cơ thể, mệt mỏi mạn tính, đoản hơi, chân tay lạnh; di tinh, liệt dương, đái dầm, tiểu đêm, tiểu nhiều lần, tiểu không tự chủ; rối loạn kinh nguyệt, rong kinh, đau bụng kinh; đầy bụng, tiêu chảy mạn tính, sa trực tràng; hỗ trợ nâng huyết áp cho người huyết áp thấp tư thế.',
    technique: 'Áp lòng bàn tay ấm vào vùng dưới rốn, day xoa rất nhẹ nhàng theo chiều kim đồng hồ bằng mô ngón tay cái từ 3 – 5 phút để dẫn khí về đan điền.',
    caution: 'Phụ nữ đang mang thai tuyệt đối không tự ý tác động mạnh hoặc cứu ngải vùng bụng dưới vì dễ kích thích co thắt tử cung gây sảy thai. Người bí tiểu cấp tính do tắc nghẽn cơ học (u xơ tuyến tiền liệt...) tránh ấn mạnh trực tiếp vào vùng bàng quang đang căng trướng.'
  },
  {
    id: 'hop-coc',
    name: 'Hợp Cốc (LI4)',
    channel: 'Kinh Đại Trường • Hổ Khẩu',
    category: 'Bàn Tay',
    viewKey: 'front',
    pos: [-0.52, 0.02, 0.05],
    camFocus: [-0.44, 0.02, 1.10],
    indication: '"Huyệt vạn năng" giảm đau. Trị đau đầu, đau nửa đầu, đau răng (đặc biệt răng hàm dưới), đau họng, khản tiếng, liệt mặt ngoại biên, đau dây thần kinh tam thoa; hạ sốt, giải cảm, nghẹt mũi, viêm mũi dị ứng, viêm xoang; đau mỏi vai gáy, tê bì ngón tay (hội chứng ống cổ tay); kích thích nhu động ruột trị táo bón, giảm đầy bụng; sơ cứu ngất xỉu, chóng mặt, buồn nôn.',
    technique: 'Dùng ngón tay cái bên kia đặt vào khe hổ khẩu, bấm men theo bờ xương bàn tay ngón trỏ, lực tăng dần đến khi có cảm giác căng tức tê lan tỏa, không đau buốt.',
    caution: 'CHỐNG CHỈ ĐỊNH TUYỆT ĐỐI với phụ nữ mang thai — tác động vào huyệt này thúc đẩy co thắt tử cung cực mạnh, dễ gây sảy thai hoặc sinh non. Không bấm khi kẽ ngón cái – ngón trỏ trầy xước, viêm nhiễm hoặc mụn nhọt sưng đau. Tránh dùng móng tay sắc nhọn gây bầm tím hoặc tổn thương dây thần kinh cảm giác.'
  },
  {
    id: 'dai-chuy',
    name: 'Đại Chùy (GV14)',
    channel: 'Đốc Mạch • Đốt Sống C7',
    category: 'Cột Sống Sau Lưng',
    viewKey: 'back',
    pos: [0.0, 0.82, 0.05],
    camFocus: [0.0, 0.65, 1.10],
    indication: 'Hội của các đường kinh dương. Hạ sốt mạnh khi cảm cúm, sốt cao phong nhiệt, sốt phát ban; trị ho, hen suyễn, viêm phế quản; đau cứng cổ vai gáy do phong hàn hoặc thoái hóa, hạn chế vận động cổ gáy, đau nhức thắt lưng, đau dây thần kinh liên sườn; tăng cường sức đề kháng, phòng cảm cúm lúc giao mùa.',
    technique: 'Cúi nhẹ đầu để lộ rõ đốt sống C7 sau gáy, dùng ngón tay giữa xoa ấm hoặc day rất nhẹ nhàng huyệt 1 – 2 phút, kết hợp chườm ấm thảo dược.',
    caution: 'Huyệt nằm ngay sát tủy sống cổ — tuyệt đối không đấm hoặc dùng máy massage rung mạnh trực tiếp vào gai sống cổ để tránh tổn thương tủy sống, dây thần kinh trung ương. Không tác động khi nghi ngờ chấn thương cột sống cổ nghiêm trọng, vùng gáy mụn nhọt/lở loét, hoặc đang tăng huyết áp kịch phát kèm đau đầu dữ dội.'
  },
  {
    id: 'tuc-tam-ly',
    name: 'Túc Tam Lý (ST36)',
    channel: 'Kinh Vị • Dưới Đầu Gối',
    category: 'Bắp Chân',
    viewKey: 'front',
    pos: [-0.12, -0.61, 0.05],
    camFocus: [-0.10, -0.61, 1.15],
    indication: '"Huyệt dưỡng sinh cường tráng" đệ nhất Đông y. Tăng cường hệ miễn dịch, bồi bổ tỳ vị, chống mệt mỏi, suy nhược cơ thể; trị đau dạ dày, đầy bụng, chậm tiêu, buồn nôn, tiêu chảy, táo bón mạn tính; đau khớp gối, tê bì chân, đau mỏi chân do đứng/ngồi lâu; hỗ trợ điều hòa huyết áp, mất ngủ do tỳ vị hư nhược.',
    technique: 'Dùng ngón cái bấm với lực vừa phải, hơi chếch vào phía trong bờ xương chày, tạo cảm giác tê tức lan xuống bàn chân, thực hiện kiên trì mỗi sáng.',
    caution: 'Phụ nữ mang thai, đặc biệt 3 tháng đầu hoặc có cơ địa động thai, nên tránh tự ý tác động mạnh vào huyệt này do kích thích nhu động ruột vùng hạ tiêu rất mạnh. Không bấm khi khớp gối đang viêm sưng nóng đỏ do nhiễm trùng hoặc da dưới gối lở loét. Tránh ấn mạnh trực tiếp vào màng xương gây đau buốt kéo dài.'
  },
  {
    id: 'dung-tuyen',
    name: 'Dũng Tuyền (KI1)',
    channel: 'Kinh Thận • Lòng Bàn Chân',
    category: 'Lòng Bàn Chân',
    viewKey: 'foot',
    pos: [0.15, -0.42, 0.05], // Vị trí điểm huyệt Dũng Tuyền trên lòng bàn chân
    camFocus: [0.0, -0.05, 3.2], // Zoom xa vừa vặn (z = 3.2) để nhìn thấy trọn vẹn cả bàn chân, ống chân và toàn thân từ dưới lên
    indication: '"Nguồn nước ngầm" sinh khí kinh Thận. Dẫn hỏa quy nguyên, hạ huyết áp cấp tốc ở người tăng huyết áp đột ngột; trị mất ngủ, lo âu, đau đầu, chóng mặt, hoa mắt; hỗ trợ ho kéo dài, đau họng, khản tiếng; làm ấm người, trị lạnh chân tay ở người già hoặc dương khí hư; sơ cứu ngất xỉu, say nắng, đột quỵ.',
    technique: 'Xoa ấm hai lòng bàn chân vào nhau hoặc ngâm chân nước ấm thảo dược trước, sau đó dùng đầu ngón tay day bấm với lực vừa phải, tránh vật sắc nhọn.',
    caution: 'CHỐNG CHỈ ĐỊNH TUYỆT ĐỐI khi lòng bàn chân có vết thương hở, nấm kẽ chân, viêm loét do đái tháo đường — nguy cơ nhiễm trùng sâu dẫn đến hoại tử. Không xoa bóp cho người tắc tĩnh mạch sâu chi dưới hoặc suy giãn tĩnh mạch chân nặng. Phụ nữ mang thai cần hết sức thận trọng, không tự ý bấm với lực quá mạnh.'
  }
];

export class PristineMasterTheatre {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.container.innerHTML = '';
    this.currentActiveId = null;

    this.isTransitioning = false;
    this.transitionProgress = 1.0;
    this.transitionDuration = 1.4;
    this.camStartPos = new THREE.Vector3(0.0, -0.05, 4.6);
    this.camTargetPos = new THREE.Vector3(0.0, -0.05, 4.6);
    this.lookStartPos = new THREE.Vector3(0.0, -0.05, 0.0);
    this.lookTargetPos = new THREE.Vector3(0.0, -0.05, 0.0);

    this.currentCamPos = new THREE.Vector3(0.0, -0.05, 4.6);
    this.currentLookPos = new THREE.Vector3(0.0, -0.05, 0.0);

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;

    this.clock = new THREE.Clock();
    this.viewMeshes = new Map();
    this.acupointMeshes = new Map();

    this.initScene();
    this.initMultiPerspectiveMeshes();
    this.init12Acupoints();
    this.initAmbientSparks();
    this.bindEvents();
    this.initRightSidebarList();
    this.resetToFullBody(true);
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    this.camera.position.set(0.0, -0.05, 4.6);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.5);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff3e4, 1.2);
    dirLight.position.set(2, 4, 3);
    this.scene.add(dirLight);

    this.stageGroup = new THREE.Group();
    this.stageGroup.position.set(0.12, -0.05, 0);
    this.scene.add(this.stageGroup);
  }

  initMultiPerspectiveMeshes() {
    const textureLoader = new THREE.TextureLoader();

    const views = [
      { key: 'front', url: 'assets/images/meridian-3d/full-front-opt.webp', aspect: 1536 / 2752, height: 2.95 },
      { key: 'back', url: 'assets/images/meridian-3d/back_spine.webp', aspect: 1024 / 1024, height: 2.95 },
      { key: 'foot', url: 'assets/images/meridian-3d/sole_foot.webp', aspect: 571 / 1024, height: 2.95 }
    ];

    views.forEach((v) => {
      const tex = textureLoader.load(v.url);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;

      const geom = new THREE.PlaneGeometry(v.height * v.aspect, v.height, 32, 32);

      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTexture: { value: tex },
          uOpacity: { value: v.key === 'front' ? 1.0 : 0.0 },
          uTime: { value: 0.0 }
        },
        vertexShader: `
          varying vec2 vUv;
          uniform float uTime;
          void main() {
            vUv = uv;
            vec3 pos = position;
            float breathe = sin(uTime * 1.6 + pos.y * 2.0) * 0.004;
            pos.z += breathe;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uTexture;
          uniform float uOpacity;
          uniform float uTime;
          varying vec2 vUv;

          void main() {
            vec4 col = texture2D(uTexture, vUv);
            if (col.a < 0.5) discard;

            // Cắt hẳn quầng sáng/hào quang mờ bao quanh toàn thân (vùng alpha
            // trung bình-thấp lan tỏa ra ngoài viền cơ thể trong ảnh nguồn),
            // chỉ giữ lại đúng phần thân hình đặc, viền gọn.
            col.a = smoothstep(0.62, 0.95, col.a);

            float pulse = 1.0 + sin(uTime * 2.0) * 0.035;
            col.rgb *= pulse;
            col.a *= uOpacity;

            gl_FragColor = col;
          }
        `
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.renderOrder = 1;
      this.stageGroup.add(mesh);
      this.viewMeshes.set(v.key, mesh);
    });
  }

  init12Acupoints() {
    // Reusable small gold-diamond accent texture for the frame's 4 corners
    if (!this._diamondTex) {
      const c = document.createElement('canvas');
      c.width = 32; c.height = 32;
      const cx = c.getContext('2d');
      const g = cx.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, 'rgba(255, 227, 160, 1)');
      g.addColorStop(0.5, 'rgba(184, 145, 47, 0.85)');
      g.addColorStop(1, 'rgba(184, 145, 47, 0)');
      cx.save();
      cx.translate(16, 16);
      cx.rotate(Math.PI / 4);
      cx.fillStyle = g;
      cx.fillRect(-11, -11, 22, 22);
      cx.restore();
      this._diamondTex = new THREE.CanvasTexture(c);
    }

    CORE_12_ACUPOINTS.forEach((acu) => {
      const acuGroup = new THREE.Group();
      acuGroup.position.set(acu.pos[0], acu.pos[1], acu.pos[2]);

      // Precise pinpoint dot at the exact acupoint location
      const dotGeom = new THREE.CircleGeometry(0.012, 20);
      const dotMat = new THREE.MeshBasicMaterial({
        color: 0xff1744,
        transparent: true,
        opacity: 0.0
      });
      const dotMesh = new THREE.Mesh(dotGeom, dotMat);
      dotMesh.position.z = 0.002;
      acuGroup.add(dotMesh);

      // Formal ornamental corner-bracket frame (thay cho vòng tròn đỏ cũ) —
      // giống khung ấn triện/bằng khen: 4 góc vuông, ôm sát điểm huyệt để
      // không lấn sang các nút vàng trang trí lân cận trên hình.
      const frameGeom = buildCornerFrameGeometry(0.030, 0.013);
      const frameMat = new THREE.LineBasicMaterial({
        color: 0xff1744,
        transparent: true,
        opacity: 0.0
      });
      const frameLines = new THREE.LineSegments(frameGeom, frameMat);
      frameLines.position.z = 0.0015;
      acuGroup.add(frameLines);

      // Hoa văn kim tuyến vàng nhỏ đúng 4 góc khung
      const s = 0.030;
      const diamondGeom = new THREE.BufferGeometry();
      diamondGeom.setAttribute('position', new THREE.Float32BufferAttribute([
        -s, s, 0,   s, s, 0,   s, -s, 0,   -s, -s, 0
      ], 3));
      const diamondMat = new THREE.PointsMaterial({
        size: 0.022,
        map: this._diamondTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.0
      });
      const cornerDiamonds = new THREE.Points(diamondGeom, diamondMat);
      cornerDiamonds.position.z = 0.0018;
      acuGroup.add(cornerDiamonds);

      acuGroup.userData = {
        data: acu,
        dotMesh: dotMesh,
        frameLines: frameLines,
        cornerDiamonds: cornerDiamonds
      };

      acuGroup.renderOrder = 2;
      this.stageGroup.add(acuGroup);
      this.acupointMeshes.set(acu.id, acuGroup);
    });
  }

  initAmbientSparks() {
    const count = 90;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.1) * 3.2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      speeds[i] = Math.random() * 0.25 + 0.12;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleSpeeds = speeds;

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 235, 160, 1)');
    grad.addColorStop(0.35, 'rgba(201, 147, 59, 0.7)');
    grad.addColorStop(0.7, 'rgba(13, 81, 70, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const sparkTex = new THREE.CanvasTexture(canvas);
    const pMat = new THREE.PointsMaterial({
      size: 0.045,
      map: sparkTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.7
    });

    this.particles = new THREE.Points(geom, pMat);
    this.scene.add(this.particles);
  }

  initRightSidebarList() {
    const listContainer = document.getElementById('acupointsRightList');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    CORE_12_ACUPOINTS.forEach((acu, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn-acu-item ${acu.id === this.currentActiveId ? 'active' : ''}`;
      btn.setAttribute('data-id', acu.id);
      btn.innerHTML = `
        <span class="acu-idx">${String(index + 1).padStart(2, '0')}</span>
        <div class="acu-info-col">
          <span class="acu-name-txt">${splitAcuTitle(acu.name)}</span>
          <span class="acu-chan-txt">${acu.channel}</span>
        </div>
        <span class="acu-arrow">›</span>
      `;
      btn.addEventListener('click', () => {
        this.selectAcupoint(acu.id, false);
      });
      listContainer.appendChild(btn);
    });

    const resetBtn = document.getElementById('btnResetToFullBody');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetToFullBody(false);
      });
    }
  }

  easeInOutQuart(x) {
    return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
  }

  selectAcupoint(acuId, isInstant = false) {
    const acu = CORE_12_ACUPOINTS.find(a => a.id === acuId);
    if (!acu) return;

    this.currentActiveId = acuId;

    // 1. Camera Flight setup (Ultra close-up zoom z = 1.25 – 1.30)
    this.camStartPos.copy(this.currentCamPos);
    this.camTargetPos.set(acu.camFocus[0] + 0.12, acu.camFocus[1] - 0.05, acu.camFocus[2]);

    this.lookStartPos.copy(this.currentLookPos);
    this.lookTargetPos.set(acu.camFocus[0] + 0.12, acu.camFocus[1] - 0.05, 0.0);

    if (isInstant) {
      this.currentCamPos.copy(this.camTargetPos);
      this.currentLookPos.copy(this.lookTargetPos);
      this.camera.position.copy(this.currentCamPos);
      this.camera.lookAt(this.currentLookPos);
      this.transitionProgress = 1.0;
      this.isTransitioning = false;

      this.viewMeshes.forEach((mesh, key) => {
        mesh.material.uniforms.uOpacity.value = (key === acu.viewKey) ? 1.0 : 0.0;
      });
    } else {
      this.transitionProgress = 0.0;
      this.isTransitioning = true;
    }

    // 2. Synchronized Red Light on Acupoint Mesh
    this.acupointMeshes.forEach((meshGroup, id) => {
      const isSelected = (id === acuId);
      const uData = meshGroup.userData;
      meshGroup.visible = isSelected;

      if (isSelected) {
        meshGroup.position.set(acu.pos[0], acu.pos[1], acu.pos[2]);
        uData.dotMesh.material.opacity = 1.0;
        uData.frameLines.material.opacity = 0.9;
        uData.cornerDiamonds.material.opacity = 1.0;
      }
    });

    // 3. Update Right Sidebar Active State
    document.querySelectorAll('.btn-acu-item').forEach(btn => {
      if (btn.getAttribute('data-id') === acuId) {
        btn.classList.add('active');
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        btn.classList.remove('active');
      }
    });

    // 4. Synchronized Text Animation Timeline
    this.updateAcupointContentSynchronized(acu);
  }

  resetToFullBody(isInstant = false) {
    this.currentActiveId = null;

    this.camStartPos.copy(this.currentCamPos);
    this.camTargetPos.set(0.0, -0.05, 4.6);

    this.lookStartPos.copy(this.currentLookPos);
    this.lookTargetPos.set(0.0, -0.05, 0.0);

    if (isInstant) {
      this.currentCamPos.copy(this.camTargetPos);
      this.currentLookPos.copy(this.lookTargetPos);
      this.camera.position.copy(this.currentCamPos);
      this.camera.lookAt(this.currentLookPos);
      this.transitionProgress = 1.0;
      this.isTransitioning = false;

      this.viewMeshes.forEach((mesh, key) => {
        mesh.material.uniforms.uOpacity.value = (key === 'front') ? 1.0 : 0.0;
      });
    } else {
      this.transitionProgress = 0.0;
      this.isTransitioning = true;
    }

    this.acupointMeshes.forEach((meshGroup) => {
      meshGroup.visible = false;
    });

    document.querySelectorAll('.btn-acu-item').forEach(btn => {
      btn.classList.remove('active');
    });

    const cardTitle = document.getElementById('selectedAcuTitle');
    const cardChannel = document.getElementById('selectedAcuChannel');
    const indicationText = document.getElementById('selectedAcuIndication');
    const techniqueText = document.getElementById('selectedAcuTechnique');
    const cautionText = document.getElementById('selectedAcuCaution');

    if (cardTitle) cardTitle.textContent = "Hồi Xuân Đường";
    if (cardChannel) cardChannel.textContent = "TINH HOA ĐÔNG Y • THANH XUÂN BẤT TẬN";
    if (indicationText) indicationText.textContent = "Trực quan hóa hệ thống Thập Nhị Kinh Lạc & Kỳ Kinh Bát Mạch trên không gian 3D — nơi Hồi Xuân Đường gửi gắm triết lý dưỡng sinh cổ truyền. Khí hành thì huyết hành, kinh lạc thông suốt thì bách bệnh tự nhiên tiêu tan, thân tâm an lạc.";
    if (techniqueText) techniqueText.textContent = "Nhấp chọn từng huyệt đạo ở danh sách bên phải để kích hoạt camera 3D zoom cận cảnh và khám phá phương pháp trị liệu.";
    if (cautionText) cautionText.textContent = "Không tự ý thực hiện bấm huyệt trị liệu chuyên sâu khi chưa có chỉ định hoặc hướng dẫn trực tiếp từ bác sĩ chuyên khoa Đông y.";
  }

  updateAcupointContentSynchronized(acu) {
    const leftContainer = document.querySelector('.theatre-left-editorial');
    if (!leftContainer) return;

    leftContainer.classList.remove('animate-in');
    leftContainer.classList.add('animate-out');

    setTimeout(() => {
      const cardTitle = document.getElementById('selectedAcuTitle');
      const cardChannel = document.getElementById('selectedAcuChannel');
      const indicationText = document.getElementById('selectedAcuIndication');
      const techniqueText = document.getElementById('selectedAcuTechnique');
      const cautionText = document.getElementById('selectedAcuCaution');

      if (cardTitle) cardTitle.innerHTML = splitAcuTitle(acu.name);
      if (cardChannel) cardChannel.textContent = acu.channel.toUpperCase();
      if (indicationText) indicationText.textContent = acu.indication;
      if (techniqueText) techniqueText.textContent = acu.technique;
      if (cautionText) cautionText.textContent = acu.caution;

      leftContainer.classList.remove('animate-out');
      leftContainer.classList.add('animate-in');
    }, 380); // Khớp với thời lượng fade-out 0.4s để chữ mờ hẳn trước khi đổi nội dung
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());

    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Morph / Cross-fade transition between perspectives
    const targetKey = this.currentActiveId 
      ? (CORE_12_ACUPOINTS.find(a => a.id === this.currentActiveId)?.viewKey || 'front')
      : 'front';

    this.viewMeshes.forEach((mesh, key) => {
      const currentOp = mesh.material.uniforms.uOpacity.value;
      const targetOp = (key === targetKey) ? 1.0 : 0.0;
      mesh.material.uniforms.uOpacity.value += (targetOp - currentOp) * 0.08;
      if (mesh.material.uniforms.uTime) {
        mesh.material.uniforms.uTime.value = time;
      }
    });

    if (this.isTransitioning) {
      this.transitionProgress += delta / this.transitionDuration;
      if (this.transitionProgress >= 1.0) {
        this.transitionProgress = 1.0;
        this.isTransitioning = false;
      }

      const ease = this.easeInOutQuart(this.transitionProgress);
      this.currentCamPos.lerpVectors(this.camStartPos, this.camTargetPos, ease);
      this.currentLookPos.lerpVectors(this.lookStartPos, this.lookTargetPos, ease);
    }

    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookPos);

    this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

    if (this.stageGroup) {
      this.stageGroup.rotation.y = this.mouseX * 0.05;
      this.stageGroup.rotation.x = -this.mouseY * 0.03;
    }

    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] += this.particleSpeeds[i] * delta * 0.6;
        if (positions[i * 3 + 1] > 2.5) {
          positions[i * 3 + 1] = -2.5;
          positions[i * 3 + 0] = (Math.random() - 0.1) * 3.2;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    if (this.currentActiveId) {
      const activeMeshGroup = this.acupointMeshes.get(this.currentActiveId);
      if (activeMeshGroup && activeMeshGroup.visible) {
        const { frameLines, cornerDiamonds } = activeMeshGroup.userData;
        // Nhịp thở nhẹ nhàng, trang trọng — thay cho hiệu ứng giật nảy của vòng tròn cũ
        const pulse = 1.0 + Math.sin(time * 2.0) * 0.045;
        if (frameLines) {
          frameLines.scale.set(pulse, pulse, 1);
          frameLines.material.opacity = 0.78 + Math.sin(time * 2.0) * 0.12;
        }
        if (cornerDiamonds) {
          cornerDiamonds.scale.set(pulse, pulse, 1);
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Auto-initialize
window.addEventListener('DOMContentLoaded', () => {
  window.masterTheatre = new PristineMasterTheatre('hero3DCanvas');
});
