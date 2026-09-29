import Link from 'next/link';

const experiences = [
  {
    id: 'tram-chim',
    title: 'Vườn Quốc Gia Tràm Chim',
    subtitle: 'Mùa nước nổi & Sếu đầu đỏ',
    image: '/images/tram-chim-hero.jpg',
    season: 'Tháng 8 - 11',
    price: '600.000 VNĐ',
    description: 'Chèo xuồng ba lá len lỏi giữa rừng tràm nguyên sinh, ngắm đồng sen, đồng súng ma và đoàn Sếu đầu đỏ huyền thoại.',
    link: '/experience/tram-chim'
  },
  {
    id: 'sa-dec-hoa',
    title: 'Làng Hoa Sa Đéc - Tân Quy Đông',
    subtitle: 'Nghề trồng hoa trên giàn tre 300 năm',
    image: '/images/sa-dec-hoa-hero.jpg',
    season: 'Tháng 12 - 1',
    price: '450.000 VNĐ',
    description: 'Trải nghiệm làm nghề cùng người chăm hoa, chèo xuồng giữa biển hoa cúc mâm xôi, hồng leo rực rỡ chuẩn bị đón Tết.',
    link: '/experience/sa-dec-hoa'
  },
  {
    id: 'gao-giong',
    title: 'Khu Du Lịch Sinh Thái Gáo Giồng',
    subtitle: 'Sân chim Đồng Tháp Mười',
    image: '/images/gao-giong-hero.jpg',
    season: 'Tháng 9 - 11',
    price: '550.000 VNĐ',
    description: 'Lên đài quan sát ngắm chim về tổ lúc hoàng hôn, câu cá giải trí, thưởng thức lẩu cá linh bông điên điển đặc trưng.',
    link: '/experience/gao-giong'
  },
  {
    id: 'cultural-heritage',
    title: 'Di Sản Sa Đéc: Nhà Cổ & Chùa Cổ',
    subtitle: 'Kiến trúc Pháp - Hoa & Thiên tình sử L\'Amant',
    image: '/images/heritage-hero.jpg',
    season: 'Cả năm',
    price: '300.000 VNĐ',
    description: 'Khám phá Nhà cổ Huỳnh Thủy Lê, Chùa Kiến An Cung, Làng bột trăm năm và thưởng thức hủ tiếu Sa Đéc chuẩn vị.',
    link: '/experience/heritage'
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--md-sys-color-surface)]">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B4D3E] via-[#0D2B1F] to-[#0A1F15] opacity-90" />
          <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-sm font-medium mb-6 animate-fade-in-up">
            🌾 SA ĐÉC MARKETING HUB — Đồng Tháp Miền Tây
          </span>

          <h1 className="m3-display-large text-white font-light tracking-tight mb-6 animate-fade-in-up delay-100">
            Về Đồng Tháp <br />
            <span className="font-medium text-[var(--md-sys-color-primary)]">Nghe Nước Kể Chuyện</span>
          </h1>

          <p className="m3-body-large text-white/90 max-w-3xl mx-auto mb-10 animate-fade-in-up delay-200">
            Khám phá vẻ đẹp trù phú của vùng đất Sen Hồng qua trải nghiệm bản địa chân thực:
            Mùa nước nổi Tràm Chim, Phố hoa Sa Đéc, Di sản văn hóa trăm năm.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <Link
              href="/experience"
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-medium text-base transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              Khám phá trải nghiệm
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            <Link
              href="/hub"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[var(--md-sys-shape-corner-full)] border-2 border-white/30 text-white font-medium text-base transition-all duration-300 hover:bg-white/10"
            >
              Tham gia Hub Agency
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-[var(--md-sys-color-surface-container)] border-y border-[var(--md-sys-color-outline-variant)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="m3-display-medium text-[var(--md-sys-color-primary)] font-light">100K+</div>
            <div className="m3-body-medium text-[var(--md-sys-color-on-surface-variant)]">Người theo dõi đa kênh</div>
          </div>
          <div>
            <div className="m3-display-medium text-[var(--md-sys-color-primary)] font-light">500+</div>
            <div className="m3-body-medium text-[var(--md-sys-color-on-surface-variant)]">Asset Media 4K bản quyền</div>
          </div>
          <div>
            <div className="m3-display-medium text-[var(--md-sys-color-primary)] font-light">20+</div>
            <div className="m3-body-medium text-[var(--md-sys-color-on-surface-variant)]">Agency liên kết ĐBSCL</div>
          </div>
          <div>
            <div className="m3-display-medium text-[var(--md-sys-color-primary)] font-light">1000+</div>
            <div className="m3-body-medium text-[var(--md-sys-color-on-surface-variant)]">Khách trải nghiệm/năm</div>
          </div>
        </div>
      </section>

      {/* Experiences Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="m3-headline-large text-[var(--md-sys-color-on-surface)] font-normal mb-4">
              Trải Nghiệm Bản Địa Độc Quyền
            </h2>
            <p className="m3-body-large text-[var(--md-sys-color-on-surface-variant)] max-w-2xl mx-auto">
              Mỗi hành trình được thiết kế bởi người địa phương, mang đậm hồn phù sa và nét văn hóa không thể sao chép.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {experiences.map((exp) => (
              <Link
                key={exp.id}
                href={exp.link}
                className="group relative block bg-[var(--md-sys-color-surface-container)] rounded-[var(--md-sys-shape-corner-large)] overflow-hidden border border-[var(--md-sys-color-outline-variant)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="aspect-video relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-medium">
                      {exp.season}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-3 py-1.5 rounded-full bg-white/90 text-[var(--md-sys-color-on-surface)] text-sm font-medium">
                      {exp.price}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="m3-headline-small text-[var(--md-sys-color-on-surface)] font-medium mb-2 group-hover:text-[var(--md-sys-color-primary)] transition-colors">
                    {exp.title}
                  </h3>
                  <p className="m3-body-small text-[var(--md-sys-color-on-surface-variant)] mb-3 line-clamp-2">
                    {exp.subtitle}
                  </p>
                  <p className="m3-body-medium text-[var(--md-sys-color-on-surface)] line-clamp-3 mb-4">
                    {exp.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--md-sys-color-outline-variant)]">
                    <span className="text-sm font-medium text-[var(--md-sys-color-primary)] group-hover:underline">
                      Xem chi tiết
                    </span>
                    <svg className="w-5 h-5 text-[var(--md-sys-color-primary)] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hub Value Proposition */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--md-sys-color-surface-container-low)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="m3-headline-large text-[var(--md-sys-color-on-surface)] font-normal mb-6">
                Hơn Một Công Ty Marketing — Là Hệ Sinh Thái Văn Hóa
              </h2>
              <div className="space-y-6">
                {[
                  { icon: '🎬', title: 'Agency Thực Chiến', desc: 'Nhận đặt hàng chiến dịch marketing bản địa cho thương hiệu muốn "chạm đất" Mekong Delta. Từ ý tưởng đến sản xuất 4K, chạy quảng cáo đa kênh.' },
                  { icon: '📺', title: 'Owned Media IP House', desc: 'Tự xây kênh YouTube/TikTok triệu view kể chuyện mùa nước nổi, hoa kiểng, ẩm thực, di sản. Sở hữu kho Media 4K lớn nhất vùng.' },
                  { icon: '🎓', title: 'Academy & Vibe Coding Hub', desc: 'Đào tạo Marketers tại ĐBSCL ứng dụng AI & Vibe Coding tạo Landing Page, Zalo Mini App, Automation trong 48h.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-[var(--md-sys-color-surface)] rounded-[var(--md-sys-shape-corner-large)] border border-[var(--md-sys-color-outline-variant)]">
                    <span className="text-3xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <h3 className="m3-title-large text-[var(--md-sys-color-on-surface)] font-medium mb-1">{item.title}</h3>
                      <p className="m3-body-medium text-[var(--md-sys-color-on-surface-variant)]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="p-6 bg-[var(--md-sys-color-surface)] rounded-[var(--md-sys-shape-corner-large)] border border-[var(--md-sys-color-outline-variant)]">
                  <h3 className="m3-title-large text-[var(--md-sys-color-on-surface)] font-medium mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-sm font-bold">🛠</span>
                    Công Cụ MarTech Hub
                  </h3>
                  <ul className="space-y-3 text-sm">
                    {[
                      'Mekong Media Vault (10TB+ 4K)',
                      'Hương Sen AI Scriptwriter',
                      'Local Booking Configurator',
                      'Zalo Connect & QR Generator',
                      'n8n Automation Workflows',
                      'Vibe Coding Playground'
                    ].map((tool, i) => (
                      <li key={i} className="flex items-center gap-2 text-[var(--md-sys-color-on-surface-variant)]">
                        <svg className="w-4 h-4 text-[var(--md-sys-color-primary)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 bg-[var(--md-sys-color-primary)] rounded-[var(--md-sys-shape-corner-large)] text-[var(--md-sys-color-on-primary)]">
                  <h3 className="m3-title-large font-medium mb-3">Tham gia Mekong Agency Alliance</h3>
                  <p className="mb-4 opacity-90">Kết nối 20+ Agency tại Đồng Bằng Sông Cửu Long. Chia sẻ tài nguyên, hợp tác thầu dự án lớn, đào tạo cùng nhau.</p>
                  <Link
                    href="/hub/join"
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-medium transition-all hover:shadow-lg"
                  >
                    Đăng ký trở thành Partner
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="m3-headline-large text-[var(--md-sys-color-on-surface)] font-normal mb-6">
            Sẵn Sàng Khám Phá Miền Tây Chân Thật?
          </h2>
          <p className="m3-body-large text-[var(--md-sys-color-on-surface-variant)] mb-8 max-w-2xl mx-auto">
            Hãy để Sa Đéc Marketing Hub dẫn dắt bạn chạm tay vào vẻ đẹp thô sơ, nhân văn và đầy cảm xúc của Đồng Tháp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-medium"
            >
              Liên hệ hợp tác
            </Link>
            <Link
              href="/booking"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[var(--md-sys-shape-corner-full)] border-2 border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] font-medium hover:bg-[var(--md-sys-color-surface-container)]"
            >
              Đặt trải nghiệm ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-[var(--md-sys-color-surface-container)] border-t border-[var(--md-sys-color-outline-variant)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="m3-title-medium text-[var(--md-sys-color-on-surface)] font-medium mb-4">SA ĐÉC MARKETING HUB</h4>
              <p className="m3-body-small text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                Đại bản doanh Sa Đéc, Đồng Tháp — Thủ phủ Hoa Kiểng, Vùng Đất Sen Hồng.
                Kiến tạo giá trị văn hóa Mekong bằng Sáng tạo Nội dung + Công nghệ AI.
              </p>
            </div>
            <div>
              <h4 className="m3-title-medium text-[var(--md-sys-color-on-surface)] font-medium mb-4">Trải Nghiệm</h4>
              <ul className="space-y-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                <li><Link href="/experience/tram-chim" className="hover:text-[var(--md-sys-color-primary)] transition-colors">Tràm Chim Mùa Nước Nổi</Link></li>
                <li><Link href="/experience/sa-dec-hoa" className="hover:text-[var(--md-sys-color-primary)] transition-colors">Làng Hoa Sa Đéc</Link></li>
                <li><Link href="/experience/gao-giong" className="hover:text-[var(--md-sys-color-primary)] transition-colors">Gáo Giồng Sân Chim</Link></li>
                <li><Link href="/experience/heritage" className="hover:text-[var(--md-sys-color-primary)] transition-colors">Di Sản Văn Hóa Sa Đéc</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="m3-title-medium text-[var(--md-sys-color-on-surface)] font-medium mb-4">Dịch Vụ</h4>
              <ul className="space-y-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                <li><Link href="/services/agency" className="hover:text-[var(--md-sys-color-primary)] transition-colors">Dịch Vụ Agency B2B</Link></li>
                <li><Link href="/services/booking" className="hover:text-[var(--md-sys-color-primary)] transition-colors">Booking Tour Bản Địa</Link></li>
                <li><Link href="/academy" className="hover:text-[var(--md-sys-color-primary)] transition-colors">Khóa Học & Đào Tạo</Link></li>
                <li><Link href="/hub/join" className="hover:text-[var(--md-sys-color-primary)] transition-colors">Tham Gia Liên Minh</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="m3-title-medium text-[var(--md-sys-color-on-surface)] font-medium mb-4">Liên Hệ</h4>
              <ul className="space-y-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                <li>📍 Sa Đéc, Đồng Tháp, Việt Nam</li>
                <li>📞 Hotline: 0277.xxx.xxx</li>
                <li>✉️ hello@sadecmarketinghub.vn</li>
                <li>🌐 github.com/huuthongdongthap/sadec-marketing-hub</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[var(--md-sys-color-outline-variant)] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="m3-body-small text-[var(--md-sys-color-on-surface-variant)]">
              © 2025 Sa Đéc Marketing Hub. Bản quyền kiến trúc thuộc về Mekong Delta Innovation Project.
            </p>
            <div className="flex gap-6">
              <a href="https://facebook.com" className="text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://tiktok.com" className="text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors" aria-label="TikTok">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3C6.477 3 2 7.477 2 13c0 1.78.488 3.44 1.309 4.845L2 22l5.157-1.87A9.967 9.967 0 0012 21c5.523 0 10-4.477 10-10S17.523 3 12 3zm5.521 16.34c-.154.318-.412.554-.72.644-.368.106-.752.083-1.038-.057l-2.056-1.03c-.458-.23-1.047-.23-1.522 0l-1.383.696c-.416.208-.831.162-1.143-.114-.368-.326-.478-.829-.347-1.2.137-.384.375-.704.689-.959.684-.55 1.633-1.047 2.474-1.17.878-.13 1.736-.06 2.524.21.86.294 1.548.822 1.865 1.537.287.645.135 1.32-.36 1.834zm1.148-5.62c0 .23-.03.46-.083.684-.07.296-.182.563-.34.772-.174.233-.386.424-.636.572-.288.174-.607.305-.958.392-.352.09-.69.135-1.015.135-.406 0-.787-.06-1.143-.182-.373-.127-.708-.305-.98-.54-.256-.233-.454-.506-.593-.82-.14-.315-.208-.656-.208-1.025 0-.39.07-.752.208-1.085.14-.315.34-.58.593-.82.27-.235.605-.406.98-.54.355-.122.736-.182 1.143-.182.327 0 .664.045 1.015.135.35.087.669.218.958.392.25.148.462.339.636.572.158.208.27.475.34.772.053.224.08.454.08.684zm-2.598-7.46c-.597 0-1.113.118-1.547.355-.435.237-.78.586-1.033 1.05-.253.463-.38.99-.38 1.58v3.457h-1.5V13.5c0-.876.174-1.614.52-2.214.347-.6.808-.902 1.382-.902.53 0 .987.14 1.37.42.384.28.576.69.576 1.23v3.8h2.005v-3.8c0-.615-.16-1.13-.48-1.545-.32-.415-.76-.623-1.32-.623z"/></svg>
              </a>
              <a href="https://youtube.com" className="text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors" aria-label="YouTube">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L16.248 12 9.545 15.568z"/></svg>
              </a>
              <a href="https://github.com/huuthongdongthap/sadec-marketing-hub" className="text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}