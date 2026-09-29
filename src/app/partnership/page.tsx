import React from 'react';
import Link from 'next/link';
import RoiCalculator from '@/components/partnership/RoiCalculator';

export const metadata = {
  title: 'Hợp Tác Sáng Lập: Sa Đéc & Cao Lãnh Marketing Hub',
  description: 'Bản đề án hợp tác độc quyền dành cho Đội ngũ Quay Dựng Video & Cinematography — Xây dựng đế chế Marketing Văn hóa Bản địa tại Đồng Tháp.',
};

export default function PartnershipPage() {
  return (
    <div className="min-h-screen bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-[var(--md-sys-color-surface)]/90 backdrop-blur-md border-b border-[var(--md-sys-color-outline-variant)] py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-[var(--md-sys-color-primary)]">
            <span>🌾</span>
            <span>SA ĐÉC & CAO LÃNH MARKETING HUB</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] px-3 py-1 rounded-full font-medium">
              Tài liệu nội bộ Co-Founder
            </span>
            <a
              href="#appointment"
              className="px-4 py-2 rounded-full bg-[var(--md-sys-color-primary)] text-white text-xs font-semibold hover:shadow-md transition-all"
            >
              Hẹn Cafe Ngay
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-8 overflow-hidden bg-gradient-to-b from-[#1B4D3E]/10 via-transparent to-transparent">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs sm:text-sm font-semibold mb-6">
            🤝 THƯ NGỎ HỢP TÁC SÁNG LẬP — MEKONG 2026
          </span>
          <h1 className="m3-display-medium sm:m3-display-large font-light mb-6 text-[var(--md-sys-color-on-surface)] leading-tight">
            Biến Tài Năng Quay Phim & Thiết Bị Sẵn Có <br />
            <span className="font-semibold text-[var(--md-sys-color-primary)]">
              Thành Doanh Nghiệp 2.7 Tỷ/Năm Tại Đồng Tháp
            </span>
          </h1>
          <p className="m3-body-large text-[var(--md-sys-color-on-surface-variant)] max-w-3xl mx-auto mb-10 leading-relaxed">
            Gửi anh em đội ngũ quay chụp cưới & sự kiện thể thao: Chúng ta không bỏ nghề truyền thống, mà dùng công nghệ Mekong CLI và mô hình Agency đa tầng để <strong>thoát khỏi cảnh cày cuốc theo mùa vụ</strong>, biến mỗi shot quay thành tài sản sinh lời dài hạn!
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#calculator"
              className="px-8 py-3.5 rounded-full bg-[var(--md-sys-color-primary)] text-white font-semibold text-sm hover:shadow-lg transition-all"
            >
              Xem Bảng Tính Dòng Tiền ROI 👇
            </a>
            <a
              href="#safety"
              className="px-8 py-3.5 rounded-full border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] font-semibold text-sm hover:bg-gray-50 transition-all"
            >
              Điều Khoản An Toàn Thiết Bị
            </a>
          </div>
        </div>
      </section>

      {/* Nỗi đau & Cơ hội đối sánh */}
      <section className="py-16 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="m3-headline-medium font-normal mb-3">
            Sự Khác Biệt Khi Bắt Tay Cùng Nhau
          </h2>
          <p className="m3-body-medium text-[var(--md-sys-color-on-surface-variant)] max-w-2xl mx-auto">
            Tại sao tiếp tục làm thợ chụp đám cưới đơn lẻ sẽ ngày càng vất vả, trong khi cùng lập Agency sẽ giúp anh em tự do tài chính?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Cột cũ: Làm độc lập */}
          <div className="bg-red-50/50 rounded-[var(--md-sys-shape-corner-large)] p-6 sm:p-8 border border-red-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
                ❌
              </span>
              <h3 className="m3-title-large font-bold text-red-900">
                Nghề Cưới Đơn Lẻ (Hiện Tại)
              </h3>
            </div>
            <ul className="space-y-4 text-sm text-red-800">
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>Tháng ăn không hết, tháng lần không ra:</strong> Mùa mưa hoặc tháng kiêng cưới thì ngồi chơi, tiền mặt bằng và nuôi thợ vẫn phải trả đều.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>Bị ép giá, cạnh tranh khốc liệt:</strong> Nhiều nhóm trẻ mới vào nghề nhận giá rẻ mạt, khiến biên lợi nhuận ngày càng mỏng.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>Giới hạn bởi sức người:</strong> Ngày nào không vác máy đi quay là ngày đó không có tiền. Quay xong về thức trắng đêm tự cắt ghép dựng clip.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>Bỏ lỡ khách quen:</strong> Chủ vựa trái cây, chủ tiệm vàng nhờ quản lý kênh TikTok, làm web... nhưng không dám nhận vì thiếu chuyên môn.</span>
              </li>
            </ul>
          </div>

          {/* Cột mới: Bắt tay lập Hub */}
          <div className="bg-green-50/60 rounded-[var(--md-sys-shape-corner-large)] p-6 sm:p-8 border border-green-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-lg">
                ✅
              </span>
              <h3 className="m3-title-large font-bold text-green-900">
                Bắt Tay Lập Hub Agency (2026)
              </h3>
            </div>
            <ul className="space-y-4 text-sm text-green-900">
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>Doanh thu đa tầng quanh năm:</strong> Mùa cưới có show cưới; mùa mưa có khách Agency OCOP (15-25tr/tháng) và đào tạo học viện.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>Bán trọn gói giá trị cao:</strong> Không bán clip lẻ tẻ, bán trọn bộ "Nhận diện + Web + 30 Video xây kênh", thu tiền tươi 15 – 35 triệu/hợp đồng.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>Công nghệ AI gánh việc hậu kỳ:</strong> Toàn bộ việc viết kịch bản, dựng web, chạy quảng cáo, phụ đề tự động... đã có Mekong CLI lo.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span><strong>Thu nhập 3 tầng minh bạch:</strong> Có lương cứng mỗi tháng + Tiền show trực tiếp + Cổ tức lợi nhuận ròng cuối năm &gt; 600 triệu!</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Phân vai sáng lập */}
      <section className="py-16 px-4 sm:px-8 bg-[var(--md-sys-color-surface-container-low)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="m3-headline-medium font-normal mb-3">
              Phân Chia Vai Trò Sáng Lập Minh Bạch
            </h2>
            <p className="m3-body-medium text-[var(--md-sys-color-on-surface-variant)]">
              Mỗi bên làm đúng thứ mình giỏi nhất — Không giẫm chân lên nhau, cùng hướng tới mục tiêu chung:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-[var(--md-sys-shape-corner-large)] border border-[var(--md-sys-color-outline-variant)]">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="m3-title-large font-bold text-[var(--md-sys-color-primary)] mb-2">
                VAI TRÒ CỦA ANH EM (CHIEF PRODUCTION / CPO)
              </h3>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-4">
                Sở hữu 45% – 50% Cổ phần Sáng lập
              </p>
              <ul className="space-y-3 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✔</span>
                  <span>Đạo diễn hình ảnh, chỉ đạo bấm máy 4K cho toàn bộ dự án.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✔</span>
                  <span>Quản lý hệ thống máy quay, flycam, gimbal, ánh sáng.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✔</span>
                  <span>Quyết định quy chuẩn thẩm mỹ, tone màu và chất lượng video cuối cùng.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✔</span>
                  <span>Dẫn dắt các chuyến điền dã thực tế và hướng dẫn thợ phụ.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-[var(--md-sys-shape-corner-large)] border border-[var(--md-sys-color-outline-variant)]">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="m3-title-large font-bold text-[var(--md-sys-color-primary)] mb-2">
                VAI TRÒ CỦA TÔI (TECH, GROWTH & CEO)
              </h3>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-4">
                Sở hữu 50% – 55% Cổ phần Sáng lập
              </p>
              <ul className="space-y-3 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✔</span>
                  <span>Chiến lược kinh doanh, săn tìm và ký hợp đồng khách hàng B2B.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✔</span>
                  <span>Xây dựng hệ thống Web, Zalo Mini App, Automation bằng Mekong CLI.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✔</span>
                  <span>Quản lý dòng tiền, thuế, kế toán, hóa đơn và hợp đồng pháp lý.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✔</span>
                  <span>Thiết kế giáo trình và đứng lớp đào tạo khóa học AI / Vibe Coding.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Calculator Section */}
      <section id="calculator" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <RoiCalculator />
      </section>

      {/* Điều khoản an toàn (Safety Net) */}
      <section id="safety" className="py-16 px-4 sm:px-8 bg-[var(--md-sys-color-surface-container)] border-t border-[var(--md-sys-color-outline-variant)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] px-3 py-1 rounded-full">
              🛡️ CAM KẾT VÀNG TỪ LEAD FOUNDER
            </span>
            <h2 className="m3-headline-medium font-normal mt-3 mb-2">
              Điều Khoản Bảo Vệ Tài Sản & Tự Do Cho Anh Em
            </h2>
            <p className="m3-body-medium text-[var(--md-sys-color-on-surface-variant)]">
              Không có chuyện "góp gạo thổi cơm chung" rồi mất trắng. Mọi thứ được ghi rõ vào văn bản nguyên tắc trước khi bấm máy:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="bg-white p-6 rounded-[var(--md-sys-shape-corner-medium)] border border-[var(--md-sys-color-outline-variant)]">
              <div className="text-2xl mb-2">📷</div>
              <h4 className="font-bold text-base mb-2">1. Máy Móc Của Ai Vẫn Là Của Người Đó</h4>
              <p className="text-[var(--md-sys-color-on-surface-variant)]">
                Dàn máy ảnh, flycam, lens của anh em được định giá góp vốn hoặc công ty thuê lại hàng tháng. Nếu dừng hợp tác, anh em mang nguyên vẹn thiết bị về!
              </p>
            </div>

            <div className="bg-white p-6 rounded-[var(--md-sys-shape-corner-medium)] border border-[var(--md-sys-color-outline-variant)]">
              <div className="text-2xl mb-2">👥</div>
              <h4 className="font-bold text-base mb-2">2. Khách Hàng Cũ Được Giữ Nguyên</h4>
              <p className="text-[var(--md-sys-color-on-surface-variant)]">
                Toàn bộ tệp khách hàng quen thuộc của anh em từ trước đến nay vẫn thuộc quyền sở hữu riêng của anh em, công ty chỉ hỗ trợ nâng giá trị show lên.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[var(--md-sys-shape-corner-medium)] border border-[var(--md-sys-color-outline-variant)]">
              <div className="text-2xl mb-2">⏳</div>
              <h4 className="font-bold text-base mb-2">3. Thử Nghiệm 6 Tháng (Probation)</h4>
              <p className="text-[var(--md-sys-color-on-surface-variant)]">
                Chạy thử 6 tháng. Nếu thấy không hợp phong cách làm việc hoặc dòng tiền không đúng như cam kết, hai bên vui vẻ bắt tay chia lợi nhuận và dừng lại trong hòa bình.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment CTA */}
      <section id="appointment" className="py-20 px-4 sm:px-8 text-center max-w-4xl mx-auto">
        <h2 className="m3-headline-large font-normal mb-4">
          Anh Em Mình Làm Một Ly Cà Phê Nhé?
        </h2>
        <p className="m3-body-large text-[var(--md-sys-color-on-surface-variant)] mb-8 max-w-2xl mx-auto">
          Ngồi lại tại TP. Cao Lãnh để xem trực tiếp các bản thiết kế, hệ thống code tự động và cùng bàn bạc chi tiết kế hoạch cho mùa cưới & mùa hoa Tết sắp tới.
        </p>

        <div className="inline-flex flex-col sm:flex-row gap-4 p-4 bg-[var(--md-sys-color-surface-container-high)] rounded-[var(--md-sys-shape-corner-large)] border border-[var(--md-sys-color-outline-variant)] shadow-sm">
          <a
            href="tel:0900000000"
            className="px-8 py-3.5 rounded-full bg-[var(--md-sys-color-primary)] text-white font-bold text-sm hover:shadow-lg transition-all"
          >
            📞 Gọi Cho Tôi Ngay (Hotline)
          </a>
          <a
            href="https://zalo.me"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 rounded-full bg-[#0068FF] text-white font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>💬 Nhắn Zalo Trao Đổi</span>
          </a>
        </div>

        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-4">
          Địa điểm gặp mặt: Quán Cafe bờ kè thoáng mát, TP. Cao Lãnh, Đồng Tháp.
        </p>
      </section>
    </div>
  );
}
