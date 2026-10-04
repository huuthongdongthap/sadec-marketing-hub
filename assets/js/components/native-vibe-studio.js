/**
 * Native Vibe Studio v2 - Content Engine 4K & Phóng Sự Bản Địa (Cao Lãnh 2026)
 * Hỗ trợ sinh kịch bản 3 định dạng: Video Ngắn 60s, Phóng Sự 10 Phút, Bài PR Báo Chí.
 */
(() => {
  const TOPICS = {
    'mua-nuoc-noi': {
      title: 'Mùa Nước Nổi & Giăng Câu Cá Linh',
      hook: 'Từng đàn cá linh non vượt hàng ngàn cây số về với phù sa sông Tiền...',
      scenes: [
        { time: '00:00 - 00:03', shot: 'Drone FPV bay là là mặt nước sông Tiền rạng sáng', audio: 'Tiếng máy đuôi tôm xé nước', voice: 'Ai về Đồng Tháp mùa này, nhớ dậy lúc 4 giờ sáng giăng lưới cá linh nghen!' },
        { time: '00:03 - 00:15', shot: 'Macro 50mm cá linh bạc lóng lánh nhảy trên mui ghe', audio: 'Tiếng cá quẫy bì bõm, Acoustic ấm', voice: 'Cá linh đầu mùa xương mềm rụm, nấu bông điên điển vàng rực thì ngon hết sẩy.' },
        { time: '00:15 - 00:25', shot: 'Toàn cảnh bếp lửa un khói giữa đồng nước mênh mông', audio: 'Tiếng củi nổ lách tách, tiếng cười má Ba', voice: 'Cái tình miền Tây hổng nằm ở mâm cao cỗ đầy, mà ở nồi canh chua bốc khói giữa đồng.' },
        { time: '00:25 - 00:30', shot: 'Góc trung: nụ cười hào sảng giơ rổ cá linh tươi rói', audio: 'Đờn kìm lofi vang lên', voice: 'Mùa nước nổi chỉ kéo dài 2 tháng. Xách ba lô về Cao Lãnh tụi tui đón liền nha!' }
      ],
      gear: 'Sony FX3 + 24-70mm GM II, Drone Mini 4 Pro, Mic Rode Wireless GO II',
      audioPrompt: 'Giai điệu Lofi kết hợp đờn bầu và tiếng chèo khua nước nhẹ nhàng.',
      doc: [
        { act: 'Hồi 1 (00:00-02:30)', title: 'Dòng Phù Sa Thượng Nguồn', desc: 'Flycam 4K theo con nước lũ đổ về biên giới. Ghi hình chuẩn bị dớn, lưới, xuồng ba lá trong rạng đông.' },
        { act: 'Hồi 2 (02:30-06:00)', title: 'Cuộc Đua Giăng Lưới Rạng Sáng', desc: 'Âm thanh máy đuôi tôm dội vang mặt sông. Cận cảnh kéo mẻ cá linh non óng ánh và nụ cười lão ngư.' },
        { act: 'Hồi 3 (06:00-08:30)', title: 'Khói Bếp Đồng & Bông Điên Điển', desc: 'Bữa cơm trưa chòi sàn ngập nước: Canh chua cá linh bông điên điển, cá linh kho lạt dầm ớt hiểm.' },
        { act: 'Hồi 4 (08:30-10:00)', title: 'Di Sản & Du Lịch Bản Địa 2026', desc: 'Mô hình du lịch trải nghiệm sông nước Cao Lãnh kết nối công nghệ số và nông nghiệp sinh thái.' }
      ],
      press: {
        headline: 'Về Đất Sen Hồng Mùa Nước Nổi: Đánh Thức Hương Vị Ký Ức Cùng Ngư Dân Đồng Tháp',
        sapo: 'Khi con nước son tràn về, Đồng Tháp khoác lên mình tấm áo hào sảng nhất của thiên nhiên sông nước.',
        body: 'Mùa nước nổi Cao Lãnh mang đến trải nghiệm đánh thức mọi giác quan: từ 4h sáng giăng lưới cá linh non đến nồi canh chua điên điển bốc khói giữa đồng.'
      }
    },
    'lang-hoa-sadec': {
      title: 'Làng Hoa Sa Đéc Trăm Năm Giàn Trên Nước',
      hook: 'Nơi duy nhất trên thế giới người ta trồng hoa mà phải bơi xuồng để tưới!',
      scenes: [
        { time: '00:00 - 00:03', shot: 'Drone Top-down 90 độ quét qua luống cúc mâm xôi', audio: 'Tiếng beat dồn dập rộn rã', voice: 'Bạn đã từng thấy cánh đồng hoa bồng bềnh trên mặt nước chưa?' },
        { time: '00:03 - 00:15', shot: 'Chống xuồng lướt êm giữa hai giàn hoa FPV', audio: 'Tiếng khua chèo róc rách', voice: 'Tại Sa Đéc, phù sa sông Tiền nuôi lớn những đóa hoa rực rỡ nhất đón xuân cho cả miền Nam.' },
        { time: '00:15 - 00:25', shot: 'Cận cảnh đôi bàn tay tỉ mỉ bấm ngọn kiểng', audio: 'Tiếng gió xào xạc lá hoa', voice: 'Mỗi chậu hoa là một năm chắt chiu mồ hôi của những nghệ nhân đời thứ ba làng hoa.' },
        { time: '00:25 - 00:30', shot: 'Góc nghiêng điện ảnh đón nắng chiều tà xuyên giàn hoa', audio: 'Nhạc cao trào cảm xúc', voice: 'Về Sa Đéc hít hà hương hoa cùng tụi mình nghen!' }
      ],
      gear: 'Gimbal RS3 + 35mm f/1.4, kính lọc CPL phân cực khử bóng nước mặt sông',
      audioPrompt: 'Nhạc Pop Acoustic tươi sáng, tiếng sáo trúc réo rắt hiện đại.',
      doc: [
        { act: 'Hồi 1 (00:00-02:30)', title: 'Gốc Tích Giàn Hoa Trên Sông', desc: 'Lịch sử 100 năm Tân Quy Đông vượt lũ bằng sáng kiến đóng giàn tre trồng hoa trên mặt rạch.' },
        { act: 'Hồi 2 (02:30-06:00)', title: 'Kỹ Nghệ Người Thổi Hồn Vào Cây', desc: 'Nghệ nhân uốn kiểng cổ, chăm hoa hồng và cúc mâm xôi nở chuẩn xác từng ngày Tết.' },
        { act: 'Hồi 3 (06:00-08:30)', title: 'Thế Hệ Trẻ & Cách Mạng Số', desc: 'Người trẻ Sa Đéc ứng dụng livestream, thương mại điện tử xuất khẩu hoa kiểng toàn quốc.' },
        { act: 'Hồi 4 (08:30-10:00)', title: 'Thủ Phủ Hoa Sa Đéc 2026', desc: 'Quy hoạch thành phố hoa kết nối du lịch di sản, làng nghề bột và tour quay phim điện ảnh.' }
      ],
      press: {
        headline: 'Kỳ Tích Làng Hoa Sa Đéc: Trăm Năm Đơm Hoa Trên Giàn Nước Phù Sa',
        sapo: 'Làng hoa Sa Đéc là chứng nhân cho sự cần cù và óc sáng tạo diệu kỳ của người nông dân xứ sen.',
        body: 'Hình ảnh thong dong chèo xuồng giữa đôi bờ rực rỡ sắc màu biến Sa Đéc thành không gian văn hoá sáng tạo đa giác quan thu hút du khách toàn cầu.'
      }
    },
    'ocop-nem-bot': {
      title: 'Bí Mật Nem Lai Vung & Bột Gạo Sa Đéc',
      hook: 'Lá chuối xanh, ớt chỉ thiên đỏ thắm và vị chua thanh làm say lòng lữ khách...',
      scenes: [
        { time: '00:00 - 00:03', shot: 'Extreme Macro ngón tay bóc từng lớp lá chuối xanh', audio: 'Tiếng xé lá chuối ASMR', voice: 'Cái nem Lai Vung chuẩn vị là phải giòn sần sật, chua thanh mà ngọt hậu thế này nè!' },
        { time: '00:03 - 00:15', shot: 'Slow-motion 120fps quết thịt heo và trộn bì giòn', audio: 'Tiếng chày cối rộn rã', voice: 'Thịt heo phải là thịt nóng vừa ra lò lúc sáng sớm, quết đều tay cùng gia vị gia truyền.' },
        { time: '00:15 - 00:25', shot: 'Bàn tay thoăn thoắt gói chiếc nem trong 5 giây', audio: 'Tiếng cười rộn rã các chị thợ', voice: 'Từ làng nghề trăm năm vươn mình thành sản phẩm OCOP 4 sao có mặt khắp bàn tiệc quốc tế.' },
        { time: '00:25 - 00:30', shot: 'Hộp nem thắt nơ tinh tế bên đĩa nem thái lát', audio: 'Jingle ấm cúng', voice: 'Quà biếu Đất Sen Hồng — gói trọn ân tình miền Tây sông nước.' }
      ],
      gear: 'Macro Lens 90mm f/2.8, Đèn LED Amaran 200d ánh sáng vàng ấm 3200K',
      audioPrompt: 'ASMR chi tiết cao, âm thanh ẩm thực sống động không tạp âm.',
      doc: [
        { act: 'Hồi 1 (00:00-02:30)', title: 'Hạt Gạo Trắng Ven Dòng Sa Giang', desc: 'Nguồn nước ngọt lành sông Sa Giang tạo độ mịn và dẻo trắng đặc trưng của làng bột trăm năm.' },
        { act: 'Hồi 2 (02:30-06:00)', title: 'Lên Men Tự Nhiên Nem Lai Vung', desc: 'Bí mật ủ nem nghệ nhân: cân bằng thịt nạc đùi, bì heo, tỏi ớt và lá chùm ruột.' },
        { act: 'Hồi 3 (06:00-08:30)', title: 'Chuẩn Hoá OCOP 4 Sao & Xuất Khẩu', desc: 'Máy móc tiệt trùng, bao bì hút chân không và mã QR truy xuất nguồn gốc từng xưởng.' },
        { act: 'Hồi 4 (08:30-10:00)', title: 'Thương Hiệu Ẩm Thực Bản Địa', desc: 'Đưa đặc sản Đồng Tháp lên bàn ăn du khách đô thị qua hệ thống phân phối số và video 4K.' }
      ],
      press: {
        headline: 'Chuyện Nghề Trăm Năm: Từ Hạt Bột Sa Đéc Đến Chiếc Nem Lai Vung Trứ Danh',
        sapo: 'Ẩm thực Đồng Tháp gói trọn trong hạt bột gạo tinh khôi và vị chua cay giòn sần sật của chiếc nem lá chuối thắt lạt đỏ.',
        body: 'Mỗi món ăn bản địa là câu chuyện gìn giữ ngọn lửa nghề của nhiều thế hệ, tự tin vươn xa với nhận diện thương hiệu OCOP chuẩn mực.'
      }
    },
    'homestay-cao-lanh': {
      title: 'Một Ngày Trốn Phố Về Homestay Ven Sông Cao Lãnh',
      hook: 'Rời xa còi xe Sài Gòn, sáng thức giấc nghe chim hót líu lo bên rặng bần...',
      scenes: [
        { time: '00:00 - 00:03', shot: 'Góc máy chậm mở rèm cửa gỗ nhìn ra bờ sông Tiền', audio: 'Tiếng chim chích, gió thổi bần', voice: 'Có những ngày chỉ muốn trốn hết deadline, về Cao Lãnh làm giấc ngủ không báo thức.' },
        { time: '00:03 - 00:15', shot: 'Uống tách trà sen ấm trên cầu tre ngắm cá đớp bóng', audio: 'Tiếng rót nước, Jazz Lofi êm', voice: 'Ở đây không có wifi tốc độ cao để chạy việc, chỉ có sự bình yên mà phố thị chẳng mua được.' },
        { time: '00:15 - 00:25', shot: 'Bẻ xoài cát Chu chín cây ăn tại vườn sinh thái', audio: 'Tiếng cắn xoài ngọt ngào', voice: 'Bữa cơm trưa có cá lóc nướng trui cuốn lá sen non và ốc bươu hấp tiêu xanh cay nồng.' },
        { time: '00:25 - 00:30', shot: 'Ngồi võng ngắm hoàng hôn đỏ ối buông xuống mặt sông', audio: 'Guitar mộc mạc lắng đọng', voice: 'Cuối tuần này, bạn có hẹn với bình yên tại Cao Lãnh chưa?' }
      ],
      gear: 'Máy quay 4K 10-bit 4:2:2, Chân máy Monopod mượt mà, Đèn Tube cầm tay',
      audioPrompt: 'Nhạc guitar mộc kết hợp tiếng sóng nước vỗ bờ êm dịu.',
      doc: [
        { act: 'Hồi 1 (00:00-02:30)', title: 'Chuyến Xe Rời Xa Đô Thị', desc: 'Hành trình 2.5h từ Sài Gòn qua cầu Cao Lãnh vào không gian rợp bóng vườn xoài và dừa nước.' },
        { act: 'Hồi 2 (02:30-06:00)', title: 'Kiến Trúc Mộc & Nhà Vườn', desc: 'Homestay tre nứa bản địa, hồ sen trước ngõ, đón gió mát tự nhiên không cần điều hòa.' },
        { act: 'Hồi 3 (06:00-08:30)', title: 'Ẩm Thực Cây Nhà Lá Vườn', desc: 'Tát mương bắt cá, hái đọt nhãn lồng, nướng cá lóc rơm rạ đậm đà tình làng nghĩa xóm.' },
        { act: 'Hồi 4 (08:30-10:00)', title: 'Du Lịch Chữa Lành Sinh Thái', desc: 'Mô hình du lịch boutique slow-living gắn với bảo tồn cảnh quan tự nhiên sông Tiền.' }
      ],
      press: {
        headline: 'Tìm Về An Yên: Trải Nghiệm Homestay Sinh Thái Ven Sông Tiền Tại Cao Lãnh',
        sapo: 'Homestay nhà vườn Cao Lãnh chính là điểm dừng chân hoàn hảo cho tâm hồn sau những ngày hối hả.',
        body: 'Thức giấc trong tiếng chim chuyền cành, thưởng thức trà sen và cảm nhận nhịp sống chậm rãi ven sông Tiền.'
      }
    }
  };

  let activeFormat = 'short';

  function renderScript() {
    const topicKey = document.getElementById('nvs-topic-select').value;
    const data = TOPICS[topicKey] || TOPICS['mua-nuoc-noi'];
    const container = document.getElementById('nvs-output-container');
    if (!container) return;

    let contentHtml = '';
    if (activeFormat === 'short') {
      contentHtml = `<div style="display:flex;flex-direction:column;gap:0.75rem;">
        ${data.scenes.map((s, idx) => `
          <div style="background:#F9FAF8;border-left:4px solid #1B4D3E;border-radius:8px;padding:0.75rem 1rem;">
            <div style="display:flex;justify-content:space-between;font-size:0.8rem;font-weight:800;color:#B25E00;margin-bottom:0.25rem;"><span>CẢNH ${idx + 1} (${s.time})</span><span>${s.shot}</span></div>
            <div style="font-size:0.9rem;color:#1B4D3E;margin-bottom:0.25rem;"><strong>🎙️ Lời thoại:</strong> "${s.voice}"</div>
            <div style="font-size:0.8rem;color:#555;"><strong>🔊 Âm thanh/SFX:</strong> ${s.audio}</div>
          </div>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0.75rem;margin-top:1rem;background:#F0F5EE;padding:0.85rem;border-radius:12px;font-size:0.8rem;">
        <div><strong>🎥 Đề Xuất Thiết Bị:</strong><br>${data.gear}</div>
        <div><strong>🎵 Âm Nhạc & Nhịp Điệu:</strong><br>${data.audioPrompt}</div>
      </div>`;
    } else if (activeFormat === 'doc') {
      contentHtml = `<div style="display:flex;flex-direction:column;gap:0.75rem;">
        ${data.doc.map(act => `
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:0.85rem 1rem;">
            <div style="font-size:0.85rem;font-weight:800;color:#15803D;margin-bottom:0.3rem;">🎬 ${act.act} • ${act.title}</div>
            <div style="font-size:0.88rem;color:#333;line-height:1.5;">${act.desc}</div>
          </div>`).join('')}
      </div>
      <div style="margin-top:0.75rem;background:#FEF3C7;border:1px solid #FCD34D;padding:0.75rem;border-radius:10px;font-size:0.8rem;color:#92400E;">
        💡 <strong>Chuẩn Điện Ảnh:</strong> Quay 4K 10-bit S-Log3, Color Grade LUT màu phù sa Đồng Tháp độc quyền.
      </div>`;
    } else {
      contentHtml = `<div style="background:#FFF;border:1px solid #E5E7EB;border-radius:12px;padding:1.25rem;">
        <h4 style="font-size:1.15rem;font-weight:800;color:#1B4D3E;margin:0 0 0.5rem;line-height:1.4;">${data.press.headline}</h4>
        <p style="font-size:0.9rem;font-weight:600;color:#4B5563;font-style:italic;margin:0 0 0.85rem;border-left:3px solid #D4AF37;padding-left:0.75rem;">${data.press.sapo}</p>
        <div style="font-size:0.88rem;color:#374151;line-height:1.6;">${data.press.body}</div>
      </div>`;
    }

    container.innerHTML = `
      <div style="background:#fff;border-radius:18px;border:1.5px solid #1B4D3E;padding:1.25rem;box-shadow:0 10px 25px rgba(27,77,62,0.06);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.75rem;border-bottom:1px solid #E5E7EB;padding-bottom:0.85rem;margin-bottom:0.85rem;">
          <div>
            <span style="background:#DCFCE7;color:#166534;font-size:0.75rem;font-weight:800;padding:0.2rem 0.6rem;border-radius:999px;">CONTENT ENGINE V2 • 4K</span>
            <h3 style="font-size:1.25rem;font-weight:800;color:#1B4D3E;margin:0.35rem 0 0.15rem;">${data.title}</h3>
            <p style="font-size:0.82rem;color:#666;margin:0;">💡 <strong>Visual Hook:</strong> "${data.hook}"</p>
          </div>
          <button id="nvs-copy-btn" style="background:#1B4D3E;color:#fff;border:none;padding:0.45rem 0.9rem;border-radius:10px;font-size:0.82rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:0.35rem;">
            <span class="material-symbols-outlined" style="font-size:1rem;">content_copy</span>
            <span>Sao Chép Định Dạng</span>
          </button>
        </div>
        <div style="display:flex;gap:0.4rem;margin-bottom:1rem;background:#F0F5EE;padding:0.3rem;border-radius:10px;">
          <button id="nvs-tab-short" style="flex:1;padding:0.45rem;border:none;border-radius:8px;font-weight:700;font-size:0.8rem;cursor:pointer;background:${activeFormat === 'short' ? '#1B4D3E' : 'transparent'};color:${activeFormat === 'short' ? '#fff' : '#555'};">⚡ Video Ngắn 60s</button>
          <button id="nvs-tab-doc" style="flex:1;padding:0.45rem;border:none;border-radius:8px;font-weight:700;font-size:0.8rem;cursor:pointer;background:${activeFormat === 'doc' ? '#1B4D3E' : 'transparent'};color:${activeFormat === 'doc' ? '#fff' : '#555'};">🎥 Phóng Sự 10 Phút</button>
          <button id="nvs-tab-press" style="flex:1;padding:0.45rem;border:none;border-radius:8px;font-weight:700;font-size:0.8rem;cursor:pointer;background:${activeFormat === 'press' ? '#1B4D3E' : 'transparent'};color:${activeFormat === 'press' ? '#fff' : '#555'};">📰 Bài PR Báo Chí</button>
        </div>
        ${contentHtml}
      </div>
    `;

    ['short', 'doc', 'press'].forEach(fmt => {
      document.getElementById('nvs-tab-' + fmt).onclick = () => { activeFormat = fmt; renderScript(); };
    });

    document.getElementById('nvs-copy-btn').onclick = () => {
      const copyText = activeFormat === 'short'
        ? `🎬 KỊCH BẢN 60S: ${data.title}\nHOOK: ${data.hook}\n\n` + data.scenes.map((s, idx) => `[CẢNH ${idx+1}] (${s.time})\n- Góc máy: ${s.shot}\n- Lời thoại: "${s.voice}"\n- Âm thanh: ${s.audio}`).join('\n\n') + `\n\nThiết bị: ${data.gear}\nÂm nhạc: ${data.audioPrompt}`
        : activeFormat === 'doc'
        ? `🎥 PHÓNG SỰ 10 PHÚT: ${data.title}\n\n` + data.doc.map(a => `[${a.act}] ${a.title}\n${a.desc}`).join('\n\n')
        : `📰 BÀI PR: ${data.press.headline}\n\nSAPO: ${data.press.sapo}\n\nNỘI DUNG:\n${data.press.body}`;
      navigator.clipboard.writeText(copyText);
      alert('Đã sao chép nội dung kịch bản vào clipboard!');
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

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', window.initNativeVibeStudio) : window.initNativeVibeStudio();
})();
