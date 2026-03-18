from __future__ import annotations

import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
AUTH_STEPS = {"cms-health", "member-login", "auth-me", "moderation-reports", "search-status"}


def extract_json_blob(text: str) -> dict[str, object]:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("Could not find JSON output in smoke test")
    return json.loads(text[start : end + 1])


def main() -> int:
    completed = subprocess.run(["pnpm", "smoke:test"], cwd=ROOT, capture_output=True, text=True)
    payload = extract_json_blob(completed.stdout) if completed.stdout.strip() else {}
    results = payload.get("results", []) if isinstance(payload, dict) else []
    auth_results = [result for result in results if isinstance(result, dict) and result.get("step") in AUTH_STEPS]
    ok = completed.returncode == 0 and any(
        isinstance(result, dict) and result.get("step") == "member-login" and result.get("status") == "ok"
        for result in auth_results
    )
    print(
        json.dumps(
            {
                "ok": ok,
                "command": ["pnpm", "smoke:test"],
                "exit_code": completed.returncode,
                "auth_results": auth_results,
                "stderr": completed.stderr.strip(),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
