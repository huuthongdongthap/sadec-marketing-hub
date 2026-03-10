Execute implementation: "$ARGUMENTS"

Steps:
1. Read the plan/task description carefully
2. Identify all files to create/modify
3. Implement changes following existing patterns:
   - HTML: Use M3 Web Components + portal.css + sadec-sidebar
   - JS: ES modules, Supabase client pattern from portal/supabase.js
   - CSS: Use existing m3-agency.css tokens
   - Edge Functions: Deno + Supabase client (see existing functions in supabase/functions/)
4. After implementation, verify with grep/read
5. Git commit with conventional format: "feat/fix/refactor: description"
6. Git push origin main

Tech stack:
- Vanilla HTML/JS/CSS (no framework)
- Material Design 3 Web Components
- Supabase (Auth + PostgreSQL + Edge Functions)
- Vercel (hosting, auto-deploy from main)
- PayOS/VNPay/MoMo (payment gateways)

Portal structure: /admin/, /portal/, /affiliate/, /auth/
