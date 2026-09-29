---
description: CTO Factory dispatch rules - MUST READ before every plan dispatch
---

# 🦞 CTO FACTORY DISPATCH RULES

> **ĐỌC FILE NÀY TRƯỚC KHI DISPATCH BẤT KỲ PLAN NÀO**

## RULE 1: Reuse trước, Restart chỉ khi cần

```
Giao plan mới:
1. Check tmux alive?
   → YES → gửi task trực tiếp qua send-keys (3s)
   → NO  → kill old + restart factory + CTO (25s)

2. Check CTO Brain alive?
   → YES → đặt plan.md, CTO tự scan
   → NO  → restart CTO Brain only

3. MỞ Terminal cho anh xem (BẮT BUỘC)
```

## RULE 2: Mỗi lần giao plan PHẢI mở Terminal

- Anh PHẢI thấy TMUX đang chạy
- Nếu Terminal đóng → `osascript 'tell Terminal activate, do script tmux attach -t tom_hum'`
- KHÔNG được report "đã giao" mà anh không thấy Terminal

## RULE 3: KHÔNG BAO GIỜ gửi lệnh trực tiếp cho Worker

- **TUYỆT ĐỐI KHÔNG** dùng `tmux send-keys` gửi task trực tiếp cho worker
- **MỌI task PHẢI đi qua CTO Brain** — viết plan.md → CTO scan → CTO dispatch
- Nếu CTO dispatch bị lỗi → **FIX CTO Brain/dispatch script TRƯỚC**
- Không được bypass CTO dưới bất kỳ lý do gì

## RULE 4: Verify workers đang chạy

- Sau khi dispatch, PHẢI chờ 15s rồi check status
- ALL workers phải ở trạng thái LOADING/WORKING/THINKING
- Nếu có worker IDLE sau 30s → redispatch task cho worker đó

## RULE 5: KHÔNG sửa code trực tiếp

- TUYỆT ĐỐI không nhúng tay sửa code trực tiếp
- Chỉ lên Plan → giao CTO → CTO dispatch workers
- Chỉ commit/push kết quả workers tạo ra

## RULE 6: Skills có sẵn (9 skills)

| Skill | Dùng khi |
|-------|----------|
| `/scout` | Phân tích, tìm hiểu codebase |
| `/fix` | Sửa bug cụ thể |
| `/test` | Chạy tests |
| `/cook` | Build feature mới |
| `/review` | Code review, security audit |
| `/refactor` | Refactor giữ behavior |
| `/plan` | Lập kế hoạch |
| `/check-and-commit` | Git review + commit |
| `/ship` | Deploy readiness check |

## RULE 7: Pane mapping

| Pane | Index | Default Role |
|------|-------|-------------|
| Top-left | 0 | CTO/Scout |
| Top-right | 1 | Builder/Fix |
| Bottom-left | 2 | Tester |
| Bottom-right | 3 | Reviewer/Designer |
