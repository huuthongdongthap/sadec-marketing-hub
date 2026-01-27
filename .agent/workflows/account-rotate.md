---
description: Rotate/switch Antigravity accounts to optimize quota usage
---

# Account Rotation Workflow

Tự động switch accounts để tránh limit quota và tối ưu tài nguyên.

// turbo-all

## Commands

### 1. Kiểm tra status tất cả accounts
```bash
./scripts/account-rotate.sh --status
```

### 2. Switch random account (quota > 50%)
```bash
./scripts/account-rotate.sh --random
```

### 3. Chọn account tốt nhất (ULTRA/PRO ưu tiên)
```bash
./scripts/account-rotate.sh --best
```

### 4. Đổi strategy proxy
```bash
./scripts/account-rotate.sh --strategy hybrid
```

## Strategy Options
- `hybrid` (mặc định): Tự động chọn theo health score
- `sticky`: Giữ session trên cùng account (tốt cho prompt caching)
- `round-robin`: Luân phiên đều giữa các accounts
