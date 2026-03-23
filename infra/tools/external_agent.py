#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path


DEFAULT_TIMEOUT_SECONDS = 240
DEFAULT_RETRIES = 2
SESSION_MODES = ("auto", "fresh", "sticky", "resume-latest")
INTERACTION_MODES = ("auto", "chat", "repo")
MAX_MEMORY_TURNS = 6
MAX_MEMORY_CHARS = 600


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
        choices=SESSION_MODES,
        default="auto",
        help="Session strategy. auto/sticky keep a per-workspace wrapper session; fresh starts clean; resume-latest attaches to the provider's latest project session when supported.",
    )
    parser.add_argument(
        "--interaction-mode",
        choices=INTERACTION_MODES,
        default="auto",
        help="auto classifies the prompt as chat or repo-aware. chat avoids loading repo context by default; repo keeps workspace-aware behavior.",
    )
    return parser.parse_args()


def extract_first_json_blob(*texts: str) -> dict:
    merged = "\n".join(text for text in texts if text)
    start = merged.find("{")
    if start == -1:
        raise ValueError("No JSON object found in Gemini output.")

    depth = 0
    in_string = False
    escape = False
    for index, char in enumerate(merged[start:], start=start):
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
                return json.loads(merged[start : index + 1])

    raise ValueError("Incomplete JSON object in Gemini output.")


def workspace_slug(cwd: Path) -> str:
    normalized = cwd.resolve().as_posix().lower()
    digest = hashlib.sha1(normalized.encode("utf-8")).hexdigest()[:10]
    stem = re.sub(r"[^a-z0-9]+", "-", cwd.name.lower()).strip("-") or "workspace"
    return f"{stem}-{digest}"


def provider_runtime_dir(cwd: Path, provider: str) -> Path:
    runtime_dir = Path.home() / ".codex" / "subagent-runtime" / provider / workspace_slug(cwd)
    runtime_dir.mkdir(parents=True, exist_ok=True)
    return runtime_dir


def provider_state_path(cwd: Path, provider: str) -> Path:
    return provider_runtime_dir(cwd, provider) / "session.json"


def provider_memory_path(cwd: Path, provider: str) -> Path:
    return provider_runtime_dir(cwd, provider) / "conversation.jsonl"


def classify_interaction_mode(prompt: str, mode: str) -> str:
    if mode != "auto":
        return mode

    text = prompt.lower()
    path_pattern = re.compile(r"(?:[A-Za-z]:)?[\\/][\w .-]+|(?:^|\s)[\w.-]+\.(?:ts|tsx|js|jsx|json|md|py|yaml|yml)\b")
    repo_signals = (
        "apps/",
        "packages/",
        "design/",
        "repo",
        "repository",
        "codebase",
        "module",
        "endpoint",
        "schema",
        "dto",
        "nestjs",
        "nextjs",
        "diff",
        "route inventory",
        "api contract",
        "page inventory",
        "agents.md",
    )
    if path_pattern.search(prompt):
        return "repo"
    return "repo" if any(signal in text for signal in repo_signals) else "chat"


def shape_prompt(prompt: str, interaction_mode: str) -> str:
    stripped = prompt.strip()
    if interaction_mode == "chat":
        prefix = "Treat this as a normal chat reply. Do not inspect repository files, tools, MCP servers, or local docs unless the prompt explicitly requires them. Answer directly and concisely. "
        return prefix + stripped
    repo_prefix = "Treat this as a targeted repo task. Read only the files or paths explicitly named in the prompt. Do not recursively inspect unrelated repo files, AGENTS, skills, MCP servers, or local docs unless the prompt explicitly requires them. "
    return repo_prefix + stripped


def command_cwd(cwd: Path, provider: str, interaction_mode: str) -> Path:
    return provider_runtime_dir(cwd, provider) if interaction_mode == "chat" else cwd


def trim_memory_text(value: str) -> str:
    compact = re.sub(r"\s+", " ", value.strip())
    if len(compact) <= MAX_MEMORY_CHARS:
        return compact
    return compact[: MAX_MEMORY_CHARS - 3].rstrip() + "..."


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


def delete_file_if_exists(path: Path) -> None:
    try:
        path.unlink()
    except FileNotFoundError:
        return


