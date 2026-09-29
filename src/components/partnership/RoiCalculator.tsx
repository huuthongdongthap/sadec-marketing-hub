'use client';

import React, { useState, useMemo } from 'react';

export default function RoiCalculator() {
  const [weddingCount, setWeddingCount] = useState<number>(5);
  const [retainerCount, setRetainerCount] = useState<number>(6);
  const [tourCount, setTourCount] = useState<number>(30);
  const [sharePercent, setSharePercent] = useState<number>(45);

  const calculations = useMemo(() => {
    // Đơn giá trung bình
    const weddingPrice = 12000000; // 12 triệu / show cưới hoặc sự kiện thể thao
    const retainerPrice = 15000000; // 15 triệu / hợp đồng marketing OCOP/tháng
    const tourRevenuePerPax = 900000; // 900k / khách (lãi ròng ~350k/khách sau chi phí dịch vụ)
    const tourProfitPerPax = 350000;

    // Doanh thu gộp hàng tháng
    const monthlyWeddingRev = weddingCount * weddingPrice;
    const monthlyRetainerRev = retainerCount * retainerPrice;
    const monthlyTourRev = tourCount * tourRevenuePerPax;
    const totalMonthlyRev = monthlyWeddingRev + monthlyRetainerRev + monthlyTourRev;

    // Chi phí giá vốn dịch vụ tour (trả nhà vườn, ăn uống)
    const tourCOGS = tourCount * (tourRevenuePerPax - tourProfitPerPax);

    // Chi phí cố định OPEX tại TP. Cao Lãnh (mặt bằng, 2 thợ phụ, điện mạng, xăng xe)
    const fixedOPEX = 71000000;

    // Lợi nhuận trước thuế của công ty
    const monthlyNetProfit = Math.max(0, totalMonthlyRev - tourCOGS - fixedOPEX);

    // Thu nhập 3 tầng của Co-founder mỗi tháng:
    const baseSalary = 25000000; // Tầng 1: Lương cứng đảm bảo cuộc sống
    const weddingCommission = monthlyWeddingRev * 0.35; // Tầng 2: 35% thù lao trực tiếp từ show cưới/thể thao
    const dividendShare = (monthlyNetProfit * (sharePercent / 100)) * 0.8; // Tầng 3: Chia 80% lợi nhuận sau khi trích 20% quỹ tái đầu tư thiết bị

    const cofounderMonthlyTakeHome = baseSalary + weddingCommission + dividendShare;
    const cofounderAnnualTakeHome = cofounderMonthlyTakeHome * 12;

    return {
      totalMonthlyRev,
      fixedOPEX,
      monthlyNetProfit,
      baseSalary,
      weddingCommission,
      dividendShare,
      cofounderMonthlyTakeHome,
      cofounderAnnualTakeHome,
      annualCompanyRev: totalMonthlyRev * 12,
      annualNetProfit: monthlyNetProfit * 12,
    };
  }, [weddingCount, retainerCount, tourCount, sharePercent]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-[var(--md-sys-color-surface-container-low)] rounded-[var(--md-sys-shape-corner-extra-large)] border border-[var(--md-sys-color-outline-variant)] p-6 md:p-10 shadow-lg">
      <div className="max-w-3xl mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-semibold uppercase tracking-wider mb-3">
          🧮 BẢNG TÍNH DÒNG TIỀN & ROI THỰC CHIẾN
        </span>
        <h3 className="m3-headline-medium text-[var(--md-sys-color-on-surface)] font-medium mb-3">
          Kéo Thử Các Con Số — Thấy Ngay Tiền Về Túi Anh Em
        </h3>
        <p className="m3-body-medium text-[var(--md-sys-color-on-surface-variant)]">
          Mô hình không vẽ dự án trên mây. Hãy thử điều chỉnh số lượng công việc mỗi tháng dựa trên năng lực bấm máy thực tế của đội ngũ:
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Thanh trượt điều khiển */}
        <div className="lg:col-span-7 space-y-6 bg-[var(--md-sys-color-surface)] p-6 rounded-[var(--md-sys-shape-corner-large)] border border-[var(--md-sys-color-outline-variant)]">
          {/* Slider 1: Show cưới / thể thao */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                <span>🎥 Show Cưới & Sự Kiện Thể Thao:</span>
                <span className="text-xs text-[var(--md-sys-color-primary)] font-normal">(12tr/show)</span>
              </label>
              <span className="text-base font-bold text-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] px-3 py-0.5 rounded-full">
                {weddingCount} show/tháng
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={weddingCount}
              onChange={(e) => setWeddingCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1B4D3E]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0 show (Mùa thấp điểm)</span>
              <span>8 show</span>
              <span>15 show (Mùa cưới rộ)</span>
            </div>
          </div>

          {/* Slider 2: Khách Retainer Marketing OCOP */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                <span>🏢 Khách Hàng Retainer OCOP / SME:</span>
                <span className="text-xs text-[var(--md-sys-color-primary)] font-normal">(15tr/tháng)</span>
              </label>
              <span className="text-base font-bold text-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] px-3 py-0.5 rounded-full">
                {retainerCount} hợp đồng
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={retainerCount}
              onChange={(e) => setRetainerCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1B4D3E]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 khách (Bắt đầu)</span>
              <span>6 khách (Mục tiêu 3 tháng)</span>
              <span>15 khách (Kịch trần)</span>
            </div>
          </div>

          {/* Slider 3: Khách Tour Trải Nghiệm Bản Địa */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                <span>🌾 Khách Đặt Tour Sinh Thái / Làng Hoa:</span>
                <span className="text-xs text-[var(--md-sys-color-primary)] font-normal">(900k/khách)</span>
              </label>
              <span className="text-base font-bold text-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] px-3 py-0.5 rounded-full">
                {tourCount} khách/tháng
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={tourCount}
              onChange={(e) => setTourCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1B4D3E]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0 khách</span>
              <span>50 khách (Cuối tuần)</span>
              <span>150 khách (Mùa nước nổi)</span>
            </div>
          </div>

          {/* Tỷ lệ cổ phần Co-founder */}
          <div className="pt-4 border-t border-[var(--md-sys-color-outline-variant)]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
                🤝 Tỷ Lệ Cổ Phần Co-Founder Đề Xuất:
              </label>
              <span className="text-sm font-bold text-[var(--md-sys-color-tertiary)] bg-[var(--md-sys-color-tertiary-container)] px-3 py-0.5 rounded-full">
                {sharePercent}% Cổ Phần
              </span>
            </div>
            <div className="flex gap-3">
              {[40, 45, 50].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setSharePercent(pct)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-full border transition-all ${
                    sharePercent === pct
                      ? 'bg-[var(--md-sys-color-primary)] text-white border-transparent'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {pct}% Cổ phần
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bảng kết quả hiển thị dòng tiền */}
        <div className="lg:col-span-5 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] p-6 md:p-8 rounded-[var(--md-sys-shape-corner-large)] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <h4 className="text-xs uppercase font-bold tracking-widest text-[#A7F3D8] mb-1">
            THU NHẬP THỰC NHẬN CỦA CO-FOUNDER
          </h4>
          <div className="text-3xl md:text-4xl font-light mb-1 text-white">
            {formatVND(calculations.cofounderMonthlyTakeHome)}
            <span className="text-sm font-normal text-white/80"> /tháng</span>
          </div>
          <div className="text-xs text-white/70 mb-6 pb-6 border-b border-white/20">
            Tương đương <strong className="text-[#A7F3D8]">{formatVND(calculations.cofounderAnnualTakeHome)}</strong> / năm trọn vẹn
          </div>

          <div className="space-y-3 text-xs mb-6">
            <div className="flex justify-between py-1 border-b border-white/10">
              <span className="text-white/80">1. Lương cứng mỗi tháng:</span>
              <span className="font-semibold text-white">{formatVND(calculations.baseSalary)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/10">
              <span className="text-white/80">2. Hoa hồng show quay cưới/thể thao (35%):</span>
              <span className="font-semibold text-[#A7F3D8]">{formatVND(calculations.weddingCommission)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/10">
              <span className="text-white/80">3. Cổ tức lợi nhuận ròng ({sharePercent}%):</span>
              <span className="font-semibold text-[#FCDAC4]">{formatVND(calculations.dividendShare)}</span>
            </div>
          </div>

          <div className="bg-black/20 p-4 rounded-[var(--md-sys-shape-corner-medium)] text-xs space-y-2">
            <div className="flex justify-between text-white/70">
              <span>Doanh thu toàn công ty/tháng:</span>
              <span className="font-medium text-white">{formatVND(calculations.totalMonthlyRev)}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Chi phí cố định Cao Lãnh (OPEX):</span>
              <span className="font-medium text-white">~{formatVND(calculations.fixedOPEX)}</span>
            </div>
            <div className="flex justify-between text-white/70 pt-1 border-t border-white/10">
              <span className="text-[#A7F3D8] font-bold">Lợi nhuận ròng công ty (EBITDA):</span>
              <span className="text-[#A7F3D8] font-bold">{formatVND(calculations.monthlyNetProfit)}</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="#appointment"
              className="inline-flex items-center justify-center w-full py-3 rounded-full bg-[#A7F3D8] text-[#062E23] font-bold text-sm hover:shadow-lg transition-all"
            >
              Hẹn Cafe Chốt Phương Án Này 👉
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
