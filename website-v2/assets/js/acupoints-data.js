/**
 * 12 HUYỆT ĐẠO — dữ liệu lấy nguyên từ website-v2 (CORE_12_ACUPOINTS)
 *
 * pos  : toạ độ CHUẨN HOÁ theo cơ thể, không phụ thuộc scale model
 *        y: 0 = gan bàn chân → 1 = đỉnh đầu
 *        x: 0 = trục giữa, dương = phía bên phải người xem
 *        z: dương = phía trước (bụng/mặt), âm = phía sau (lưng/gáy)
 * snap : cách bám vào da — 'near' (đỉnh gần nhất) | 'top' (điểm cao nhất) | 'bottom' (thấp nhất)
 * view : góc camera khi chọn huyệt — 'front' | 'back' | 'top' | 'bottom' | 'left' | 'right'
 * zoom : khoảng cách camera (theo chiều cao cơ thể); nhỏ = cận hơn
 */

export const ACUPOINTS = [
  {
    id: 'bach-hoi', code: 'GV20', name: 'Bách Hội', channel: 'Đốc Mạch • Đỉnh Đầu Não',
    pos: [-0.002, 1.004, 0.068], snap: 'top', view: 'top', zoom: 0.42, calibrated: true,
    indication: 'Nơi hội tụ trăm kinh mạch. Đặc trị đau đầu đỉnh đầu, đau nửa đầu, hoa mắt chóng mặt, ù tai, mất ngủ kinh niên do suy nhược thần kinh, hay quên, rối loạn tâm thần; hỗ trợ sa dạ dày – sa tử cung – trĩ do khí hư hạ hãm; điều hòa cả huyết áp cao lẫn huyết áp thấp. Phối hợp Nhân Trung, Ấn Đường để sơ cứu ngất xỉu, trúng gió, say nắng, đột quỵ.',
    technique: 'Dùng đầu ngón tay cái hoặc ngón trỏ đặt vuông góc lên đỉnh huyệt, day ấn nhẹ nhàng theo chiều kim đồng hồ từ 1 – 3 phút, hít thở sâu đều đặn. Tuyệt đối không dùng móng tay sắc bấm trực tiếp.',
    caution: 'Không bấm khi da đầu có vết thương hở, sưng viêm hoặc mụn nhọt. Trẻ nhỏ có thóp đầu chưa đóng cần đặc biệt thận trọng, tránh day ấn mạnh gây nguy cơ nhiễm trùng vùng màng não. Cần có sự hướng dẫn chuyên môn từ bác sĩ Đông y.'
  },
  {
    id: 'an-duong', code: 'EX-HN3', name: 'Ấn Đường', channel: 'Kỳ Huyệt • Giữa Chân Mày',
    pos: [0.0, 0.947, 0.459], snap: 'front', view: 'front', zoom: 0.34, calibrated: true,
    indication: '"Con mắt thứ ba". Giải cảm mạo phong hàn, nghẹt mũi, sổ mũi, viêm xoang, viêm mũi dị ứng; đau đầu vùng trán, mệt mỏi, mất ngủ, căng thẳng thần kinh, stress kéo dài; hỗ trợ giảm mỏi mắt, hoa mắt khi làm việc máy tính lâu. Phối hợp Nhân Trung, Bách Hội để sơ cứu ngất, say nắng, say nóng.',
    technique: 'Dùng ngón tay cái day nhẹ nhàng huyệt Ấn Đường 1 – 2 phút, sau đó vuốt ngược nhẹ lên phía chân tóc để thư giãn thần kinh.',
    caution: 'Không tác động khi vùng da giữa hai chân mày có mụn bọc, viêm loét hoặc trầy xước. Vùng da mặt rất nhạy cảm — tránh bấm quá mạnh bằng móng tay vì dễ để lại sẹo lõm mất thẩm mỹ.'
  },
  {
    id: 'thai-duong', code: 'EX-HN5', name: 'Thái Dương', channel: 'Kỳ Huyệt • Vùng Thái Dương',
    // hõm thái dương: ngang tầm đuôi lông mày, PHÍA TRƯỚC vành tai (z lớn hơn tai)
    pos: [0.091, 0.940, 0.245], snap: 'side', view: 'right', zoom: 0.30, calibrated: true,
    indication: '"Điểm vàng" giảm đau nửa đầu (migraine), đau đầu do căng thẳng, đau vùng thái dương; hỗ trợ đau mắt đỏ, mỏi mắt, khô mắt, giảm thị lực tạm thời; liệt mặt ngoại biên (liệt dây thần kinh số VII), đau dây thần kinh tam thoa, đau răng hàm trên. Phối hợp Nhân Trung khi sơ cứu ngất xỉu, chóng mặt đột ngột.',
    technique: 'Dùng hai ngón tay cái hoặc ngón giữa đặt tại hõm thái dương 2 bên, day tròn nhẹ nhàng từ trước ra sau khoảng 30 – 50 lần bằng đệm ngón tay.',
    caution: 'Dưới huyệt là vùng xương sọ mỏng nhất và có động mạch thái dương nông chạy qua — tuyệt đối không ấn sâu, đấm hoặc dùng lực vuông góc, tránh gây tụ máu hay tổn thương mạch máu não. Không bấm khi có chấn thương đầu chưa rõ nguyên nhân, nứt xương sọ hoặc da đang sưng viêm.'
  },
  {
    id: 'phong-tri', code: 'GB20', name: 'Phong Trì', channel: 'Kinh Đởm • Sau Gáy Chẩm',
    pos: [0.035, 0.905, -0.233], snap: 'back', view: 'back', zoom: 0.38, calibrated: true,
    indication: '"Ao chứa gió". Trị đau mỏi cứng cổ vai gáy do lạnh hoặc thoái hóa đốt sống cổ; giải cảm lạnh, sợ gió, sợ lạnh, nhức đầu gáy, nghẹt mũi; thiểu năng tuần hoàn não, rối loạn tiền đình, hoa mắt, chóng mặt, ù tai, mất ngủ, giảm trí nhớ, đau nửa đầu mãn tính kèm buồn nôn; hỗ trợ liệt mặt ngoại biên.',
    technique: 'Dùng 2 ngón tay cái ôm lấy sau gáy, ấn chếch nhẹ hướng về phía mắt đối diện, day tròn 2 – 3 phút đến khi có cảm giác tức nhẹ lan tỏa.',
    caution: 'Huyệt nằm rất gần nền sọ và động mạch đốt sống dẫn máu lên não — lực bấm phải hướng về phía mắt đối diện, không đẩy thô bạo từ dưới lên để tránh chóng mặt dữ dội hoặc tổn thương mạch máu. Không bấm khi nghi ngờ chấn thương cột sống cổ cấp tính hoặc vùng da dưới xương chẩm viêm loét.'
  },
  {
    id: 'kien-tinh', code: 'GB21', name: 'Kiên Tỉnh', channel: 'Kinh Đởm • Đỉnh Cơ Vai Gáy',
    pos: [0.144, 0.840, -0.131], snap: 'top', snapR: 0.028, view: 'top', zoom: 0.52, calibrated: true,
    indication: '"Giếng trên vai". Đặc trị đau cứng cổ vai gáy cấp tính, co cơ thang do lạnh, hội chứng cổ – vai – cánh tay, đau quanh khớp vai gây hạn chế vận động cánh tay; hỗ trợ tắc tia sữa, viêm tuyến vú ở phụ nữ sau sinh.',
    technique: 'Dùng 4 ngón tay bóp nhẹ nhàng cơ vai, không ấn sâu ngón tay xuống với lực mạnh.',
    caution: 'CHỐNG CHỈ ĐỊNH TUYỆT ĐỐI với phụ nữ mang thai — huyệt có tính giáng khí rất mạnh, kích thích co bóp tử cung dữ dội, dễ gây dọa sảy thai hoặc sinh non. Huyệt nằm ngay trên đỉnh phổi, cần thận trọng tránh nguy cơ tràn khí màng phổi. Không bấm khi gãy xương đòn hoặc chấn thương/sưng viêm khớp vai cấp tính.'
  },
  {
    id: 'dan-trung', code: 'CV17', name: 'Đản Trung', channel: 'Nhâm Mạch • Giữa Ngực',
    pos: [0.0, 0.725, 0.387], snap: 'front', view: 'front', zoom: 0.42, calibrated: true,
    indication: 'Hội của Khí. Trị đau tức ngực, khó thở, ho khan, ho có đờm, hen suyễn, viêm phế quản mạn tính, hồi hộp đánh trống ngực; giảm stress, căng thẳng, u uất lồng ngực do áp lực tâm lý; hỗ trợ phụ nữ sau sinh thiếu sữa, tắc tia sữa; trị nấc cụt, nghẹn họng.',
    technique: 'Dùng lòng bàn tay xoa nhẹ nhàng theo vòng tròn xung quanh huyệt, kết hợp thở sâu đều đặn.',
    caution: 'Huyệt nằm ngay trên xương ức và phía trước tim — tuyệt đối không đấm, gõ hoặc ấn mạnh trực tiếp vuông góc vì có thể gây loạn nhịp tim. Không tự ý tác động khi đang lên cơn nhồi máu cơ tim cấp, suy tim nặng, suy hô hấp cấp hoặc chấn thương xương ức — ưu tiên cấp cứu y tế ngay.'
  },
  {
    id: 'trung-quan', code: 'CV12', name: 'Trung Quản', channel: 'Nhâm Mạch • Thượng Vị',
    pos: [0.0, 0.635, 0.389], snap: 'front', view: 'front', zoom: 0.42, calibrated: true,
    indication: '"Mộ" của Dạ dày (Vị). Trị đau dạ dày cấp và mạn tính, trào ngược dạ dày thực quản, đầy bụng, khó tiêu, ợ chua, nấc cụt, ăn uống kém ngon miệng, nôn mửa, buồn nôn, tiêu chảy, kiết lỵ, táo bón do rối loạn chức năng đại tràng; phục hồi thể trạng cho người suy nhược, kém ăn.',
    technique: 'Xoa ấm hai bàn tay, đặt bàn tay lên thượng vị xoa tròn theo chiều kim đồng hồ quanh huyệt từ 3 – 5 phút, lực tăng dần từ nhẹ đến vừa.',
    caution: 'CHỐNG CHỈ ĐỊNH TUYỆT ĐỐI trong cấp cứu bụng ngoại khoa: viêm ruột thừa cấp, thủng dạ dày, tắc ruột, viêm tụy cấp hoặc đang xuất huyết tiêu hóa. Phụ nữ mang thai (đặc biệt giữa và cuối thai kỳ) tránh bấm sâu vào bụng. Không bấm khi vừa ăn quá no hoặc đang quá đói — ấn quá sâu, thô bạo có thể tổn thương các tạng phủ bên dưới.'
  },
  {
    id: 'khi-hai', code: 'CV6', name: 'Khí Hải', channel: 'Nhâm Mạch • Đan Điền',
    pos: [0.0, 0.565, 0.380], snap: 'front', view: 'front', zoom: 0.42, calibrated: true,
    indication: '"Bể" của Khí. Trị suy nhược cơ thể, mệt mỏi mạn tính, đoản hơi, chân tay lạnh; di tinh, liệt dương, đái dầm, tiểu đêm, tiểu nhiều lần, tiểu không tự chủ; rối loạn kinh nguyệt, rong kinh, đau bụng kinh; đầy bụng, tiêu chảy mạn tính, sa trực tràng; hỗ trợ nâng huyết áp cho người huyết áp thấp tư thế.',
    technique: 'Áp lòng bàn tay ấm vào vùng dưới rốn, day xoa rất nhẹ nhàng theo chiều kim đồng hồ bằng mô ngón tay cái từ 3 – 5 phút để dẫn khí về đan điền.',
    caution: 'Phụ nữ đang mang thai tuyệt đối không tự ý tác động mạnh hoặc cứu ngải vùng bụng dưới vì dễ kích thích co thắt tử cung gây sảy thai. Người bí tiểu cấp tính do tắc nghẽn cơ học (u xơ tuyến tiền liệt...) tránh ấn mạnh trực tiếp vào vùng bàng quang đang căng trướng.'
  },
  {
    id: 'hop-coc', code: 'LI4', name: 'Hợp Cốc', channel: 'Kinh Đại Trường • Hổ Khẩu',
    // Bàn tay model nằm chéo: ngón cái là nhánh riêng ở z=0.064–0.093, khe hổ khẩu
    // (chỗ ngón cái nhập vào bàn tay) ở y=0.814m, z=0.060m. Hợp Cốc lùi về phía
    // cổ tay ~1.8cm men theo bờ xương bàn tay ngón trỏ → (0.364, 0.830, 0.056) m.
    pos: [0.473, 0.494, 0.158], snap: 'side', view: 'auto', zoom: 0.17, calibrated: true,
    indication: '"Huyệt vạn năng" giảm đau. Trị đau đầu, đau nửa đầu, đau răng (đặc biệt răng hàm dưới), đau họng, khản tiếng, liệt mặt ngoại biên, đau dây thần kinh tam thoa; hạ sốt, giải cảm, nghẹt mũi, viêm mũi dị ứng, viêm xoang; đau mỏi vai gáy, tê bì ngón tay (hội chứng ống cổ tay); kích thích nhu động ruột trị táo bón, giảm đầy bụng; sơ cứu ngất xỉu, chóng mặt, buồn nôn.',
    technique: 'Dùng ngón tay cái bên kia đặt vào khe hổ khẩu, bấm men theo bờ xương bàn tay ngón trỏ, lực tăng dần đến khi có cảm giác căng tức tê lan tỏa, không đau buốt.',
    caution: 'CHỐNG CHỈ ĐỊNH TUYỆT ĐỐI với phụ nữ mang thai — tác động vào huyệt này thúc đẩy co thắt tử cung cực mạnh, dễ gây sảy thai hoặc sinh non. Không bấm khi kẽ ngón cái – ngón trỏ trầy xước, viêm nhiễm hoặc mụn nhọt sưng đau. Tránh dùng móng tay sắc nhọn gây bầm tím hoặc tổn thương dây thần kinh cảm giác.'
  },
  {
    id: 'dai-chuy', code: 'GV14', name: 'Đại Chùy', channel: 'Đốc Mạch • Đốt Sống C7',
    pos: [0.0, 0.858, -0.303], snap: 'back', view: 'back', zoom: 0.40, calibrated: true,
    indication: 'Hội của các đường kinh dương. Hạ sốt mạnh khi cảm cúm, sốt cao phong nhiệt, sốt phát ban; trị ho, hen suyễn, viêm phế quản; đau cứng cổ vai gáy do phong hàn hoặc thoái hóa, hạn chế vận động cổ gáy, đau nhức thắt lưng, đau dây thần kinh liên sườn; tăng cường sức đề kháng, phòng cảm cúm lúc giao mùa.',
    technique: 'Cúi nhẹ đầu để lộ rõ đốt sống C7 sau gáy, dùng ngón tay giữa xoa ấm hoặc day rất nhẹ nhàng huyệt 1 – 2 phút, kết hợp chườm ấm thảo dược.',
    caution: 'Huyệt nằm ngay sát tủy sống cổ — tuyệt đối không đấm hoặc dùng máy massage rung mạnh trực tiếp vào gai sống cổ để tránh tổn thương tủy sống, dây thần kinh trung ương. Không tác động khi nghi ngờ chấn thương cột sống cổ nghiêm trọng, vùng gáy mụn nhọt/lở loét, hoặc đang tăng huyết áp kịch phát kèm đau đầu dữ dội.'
  },
  {
    id: 'tuc-tam-ly', code: 'ST36', name: 'Túc Tam Lý', channel: 'Kinh Vị • Dưới Đầu Gối',
    pos: [0.122, 0.248, 0.115], snap: 'front', view: 'front', zoom: 0.34, calibrated: true,
    indication: '"Huyệt dưỡng sinh cường tráng" đệ nhất Đông y. Tăng cường hệ miễn dịch, bồi bổ tỳ vị, chống mệt mỏi, suy nhược cơ thể; trị đau dạ dày, đầy bụng, chậm tiêu, buồn nôn, tiêu chảy, táo bón mạn tính; đau khớp gối, tê bì chân, đau mỏi chân do đứng/ngồi lâu; hỗ trợ điều hòa huyết áp, mất ngủ do tỳ vị hư nhược.',
    technique: 'Dùng ngón cái bấm với lực vừa phải, hơi chếch vào phía trong bờ xương chày, tạo cảm giác tê tức lan xuống bàn chân, thực hiện kiên trì mỗi sáng.',
    caution: 'Phụ nữ mang thai, đặc biệt 3 tháng đầu hoặc có cơ địa động thai, nên tránh tự ý tác động mạnh vào huyệt này do kích thích nhu động ruột vùng hạ tiêu rất mạnh. Không bấm khi khớp gối đang viêm sưng nóng đỏ do nhiễm trùng hoặc da dưới gối lở loét. Tránh ấn mạnh trực tiếp vào màng xương gây đau buốt kéo dài.'
  },
  {
    id: 'dung-tuyen', code: 'KI1', name: 'Dũng Tuyền', channel: 'Kinh Thận • Lòng Bàn Chân',
    pos: [0.155, 0.000, 0.160], snap: 'bottom', snapR: 0.04, view: 'bottom', zoom: 0.40, calibrated: true,
    indication: '"Nguồn nước ngầm" sinh khí kinh Thận. Dẫn hỏa quy nguyên, hạ huyết áp cấp tốc ở người tăng huyết áp đột ngột; trị mất ngủ, lo âu, đau đầu, chóng mặt, hoa mắt; hỗ trợ ho kéo dài, đau họng, khản tiếng; làm ấm người, trị lạnh chân tay ở người già hoặc dương khí hư; sơ cứu ngất xỉu, say nắng, đột quỵ.',
    technique: 'Xoa ấm hai lòng bàn chân vào nhau hoặc ngâm chân nước ấm thảo dược trước, sau đó dùng đầu ngón tay day bấm với lực vừa phải, tránh vật sắc nhọn.',
    caution: 'CHỐNG CHỈ ĐỊNH TUYỆT ĐỐI khi lòng bàn chân có vết thương hở, nấm kẽ chân, viêm loét do đái tháo đường — nguy cơ nhiễm trùng sâu dẫn đến hoại tử. Không xoa bóp cho người tắc tĩnh mạch sâu chi dưới hoặc suy giãn tĩnh mạch chân nặng. Phụ nữ mang thai cần hết sức thận trọng, không tự ý bấm với lực quá mạnh.'
  }
];

// góc camera cho từng kiểu view: [theta (ngang), phi (dọc, 0=trên đỉnh, π=dưới đáy)]
export const VIEW_ANGLES = {
  front:  [0.0,            Math.PI / 2],
  back:   [Math.PI,        Math.PI / 2],
  right:  [Math.PI / 2,    Math.PI / 2],
  left:   [-Math.PI / 2,   Math.PI / 2],
  top:    [0.35,           0.40],          // nhìn từ trên đỉnh đầu chếch xuống
  bottom: [0.0,            Math.PI - 0.42] // nhìn từ dưới gan bàn chân lên
};