def is_stale_session_error(message: str) -> bool:
    text = message.lower()
    stale_markers = (
        "no conversation found with session id",
        "conversation not found",
        "session not found",
        "invalid session",
        "unknown session",
    )
    return any(marker in text for marker in stale_markers)


def load_recent_turns(cwd: Path, provider: str) -> list[dict]:
    path = provider_memory_path(cwd, provider)
    if not path.exists():
        return []

    turns: list[dict] = []
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line:
            continue
        try:
            payload = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(payload, dict):
            turns.append(payload)
    return turns[-MAX_MEMORY_TURNS:]


def append_turn(cwd: Path, provider: str, user_prompt: str, response: str) -> None:
    payload = {
        "user": trim_memory_text(user_prompt),
        "assistant": trim_memory_text(response),
    }
    path = provider_memory_path(cwd, provider)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(payload, ensure_ascii=False) + "\n")


def inject_memory(prompt: str, cwd: Path, provider: str, session_mode: str, interaction_mode: str) -> str:
    if interaction_mode != "chat" or session_mode == "fresh":
        return prompt

    turns = load_recent_turns(cwd, provider)
    if not turns:
        return prompt

    memory_lines = []
    for turn in turns:
        user = turn.get("user")
        assistant = turn.get("assistant")
        if isinstance(user, str):
            memory_lines.append(f"User: {user}")
        if isinstance(assistant, str):
            memory_lines.append(f"Assistant: {assistant}")

    if not memory_lines:
        return prompt

    memory_block = (
        "Use the following local transcript as authoritative recent conversation context. "
        "If the user refers to earlier replies, use this transcript instead of guessing.\n"
        + "\n".join(memory_lines)
    )
    return f"{memory_block}\nCurrent user message: {prompt}"


def answer_from_local_memory(cwd: Path, provider: str, prompt: str, session_mode: str, interaction_mode: str) -> str | None:
    if interaction_mode != "chat" or session_mode == "fresh":
        return None

    text = prompt.lower()
    recall_phrases = (
        "previous reply",
        "last reply",
        "what did you just say",
        "what was your previous reply",
        "what was your last reply",
    )
    if not any(phrase in text for phrase in recall_phrases):
        return None

    turns = load_recent_turns(cwd, provider)
    if not turns:
        return None

    last_reply = next(
        (
            turn.get("assistant")
            for turn in reversed(turns)
            if isinstance(turn, dict) and isinstance(turn.get("assistant"), str) and turn.get("assistant").strip()
        ),
        None,
    )
    if not isinstance(last_reply, str):
        return None

    answer = last_reply.strip()
    if "one word" in text:
        match = re.search(r"[A-Za-z0-9À-ỹ-]+", answer)
        return match.group(0) if match else answer
    return answer


def load_provider_session(cwd: Path, provider: str) -> dict | None:
    return load_json_file(provider_state_path(cwd, provider))


def store_provider_session(cwd: Path, provider: str, payload: dict) -> str | None:
    session_id = payload.get("session_id")
    if not isinstance(session_id, str) or not session_id.strip():
        return None

    save_json_file(
        provider_state_path(cwd, provider),
        {
            "session_id": session_id.strip(),
            "model": payload.get("model"),
            "workspace_cwd": str(cwd),
        },
    )
    return session_id.strip()


def resolve_cli_script(*candidates: str) -> str | None:
    for candidate in candidates:
        resolved = shutil.which(candidate)
        if not resolved:
            continue
        path = Path(resolved)
        if path.suffix.lower() == ".cmd":
            ps1_sibling = path.with_suffix(".ps1")
            if ps1_sibling.exists():
                return str(ps1_sibling)
        return resolved
    return None


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
            time.sleep(min(5, attempt))
            continue

        if completed.returncode == 0:
            return completed

        message = completed.stderr.strip() or completed.stdout.strip() or "Unknown external worker failure."
        last_error = RuntimeError(f"{message} (attempt {attempt}/{max_attempts})")
        if attempt == max_attempts:
            raise last_error
        time.sleep(min(5, attempt))

    assert last_error is not None
    raise last_error


