#!/usr/bin/env python3
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path


DEFAULT_TIMEOUT_SECONDS = 120
DEFAULT_RETRIES = 2


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run external AI CLIs in a repo-safe, non-interactive wrapper."
    )
    parser.add_argument(
        "--provider",
        required=True,
        choices=("claude", "codex", "copilot", "gemini", "aider"),
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
    parser.add_argument(
        "--timeout-seconds",
        type=int,
        default=DEFAULT_TIMEOUT_SECONDS,
        help="Subprocess timeout in seconds. Default keeps external worker runs bounded.",
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=DEFAULT_RETRIES,
        help="Retry count for timeout or transient wrapper failures.",
    )
    parser.add_argument(
        "--session-mode",
        choices=("auto", "fresh", "sticky", "resume-latest"),
        default="auto",
        help="Gemini session strategy. auto/sticky keep a per-workspace wrapper session; fresh starts clean; resume-latest attaches to the CLI's latest project session.",
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


def provider_runtime_dir(cwd: Path, provider: str) -> Path:
    runtime_dir = cwd / "tmp" / f"{provider}-runtime"
    runtime_dir.mkdir(parents=True, exist_ok=True)
    return runtime_dir


def load_json_file(path: Path) -> dict | None:
    if not path.exists():
        return None

    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None
    return payload if isinstance(payload, dict) else None


def save_json_file(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def run_command_with_retries(
    command: list[str],
    *,
    cwd: Path,
    timeout_seconds: int,
    retries: int,
) -> subprocess.CompletedProcess[str]:
    last_error: Exception | None = None
    max_attempts = max(1, retries + 1)

    for attempt in range(1, max_attempts + 1):
        try:
            completed = subprocess.run(
                command,
                cwd=str(cwd),
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                check=False,
                timeout=timeout_seconds,
            )
        except subprocess.TimeoutExpired as exc:
            last_error = RuntimeError(
                f"Command timed out after {timeout_seconds}s (attempt {attempt}/{max_attempts})."
            )
            if attempt == max_attempts:
                raise last_error
            continue

        if completed.returncode == 0:
            return completed

        message = completed.stderr.strip() or completed.stdout.strip() or "Unknown external worker failure."
        last_error = RuntimeError(f"{message} (attempt {attempt}/{max_attempts})")
        if attempt == max_attempts:
            raise last_error

    assert last_error is not None
    raise last_error


def run_copilot(
    prompt: str,
    model: str | None,
    cwd: Path,
    *,
    timeout_seconds: int,
    retries: int,
) -> tuple[str, str | None]:
    command = [
        "copilot.exe",
        "-p",
        prompt,
        "--model",
        model or "claude-haiku-4.5",
        "--allow-all-tools",
        "--allow-all-paths",
        "--allow-all-urls",
        "--no-ask-user",
        "--no-custom-instructions",
        "--disable-builtin-mcps",
        "--stream",
        "off",
        "--output-format",
        "json",
    ]

    result = run_command_with_retries(
        command,
        cwd=cwd,
        timeout_seconds=timeout_seconds,
        retries=retries,
    )

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


def run_claude(
    prompt: str,
    model: str | None,
    cwd: Path,
    *,
    timeout_seconds: int,
    retries: int,
) -> tuple[str, str | None]:
    claude_script = shutil.which("claude.cmd") or shutil.which("claude")
    if not claude_script:
        raise RuntimeError("Claude Code CLI executable was not found on PATH.")

    resolved_model = model or load_claude_default_model(cwd) or "unknown"
    command = [
        claude_script,
        "-p",
        prompt,
        "--effort",
        "low",
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

    result = run_command_with_retries(
        command,
        cwd=cwd,
        timeout_seconds=timeout_seconds,
        retries=retries,
    )

    response = result.stdout.strip()
    if not response:
        raise RuntimeError("Claude Code CLI returned no assistant message.")

    return response, resolved_model


def resolve_gemini_resume_arg(cwd: Path, session_mode: str) -> str | None:
    runtime_dir = provider_runtime_dir(cwd, "gemini")
    state_path = runtime_dir / "session.json"
    state = load_json_file(state_path)

    if session_mode == "resume-latest":
        return "latest"
    if session_mode == "fresh":
        return None
    if session_mode in {"auto", "sticky"} and state:
        session_id = state.get("session_id")
        if isinstance(session_id, str) and session_id.strip():
            return session_id.strip()
    return None


def store_gemini_session(cwd: Path, payload: dict, model: str | None) -> str | None:
    session_id = payload.get("session_id")
    if not isinstance(session_id, str) or not session_id.strip():
        return None

    state_path = provider_runtime_dir(cwd, "gemini") / "session.json"
    save_json_file(
        state_path,
        {
            "session_id": session_id.strip(),
            "model": model,
            "cwd": str(cwd),
        },
    )
    return session_id.strip()


def run_gemini(
    prompt: str,
    model: str | None,
    cwd: Path,
    *,
    timeout_seconds: int,
    retries: int,
    session_mode: str,
) -> tuple[str, str | None, str | None]:
    gemini_script = shutil.which("gemini.cmd") or shutil.which("gemini.ps1") or shutil.which("gemini")
    if not gemini_script:
        raise RuntimeError("Gemini CLI executable was not found on PATH.")

    resolved_resume = resolve_gemini_resume_arg(cwd, session_mode)
    resolved_model = model or "gemini-2.5-flash-lite"

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
            "--model",
            resolved_model,
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
            "--model",
            resolved_model,
            "--approval-mode",
            "yolo",
            "--output-format",
            "json",
        ]

    if resolved_resume:
        command.extend(["--resume", resolved_resume])

    result = run_command_with_retries(
        command,
        cwd=cwd,
        timeout_seconds=timeout_seconds,
        retries=retries,
    )

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

    stored_session_id = None
    if session_mode in {"auto", "sticky", "resume-latest"}:
        stored_session_id = store_gemini_session(cwd, payload, resolved_model)

    return response, resolved_model, stored_session_id


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


def load_aider_default_model() -> str | None:
    explicit = os.environ.get("AIDER_MODEL")
    if explicit:
        return explicit

    if os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"):
        return "gemini/gemini-2.5-flash-lite"

    return None


def find_aider_executable() -> str:
    for candidate in ("aider.exe", "aider.cmd", "aider"):
        resolved = shutil.which(candidate)
        if resolved:
            return resolved

    fallback = Path.home() / ".local" / "bin" / ("aider.exe" if os.name == "nt" else "aider")
    if fallback.exists():
        return str(fallback)

    raise RuntimeError("Aider executable was not found on PATH or in ~/.local/bin.")


def run_aider(
    prompt: str,
    model: str | None,
    cwd: Path,
    *,
    timeout_seconds: int,
    retries: int,
) -> tuple[str, str | None]:
    aider_script = find_aider_executable()
    resolved_model = model or load_aider_default_model()
    runtime_dir = cwd / "tmp" / "aider-runtime"
    runtime_dir.mkdir(parents=True, exist_ok=True)

    command = [
        aider_script,
        "--message",
        prompt,
        "--yes-always",
        "--dry-run",
        "--no-auto-commits",
        "--no-dirty-commits",
        "--no-gitignore",
        "--no-pretty",
        "--no-stream",
        "--no-show-model-warnings",
        "--no-check-update",
        "--analytics-disable",
        "--encoding",
        "utf-8",
        "--input-history-file",
        str(runtime_dir / "input.history"),
        "--chat-history-file",
        str(runtime_dir / "chat.history.md"),
        "--llm-history-file",
        str(runtime_dir / "llm.history.log"),
        "--subtree-only",
    ]
    if resolved_model:
        command.extend(["--model", resolved_model])

    result = run_command_with_retries(
        command,
        cwd=cwd,
        timeout_seconds=timeout_seconds,
        retries=retries,
    )

    response = result.stdout.strip()
    if not response:
        raise RuntimeError("Aider returned no assistant message.")

    return response, resolved_model or "configured-by-aider"


def run_codex(
    prompt: str,
    model: str | None,
    cwd: Path,
    *,
    timeout_seconds: int,
    retries: int,
) -> tuple[str, str | None]:
    codex_script = shutil.which("codex.cmd") or shutil.which("codex")
    if not codex_script:
        raise RuntimeError("Codex CLI executable was not found on PATH.")

    resolved_model = model or "gpt-5.4-mini"
    command = [
        codex_script,
        "-m",
        resolved_model,
        "-a",
        "never",
        "-c",
        "features.multi_agent=false",
        "-c",
        "project_doc_max_bytes=8192",
        "-c",
        "model_reasoning_effort=\"medium\"",
        "exec",
        "-C",
        str(cwd),
        "-s",
        "read-only",
        "--json",
        prompt,
    ]

    result = run_command_with_retries(
        command,
        cwd=cwd,
        timeout_seconds=timeout_seconds,
        retries=retries,
    )

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
    gemini_session_id: str | None = None

    try:
        if args.provider == "claude":
            response, resolved_model = run_claude(
                args.prompt,
                args.model,
                cwd,
                timeout_seconds=args.timeout_seconds,
                retries=args.retries,
            )
        elif args.provider == "codex":
            response, resolved_model = run_codex(
                args.prompt,
                args.model,
                cwd,
                timeout_seconds=args.timeout_seconds,
                retries=args.retries,
            )
        elif args.provider == "copilot":
            response, resolved_model = run_copilot(
                args.prompt,
                args.model,
                cwd,
                timeout_seconds=args.timeout_seconds,
                retries=args.retries,
            )
        elif args.provider == "aider":
            response, resolved_model = run_aider(
                args.prompt,
                args.model,
                cwd,
                timeout_seconds=args.timeout_seconds,
                retries=args.retries,
            )
        else:
            response, resolved_model, gemini_session_id = run_gemini(
                args.prompt,
                args.model,
                cwd,
                timeout_seconds=args.timeout_seconds,
                retries=args.retries,
                session_mode=args.session_mode,
            )
    except Exception as exc:  # pragma: no cover - wrapper should fail loudly
        print(f"[external-agent:{args.provider}] {exc}", file=sys.stderr)
        return 1

    if args.debug:
        model_value = resolved_model or args.model or "unknown"
        print(f"provider={args.provider}")
        print(f"model={model_value}")
        if args.provider == "gemini":
            print(f"session_mode={args.session_mode}")
            if gemini_session_id:
                print(f"session_id={gemini_session_id}")
        print("---")

    print(response)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
