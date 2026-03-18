from __future__ import annotations

import argparse
import json
import subprocess
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--all-pages", action="store_true")
    parser.add_argument("--page", type=int, default=1)
    parser.add_argument("--limit", type=int, default=100)
    parser.add_argument("--health-url", default="http://localhost:7700/health")
    args = parser.parse_args()

    if args.all_pages:
        command = ["pnpm", "reindex:posts"]
    else:
        command = ["pnpm", "--filter", "@pmtl/cms", "reindex:posts", "--", f"--page={args.page}", f"--limit={args.limit}"]

    completed = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)

    health = {"ok": False, "status": None, "body": ""}
    try:
        with urllib.request.urlopen(args.health_url, timeout=10) as response:
            body = response.read().decode("utf-8", errors="replace")
            health = {"ok": response.status == 200, "status": response.status, "body": body}
    except Exception as error:  # noqa: BLE001
        health = {"ok": False, "status": None, "body": str(error)}

    ok = completed.returncode == 0 and health["ok"]
    print(
        json.dumps(
            {
                "ok": ok,
                "command": command,
                "exit_code": completed.returncode,
                "stdout": completed.stdout.strip(),
                "stderr": completed.stderr.strip(),
                "health": health,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
