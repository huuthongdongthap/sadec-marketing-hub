Plan implementation: "$ARGUMENTS"

Steps:
1. Analyze the goal and break into discrete tasks
2. Identify files to create/modify/delete
3. Map dependencies between tasks
4. Estimate complexity (TRIVIAL/SIMPLE/MODERATE/COMPLEX)
5. Output a structured plan:
   - Files list with [NEW]/[MODIFY]/[DELETE] tags
   - Step-by-step execution order
   - Verification criteria

Output format:
## Plan: [goal]
### Files:
- [NEW] path/to/file.html — description
- [MODIFY] path/to/existing.js — what changes
### Steps:
1. Step description
### Verify:
- [ ] Acceptance criteria
