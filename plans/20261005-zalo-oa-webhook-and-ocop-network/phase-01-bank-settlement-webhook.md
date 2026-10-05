# ⚡ PHASE 1: BANK SETTLEMENT WEBHOOK SIMULATOR & ENGINE

> **Mục tiêu:** Xây dựng Engine giải lập và xử lý webhook tự động giải ngân ngân hàng SePay/MBBank/Napas 24/7 theo cam kết minh bạch tài chính.

---

## 🛠️ CHI TIẾT KỸ THUẬT

1. **Dataset & Helpers (`assets/js/components/mekong-settlement-webhook-data.js`):**
   * Định nghĩa cấu trúc webhook payload: `id`, `gateway`, `transactionId`, `amount`, `content`, `signature`, `status`, `timestamp`.
   * Danh sách giao dịch mẫu và quy tắc chia tách dòng tiền 4 bên:
     - Homestay / Cơ sở bản địa: 30%
     - Ekip sản xuất trực tiếp (Co-founder): 35%
     - Khấu hao thiết bị & hậu cần: 20%
     - Quỹ phát triển AI Hub & khuyến nông: 15%
   * Các hàm utility: format tiền tệ VNĐ, xác thực checksum / chữ ký giả lập, tạo transaction hash `#TX-XXXXXXXX`.

2. **Giao Diện & Xử Lý Sự Kiện (`assets/js/components/mekong-settlement-webhook.js`):**
   * Drawer/Modal giao diện quản trị webhook & bảng điều khiển giải ngân trực quan.
   * Danh sách các sự kiện webhook thời gian thực: Webhook Inbound ➔ Signature Verified ➔ Revenue Split Executed ➔ Partner Payout Dispatched.
   * Bộ điều khiển giả lập (Simulate Inbound Webhook) cho phép thử nghiệm:
     - Giao dịch cọc tour 50% (`HUB-TOUR-SD01`)
     - Giao dịch tất toán hợp đồng OCOP (`HUB-OCOP-LV02`)
     - Giao dịch đặt lịch kịch bản 4K (`HUB-SCRIPT-CL03`)
   * Trực quan hóa tiến độ giải ngân từng tài khoản đối tác với nút bấm bắn thông báo biên lai qua Zalo.
   * File size: Giữ nghiêm ngặt < 200 dòng.
