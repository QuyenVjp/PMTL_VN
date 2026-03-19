from __future__ import annotations

import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]


def main() -> int:
    command = [sys.executable, str(ROOT / "infra" / "tools" / "codex_actions.py"), "auth-flow", *sys.argv[1:]]
    return subprocess.run(command, cwd=ROOT).returncode


if __name__ == "__main__":
    raise SystemExit(main())
