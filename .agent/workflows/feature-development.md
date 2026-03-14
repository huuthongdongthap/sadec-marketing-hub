---
description: Execute full feature development workflow (Plan → Code → Test → Deploy)
---

# /FEATURE-DEV Workflow

Complete feature development following AgencyOS best practices.

## Zero-Effort Commands (Binh Pháp)
```bash
/plan     # Research & plan the feature
/code     # Implement the feature
/ship     # Test, review & deploy
```

## Step-by-Step Process

// turbo-all

### 1. Planning Phase
```bash
/plan "describe the feature you want to build"
```
**What happens:**
- Planner Agent creates detailed implementation plan
- Researcher Agent analyzes best practices
- Code Reviewer Agent reviews for architectural soundness
- Output: Plan file in `plans/YYYYMMDD-HHMM-feature-description/`

### 2. Implementation Phase
```bash
/code
```
**What happens:**
- Reads the latest plan
- Fullstack Developer Agent implements backend/frontend
- UI/UX Designer Agent creates interface designs
- Database Admin Agent handles schema changes
- Skills auto-activate based on tech stack

### 3. Testing Phase
```bash
/fix:test
```
**What happens:**
- Tester Agent writes comprehensive tests
- Runs unit, integration, E2E tests
- Debugger Agent investigates failures
- Target: 90%+ coverage

### 4. Code Review Phase
```bash
/code-review "describe what to review"
```
**What happens:**
- Security and performance analysis
- Bug detection
- Architectural validation
- Generates review report

### 5. Deployment Preparation
```bash
/fix:ci "prepare for production deployment"
```
**What happens:**
- CI/CD issues fixed
- Deployment configurations prepared
- Pipeline validated
- Documentation updated

### 6. Commit & Deploy
```bash
/git:cm /git:pr "feature/branch-name"
```
**What happens:**
- Git stages and commits with conventional format
- Creates professional commit message
- Opens pull request with detailed description
- Handles merge conflicts

## Quick Reference

| Phase | Command | Purpose |
|-------|---------|---------|
| Plan | `/plan "feature"` | Create implementation plan |
| Code | `/code` | Implement feature |
| Test | `/fix:test` | Write & run tests |
| Review | `/code-review "scope"` | Code analysis |
| CI/CD | `/fix:ci "goal"` | Fix deployment issues |
| Deploy | `/git:cm /git:pr "branch"` | Commit & PR |

## Sync Commands
```bash
/sync-all    # Sync patterns from Antigravity
```

## Related Workflows
- `/binh-phap` - Strategic analysis
- `/marketing` - Marketing automation
- `/seo` - SEO audit
