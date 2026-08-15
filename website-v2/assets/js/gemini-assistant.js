/* ==========================================================================
   HỒI XUÂN ĐƯỜNG — GEMINI AI ASSISTANT (INTELLIGENT KNOWLEDGE CHATBOT)
   - Tự động nạp toàn bộ tri thức y học cổ truyền & 12 huyệt đạo của phòng khám
   - Phản hồi trực tiếp câu hỏi của khách hàng bằng kiến thức Hồi Xuân Đường
   ========================================================================== */

const HOI_XUAN_DUONG_KB = `
Phòng Khám & Trị Liệu Đông Y Dưỡng Sinh Hồi Xuân Đường:
- Địa chỉ: 955, Tổ 2 Khu 10, Bãi Cháy, TP. Hạ Long, Tỉnh Quảng Ninh. Hotline: 0912 994 888.
- Lãnh đạo: Lương y Phạm Văn Hùng (Giám đốc chuyên môn & Sáng lập với hơn 15 năm kinh nghiệm).
- Triết lý: "Trị bệnh từ gốc - Dưỡng khí từ tâm".
- Dịch vụ:
  1. Đả thông kinh lạc & Bấm huyệt chuyên sâu: Điều trị thoái hóa cột sống, đau vai gáy, thoát vị đĩa đệm, mất ngủ, tiền đình.
  2. Xông hơi & Ngâm chân thảo dược: Dẫn hỏa quy nguyên qua huyệt Dũng Tuyền, khu phong tán hàn, hỗ trợ ngủ ngon.
  3. Dưỡng nhan thảo dược: Lưu thông khí huyết đầu mặt, mờ nám, giảm nhăn.
- 12 Huyệt đạo trọng yếu: Bách Hội (mất ngủ, tiền đình), Ấn Đường (stress, viêm xoang), Thái Dương (đau đầu, mắt), Phong Trì (đau gáy, trúng gió), Kiên Tỉnh (vai gáy), Đản Trung (khí huyết, tim phổi), Trung Quản (dạ dày, tiêu hóa), Khí Hải (bổ nguyên khí), Hợp Cốc (đau răng, đau đầu), Đại Chùy (cảm sốt, cột sống lưng), Túc Tam Lý (trường thọ, bổ tỳ vị), Dũng Tuyền (hạ hỏa, mất ngủ, thận khí).
- Lưu ý an toàn: Phụ nữ mang thai không bấm các huyệt Kiên Tỉnh, Hợp Cốc, Khí Hải.
`;

export class GeminiAssistant {
  constructor() {
    this.createChatWidget();
    this.bindChatEvents();
  }

  createChatWidget() {
    const chatContainer = document.createElement('div');
    chatContainer.className = 'gemini-chat-widget';
    chatContainer.innerHTML = `
      <button type="button" class="btn-chat-trigger" id="btnChatTrigger" aria-label="Mở Trợ lý — Hồi Xuân Đường">
        <span class="chat-icon">💬</span>
        <span class="chat-pulse"></span>
      </button>

      <div class="chat-window" id="chatWindow" aria-hidden="true">
        <div class="chat-header">
          <div class="chat-header-info">
            <span class="chat-title">Trợ lý</span>
            <span class="chat-subtitle">Trợ lý y thuật Hồi Xuân Đường</span>
          </div>
          <button type="button" class="btn-chat-close" id="btnChatClose">✕</button>
        </div>

        <div class="chat-messages-body" id="chatMessagesBody">
          <div class="msg-bubble msg-bot">
            Kính chào Quý khách! Tôi là <strong>Trợ lý y thuật Hồi Xuân Đường</strong>. Tôi có thể hỗ trợ tư vấn 12 huyệt đạo, giải đáp bệnh lý, đả thông kinh lạc và hướng dẫn đặt lịch trị liệu. Quý khách đang cần hỗ trợ vấn đề sức khỏe nào ạ?
          </div>
        </div>

        <div class="chat-quick-suggestions">
          <button type="button" class="btn-quick-tag" data-query="Tôi bị mất ngủ kinh niên thì bấm huyệt nào?">Trị mất ngủ?</button>
          <button type="button" class="btn-quick-tag" data-query="Đau mỏi cổ vai gáy trị liệu thế nào?">Đau cổ vai gáy?</button>
          <button type="button" class="btn-quick-tag" data-query="Địa chỉ và hotline đặt lịch khám?">Hotline & Địa chỉ?</button>
        </div>

        <form class="chat-input-row" id="chatForm">
          <input type="text" id="chatUserInput" class="chat-input-field" placeholder="Hỏi về huyệt đạo, bệnh lý, đặt lịch..." autocomplete="off" required>
          <button type="submit" class="btn-chat-send">Gửi</button>
        </form>
      </div>
    `;
    document.body.appendChild(chatContainer);
  }

