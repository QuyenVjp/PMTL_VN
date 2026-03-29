# Autoresearch Program

## Goal
- Maximize the numeric score returned by `prepare.py`.
- Higher score is better.

## Editable Scope
- The optimizer may edit only `train.py`.
- `prepare.py` is read-only and acts as the judge.

## Guardrails
- One small change per iteration.
- Keep a change only when score improves by at least the configured `min_delta`.
- Revert immediately when score is worse or unchanged.
- Stop after patience is exhausted or max iterations reached.

## How to Run
```powershell
py infra/tools/autoresearch/runner.py --max-iters 120 --patience 20
```

## Notes
- This demo is deterministic and local. It is designed to show the pattern.
- Replace `prepare.py` with your real metric once you have a measurable target.
