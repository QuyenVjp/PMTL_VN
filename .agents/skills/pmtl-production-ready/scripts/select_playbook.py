from __future__ import annotations

import argparse
import json


def choose_lane(task: str) -> dict[str, object]:
    text = task.lower()
    if any(keyword in text for keyword in ["bug", "incident", "error", "500", "403", "429", "failed", "failure", "broken"]):
        return {
            "lane": "incident",
            "read": [
                "references/incident-lane.md",
                "docs/troubleshooting.md",
                "docs/runbooks.md",
            ],
            "pair_with": ["pmtl-runbook-cms-runtime-errors"],
        }
    if any(keyword in text for keyword in ["release", "deploy", "ship", "done", "verify", "production"]):
        return {
            "lane": "release-gate",
            "read": ["references/release-gate.md"],
            "pair_with": ["pmtl-verify-quality-gate", "pmtl-automation-smoke-suite"],
        }
    return {
        "lane": "implementation",
        "read": ["references/implementation-lane.md", "docs/architecture/conventions.md"],
        "pair_with": ["pmtl-production-baseline", "pmtl-verify-quality-gate"],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--task", required=True)
    args = parser.parse_args()
    print(json.dumps(choose_lane(args.task), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
