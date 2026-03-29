"""Simple mutator for train.py used by the demo runner.

This is a stand-in for an external AI editor command.
"""

from __future__ import annotations

import random
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent
TRAIN_PATH = ROOT / "train.py"

PARAM_RE = re.compile(r"^(SLOPE|BIAS|WOBBLE)\s*=\s*(-?\d+(?:\.\d+)?)\s*$")


def clamp(name: str, value: float) -> float:
    if name == "SLOPE":
        return max(-10.0, min(10.0, value))
    if name == "BIAS":
        return max(-10.0, min(10.0, value))
    return max(-3.0, min(3.0, value))


def mutate_once() -> str:
    random.seed()
    lines = TRAIN_PATH.read_text(encoding="utf-8").splitlines()
    indices: list[int] = []
    params: dict[str, float] = {}

    for idx, line in enumerate(lines):
        match = PARAM_RE.match(line.strip())
        if not match:
            continue
        name = match.group(1)
        value = float(match.group(2))
        indices.append(idx)
        params[name] = value

    if not params:
        raise RuntimeError("No mutable parameters found in train.py")

    target = random.choice(list(params.keys()))
    step_scale = {
        "SLOPE": 0.35,
        "BIAS": 0.35,
        "WOBBLE": 0.15,
    }[target]
    delta = random.uniform(-step_scale, step_scale)
    new_value = round(clamp(target, params[target] + delta), 6)

    for idx in indices:
        match = PARAM_RE.match(lines[idx].strip())
        if match and match.group(1) == target:
            lines[idx] = f"{target} = {new_value}"
            break

    TRAIN_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return f"{target}: {params[target]} -> {new_value}"


def main() -> int:
    summary = mutate_once()
    print(summary)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
