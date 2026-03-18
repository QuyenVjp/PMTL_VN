from __future__ import annotations

import argparse
import json
from pathlib import Path


PATTERNS = {
    "broad-use-client": "'use client'",
    "todo-placeholder": "TODO",
    "implicit-any": ": any",
    "internal-api-fetch": 'fetch("/api/',
    "h-screen": "h-screen",
    "effect-fetch": "useEffect",
}


def scan_file(path: Path) -> dict[str, object]:
    text = path.read_text(encoding="utf-8", errors="replace")
    findings = []
    for label, pattern in PATTERNS.items():
        if pattern in text:
            findings.append(label)
    return {"file": str(path), "findings": findings}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="+")
    args = parser.parse_args()
    report = [scan_file(Path(path)) for path in args.paths]
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
