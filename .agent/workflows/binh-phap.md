---
description: Execute Binh Pháp strategy with Mekong CLI
---

# /BINH-PHAP Workflow

Execute the full Binh Pháp strategic analysis using AgencyOS agents.

## Prerequisites
- AgencyOS CLI installed (`npm install -g @agencyos/mekong-cli`)
- Supabase project configured
- Domain access for SEO audit

## Execution Steps

// turbo-all

1. **Activate Strategic Agent**
```bash
mekong agent:planner --task "Binh Pháp Strategic Analysis"
```

2. **Run Competitive Intelligence**
```bash
mekong binh-phap --analyze --competitor "local-agencies" --region "dong-thap"
```

3. **Generate Market Intel**
```bash
mekong intel --report --region "dong-thap" --industry "sme-services"
```

4. **Marketing Plan Generation**
```bash
mekong ke-hoach-tiep-thi --client "SME Đồng Tháp" --budget "10M VND"
```

5. **SEO Audit**
```bash
mekong seo --audit --domain "sadecmarketinghub.com"
```

6. **Lead Generation Setup**
```bash
mekong leadgen --source "facebook,zalo" --segment "local-sme"
```

7. **CRM Configuration**
```bash
mekong crm --init --platform "supabase"
```

8. **WIN³ Dashboard**
```bash
mekong win3:dashboard --output "reports/win3-dashboard.html"
```

## Success Criteria
- ✅ All 4 phases executed
- ✅ Intel reports generated
- ✅ Marketing plan created
- ✅ CRM synchronized
- ✅ WIN³ metrics tracking active
