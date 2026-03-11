Check git status, review all changes, and create a clean commit.

Steps:
1. Run `git status` and `git diff --stat` to see all pending changes
2. Review each changed file for quality (no debug code, no TODO left)
3. Group related changes into logical commits
4. Write clear commit messages following conventional commits (feat/fix/refactor/docs)
5. Run `git add` and `git commit` for each group
6. Report what was committed

Rules:
- Never commit .env, secrets, or API keys
- Never commit node_modules or build artifacts
- Use conventional commit format: type(scope): description
- If changes are too large, split into multiple commits
