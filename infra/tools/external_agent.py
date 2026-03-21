#!/usr/bin/env python3
import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run external AI CLIs in a repo-safe, non-interactive wrapper."
    )
    parser.add_argument(
        "--provider",
        required=True,
        choices=("claude", "codex", "copilot", "gemini"),
        help="External CLI to run.",
    )
    parser.add_argument(
        "--prompt",
        required=True,
        help="Prompt to send. Keep it concise and reference file paths instead of pasting large blobs.",
    )
    parser.add_argument(
        "--model",
        help="Optional model override understood by the target CLI.",
    )
    parser.add_argument(
        "--cwd",
        help="Optional working directory override. Defaults to current working directory.",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Print provider and model metadata before the response.",
    )
    return parser.parse_args()


def extract_first_json_blob(text: str) -> dict:
    start = text.find("{")
    if start == -1:
        raise ValueError("No JSON object found in Gemini output.")

    depth = 0
    in_string = False
    escape = False
    for index, char in enumerate(text[start:], start=start):
        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == '"':
                in_string = False
            continue

        if char == '"':
            in_string = True
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return json.loads(text[start : index + 1])

    raise ValueError("Incomplete JSON object in Gemini output.")


def run_copilot(prompt: str, model: str | None, cwd: Path) -> tuple[str, str | None]:
    command = [
        "copilot.exe",
        "-p",
        prompt,
        "--allow-all-tools",
        "--allow-all-paths",
        "--allow-all-urls",
        "--no-ask-user",
        "--output-format",
        "json",
    ]
    if model:
        command.extend(["--model", model])

    result = subprocess.run(
        command,
        cwd=str(cwd),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip())

    response = None
    resolved_model = None
    for line in result.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            payload = json.loads(line)
        except json.JSONDecodeError:
            continue

        payload_type = payload.get("type")
        if payload_type == "assistant.message":
            response = payload.get("data", {}).get("content")
        elif payload_type == "session.tools_updated":
            resolved_model = payload.get("data", {}).get("model", resolved_model)

    if not response:
        raise RuntimeError("Copilot CLI returned no assistant message.")
    return response.strip(), resolved_model


def load_claude_default_model(cwd: Path) -> str | None:
    settings_path = cwd / ".claude" / "settings.json"
    if not settings_path.exists():
        return None

    try:
        payload = json.loads(settings_path.read_text(encoding="utf-8"))
    except Exception:
        return None

    model = payload.get("model")
    return model if isinstance(model, str) else None


def run_claude(prompt: str, model: str | None, cwd: Path) -> tuple[str, str | None]:
    claude_script = shutil.which("claude.cmd") or shutil.which("claude")
    if not claude_script:
        raise RuntimeError("Claude Code CLI executable was not found on PATH.")

    resolved_model = model or load_claude_default_model(cwd) or "unknown"
    command = [
        claude_script,
        "-p",
        prompt,
        "--output-format",
        "text",
        "--permission-mode",
        "dontAsk",
        "--disable-slash-commands",
        "--allowedTools",
        "Read,Grep,Glob,Bash",
        "--setting-sources",
        "project",
        "--add-dir",
        str(cwd),
    ]
    if model:
        command.extend(["--model", model])

    result = subprocess.run(
        command,
        cwd=str(cwd),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip())

    response = result.stdout.strip()
    if not response:
        raise RuntimeError("Claude Code CLI returned no assistant message.")

    return response, resolved_model


def run_gemini(prompt: str, model: str | None, cwd: Path) -> tuple[str, str | None]:
    gemini_script = shutil.which("gemini.cmd") or shutil.which("gemini.ps1") or shutil.which("gemini")
    if not gemini_script:
        raise RuntimeError("Gemini CLI executable was not found on PATH.")

    if gemini_script.lower().endswith(".ps1"):
        command = [
            "pwsh",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            gemini_script,
            "-p",
            prompt,
            "--approval-mode",
            "yolo",
            "--output-format",
            "json",
        ]
    else:
        command = [
            gemini_script,
            "-p",
            prompt,
            "--approval-mode",
            "yolo",
            "--output-format",
            "json",
        ]
    if model:
        command.extend(["--model", model])

    result = subprocess.run(
        command,
        cwd=str(cwd),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip())

    payload = extract_first_json_blob(result.stdout)
    response = payload.get("response", "").strip()
    if not response:
        raise RuntimeError("Gemini CLI returned no response field.")

    models = payload.get("stats", {}).get("models", {})
    resolved_model = None
    if models:
        resolved_model = max(
            models.items(),
            key=lambda item: item[1].get("api", {}).get("totalRequests", 0),
        )[0]

    return response, resolved_model


def load_codex_default_model() -> str | None:
    config_path = Path.home() / ".codex" / "config.toml"
    if not config_path.exists():
        return None

    try:
        content = config_path.read_text(encoding="utf-8")
    except Exception:
        return None

    match = re.search(r'^\s*model\s*=\s*"([^"]+)"', content, re.MULTILINE)
    return match.group(1) if match else None


def run_codex(prompt: str, model: str | None, cwd: Path) -> tuple[str, str | None]:
    codex_script = shutil.which("codex.cmd") or shutil.which("codex")
    if not codex_script:
        raise RuntimeError("Codex CLI executable was not found on PATH.")

    resolved_model = model or load_codex_default_model() or "unknown"
    command = [
        codex_script,
        "-a",
        "never",
        "-c",
        "features.multi_agent=false",
        "-c",
        "project_doc_max_bytes=8192",
        "exec",
        "-C",
        str(cwd),
        "-s",
        "read-only",
        "--json",
        prompt,
    ]
    if model:
        command[2:2] = ["-m", model]

    result = subprocess.run(
        command,
        cwd=str(cwd),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip())

    response = None
    for line in result.stdout.splitlines():
        line = line.strip()
        if not line or not line.startswith("{"):
            continue
        try:
            payload = json.loads(line)
        except json.JSONDecodeError:
            continue

        if payload.get("type") != "item.completed":
            continue

        item = payload.get("item", {})
        if item.get("type") == "agent_message":
            response = item.get("text")

    if not response:
        raise RuntimeError("Codex CLI returned no assistant message.")

    return response.strip(), resolved_model


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

    args = parse_args()
    cwd = Path(args.cwd).resolve() if args.cwd else Path.cwd()

    try:
        if args.provider == "claude":
            response, resolved_model = run_claude(args.prompt, args.model, cwd)
        elif args.provider == "codex":
            response, resolved_model = run_codex(args.prompt, args.model, cwd)
        elif args.provider == "copilot":
            response, resolved_model = run_copilot(args.prompt, args.model, cwd)
        else:
            response, resolved_model = run_gemini(args.prompt, args.model, cwd)
    except Exception as exc:  # pragma: no cover - wrapper should fail loudly
        print(f"[external-agent:{args.provider}] {exc}", file=sys.stderr)
        return 1

    if args.debug:
        model_value = resolved_model or args.model or "unknown"
        print(f"provider={args.provider}")
        print(f"model={model_value}")
        print("---")

    print(response)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
