#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
EXTERNAL_AGENT = ROOT / "infra" / "tools" / "external_agent.py"
PROVIDERS = ("claude", "codex", "copilot", "gemini")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Route a task to the smallest correct external AI CLI worker set."
    )
    parser.add_argument("--task", required=True, help="Task description to route.")
    parser.add_argument(
        "--provider",
        choices=PROVIDERS,
        help="Force a provider instead of auto-routing.",
    )
    parser.add_argument(
        "--compare",
        action="store_true",
        help="Ask a second worker for comparison using the routing matrix fallback.",
    )
    parser.add_argument(
        "--route-only",
        action="store_true",
        help="Print the routing decision without calling any worker.",
    )
    parser.add_argument("--cwd", help="Optional working directory override.")
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit machine-readable JSON.",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Include routing metadata and worker model info.",
    )
    parser.add_argument(
        "--speed",
        choices=("fast", "balanced", "deep"),
        default="fast",
        help="Routing bias. fast avoids slower workers unless clearly warranted.",
    )
    return parser.parse_args()


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def score_task(task: str) -> tuple[dict[str, int], list[str]]:
    text = normalize(task)
    scores = {provider: 0 for provider in PROVIDERS}
    reasons: list[str] = []

    research_keywords = (
        "latest",
        "newest",
        "current",
        "official docs",
        "documentation",
        "search",
        "research",
        "compare models",
        "version drift",
        "release notes",
        "migrate",
        "what changed",
    )
    if any(keyword in text for keyword in research_keywords):
        scores["gemini"] += 5
        reasons.append("Current-doc or research task pushes priority to Gemini.")

    github_keywords = (
        "github",
        "pull request",
        "pr ",
        "issue",
        "actions",
        "workflow",
        "gh ",
        "copilot",
        "prompt file",
        "custom agent",
        "mcp tool",
        "acp",
    )
    if any(keyword in text for keyword in github_keywords):
        scores["copilot"] += 5
        reasons.append("GitHub-centric wording pushes priority to Copilot.")

    policy_keywords = (
        "architecture",
        "design",
        "repo policy",
        "routing",
        "skill",
        "agents.md",
        "claude.md",
        "docs",
        "governance",
        "review first",
        "multi file",
        "cross file",
        "source of truth",
    )
    if any(keyword in text for keyword in policy_keywords):
        scores["claude"] += 4
        reasons.append("Policy or architecture wording pushes priority to Claude.")

    repo_policy_paths = ("agents.md", "claude.md", "team_guide.md", "design/")
    if any(keyword in text for keyword in repo_policy_paths):
        scores["claude"] += 3
        reasons.append("Repo policy file references increase Claude priority.")

    high_context_policy = ("architecture", "repo policy", "source of truth", "governance", "agents policy")
    if any(keyword in text for keyword in high_context_policy):
        scores["claude"] += 2
        reasons.append("High-context policy wording strengthens Claude as primary reviewer.")

    codex_keywords = (
        "script",
        "wrapper",
        "patch",
        "diff",
        "review",
        "non-interactive",
        "cli",
        "exec",
        "command",
        "regex",
        "json",
        "automation",
        "targeted",
        "focused",
    )
    if any(keyword in text for keyword in codex_keywords):
        scores["codex"] += 4
        reasons.append("Focused scripting or review wording pushes priority to Codex.")

    path_hits = re.findall(r"(?:^|\s)(?:[A-Za-z]:)?[\\/.\w-]+(?:/[.\w-]+)+(?:\.[A-Za-z0-9]+)?", task)
    if len(path_hits) >= 3:
        scores["claude"] += 2
        reasons.append("Multiple path references suggest a higher-context review.")
    elif len(path_hits) == 1:
        scores["codex"] += 1
        reasons.append("Single-path task suggests a narrower worker lane.")

    if "compare" in text or "second opinion" in text:
        scores["gemini"] += 1
        scores["codex"] += 1
        reasons.append("Comparison wording makes a two-worker lane more likely.")

    if all(value == 0 for value in scores.values()):
        scores["claude"] = 2
        reasons.append("Default fallback is Claude for general repo-aware tasks.")

    return scores, reasons


