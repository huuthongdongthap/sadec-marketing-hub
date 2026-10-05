/**
 * Mekong Settlement Webhook Data & Calculations
 * Kiến trúc đối soát giải ngân tự động qua Webhook SePay / MBBank 24/7
 * Tuân thủ nghiêm ngặt quy tắc modularity (< 200 dòng/file).
 */
(function() {
  const SPLIT_RULES = {
    homestay: { rate: 0.30, label: 'Homestay / Nhà Vườn Bản Địa', beneficiary: 'Cơ sở sinh thái đón đoàn' },
    crew: { rate: 0.35, label: 'Ekip Sản Xuất 4K Co-Founder', beneficiary: 'Đội ngũ quay phim, đạo diễn' },
    gear: { rate: 0.20, label: 'Khấu Hao Thiết Bị & Hậu Cần', beneficiary: 'Quỹ nâng cấp máy quay, drone, di chuyển' },
    hubFund: { rate: 0.15, label: 'Quỹ Phát Triển AI Hub & Khuyến Nông', beneficiary: 'Hạ tầng server, đào tạo nông dân số' }
  };

  const MOCK_WEBHOOKS = [
    {
      id: 'WH-8901',
      gateway: 'MBBank / Napas 24/7',
      orderId: 'HUB-TOUR-SD01',
      orderDesc: 'Boutique Cinema Tour Sa Đéc 1 Ngày',
      amount: 3250000,
      payerName: 'LÊ HOÀNG NAM',
      payerPhone: '0918.456.789',
      status: 'settled',
      signature: 'hmac_sha256_mb_9a8f2c710',
      txTime: '14:20 05/10/2026',
      txRef: 'FT2627891234501'
    },
    {
      id: 'WH-8902',
      gateway: 'SePay Auto Hook',
      orderId: 'HUB-OCOP-LV02',
      orderDesc: 'Phóng Sự 4K Xưởng Nem Lai Vung OCOP',
      amount: 8500000,
      payerName: 'TRẦN VĂN ĐỨC',
      payerPhone: '0903.112.334',
      status: 'settled',
      signature: 'hmac_sha256_sp_4b7e1ae89',
      txTime: '09:15 05/10/2026',
      txRef: 'FT2627889812402'
    },
    {
      id: 'WH-8903',
      gateway: 'MBBank / Napas 24/7',
      orderId: 'HUB-HOMESTAY-CL03',
      orderDesc: 'Ký Sự Điện Ảnh 2N1Đ Homestay Cao Lãnh',
      amount: 6000000,
      payerName: 'NGUYỄN MAI TRANG',
      payerPhone: '0989.654.321',
      status: 'settled',
      signature: 'hmac_sha256_mb_3c2d1e564',
      txTime: '16:45 04/10/2026',
      txRef: 'FT2627876543103'
    }
  ];

  function formatVnd(val) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  }

  function calculateSplit(amount) {
    const homestay = Math.round(amount * SPLIT_RULES.homestay.rate);
    const crew = Math.round(amount * SPLIT_RULES.crew.rate);
    const gear = Math.round(amount * SPLIT_RULES.gear.rate);
    const hubFund = amount - homestay - crew - gear; // chuẩn hóa số dư
    return {
      total: amount,
      homestay: { amount: homestay, percent: '30%', ...SPLIT_RULES.homestay },
      crew: { amount: crew, percent: '35%', ...SPLIT_RULES.crew },
      gear: { amount: gear, percent: '20%', ...SPLIT_RULES.gear },
      hubFund: { amount: hubFund, percent: '15%', ...SPLIT_RULES.hubFund }
    };
  }

  function generateWebhookId() {
    return 'WH-' + Math.floor(1000 + Math.random() * 9000);
  }

  function generateTxRef() {
    return 'FT' + Date.now().toString().slice(-11);
  }

  window.MekongSettlementData = {
    SPLIT_RULES,
    MOCK_WEBHOOKS,
    formatVnd,
    calculateSplit,
    generateWebhookId,
    generateTxRef
  };
})();