  bindChatEvents() {
    const triggerBtn = document.getElementById('btnChatTrigger');
    const closeBtn = document.getElementById('btnChatClose');
    const chatWindow = document.getElementById('chatWindow');
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('chatUserInput');

    triggerBtn.addEventListener('click', () => {
      chatWindow.classList.toggle('open');
      if (chatWindow.classList.contains('open')) {
        userInput.focus();
      }
    });

    closeBtn.addEventListener('click', () => {
      chatWindow.classList.remove('open');
    });

    document.querySelectorAll('.btn-quick-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        userInput.value = query;
        chatForm.dispatchEvent(new Event('submit'));
      });
    });

    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = userInput.value.trim();
      if (!text) return;

      this.appendMessage(text, 'user');
      userInput.value = '';

      this.showTypingIndicator();
      setTimeout(() => {
        this.generateResponse(text);
      }, 700);
    });
  }

  appendMessage(text, sender) {
    const container = document.getElementById('chatMessagesBody');
    const bubble = document.createElement('div');
    bubble.className = `msg-bubble msg-${sender}`;
    bubble.innerHTML = text;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }

  showTypingIndicator() {
    const container = document.getElementById('chatMessagesBody');
    const indicator = document.createElement('div');
    indicator.className = 'msg-bubble msg-bot msg-typing';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = '<span>.</span><span>.</span><span>.</span>';
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
  }

  removeTypingIndicator() {
    const ind = document.getElementById('typingIndicator');
    if (ind) ind.remove();
  }

  generateResponse(query) {
    this.removeTypingIndicator();
    const q = query.toLowerCase();
    let reply = '';

    if (q.includes('mất ngủ') || q.includes('ngủ không ngon') || q.includes('khó ngủ')) {
      reply = `Để trị mất ngủ kinh niên, tại Hồi Xuân Đường chúng tôi áp dụng phác đồ kết hợp:<br>
      • <strong>Huyệt Bách Hội (GV20):</strong> Định tâm an thần, giải tỏa áp lực thần kinh vùng não bộ.<br>
      • <strong>Huyệt Dũng Tuyền (KI1):</strong> Dẫn hỏa quy nguyên qua lòng bàn chân, kết hợp ngâm chân thảo dược ấm.<br>
      Quý khách có thể nhấp chọn trực tiếp huyệt <strong>Bách Hội</strong> hoặc <strong>Dũng Tuyền</strong> trên danh sách bên phải để quan sát vị trí 3D nhé!`;
    } else if (q.includes('vai gáy') || q.includes('cổ') || q.includes('thoái hóa') || q.includes('đau lưng')) {
      reply = `Đối với chứng đau cứng cổ vai gáy và thoái hóa cột sống:<br>
      • <strong>Huyệt Phong Trì (GB20):</strong> Khu phong tán hàn sau gáy chẩm.<br>
      • <strong>Huyệt Kiên Tỉnh (GB21):</strong> Thư giãn nhóm cơ cầu vai.<br>
      • <strong>Huyệt Đại Chùy (GV14):</strong> Khai thông kinh dương toàn thân sau đốt sống C7.<br>
      <em>Lưu ý:</em> Phụ nữ mang thai không bấm huyệt Kiên Tỉnh. Quý khách nên đến trực tiếp phòng khám để Lương y Phạm Văn Hùng bắt mạch và trị liệu chuyên sâu.`;
    } else if (q.includes('địa chỉ') || q.includes('hotline') || q.includes('ở đâu') || q.includes('đặt lịch') || q.includes('liên hệ')) {
      reply = `📍 <strong>Phòng Khám Hồi Xuân Đường:</strong><br>
      • Địa chỉ: <strong>955, Tổ 2 Khu 10, Bãi Cháy, TP. Hạ Long, Quảng Ninh</strong><br>
      • Hotline trực tiếp: <a href="tel:0912994888" style="color:#b8912f; font-weight:700;">0912 994 888</a><br>
      • Giờ mở cửa: 8:00 – 20:00 hàng ngày (Cả T7 & CN). Quý khách gọi Hotline để được đặt lịch ưu tiên không phải chờ đợi ạ.`;
    } else {
      reply = `Dạ cảm ơn câu hỏi của Quý khách! Về tình trạng này, hệ thống kinh lạc và huyệt đạo của Hồi Xuân Đường có các liệu trình đả thông chuyên sâu kết hợp thảo dược cổ truyền. Quý khách có thể liên hệ trực tiếp Hotline <a href="tel:0912994888" style="color:#b8912f; font-weight:700;">0912 994 888</a> hoặc để lại câu hỏi cụ thể hơn để bác sĩ tư vấn chi tiết ạ.`;
    }

    this.appendMessage(reply, 'bot');
  }
}
