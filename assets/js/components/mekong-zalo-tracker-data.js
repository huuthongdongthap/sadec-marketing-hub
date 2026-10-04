/**
 * Mekong Zalo Tracker Data & Constants (Cao Lãnh 2026)
 * Lưu trữ danh mục các bước quy trình tour và dữ liệu booking đối soát thực địa.
 */
(() => {
  window.MekongTrackerData = {
    BOOKING_STAGES: [
      { id: 'booking', label: 'Đã Đặt Lịch', icon: 'event_available', color: '#0284C7', step: 1, desc: 'Khách xác nhận lịch & cọc 50% qua VietQR' },
      { id: 'crew-assigned', label: 'Đã Phân Công Ekip', icon: 'groups', color: '#059669', step: 2, desc: 'Co-founder ekip nhận nhiệm vụ & check thiết bị' },
      { id: 'filming', label: 'Đang Quay Thực Địa', icon: 'videocam', color: '#B25E00', step: 3, desc: 'Ekip đang tại điểm: Drone, Macro, Phỏng vấn' },
      { id: 'editing', label: 'Đang Biên Tập 4K', icon: 'edit', color: '#7C3AED', step: 4, desc: 'Post-production: Color Grade S-Log3, Sound Design' },
      { id: 'review', label: 'Chờ Duyệt Khách', icon: 'visibility', color: '#DC2626', step: 5, desc: 'Gửi link xem trước (unlisted) cho khách phê duyệt' },
      { id: 'delivered', label: 'Đã Bàn Giao', icon: 'check_circle', color: '#15803D', step: 6, desc: 'File gốc 4K + Video 60s + Album ảnh ấn định' },
      { id: 'payout-pending', label: 'Chờ Giải Ngân', icon: 'payments', color: '#D97706', step: 7, desc: 'Hệ thống chuẩn bị chuyển khoản VietQR 24h' },
      { id: 'payout-done', label: 'Đã Giải Ngân', icon: 'verified', color: '#059669', step: 8, desc: 'Homestay/Đối tác nhận tiền, cập nhật sổ cái' }
    ],
    MOCK_BOOKINGS: [
      {
        id: 'MB-20261004-001',
        tour: 'Boutique Cinema Tour 1 Ngày',
        location: 'Làng Hoa Sa Đéc + Vườn Quýt Lai Vung',
        customer: 'Nguyễn Thị Lan Anh',
        phone: '0901234567',
        homestay: 'Homestay Sen Vàng Cao Lãnh',
        homestayPhone: '0939123456',
        status: 'filming',
        createdAt: '2026-10-04 06:30',
        crew: 'Ekip Alpha (3 người)',
        deposit: 3250000,
        total: 6500000,
        homestayShare: 1950000,
        crewShare: 2275000,
        equipmentShare: 1300000,
        hubShare: 975000,
        timeline: [
          { stage: 'booking', time: '2026-10-04 06:30', note: 'Khách đặt lịch qua Web, cọc 50% VietQR' },
          { stage: 'crew-assigned', time: '2026-10-04 06:45', note: 'Ekip Alpha nhận nhiệm vụ, check FX3 + Drone' },
          { stage: 'filming', time: '2026-10-04 07:15', note: 'Đang tại Làng Hoa Sa Đéc: FPV giàn hoa + phỏng vấn nghệ nhân' }
        ]
      },
      {
        id: 'MB-20261004-002',
        tour: 'Ký Sự Điện Ảnh 2N1Đ Homestay',
        location: 'Homestay Cát Chu Cao Lãnh + Gáo Giồng',
        customer: 'Trần Minh Hoàng',
        phone: '0912345678',
        homestay: 'Homestay Xoài Cát Chu',
        homestayPhone: '0987654321',
        status: 'editing',
        createdAt: '2026-10-03 14:20',
        crew: 'Ekip Bravo (4 người)',
        deposit: 6000000,
        total: 12000000,
        homestayShare: 3600000,
        crewShare: 4200000,
        equipmentShare: 2400000,
        hubShare: 1800000,
        timeline: [
          { stage: 'booking', time: '2026-10-03 14:20', note: 'Khách đặt 2N1Đ Homestay, cọc 50%' },
          { stage: 'crew-assigned', time: '2026-10-03 15:00', note: 'Ekip Bravo nhận, bổ sung Mic Rode Wireless' },
          { stage: 'filming', time: '2026-10-03 16:30', note: 'Quay xong Ngày 1: Homestay + Vườn xoài' },
          { stage: 'filming', time: '2026-10-04 05:30', note: 'Quay xong Ngày 2: Gáo Giồng + Sunset sông' },
          { stage: 'editing', time: '2026-10-04 09:00', note: 'Đang Color Grade LUT Phù Sa, Sound Lofi' }
        ]
      },
      {
        id: 'MB-20261003-003',
        tour: 'Quay Thực Địa Xưởng OCOP 4K',
        location: 'Làng Bột Sa Đéc + Nem Lai Vung',
        customer: 'Cơ sở OCOP Bà Năm',
        phone: '0923456789',
        homestay: 'Làng Nghề Bột Sa Đéc',
        homestayPhone: '0978123456',
        status: 'payout-done',
        createdAt: '2026-10-01 09:00',
        crew: 'Ekip Charlie (2 người)',
        deposit: 4250000,
        total: 8500000,
        homestayShare: 2550000,
        crewShare: 2975000,
        equipmentShare: 1700000,
        hubShare: 1275000,
        timeline: [
          { stage: 'booking', time: '2026-10-01 09:00', note: 'OCOP Bà Năm đặt quay 3 video 4K cho sàn TMĐT' },
          { stage: 'crew-assigned', time: '2026-10-01 09:30', note: 'Ekip Charlie nhận, Macro Lens 90mm' },
          { stage: 'filming', time: '2026-10-01 10:00', note: 'Quay xong xưởng bột & lò nem, phỏng vấn' },
          { stage: 'editing', time: '2026-10-01 14:00', note: 'Hoàn tất 3 video 4K + 3 teaser 15s' },
          { stage: 'review', time: '2026-10-02 10:00', note: 'Bà Năm duyệt, duyệt màu vàng rực rỡ' },
          { stage: 'delivered', time: '2026-10-02 14:00', note: 'Gửi Drive link file gốc 4K' },
          { stage: 'payout-pending', time: '2026-10-02 14:05', note: 'Trigger VietQR payout cho 3 bên' },
          { stage: 'payout-done', time: '2026-10-02 14:10', note: 'Giải ngân: Homestay 2.55M, Ekip 2.97M, Hub 1.27M' }
        ]
      }
    ],
    formatVND(n) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
    },
    getCurrentStageInfo(status) {
      return this.BOOKING_STAGES.find(s => s.id === status) || this.BOOKING_STAGES[0];
    }
  };
})();