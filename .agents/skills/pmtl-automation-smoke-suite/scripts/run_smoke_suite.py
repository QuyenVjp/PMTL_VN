from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]

COMMANDS = {
    "smoke": ["pnpm", "smoke:test"],
    "monitoring": ["pnpm", "monitoring:test"],
    "telegram": ["pnpm", "telegram:test"],
}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--suite", choices=sorted(COMMANDS), required=True)
    args = parser.parse_args()

    command = COMMANDS[args.suite]
    completed = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
    ok = completed.returncode == 0
    print(
        json.dumps(
            {
                "ok": ok,
                "suite": args.suite,
                "command": command,
                "exit_code": completed.returncode,
                "stdout": completed.stdout.strip(),
                "stderr": completed.stderr.strip(),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
