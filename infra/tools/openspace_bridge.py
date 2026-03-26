#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
EXTERNAL_AGENT = ROOT / "infra" / "tools" / "external_agent.py"
OPENSPACE_EXEC = ROOT / "infra" / "tools" / "openspace_exec.py"
OPENSPACE_PYTHON = ROOT / "tmp" / "OpenSpace" / ".venv" / "Scripts" / "python.exe"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Bridge OpenSpace execution with optional Copilot advisory lanes."
    )
    parser.add_argument("--task", required=True, help="Task to run.")
    parser.add_argument(
        "--workspace",
        default=str(ROOT),
        help="Workspace directory for OpenSpace execution.",
    )
    parser.add_argument(
        "--model",
        default="gemini/gemini-3-flash-preview",
        help="OpenSpace backbone model.",
    )
    parser.add_argument(
        "--max-iterations",
        type=int,
        default=3,
        help="OpenSpace max iterations.",
    )
    parser.add_argument(
        "--copilot",
        choices=("off", "pre", "post", "both", "auto"),
        default="auto",
        help="Use Copilot before/after OpenSpace. auto enables pre+post for GitHub-centric tasks.",
    )
    parser.add_argument(
        "--mode",
        choices=("fast", "learn"),
        default="fast",
        help="fast = execution-first, learn = enable OpenSpace recording/evolution/host skills.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit machine-readable JSON.",
    )
    return parser.parse_args()


def should_use_copilot(task: str, mode: str) -> tuple[bool, bool]:
    if mode == "off":
        return False, False
    if mode == "pre":
        return True, False
    if mode == "post":
        return False, True
    if mode == "both":
        return True, True

    text = task.lower()
    githubish = any(
        token in text
        for token in ("github", "pull request", "pr ", "issue", "workflow", "actions", "copilot")
    )
    return (githubish, githubish)


def run_subprocess(command: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        cwd=str(cwd),
        text=True,
        encoding="utf-8",
        errors="replace",
        capture_output=True,
        check=False,
    )


def parse_external_worker_output(stdout: str) -> dict[str, str]:
    lines = stdout.splitlines()
    model = "unknown"
    body_start = 0
    for index, line in enumerate(lines):
        if line.startswith("model="):
            model = line.split("=", 1)[1].strip()
        if line.strip() == "---":
            body_start = index + 1
            break
    response = "\n".join(lines[body_start:]).strip()
    return {"model": model, "response": response}


def run_copilot(prompt: str, cwd: Path) -> dict[str, str]:
    completed = run_subprocess(
        [
            sys.executable,
            str(EXTERNAL_AGENT),
            "--provider",
            "copilot",
            "--prompt",
            prompt,
            "--debug",
        ],
        cwd,
    )
    if completed.returncode != 0:
        return {
            "status": "error",
            "message": completed.stderr.strip() or completed.stdout.strip() or "Copilot wrapper failed.",
        }
    parsed = parse_external_worker_output(completed.stdout)
    return {"status": "ok", **parsed}


def run_openspace(task: str, workspace: Path, model: str, max_iterations: int, mode: str) -> dict:
    if not OPENSPACE_PYTHON.exists():
        raise FileNotFoundError(f"OpenSpace venv python not found: {OPENSPACE_PYTHON}")
    completed = run_subprocess(
        [
            str(OPENSPACE_PYTHON),
            str(OPENSPACE_EXEC),
            "--task",
            task,
            "--workspace",
            str(workspace),
            "--model",
            model,
            "--max-iterations",
            str(max_iterations),
            "--mode",
            mode,
        ],
        workspace,
    )
    if completed.returncode != 0:
        raise RuntimeError(completed.stderr.strip() or completed.stdout.strip() or "OpenSpace execution failed.")
    return json.loads(completed.stdout)


def build_preflight_prompt(task: str, workspace: Path) -> str:
    return (
        "Rewrite this task into a compact execution brief for an autonomous tool-using worker. "
        "Keep it path-based, concrete, and no more than 10 lines. "
        f"Workspace: {workspace}\n"
        f"Task: {task}"
    )


def build_postflight_prompt(task: str, result: dict) -> str:
    response = str(result.get("response", "")).strip()
    evolved = result.get("evolved_skills") or []
    evolved_names = ", ".join(item.get("name", "?") for item in evolved) if evolved else "none"
    return (
        "Review this OpenSpace run and give a terse operator note. "
        "State whether the result looks usable, any obvious risk, and whether the evolved skills seem worth keeping. "
        f"Original task: {task}\n"
        f"OpenSpace status: {result.get('status')}\n"
        f"Evolved skills: {evolved_names}\n"
        f"Response:\n{response}"
    )


def emit_text(payload: dict) -> None:
    print(f"OpenSpace model: {payload['model']}")
    print(f"Status: {payload['openspace'].get('status', 'unknown')}")
    if payload.get("copilot_pre"):
        print("\n[Copilot preflight]")
        pre = payload["copilot_pre"]
        if pre["status"] == "ok":
            print(pre["response"])
        else:
            print(f"error: {pre['message']}")

    print("\n[OpenSpace response]")
    print(str(payload["openspace"].get("response", "")).strip() or "<empty>")

    evolved = payload["openspace"].get("evolved_skills") or []
    if evolved:
        print("\n[Evolved skills]")
        for item in evolved:
            print(f"- {item.get('name', '?')} ({item.get('origin', '?')})")

    if payload.get("copilot_post"):
        print("\n[Copilot post-review]")
        post = payload["copilot_post"]
        if post["status"] == "ok":
            print(post["response"])
        else:
            print(f"error: {post['message']}")


def main() -> int:
    args = parse_args()
    workspace = Path(args.workspace).resolve()
    use_pre, use_post = should_use_copilot(args.task, args.copilot)

    payload: dict[str, object] = {
        "task": args.task,
        "workspace": str(workspace),
        "model": args.model,
        "mode": args.mode,
    }

    effective_task = args.task
    if use_pre:
        pre = run_copilot(build_preflight_prompt(args.task, workspace), workspace)
        payload["copilot_pre"] = pre
        if pre.get("status") == "ok" and pre.get("response"):
            effective_task = f"{args.task}\n\nCopilot execution brief:\n{pre['response']}"

    openspace_result = run_openspace(
        task=effective_task,
        workspace=workspace,
        model=args.model,
        max_iterations=args.max_iterations,
        mode=args.mode,
    )
    payload["openspace"] = openspace_result

    if use_post:
        payload["copilot_post"] = run_copilot(
            build_postflight_prompt(args.task, openspace_result),
            workspace,
        )

    if args.json:
        print(json.dumps(payload, ensure_ascii=False, indent=2, default=str))
    else:
        emit_text(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
