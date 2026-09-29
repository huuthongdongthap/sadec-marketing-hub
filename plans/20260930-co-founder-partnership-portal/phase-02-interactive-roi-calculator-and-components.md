# 📋 PHASE 02: XÂY DỰNG COMPONENT TÍNH TOÁN ROI & DÒNG TIỀN TƯƠNG TÁC

## 1. MỤC TIÊU
Tạo component React `RoiCalculator.tsx` cho phép Co-founder tự tay kéo thanh trượt (Slider):
- Số lượng đám cưới/sự kiện thể thao mỗi tháng.
- Số lượng khách hàng Agency Retainer OCOP.
- Số lượng khách booking tour trải nghiệm.
-> Tự động tính ra: Tổng doanh thu, Chi phí vận hành Cao Lãnh, và **Thu nhập thực tế Co-founder bỏ túi mỗi tháng & mỗi năm**.

## 2. CÔNG THỨC TÍNH TOÁN
- **Doanh thu:**
  - `Weddings`: n * 12.000.000 VNĐ
  - `Retainers`: n * 15.000.000 VNĐ
  - `Tours`: n * 900.000 VNĐ (lãi ròng ~350.000 VNĐ/khách)
- **Chi phí cố định (OPEX):** ~71.000.000 VNĐ/tháng.
- **Thu nhập Co-founder:** Lương cứng (25tr) + Hoa hồng show (35% giá trị show cưới) + 45% lợi nhuận ròng chia cổ tức.

## 3. CHECKLIST
- [ ] Xây dựng Interactive Slider UI chuẩn Material Design 3
- [ ] Tính toán thời gian thực không giật lag
- [ ] Đồ họa trực quan hóa dòng tiền theo tháng và năm