def pick_secondary(primary: str, scores: dict[str, int]) -> str:
    preferred = {
        "gemini": "codex",
        "claude": "codex",
        "codex": "claude",
        "copilot": "claude",
    }
    candidate = preferred[primary]
    if candidate != primary:
        return candidate

    ordered = sorted(scores.items(), key=lambda item: (-item[1], item[0]))
    for provider, _score in ordered:
        if provider != primary:
            return provider
    return primary


def apply_speed_bias(scores: dict[str, int], task: str, speed: str, reasons: list[str]) -> None:
    text = normalize(task)
    if speed == "balanced":
        return

    if speed == "fast":
        explicit_gemini = any(token in text for token in ("latest", "official docs", "version drift", "research", "what changed"))
        explicit_copilot = any(token in text for token in ("github", "pull request", "actions", "workflow", "copilot"))
        explicit_codex = any(token in text for token in ("codex", "exec", "jsonl", "non-interactive"))

        if not explicit_gemini:
            scores["gemini"] -= 2
        else:
            scores["gemini"] += 2
        if not explicit_codex:
            scores["codex"] -= 3
        else:
            scores["codex"] += 1
        if not explicit_copilot:
            scores["copilot"] -= 1
        scores["claude"] += 1
        reasons.append("Fast mode biases toward the quickest useful lane and avoids slower workers unless clearly warranted.")
        return

    if speed == "deep":
        scores["claude"] += 1
        scores["codex"] += 1
        reasons.append("Deep mode keeps higher-context and review-heavy workers eligible.")


def provider_rank(provider: str, speed: str) -> int:
    if speed == "fast":
        order = ("claude", "copilot", "gemini", "codex")
    elif speed == "deep":
        order = ("claude", "codex", "gemini", "copilot")
    else:
        order = ("claude", "gemini", "codex", "copilot")
    return order.index(provider)


def route_task(task: str, forced_provider: str | None, compare: bool, speed: str) -> dict[str, object]:
    scores, reasons = score_task(task)
    apply_speed_bias(scores, task, speed, reasons)
    if forced_provider:
        primary = forced_provider
        reasons.insert(0, f"Provider forced to {forced_provider}.")
    else:
        primary = sorted(scores.items(), key=lambda item: (-item[1], provider_rank(item[0], speed), item[0]))[0][0]

    secondary = pick_secondary(primary, scores) if compare else None
    return {
        "primary": primary,
        "secondary": secondary,
        "scores": scores,
        "reasons": reasons,
        "speed": speed,
    }


def run_worker(provider: str, task: str, cwd: Path) -> dict[str, str]:
    command = [
        sys.executable,
        str(EXTERNAL_AGENT),
        "--provider",
        provider,
        "--prompt",
        task,
        "--debug",
    ]
    completed = subprocess.run(
        command,
        cwd=str(cwd),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    if completed.returncode != 0:
        raise RuntimeError(completed.stderr.strip() or completed.stdout.strip())

    lines = completed.stdout.splitlines()
    model = "unknown"
    body_start = 0
    for index, line in enumerate(lines):
        if line.startswith("model="):
            model = line.split("=", 1)[1].strip()
        if line.strip() == "---":
            body_start = index + 1
            break

    response = "\n".join(lines[body_start:]).strip()
    return {"provider": provider, "model": model, "response": response}


def emit_text(result: dict[str, object], debug: bool) -> None:
    route = result["route"]
    primary = route["primary"]
    secondary = route.get("secondary")
    print(f"primary={primary}")
    if secondary:
        print(f"secondary={secondary}")
    if debug:
        print("reasons:")
        for reason in route["reasons"]:
            print(f"- {reason}")
        print("---")

    runs = result.get("runs", [])
    for index, run in enumerate(runs):
        if index:
            print("\n---")
        print(f"[{run['provider']} | {run['model']}]")
        print(run["response"])


def main() -> int:
    args = parse_args()
    cwd = Path(args.cwd).resolve() if args.cwd else Path.cwd()
    route = route_task(args.task, args.provider, args.compare, args.speed)
    result: dict[str, object] = {"ok": True, "task": args.task, "route": route, "runs": []}

    if not args.route_only:
        providers = [route["primary"]]
        if route.get("secondary"):
            providers.append(route["secondary"])
        for provider in providers:
            run = run_worker(provider, args.task, cwd)
            result["runs"].append(run)

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        emit_text(result, args.debug)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
