"""Read-only scoring script for autoresearch.

This script evaluates `train.py` and returns one number:
- larger score means better result
"""

from __future__ import annotations

import argparse
import json
import math
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable

import train


ROOT = Path(__file__).resolve().parent


@dataclass(frozen=True)
class ScoreResult:
    score: float
    rmse: float
    points: int


def target_function(x: float) -> float:
    """Ground truth used by the judge.

    Keep this fixed and hidden from the optimizer in real use-cases.
    """
    return 2.7 * x + 1.3 + 0.05 * math.sin(3.0 * x)


def evaluation_points() -> Iterable[float]:
    # Fixed holdout set for stable scoring.
    for i in range(-120, 121):
        yield i / 30.0


def compute_score() -> ScoreResult:
    points = list(evaluation_points())
    squared_error = 0.0
    for x in points:
        y_pred = train.predict(x)
        y_true = target_function(x)
        err = y_pred - y_true
        squared_error += err * err

    rmse = math.sqrt(squared_error / len(points))

    # Convert to a bounded score where higher is better.
    score = 1000.0 / (1.0 + rmse)
    return ScoreResult(score=score, rmse=rmse, points=len(points))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Score current train.py.")
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit machine-readable JSON output.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    result = compute_score()

    if args.json:
        print(json.dumps(asdict(result), ensure_ascii=True))
    else:
        print(f"score={result.score:.6f} rmse={result.rmse:.6f} points={result.points}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
