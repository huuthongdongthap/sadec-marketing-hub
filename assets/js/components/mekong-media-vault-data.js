/**
 * Mekong Media Vault 4K Data - Kho Footage Bản Quyền Bản Địa Đồng Tháp (< 200 dòng/file).
 */
(function() {
  const LICENSE_TIERS = {
    social: { id: 'social', name: 'MXH & Sáng Tạo Cá Nhân', price: 490000, desc: 'Phục vụ dựng video TikTok, Reels, YouTube cá nhân. Không chạy ads trả phí.' },
    commercial: { id: 'commercial', name: 'Thương Mại & Digital Ads', price: 1890000, desc: 'Dành cho Doanh nghiệp, SMEs OCOP chạy Ads, Website, Chiến dịch Digital Marketing.' },
    exclusive: { id: 'exclusive', name: 'Độc Quyền TVC & Điện Ảnh', price: 4900000, desc: 'Độc quyền phát sóng Truyền hình, Phóng sự tài liệu 4K, Phim điện ảnh thương mại.' }
  };

  const FOOTAGE_ITEMS = [
    {
      id: 'FT-TRC-01',
      title: 'Bình Minh Tràm Chim - Sen & Đàn Cò Trắng Bay Lượn',
      region: 'Đô thị Tam Nông',
      specs: '4K 60fps • 10-bit S-Log3 • Sony FX3',
      duration: '00:24',
      lens: 'Sony FE 70-200mm f/2.8 GM OSS II',
      category: 'nature',
      desc: 'Toàn cảnh sương sớm bốc lên từ đầm sen cổ thụ, đàn chim cất cánh trên nền rạng đông hồng rực.',
      tags: ['Tràm Chim', 'Bình Minh', 'Đầm Sen', 'Thiên Nhiên']
    },
    {
      id: 'FT-SAD-02',
      title: 'Giàn Tre Hoa Sa Đéc Rạng Đông Phù Sa',
      region: 'TP. Sa Đéc',
      specs: '4K 120fps Slow-mo • DCI 4K • FPV Drone',
      duration: '00:32',
      lens: 'FPV Cinewhoop 6S + GoPro 12 Black 5.3K Raw',
      category: 'heritage',
      desc: 'Cú lượn FPV mượt mà luồn dưới những giàn tre hoa mâm xôi ngập nước đặc trưng Sa Đéc.',
      tags: ['Làng Hoa', 'Sa Đéc', 'FPV Drone', 'Giàn Tre']
    },
    {
      id: 'FT-DY-03',
      title: 'Lò Nhuộm Lác & Chợ Ma Định Yên Lúc Nửa Đêm',
      region: 'Đô thị Lấp Vò',
      specs: '4K 24fps Cinematic • Cine Tone Low-light',
      duration: '00:18',
      lens: 'Sony FE 35mm f/1.4 GM',
      category: 'heritage',
      desc: 'Khói lam chiều hòa trong sắc đỏ tím của những bó lác nhuộm màu chuẩn bị cho phiên Chợ Ma Định Yên.',
      tags: ['Định Yên', 'Dệt Chiếu', 'Di Sản', 'Chợ Ma']
    },
    {
      id: 'FT-CL-04',
      title: 'Cận Cảnh Thu Hoạch Xoài Cát Chu Cổ Thụ Mỹ Xương',
      region: 'TP. Cao Lãnh',
      specs: '4K 60fps Macro • True Color LUT',
      duration: '00:20',
      lens: 'Sony FE 90mm f/2.8 Macro G OSS',
      category: 'agriculture',
      desc: 'Giọt sương sớm đọng trên lớp phấn trắng mịn của quả xoài Cát Chu chuẩn OCOP 5 sao.',
      tags: ['Xoài Cát Chu', 'Cao Lãnh', 'Macro', 'OCOP']
    },
    {
      id: 'FT-LV-05',
      title: 'Gói Nem Lai Vung Thủ Công - Lớp Lá Chuối Xanh Mướt',
      region: 'Đô thị Lai Vung',
      specs: '4K 60fps High Bitrate • ASMR Visual',
      duration: '00:22',
      lens: 'Sony FE 50mm f/1.2 GM',
      category: 'cuisine',
      desc: 'Bàn tay thoăn thoắt của nghệ nhân 40 năm nghề gói từng chiếc nem vuông vắn thơm mùi tiêu sọ.',
      tags: ['Nem Lai Vung', 'Ẩm Thực', 'Thủ Công', 'Làng Nghề']
    },
    {
      id: 'FT-HN-06',
      title: 'Nghệ Nhân Dệt Khăn Rằn Nam Bộ Cù Lao Long Khánh',
      region: 'TP. Hồng Ngự',
      specs: '4K 60fps • S-Cinetone • Thoi Gỗ Chạy Nhịp Nhàng',
      duration: '00:28',
      lens: 'Sigma 24-70mm f/2.8 DG DN Art',
      category: 'heritage',
      desc: 'Tiếng thoi đưa lách cách bên khung cửi gỗ, dệt nên những dải khăn rằn mộc mạc biểu tượng miền Tây.',
      tags: ['Khăn Rằn', 'Long Khánh', 'Hồng Ngự', 'Dệt Vải']
    },
    {
      id: 'FT-TM-07',
      title: 'Bạt Ngàn Cánh Đồng Sen Trắng Tháp Mười Mùa Nở Rộ',
      region: 'Đô thị Tháp Mười',
      specs: '4K 30fps HDR • Dji Mavic 3 Cine ProRes HQ',
      duration: '00:35',
      lens: 'Hasselblad 4/3 CMOS 20MP',
      category: 'nature',
      desc: 'Góc máy từ cao 150m bao quát cánh đồng sen bách diệp trải dài tít tắp đến chân trời Đồng Tháp Mười.',
      tags: ['Tháp Mười', 'Đồng Sen', 'Flycam', 'Ecolotus']
    },
    {
      id: 'FT-ST-08',
      title: 'Hoàng Hôn Sông Tiền & Thuyền Đò Đón Khách Homestay',
      region: 'Vùng Mở Rộng Cao Lãnh',
      specs: '4K 60fps • Sunset Gold Grading',
      duration: '00:25',
      lens: 'Sony FE 24-105mm f/4 G OSS',
      category: 'tourism',
      desc: 'Mặt trời lặn nhuộm vàng dòng sông Tiền, chiếc xuồng ba lá lướt nhẹ qua những rặng bần cổ thụ.',
      tags: ['Sông Tiền', 'Hoàng Hôn', 'Homestay', 'Xuồng Ba Lá']
    }
  ];

  function formatPrice(num) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  }

  function getFootageById(id) {
    return FOOTAGE_ITEMS.find(f => f.id === id) || FOOTAGE_ITEMS[0];
  }

  window.MekongMediaVaultData = {
    LICENSE_TIERS,
    FOOTAGE_ITEMS,
    formatPrice,
    getFootageById
  };
})();
