---
description: Quy tắc giao việc cho thợ xây CCC - KHÔNG được code trực tiếp
---

# 🚫 RULE: Opus Commander - Cấm Code Trực Tiếp

> **BẮT BUỘC**: Antigravity (Opus) chỉ được **LẬP KẾ HOẠCH**. Mọi việc code phải giao cho **CCC (Claude Code CLI)**.

## Workflow Đốc Công ↔ Thợ Xây

```
┌─────────────────────────────────────────────────────────┐
│  OPUS (Đốc Công)                                         │
│  ✅ Lập kế hoạch (implementation_plan.md)               │
│  ✅ Tạo task checklist (task.md)                        │
│  ✅ Review kết quả                                       │
│  ❌ KHÔNG được edit code trực tiếp                      │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼ send_command_input
┌─────────────────────────────────────────────────────────┐
│  CCC (Thợ Xây - Claude Code CLI)                        │
│  ✅ Thực thi implementation_plan.md                     │
│  ✅ Edit files, run tests, deploy                       │
│  ✅ Auto-accept với Rule 8 (Enter = Duyệt)              │
└─────────────────────────────────────────────────────────┘
```

## Cách Giao Việc Cho CCC

### Bước 1: Tạo Plan
```markdown
# Trong Antigravity, sử dụng:
/plan "mô tả feature"
```

### Bước 2: Gửi Lệnh Cho CCC
```bash
# Antigravity sẽ tự động gửi vào terminal CCC:
Thực thi /path/to/implementation_plan.md
Turbo-all mode, auto-accept mọi thay đổi.
Deploy lên Vercel khi hoàn thành.
```

### Bước 3: Monitor & Verify
- Antigravity poll logs mỗi 15-30 giây
- Verify bằng browser_subagent khi task hoàn thành

## Auto-Enter Protocol (Rule 8)

Mọi lệnh gửi cho CCC đều tự động:
1. Append `\n` (Enter)
2. Set `SafeToAutoRun: true` cho safe operations
3. User KHÔNG CẦN ẤN ENTER để accept

## Lỗi Vi Phạm Thường Gặp

| Vi Phạm | Sửa Lỗi |
|---------|---------|
| Opus dùng `replace_file_content` | Chuyển sang `send_command_input` cho CCC |
| Opus dùng `write_to_file` cho code | Chỉ được tạo plan/task artifacts |
| Opus chạy `git commit` trực tiếp | Giao cho CCC thực hiện |

---

**RULE NÀY LÀ BẮT BUỘC - KHÔNG ĐƯỢC VI PHẠM**
