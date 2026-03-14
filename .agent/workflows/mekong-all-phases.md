# Mekong CLI Integration Workflow
# Sa Đéc Marketing Hub - All Phases Execution

## Phase 1: Foundation Setup
```bash
# Initialize AgencyOS environment
mekong init sadec-marketing-hub

# Activate planner agent
mekong agent:planner --task "Sa Đéc Marketing Hub M3 Upgrade"

# Generate foundation plan
mekong plan "Setup Material Design 3 with @material/web CDN"
```

## Phase 2: Marketing Automation
```bash
# Marketing campaign planning
mekong ke-hoach-tiep-thi --client "SME Đồng Tháp" --budget "10M VND" --duration "Q1-2026"

# SEO optimization audit
mekong seo --audit --domain "sadecmarketinghub.com" --keywords "marketing sa dec,quang cao dong thap"

# PR content generation
mekong pr --generate --topic "Câu chuyện thành công SME địa phương" --format "blog,social"

# Content calendar
mekong marketing:calendar --platform "facebook,zalo" --frequency "daily"
```

## Phase 3: Sales & CRM Integration
```bash
# Lead generation setup
mekong leadgen --source "facebook,zalo,website" --segment "local-sme" --auto-qualify

# CRM initialization with Supabase
mekong crm --init --platform "supabase" --tables "contacts,leads,deals"

# Customer sync
mekong khach-hang --sync --database "contacts" --enrich "business-info"

# Sales pipeline automation
mekong sales:pipeline --stages "lead,qualified,proposal,closed" --notifications "email,zalo"
```

## Phase 4: Strategic Analysis
```bash
# Binh Pháp competitive intelligence
mekong binh-phap --analyze --competitor "local-agencies" --region "dong-thap"

# Market intelligence report
mekong intel --report --region "dong-thap" --industry "sme-services" --depth "comprehensive"

# Crisis preparedness plan
mekong crisis --plan --scenarios "market-downturn,competitor-attack,reputation-risk"

# Strategic recommendations
mekong strategy:recommend --based-on "intel,binh-phap" --timeline "Q1-Q2-2026"
```

## Verification Commands
```bash
# Run all tests
mekong test --suite "all" --coverage

# Check deployment status
mekong dev --check --env "production"

# Generate verification report
mekong verify --full-audit --output "reports/verification-2026-01-05.md"
```

## WIN³ Framework Tracking
```bash
# Track owner metrics
mekong win3:owner --metrics "time-saved,roi,efficiency"

# Track agency metrics
mekong win3:agency --metrics "consistency,quality,delivery-speed"

# Track client metrics
mekong win3:client --metrics "satisfaction,conversion,retention"

# Generate WIN³ dashboard
mekong win3:dashboard --output "reports/win3-q1-2026.html"
```
