Refactor: "$ARGUMENTS"

Steps:
1. Identify code to refactor (duplications, dead code, complexity)
2. Plan changes that preserve behavior
3. Execute refactoring
4. Verify no regressions (check imports, references, tests)
5. Commit: "refactor: $ARGUMENTS"

Rules:
- Zero behavioral changes
- Keep UI/UX identical
- Maintain backward compatibility
- Don't rename public APIs without updating all references
