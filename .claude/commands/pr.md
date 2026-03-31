---
description: Create a pull request with structured description
argument-hint: [optional title hint]
---

Create a PR for the current branch.

1. Run `git log main..HEAD --oneline` to see commits.
2. Run `git diff main...HEAD --stat` to see scope.
3. Draft PR title: short, imperative, under 70 chars.
4. Draft PR body with: Summary (3 bullets max), Test plan, Verification run.
5. Confirm with user before creating.
6. Use: `gh pr create --title "..." --body "..."`

Title hint: $ARGUMENTS
