from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]


def run(command: list[str]) -> dict[str, object]:
    completed = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
    return {
        "command": command,
        "exit_code": completed.returncode,
        "stdout": completed.stdout.strip(),
        "stderr": completed.stderr.strip(),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scope", choices=["all", "web", "cms"], default="all")
    parser.add_argument("--skip-tests", action="store_true")
    args = parser.parse_args()

    commands: list[list[str]]
    if args.scope == "web":
        commands = [["pnpm", "--filter", "@pmtl/web", "typecheck"], ["pnpm", "--filter", "@pmtl/web", "lint"]]
        if not args.skip_tests:
            commands.insert(0, ["pnpm", "--filter", "@pmtl/web", "test"])
    elif args.scope == "cms":
        commands = [["pnpm", "--filter", "@pmtl/cms", "typecheck"], ["pnpm", "--filter", "@pmtl/cms", "lint"]]
        if not args.skip_tests:
            commands.insert(0, ["pnpm", "--filter", "@pmtl/cms", "test"])
    else:
        commands = [["pnpm", "typecheck"], ["pnpm", "lint"]]
        if not args.skip_tests:
            commands.insert(0, ["pnpm", "test"])

    results = [run(command) for command in commands]
    ok = all(result["exit_code"] == 0 for result in results)
    print(json.dumps({"ok": ok, "scope": args.scope, "results": results}, ensure_ascii=False, indent=2))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
