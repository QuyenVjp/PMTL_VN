from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


ROUNDED_ARBITRARY = re.compile(r"rounded-\[[^\]]+\]")
SURFACE_TOKENS = re.compile(r"bg-[A-Za-z0-9/\-\[\]]+")


def scan(path: Path) -> dict[str, object]:
    text = path.read_text(encoding="utf-8", errors="replace")
    findings: list[str] = []
    if len(set(ROUNDED_ARBITRARY.findall(text))) > 1:
        findings.append("multiple-arbitrary-radii")
    surfaces = SURFACE_TOKENS.findall(text)
    if len(set(surfaces)) >= 8:
        findings.append("high-surface-variety")
    if "h-screen" in text:
        findings.append("uses-h-screen")
    if "text-gold" in text or "bg-gold" in text:
        findings.append("gold-present-check-density")
    return {"file": str(path), "findings": findings}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="+")
    args = parser.parse_args()
    print(json.dumps([scan(Path(path)) for path in args.paths], ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
