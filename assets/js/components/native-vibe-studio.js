/**
 * Native Vibe Studio - Bộ Sinh Kịch Bản Video Ngắn Bản Địa 4K (Cao Lãnh 2026)
 * Giúp Co-founder và học viên tạo ngay kịch bản phân cảnh chuẩn văn hoá Đồng Tháp.
 */
(() => {
  const TOPICS = {
    'mua-nuoc-noi': {
      title: 'Mùa Nước Nổi & Giăng Câu Cá Linh',
      hook: 'Từng đàn cá linh non vượt hàng ngàn cây số về với phù sa sông Tiền...',
      scenes: [
        { time: '00:00 - 00:03', shot: 'Drone FPV bay là là mặt nước sông Tiền rạng sáng', audio: 'Tiếng máy đuôi tôm xé nước giòn giã', voice: 'Ai về Đồng Tháp mùa này, nhớ dậy lúc 4 giờ sáng cùng tụi tui giăng lưới cá linh nghen!' },
        { time: '00:03 - 00:15', shot: 'Cận cảnh (Macro 50mm) cá linh bạc lóng lánh nhảy trên mui ghe', audio: 'Tiếng cá quẫy đuôi bì bõm, nhạc Acoustic ấm', voice: 'Con cá linh đầu mùa xương mềm rụm, nấu với bông điên điển vàng rực bờ kinh thì ngon hết sẩy.' },
        { time: '00:15 - 00:25', shot: 'Toàn cảnh bếp lửa un khói giữa đồng nước mênh mông', audio: 'Tiếng củi nổ lách tách, tiếng cười giòn tan của bà má Ba', voice: 'Cái tình của người miền Tây hổng nằm ở mâm cao cỗ đầy, mà ở cái nồi canh chua bốc khói giữa đồng nước.' },
        { time: '00:25 - 00:30', shot: 'Góc máy trung: nụ cười hào sảng giơ rổ cá linh tươi rói', audio: 'Giai điệu đờn kìm lofi vang lên', voice: 'Mùa nước nổi chỉ kéo dài 2 tháng thôi. Xách ba lô về Cao Lãnh tụi tui đón liền nha!' }
      ],
      gear: 'Sony FX3 + 24-70mm GM II, Drone Mini 4 Pro, Mic cài Rode Wireless GO II',
      audioPrompt: 'Giai điệu Lofi kết hợp đờn bầu và tiếng chèo khua nước nhẹ nhàng.'
    },
    'lang-hoa-sadec': {
      title: 'Làng Hoa Sa Đéc Trăm Năm Giàn Trên Nước',
      hook: 'Nơi duy nhất trên thế giới người ta trồng hoa mà phải bơi xuồng để tưới!',
      scenes: [
        { time: '00:00 - 00:03', shot: 'Drone Top-down 90 độ quét qua hàng ngàn luống cúc mâm xôi rực rỡ', audio: 'Tiếng nhạc beat dồn dập, tiếng vỗ tay rộn rã', voice: 'Bạn đã từng thấy cánh đồng hoa bồng bềnh trên mặt nước chưa?' },
        { time: '00:03 - 00:15', shot: 'Chống xuồng lướt êm giữa hai giàn hoa, góc nhìn người thứ nhất (FPV)', audio: 'Tiếng khua chèo bì bõm, giọt nước rơi lách tách', voice: 'Tại Sa Đéc, phù sa sông Tiền nuôi lớn những đóa hoa rực rỡ nhất đón xuân cho cả miền Nam.' },
        { time: '00:15 - 00:25', shot: 'Cận cảnh đôi bàn tay tỉ mỉ bấm ngọn, nâng niu từng chậu hoa kiểng', audio: 'Tiếng gió xào xạc lá hoa', voice: 'Mỗi chậu hoa là một năm chắt chiu mồ hôi của những nghệ nhân đời thứ ba làng hoa.' },
        { time: '00:25 - 00:30', shot: 'Góc nghiêng điện ảnh đón nắng chiều tà xuyên qua giàn hoa', audio: 'Nhạc cao trào cảm xúc', voice: 'Về Sa Đéc hít hà hương hoa cùng tụi mình nghen!' }
      ],
      gear: 'Gimbal RS3 + 35mm f/1.4, kính lọc CPL phân cực khử bóng nước mặt sông',
      audioPrompt: 'Nhạc Pop Acoustic tươi sáng, tiếng sáo trúc réo rắt hiện đại.'
    },
    'ocop-nem-bot': {
      title: 'Bí Mật Nem Lai Vung & Bột Gạo Sa Đéc',
      hook: 'Lá chuối xanh, ớt chỉ thiên đỏ thắm và vị chua thanh làm say lòng người lữ khách...',
      scenes: [
        { time: '00:00 - 00:03', shot: 'Cực cận (Extreme Macro) ngón tay bóc từng lớp lá chuối xanh mướt', audio: 'Tiếng xé lá chuối giòn rụm ASMR cực đã tai', voice: 'Cái nem Lai Vung chuẩn vị là phải giòn sần sật, chua thanh mà ngọt hậu thế này nè!' },
        { time: '00:03 - 00:15', shot: 'Slow-motion 120fps cảnh quết thịt heo nóng hổi và trộn bì giòn', audio: 'Tiếng chày cối rộn rã theo nhịp', voice: 'Thịt heo phải là thịt nóng vừa ra lò lúc sáng sớm, quết đều tay cùng gia vị gia truyền.' },
        { time: '00:15 - 00:25', shot: 'Bàn tay thoăn thoắt gói chiếc nem vuông vắn trong vòng 5 giây', audio: 'Tiếng cười đùa của các chị thợ làng nghề', voice: 'Từ làng nghề trăm năm vươn mình thành sản phẩm OCOP 4 sao có mặt khắp bàn tiệc quốc tế.' },
        { time: '00:25 - 00:30', shot: 'Hộp nem thắt nơ tinh tế bên đĩa nem thái lát sẵn sàng thưởng thức', audio: 'Jingle nhạc ấm cúng', voice: 'Quà biếu Đất Sen Hồng — gói trọn ân tình miền Tây sông nước.' }
      ],
      gear: 'Macro Lens 90mm f/2.8, Đèn LED Amaran 200d ánh sáng vàng ấm 3200K',
      audioPrompt: 'ASMR chi tiết cao, âm thanh ẩm thực sống động không tạp âm.'
    },
    'homestay-cao-lanh': {
      title: 'Một Ngày Trốn Phố Về Homestay Ven Sông Cao Lãnh',
      hook: 'Rời xa còi xe Sài Gòn, sáng thức giấc nghe chim hót líu lo bên rặng bần...',
      scenes: [
        { time: '00:00 - 00:03', shot: 'Góc máy chậm mở rèm cửa gỗ nhìn ra bờ sông Tiền sương sớm', audio: 'Tiếng chim chích kêu, tiếng gió thổi rặng bần rì rào', voice: 'Có những ngày chỉ muốn trốn hết deadline, về Cao Lãnh làm một giấc ngủ không báo thức.' },
        { time: '00:03 - 00:15', shot: 'Cảnh ngồi uống tách trà sen ấm trên cầu tre ngắm cá đớp bóng', audio: 'Tiếng rót nước róc rách, nhạc Jazz Lofi êm đềm', voice: 'Ở đây không có wifi tốc độ cao để chạy việc, chỉ có sự bình yên mà thành phố chẳng mua được.' },
        { time: '00:15 - 00:25', shot: 'Trải nghiệm hái ổi, bẻ xoài cát Chu chín cây ăn tại vườn', audio: 'Tiếng cắn trái xoài giòn ngọt ngào', voice: 'Bữa cơm trưa có cá lóc nướng trui cuốn lá sen non và ốc bươu hấp tiêu xanh cay nồng.' },
        { time: '00:25 - 00:30', shot: 'Ngồi võng ngắm hoàng hôn đỏ ối buông xuống mặt sông', audio: 'Nhạc guitar mộc mạc lắng đọng', voice: 'Cuối tuần này, bạn có hẹn với bình yên tại Cao Lãnh chưa?' }
      ],
      gear: 'Máy quay 4K 10-bit 4:2:2, Chân máy Monopod mượt mà, Đèn Tube cầm tay',
      audioPrompt: 'Nhạc guitar mộc kết hợp tiếng sóng nước vỗ bờ êm dịu.'
    }
  };

  function renderScript() {
    const topicKey = document.getElementById('nvs-topic-select').value;
    const data = TOPICS[topicKey] || TOPICS['mua-nuoc-noi'];
    const container = document.getElementById('nvs-output-container');
    if (!container) return;

    container.innerHTML = `
      <div style="background:#fff;border-radius:18px;border:1.5px solid #1B4D3E;padding:1.5rem;box-shadow:0 10px 25px rgba(27,77,62,0.06);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;border-bottom:1px solid #E5E7EB;padding-bottom:1rem;margin-bottom:1rem;">
          <div>
            <span style="background:#DCFCE7;color:#166534;font-size:0.75rem;font-weight:800;padding:0.25rem 0.65rem;border-radius:999px;">KỊCH BẢN PHÂN CẢNH 4K BẢN ĐỊA</span>
            <h3 style="font-size:1.3rem;font-weight:800;color:#1B4D3E;margin:0.4rem 0 0.2rem;">${data.title}</h3>
            <p style="font-size:0.85rem;color:#666;margin:0;">💡 <strong>Visual Hook:</strong> "${data.hook}"</p>
          </div>
          <div style="display:flex;gap:0.5rem;">
            <button id="nvs-copy-btn" style="background:#1B4D3E;color:#fff;border:none;padding:0.5rem 1rem;border-radius:10px;font-size:0.85rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:0.35rem;">
              <span class="material-symbols-outlined" style="font-size:1.1rem;">content_copy</span>
              <span>Sao Chép Kịch Bản</span>
            </button>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:0.85rem;">
          ${data.scenes.map((s, idx) => `
            <div style="background:#F9FAF8;border-left:4px solid #1B4D3E;border-radius:8px;padding:0.85rem 1rem;">
              <div style="display:flex;justify-content:space-between;font-size:0.8rem;font-weight:800;color:#B25E00;margin-bottom:0.25rem;">
                <span>CẢNH ${idx + 1} (${s.time})</span>
                <span>${s.shot}</span>
              </div>
              <div style="font-size:0.9rem;color:#1B4D3E;margin-bottom:0.3rem;"><strong>🎙️ Lời thoại (Voice-over):</strong> "${s.voice}"</div>
              <div style="font-size:0.82rem;color:#555;"><strong>🔊 Âm thanh (Audio/SFX):</strong> ${s.audio}</div>
            </div>
          `).join('')}
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0.85rem;margin-top:1.25rem;background:#F0F5EE;padding:1rem;border-radius:12px;font-size:0.82rem;">
          <div><strong>🎥 Đề Xuất Thiết Bị:</strong><br>${data.gear}</div>
          <div><strong>🎵 Âm Nhạc & Nhịp Điệu:</strong><br>${data.audioPrompt}</div>
        </div>
      </div>
    `;

    document.getElementById('nvs-copy-btn').onclick = () => {
      let scriptText = `🎬 KỊCH BẢN: ${data.title}\nHOOK: ${data.hook}\n\n`;
      data.scenes.forEach((s, idx) => {
        scriptText += `[CẢNH ${idx + 1}] (${s.time})\n- Góc máy: ${s.shot}\n- Lời thoại: "${s.voice}"\n- Âm thanh: ${s.audio}\n\n`;
      });
      scriptText += `Thiết bị: ${data.gear}\nÂm nhạc: ${data.audioPrompt}`;
      navigator.clipboard.writeText(scriptText);
      alert('Đã sao chép kịch bản phân cảnh vào clipboard!');
    };
  }

  window.initNativeVibeStudio = () => {
    const select = document.getElementById('nvs-topic-select');
    if (!select) return;
    select.onchange = renderScript;
    const btn = document.getElementById('nvs-generate-btn');
    if (btn) btn.onclick = renderScript;
    renderScript();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initNativeVibeStudio);
  } else {
    window.initNativeVibeStudio();
  }
})();
