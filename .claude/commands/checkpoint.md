---
description: Save a named checkpoint of current state
argument-hint: <checkpoint-name>
---

Save a checkpoint named: $ARGUMENTS

1. Run `git status` and `git diff --stat` to show current state.
2. If there are uncommitted changes, commit them with message: "checkpoint: $ARGUMENTS"
3. Tag the commit: `git tag checkpoint/$ARGUMENTS`
4. Confirm the checkpoint is saved and show the tag.
5. Remind the user: restore with `git checkout checkpoint/$ARGUMENTS`
