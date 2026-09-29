# Contributing to Sa Đéc Marketing Hub

## Yêu cầu

- **Node.js** ≥ 18 LTS
- **Git** ≥ 2.x

## Setup môi trường

```bash
git clone https://github.com/your-org/sadec-marketing-hub.git
cd sadec-marketing-hub
npm install
cp .env.example .env  # Điền Supabase credentials
npm run dev           # Start tại http://localhost:8080
```

## Quy tắc commit (Conventional Commits)

```
feat:     Tính năng mới
fix:      Bug fix
docs:     Chỉ documentation
style:    Format, spacing (không đổi logic)
refactor: Refactor không thêm feature/fix bug
test:     Thêm/sửa tests
chore:    CI, build tools, dependencies
```

## Pull Request Process

1. Fork repository
2. Tạo feature branch: `git checkout -b feat/ten-tinh-nang`
3. Commit theo Conventional Commits
4. Mở PR vào `main`, mô tả rõ thay đổi
5. CI phải pass (lint + tests)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML/CSS/JS (Vanilla) |
| Design | Material Design 3 (Teal #006A60) |
| Backend | Supabase (Auth + Database) |
| Test | Playwright E2E |
| Deploy | Vercel |

## Code Style

- Không dùng inline styles — dùng CSS classes
- Không duplicate utility functions — xài `assets/js/enhanced-utils.js`
- Tất cả secrets qua `.env`, không hardcode trong source
