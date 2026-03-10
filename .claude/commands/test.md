Run tests and verify: "$ARGUMENTS"

Steps:
1. If specific test mentioned, run that test
2. Otherwise run full suite: npx playwright test tests/smoke-all-pages.spec.ts --reporter=list
3. Check for any HTML validation errors in modified pages
4. Verify sidebar navigation links are correct
5. Report results: PASS count, FAIL count, specific failures

Available test commands:
- npx playwright test (all tests)
- npx playwright test tests/smoke-all-pages.spec.ts (smoke tests)
- npx playwright test tests/seo-validation.spec.ts (SEO)
- node -e "..." (inline validation)
