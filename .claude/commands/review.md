Review code/changes: "$ARGUMENTS"

Steps:
1. Check git diff to see recent changes
2. Review code quality: naming, structure, error handling
3. Check security: no hardcoded secrets, proper auth checks, XSS prevention
4. Verify consistency with existing codebase patterns
5. Check accessibility: proper labels, semantic HTML, contrast
6. Report: issues found (CRITICAL/WARNING/INFO), suggestions

Focus areas:
- SQL injection in Edge Functions
- Missing auth checks
- Broken navigation links
- CSS inconsistencies across portals
- Missing error handling
