"""Autoresearch loop runner.

Flow:
1) Score baseline
2) Apply one experiment to train.py
3) Re-score
4) Keep if improved, otherwise revert
5) Repeat until budget or patience is exhausted
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import time
from dataclasses import asdict, dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parent
TRAIN_PATH = ROOT / "train.py"
PREPARE_PATH = ROOT / "prepare.py"
DEFAULT_MUTATOR = [sys.executable, str(ROOT / "mutate_train.py")]


@dataclass
class IterationRecord:
    iteration: int
    action: str
    best_score: float
    candidate_score: float
    delta: float
    note: str
    elapsed_ms: int


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run autoresearch keep/revert loop.")
    parser.add_argument("--max-iters", type=int, default=120, help="Maximum loop iterations.")
    parser.add_argument("--patience", type=int, default=24, help="Stop after this many non-improving iterations.")
    parser.add_argument(
        "--min-delta",
        type=float,
        default=0.0001,
        help="Minimum score improvement to keep a change.",
    )
    parser.add_argument(
        "--mutator-cmd",
        nargs="+",
        help="Optional edit command that mutates train.py in-place.",
    )
    parser.add_argument(
        "--history-file",
        default=str(ROOT / "history.jsonl"),
        help="Where to append iteration logs.",
    )
    return parser.parse_args()


def run_command(command: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )


def score() -> float:
    completed = run_command([sys.executable, str(PREPARE_PATH), "--json"])
    if completed.returncode != 0:
        raise RuntimeError(f"prepare.py failed: {completed.stderr.strip() or completed.stdout.strip()}")
    try:
        payload = json.loads(completed.stdout.strip())
        return float(payload["score"])
    except Exception as exc:  # pragma: no cover - defensive parsing
        raise RuntimeError(f"Could not parse score output: {completed.stdout}") from exc


def append_history(path: Path, record: IterationRecord) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(asdict(record), ensure_ascii=True) + "\n")


def main() -> int:
    args = parse_args()
    history_path = Path(args.history_file)
    edit_command = args.mutator_cmd if args.mutator_cmd else DEFAULT_MUTATOR

    if not TRAIN_PATH.exists():
        raise FileNotFoundError(f"Missing editable file: {TRAIN_PATH}")
    if not PREPARE_PATH.exists():
        raise FileNotFoundError(f"Missing scoring file: {PREPARE_PATH}")

    best_score = score()
    no_improve = 0
    accepted = 0
    started = time.time()

    print(f"[baseline] score={best_score:.6f}")

    for iteration in range(1, args.max_iters + 1):
        iter_started = time.time()
        snapshot = TRAIN_PATH.read_text(encoding="utf-8")

        edit = run_command(edit_command)
        if edit.returncode != 0:
            TRAIN_PATH.write_text(snapshot, encoding="utf-8")
            note = edit.stderr.strip() or edit.stdout.strip() or "mutator failed"
            record = IterationRecord(
                iteration=iteration,
                action="revert",
                best_score=best_score,
                candidate_score=best_score,
                delta=0.0,
                note=note,
                elapsed_ms=int((time.time() - iter_started) * 1000),
            )
            append_history(history_path, record)
            print(f"[{iteration:03d}] revert | {note}")
            no_improve += 1
            if no_improve >= args.patience:
                break
            continue

        candidate_score = score()
        delta = candidate_score - best_score
        if delta >= args.min_delta:
            best_score = candidate_score
            accepted += 1
            no_improve = 0
            action = "keep"
            note = edit.stdout.strip() or "improved"
        else:
            TRAIN_PATH.write_text(snapshot, encoding="utf-8")
            no_improve += 1
            action = "revert"
            note = edit.stdout.strip() or "no improvement"

        record = IterationRecord(
            iteration=iteration,
            action=action,
            best_score=best_score,
            candidate_score=candidate_score,
            delta=delta,
            note=note,
            elapsed_ms=int((time.time() - iter_started) * 1000),
        )
        append_history(history_path, record)
        print(f"[{iteration:03d}] {action:6s} | cand={candidate_score:.6f} delta={delta:+.6f} best={best_score:.6f} | {note}")

        if no_improve >= args.patience:
            break

    total_ms = int((time.time() - started) * 1000)
    print(
        json.dumps(
            {
                "status": "done",
                "best_score": best_score,
                "accepted": accepted,
                "iterations": iteration,
                "patience_used": no_improve,
                "history_file": str(history_path),
                "elapsed_ms": total_ms,
            },
            ensure_ascii=True,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