def run_copilot(
    prompt: str,
    model: str | None,
    cwd: Path,
    *,
    timeout_seconds: int,
    retries: int,
    session_mode: str,
    interaction_mode: str,
) -> tuple[str, str | None]:
    state = load_provider_session(cwd, "copilot") if session_mode in {"auto", "sticky"} else None
    execution_cwd = provider_runtime_dir(cwd, "copilot") if interaction_mode == "repo" else command_cwd(cwd, "copilot", interaction_mode)
    scoped_prompt = prompt
    if interaction_mode == "repo":
        scoped_prompt = (
            f"Workspace root: {cwd}. Resolve any relative repo paths from this root. "
            "Read only the explicitly named files or paths under that root; do not scan unrelated repo files.\n"
            f"{prompt}"
        )
    command = [
        "copilot.exe",
        "-p",
        scoped_prompt,
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
    if session_mode == "resume-latest":
        command.append("--continue")
    elif state and isinstance(state.get("session_id"), str):
        command.append(f"--resume={state['session_id']}")

    try:
        result = run_command_with_retries(
            command,
            cwd=execution_cwd,
            timeout_seconds=timeout_seconds,
            retries=retries,
        )
    except RuntimeError as exc:
        if state and is_stale_session_error(str(exc)):
            delete_file_if_exists(provider_state_path(cwd, "copilot"))
            fresh_command = [item for item in command if not item.startswith("--resume=")]
            result = run_command_with_retries(
                fresh_command,
                cwd=execution_cwd,
                timeout_seconds=timeout_seconds,
                retries=0,
            )
        else:
            raise

    response = None
    resolved_model = None
    session_id = None
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
        elif payload_type == "result":
            session_id = payload.get("sessionId", session_id)

    if not response:
        raise RuntimeError("Copilot CLI returned no assistant message.")
    if session_mode in {"auto", "sticky", "resume-latest"} and isinstance(session_id, str) and session_id.strip():
        store_provider_session(
            cwd,
            "copilot",
            {"session_id": session_id.strip(), "model": resolved_model},
        )
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
    if not isinstance(model, str):
        return None
    normalized = model.strip()
    if not normalized or "[" in normalized or "]" in normalized:
        return None
    return normalized


def run_claude(
    prompt: str,
    model: str | None,
    cwd: Path,
    *,
    timeout_seconds: int,
    retries: int,
    session_mode: str,
    interaction_mode: str,
) -> tuple[str, str | None]:
    claude_script = resolve_cli_script("claude.ps1", "claude.cmd", "claude")
    if not claude_script:
        raise RuntimeError("Claude Code CLI executable was not found on PATH.")

    state = load_provider_session(cwd, "claude") if session_mode in {"auto", "sticky"} else None
    execution_cwd = command_cwd(cwd, "claude", interaction_mode)
    default_model = "claude-haiku-4-5" if interaction_mode == "chat" else "sonnet"
    resolved_model = model or load_claude_default_model(cwd) or default_model
    if claude_script.lower().endswith(".ps1"):
        command = [
            "pwsh",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            claude_script,
            "-p",
            prompt,
            "--effort",
            "low",
            "--output-format",
            "json",
            "--permission-mode",
            "dontAsk",
            "--disable-slash-commands",
            "--tools",
            "" if interaction_mode == "chat" else "Read,Grep,Glob,Bash",
        ]
    else:
        command = [
            claude_script,
            "-p",
            prompt,
            "--effort",
            "low",
            "--output-format",
            "json",
            "--permission-mode",
            "dontAsk",
            "--disable-slash-commands",
            "--tools",
            "" if interaction_mode == "chat" else "Read,Grep,Glob,Bash",
        ]
    if interaction_mode == "repo":
        command.extend(["--setting-sources", "project", "--add-dir", str(cwd)])
    if session_mode == "resume-latest":
        command.append("--continue")
    elif state and isinstance(state.get("session_id"), str):
        command.extend(["--resume", state["session_id"]])
    command.extend(["--model", resolved_model])

    try:
        result = run_command_with_retries(
            command,
            cwd=execution_cwd,
            timeout_seconds=timeout_seconds,
            retries=retries,
        )
    except RuntimeError as exc:
        if state and is_stale_session_error(str(exc)):
            delete_file_if_exists(provider_state_path(cwd, "claude"))
            fresh_command: list[str] = []
            skip_next = False
            for item in command:
                if skip_next:
                    skip_next = False
                    continue
                if item == "--resume":
                    skip_next = True
                    continue
                fresh_command.append(item)
            result = run_command_with_retries(
                fresh_command,
                cwd=execution_cwd,
                timeout_seconds=timeout_seconds,
                retries=0,
            )
        else:
            raise

    try:
        payload = json.loads(result.stdout.strip())
    except json.JSONDecodeError as exc:
        raise RuntimeError("Claude Code CLI returned invalid JSON.") from exc

    response = payload.get("result", "").strip()
    if not response:
        raise RuntimeError("Claude Code CLI returned no assistant message.")
    session_id = payload.get("session_id")
    resolved_model = next(iter(payload.get("modelUsage", {}).keys()), resolved_model)
    if session_mode in {"auto", "sticky", "resume-latest"} and isinstance(session_id, str) and session_id.strip():
        store_provider_session(
            cwd,
            "claude",
            {"session_id": session_id.strip(), "model": resolved_model},
        )

    return response, resolved_model


def resolve_gemini_resume_arg(cwd: Path, session_mode: str) -> str | None:
    state = load_provider_session(cwd, "gemini")
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
    return store_provider_session(cwd, "gemini", {"session_id": payload.get("session_id"), "model": model})


def run_gemini(
    prompt: str,
    model: str | None,
    cwd: Path,
    *,
    timeout_seconds: int,
    retries: int,
    session_mode: str,
    interaction_mode: str,
) -> tuple[str, str | None, str | None]:
    gemini_script = resolve_cli_script("gemini.ps1", "gemini.cmd", "gemini")
    if not gemini_script:
        raise RuntimeError("Gemini CLI executable was not found on PATH.")

    resolved_resume = resolve_gemini_resume_arg(cwd, session_mode)
    resolved_model = model or "gemini-2.5-flash-lite"
    execution_cwd = command_cwd(cwd, "gemini", interaction_mode)

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
        cwd=execution_cwd,
        timeout_seconds=timeout_seconds,
        retries=retries,
    )

    payload = extract_first_json_blob(result.stdout, result.stderr)
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
    interaction_mode = classify_interaction_mode(args.prompt, args.interaction_mode)
    local_memory_answer = answer_from_local_memory(
        cwd,
        args.provider,
        args.prompt,
        args.session_mode,
        interaction_mode,
    )
    prompt = inject_memory(
        shape_prompt(args.prompt, interaction_mode),
        cwd,
        args.provider,
        args.session_mode,
        interaction_mode,
    )
    gemini_session_id: str | None = None
    resolved_model: str | None = None
    if local_memory_answer is not None:
        response = local_memory_answer
        resolved_model = "local-memory"
    else:
        try:
            if args.provider == "claude":
                response, resolved_model = run_claude(
                    prompt,
                    args.model,
                    cwd,
                    timeout_seconds=args.timeout_seconds,
                    retries=args.retries,
                    session_mode=args.session_mode,
                    interaction_mode=interaction_mode,
                )
            elif args.provider == "codex":
                response, resolved_model = run_codex(
                    prompt,
                    args.model,
                    cwd,
                    timeout_seconds=args.timeout_seconds,
                    retries=args.retries,
                )
            elif args.provider == "copilot":
                response, resolved_model = run_copilot(
                    prompt,
                    args.model,
                    cwd,
                    timeout_seconds=args.timeout_seconds,
                    retries=args.retries,
                    session_mode=args.session_mode,
                    interaction_mode=interaction_mode,
                )
            elif args.provider == "aider":
                response, resolved_model = run_aider(
                    prompt,
                    args.model,
                    cwd,
                    timeout_seconds=args.timeout_seconds,
                    retries=args.retries,
                )
            else:
                response, resolved_model, gemini_session_id = run_gemini(
                    prompt,
                    args.model,
                    cwd,
                    timeout_seconds=args.timeout_seconds,
                    retries=args.retries,
                    session_mode=args.session_mode,
                    interaction_mode=interaction_mode,
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
        print(f"interaction_mode={interaction_mode}")
        print("---")

    append_turn(cwd, args.provider, args.prompt, response)
    print(response)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
