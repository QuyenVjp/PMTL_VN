from __future__ import annotations

import argparse
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
COMPOSE_FILE = ROOT / "infra" / "docker" / "compose.dev.yml"
ENV_FILE = ROOT / "infra" / "docker" / ".env.dev"
SKILLS_DIR = ROOT / ".agents" / "skills"
TAXONOMY_PATH = ROOT / "docs" / "architecture" / "skills-taxonomy.md"
MULTI_CLI_ROUTER_PATH = ROOT / "infra" / "tools" / "multi_cli_router.py"

SMOKE_DOCKER_ENV = {
    # Repo no longer ships a CMS service; point to a host-run backend if available.
    "CMS_PUBLIC_URL": "http://host.docker.internal:3001",
    "CMS_API_TOKEN": "",
    "NEXT_PUBLIC_SITE_URL": "http://web:5173",
}


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def emit_json(payload: dict[str, object]) -> None:
    print(json.dumps(payload, ensure_ascii=True, indent=2))


def run_process(command: list[str], *, cwd: Path = ROOT) -> dict[str, object]:
    resolved_command = command[:]
    if os.name == "nt":
        command_line = subprocess.list2cmdline(command)
        cmd_exe = os.environ.get("COMSPEC") or r"C:\Windows\System32\cmd.exe"
        resolved_command = [cmd_exe, "/d", "/s", "/c", command_line]
    else:
        executable = resolved_command[0]
        if shutil.which(executable) is None and shutil.which(f"{executable}.cmd"):
            resolved_command[0] = f"{executable}.cmd"

    completed = subprocess.run(
        resolved_command,
        cwd=cwd,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    return {
        "command": resolved_command,
        "exit_code": completed.returncode,
        "stdout": completed.stdout.strip(),
        "stderr": completed.stderr.strip(),
    }


def compose_base_args() -> list[str]:
    return ["docker", "compose", "--env-file", str(ENV_FILE), "-f", str(COMPOSE_FILE)]


def docker_available() -> bool:
    result = subprocess.run(["docker", "info"], cwd=ROOT, capture_output=True, text=True)
    return result.returncode == 0


def running_services() -> set[str]:
    if not COMPOSE_FILE.exists() or not ENV_FILE.exists() or not docker_available():
        return set()

    result = subprocess.run(
        [*compose_base_args(), "ps", "--status", "running", "--services"],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return set()
    return {line.strip() for line in result.stdout.splitlines() if line.strip()}


def shell_prefix(env: dict[str, str] | None) -> str:
    if not env:
        return ""
    return " ".join(f"{key}={shlex.quote(value)}" for key, value in env.items()) + " "


def resolve_service_container(service: str) -> str:
    preferred_name = f"docker-{service}-1"
    direct = subprocess.run(
        ["docker", "inspect", preferred_name],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if direct.returncode == 0:
        return preferred_name

    compose_result = subprocess.run(
        [*compose_base_args(), "ps", "-q", service],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    container_id = compose_result.stdout.strip()
    if compose_result.returncode == 0 and container_id:
        return container_id

    return preferred_name


def run_in_service(service: str, command: list[str], *, env: dict[str, str] | None = None) -> dict[str, object]:
    shell_command = f"cd /app && {shell_prefix(env)}{' '.join(shlex.quote(part) for part in command)}"
    return run_process(["docker", "exec", resolve_service_container(service), "sh", "-lc", shell_command])


def detect_runtime(preferred: str, *, required_services: set[str], default_auto: str) -> str:
    if preferred in {"host", "docker"}:
        return preferred
    active_services = running_services()
    if default_auto == "docker" and required_services.issubset(active_services):
        return "docker"
    return "host"


def extract_json_blob(text: str) -> dict[str, object]:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("Could not find JSON output in command output")
    return json.loads(text[start : end + 1])


def normalize_heading(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", value.strip().lower()).strip("-")
    return normalized


SECTION_PATTERNS = {
    "purpose": [r"purpose", r"overview", r"supported-suites", r"operating-model", r"interaction-rules", r"variant-selection"],
    "use_when": [r"use-when", r"read-first", r"read-in-this-order", r"read-only-what-applies", r"review-order"],
    "required_inputs": [r"required-inputs", r"inputs", r"input"],
    "expected_output": [r"expected-output", r"output-rule", r"output"],
    "execution_approach": [r"execution-approach", r"default-order", r"incident-approach", r"script", r"task-routing", r"core-rules", r"shared-rules"],
    "quality_criteria": [r"quality-criteria", r"findings-to-prioritize", r"non-negotiables", r"baseline-rules", r"core-rules"],
    "verification": [r"verification", r"output-rule", r"default-order", r"script", r"incident-approach"],
    "edge_cases": [r"edge-cases", r"typical-incident-buckets", r"common-bad-decisions"],
    "references": [r"references", r"variant-selection", r"pair-with", r"pair-withs", r"use-this-skill-with"],
}

REQUIRED_SECTIONS = (
    "purpose",
    "use_when",
    "execution_approach",
    "verification",
)

RECOMMENDED_SECTIONS = (
    "required_inputs",
    "expected_output",
    "quality_criteria",
    "edge_cases",
    "references",
)


def load_skill_categories() -> dict[str, str]:
    if not TAXONOMY_PATH.exists():
        return {}

    categories: dict[str, str] = {}
    active_local_taxonomy = False
    current_category: str | None = None
    for raw_line in TAXONOMY_PATH.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if line == "## Active local taxonomy":
            active_local_taxonomy = True
            continue
        if active_local_taxonomy and line.startswith("## "):
            break
        if not active_local_taxonomy:
            continue
        if line.startswith("### "):
            current_category = line.removeprefix("### ").strip().lower()
            continue
        if current_category and line.startswith("- `") and "`" in line[3:]:
            skill_name = line.split("`", 2)[1]
            categories[skill_name] = current_category
    return categories


def classify_section_hits(headings: list[str], content: str) -> tuple[list[str], list[str]]:
    normalized_headings = [normalize_heading(heading) for heading in headings]
    hits: set[str] = set()

    for section_name, patterns in SECTION_PATTERNS.items():
        for heading in normalized_headings:
            if any(re.fullmatch(pattern, heading) for pattern in patterns):
                hits.add(section_name)
                break

    normalized_content = normalize_heading(content)
    if "verification" not in hits and any(token in normalized_content for token in ("quality-gate", "verify", "verification")):
        hits.add("verification")

    missing_required = [section for section in REQUIRED_SECTIONS if section not in hits]
    missing_recommended = [section for section in RECOMMENDED_SECTIONS if section not in hits]
    return missing_required, missing_recommended


def skill_audit(include_legacy: bool) -> int:
    categories = load_skill_categories()
    skill_reports: list[dict[str, object]] = []

    for skill_dir in sorted(SKILLS_DIR.iterdir(), key=lambda item: item.name):
        if not skill_dir.is_dir():
            continue

        skill_name = skill_dir.name
        category = categories.get(skill_name)
        if not include_legacy and category is None:
            continue

        skill_file = skill_dir / "SKILL.md"
        content = skill_file.read_text(encoding="utf-8") if skill_file.exists() else ""
        headings = re.findall(r"^#+\s+(.+)$", content, flags=re.MULTILINE)
        frontmatter_name = bool(re.search(r"(?m)^name:\s*", content))
        frontmatter_description = bool(re.search(r"(?m)^description:\s*", content))
        missing_required, missing_recommended = classify_section_hits(headings, content)

        artifact_paths = {
            "references": skill_dir / "references",
            "scripts": skill_dir / "scripts",
            "templates": skill_dir / "templates",
            "examples": skill_dir / "examples",
            "verification": skill_dir / "verification",
            "test_data": skill_dir / "test-data",
            "gotchas": skill_dir / "gotchas.md",
            "changelog": skill_dir / "changelog.md",
        }
        artifacts = {name: path.exists() for name, path in artifact_paths.items()}

        score = 0
        if skill_file.exists():
            score += 1
        if frontmatter_name and frontmatter_description:
            score += 1
        score += len(REQUIRED_SECTIONS) - len(missing_required)
        score += sum(1 for key in ("references", "scripts", "templates", "examples", "verification", "gotchas", "changelog") if artifacts[key])

        skill_reports.append(
            {
                "skill": skill_name,
                "category": category or "legacy-or-unmapped",
                "has_skill_md": skill_file.exists(),
                "frontmatter_ok": frontmatter_name and frontmatter_description,
                "missing_required_sections": missing_required,
                "missing_recommended_sections": missing_recommended,
                "artifacts": artifacts,
                "score": score,
            }
        )

    totals = {
        "skills_audited": len(skill_reports),
        "missing_required_sections": sum(1 for report in skill_reports if report["missing_required_sections"]),
        "missing_verification_assets": sum(
            1
            for report in skill_reports
            if not isinstance(report["artifacts"], dict) or not report["artifacts"].get("verification")
        ),
        "missing_changelog": sum(
            1
            for report in skill_reports
            if not isinstance(report["artifacts"], dict) or not report["artifacts"].get("changelog")
        ),
        "missing_gotchas": sum(
            1
            for report in skill_reports
            if not isinstance(report["artifacts"], dict) or not report["artifacts"].get("gotchas")
        ),
    }

    emit_json(
        {
            "ok": True,
            "include_legacy": include_legacy,
            "totals": totals,
            "skills": skill_reports,
        }
    )
    return 0


def quality_gate(scope: str, skip_tests: bool, runtime: str) -> int:
    if scope == "web":
        commands = [["pnpm", "--filter", "@pmtl/web", "typecheck"], ["pnpm", "--filter", "@pmtl/web", "lint"]]
        service = "web"
        required = {"web"}
    elif scope in ("api", "cms"):
        commands = [["pnpm", "--filter", "@pmtl/api", "typecheck"], ["pnpm", "--filter", "@pmtl/api", "lint"]]
        service = "api"
        required = {"postgres", "redis", "meilisearch"}
    else:
        commands = [["pnpm", "typecheck"], ["pnpm", "lint"]]
        service = "web"
        required = {"web"}

    if not skip_tests:
        if scope == "web":
            commands.insert(0, ["pnpm", "--filter", "@pmtl/web", "test"])
        elif scope in ("api", "cms"):
            commands.insert(0, ["pnpm", "--filter", "@pmtl/api", "test"])
        else:
            commands.insert(0, ["pnpm", "test"])

    selected_runtime = detect_runtime(runtime, required_services=required, default_auto="docker")
    runner = (lambda command: run_in_service(service, command)) if selected_runtime == "docker" else run_process
    results = [runner(command) for command in commands]
    ok = all(result["exit_code"] == 0 for result in results)
    emit_json({"ok": ok, "runtime": selected_runtime, "scope": scope, "results": results})
    return 0 if ok else 1


def smoke_suite(suite: str, runtime: str) -> int:
    commands = {
        "smoke": ["pnpm", "smoke:test"],
        "monitoring": ["pnpm", "monitoring:test"],
        "telegram": ["pnpm", "telegram:test"],
    }
    required_services = {"web"} if suite == "smoke" else set()
    default_auto = "host"
    selected_runtime = detect_runtime(runtime, required_services=required_services, default_auto=default_auto)

    if selected_runtime == "docker":
        result = run_in_service("web", commands[suite], env=SMOKE_DOCKER_ENV if suite == "smoke" else None)
    else:
        result = run_process(commands[suite])

    ok = result["exit_code"] == 0
    emit_json({"ok": ok, "runtime": selected_runtime, "suite": suite, "result": result})
    return 0 if ok else 1


def _extract_env_refs(value: object) -> list[str]:
    refs: list[str] = []
    if isinstance(value, str):
        refs.extend(match.group(1) for match in re.finditer(r"\$\{([A-Z0-9_]+)\}", value))
    elif isinstance(value, list):
        for item in value:
            refs.extend(_extract_env_refs(item))
    elif isinstance(value, dict):
        for nested in value.values():
            refs.extend(_extract_env_refs(nested))
    return refs


def _tool_exists(command: str) -> bool:
    if os.name == "nt":
        return shutil.which(command) is not None or shutil.which(f"{command}.exe") is not None
    return shutil.which(command) is not None


def mcp_smoke() -> int:
    mcp_path = ROOT / ".mcp.json"
    if not mcp_path.exists():
        emit_json(
            {
                "ok": False,
                "workspace_mcp_present": False,
                "reason": f"Missing workspace MCP config at {mcp_path}",
            }
        )
        return 1

    config = json.loads(mcp_path.read_text(encoding="utf-8"))
    servers = config.get("mcpServers", {})
    if not isinstance(servers, dict):
        emit_json({"ok": False, "workspace_mcp_present": True, "reason": "Invalid .mcp.json: mcpServers must be an object"})
        return 1

    repo_paths = {
        "apps/web": (ROOT / "apps" / "web").exists(),
        "infra/tools/start_mcp_server.ps1": (ROOT / "infra" / "tools" / "start_mcp_server.ps1").exists(),
    }

    server_reports: list[dict[str, object]] = []
    overall_ok = True

    for name, server in servers.items():
        if not isinstance(server, dict):
            server_reports.append({"server": name, "ok": False, "reason": "Server entry must be an object"})
            overall_ok = False
            continue

        command = str(server.get("command", ""))
        args = server.get("args", [])
        transport = server.get("type", "unknown")
        env_refs = sorted(set(_extract_env_refs(server)))
        missing_env = [env_name for env_name in env_refs if not os.environ.get(env_name)]
        command_ok = bool(command) and _tool_exists(command)
        notes: list[str] = []
        required_paths: list[str] = []

        if name == "shadcn":
            required_paths.append("apps/web")
            if not repo_paths["apps/web"]:
                notes.append("apps/web is missing, so shadcn MCP cannot target the web app yet")
        if name in {"meilisearch-admin", "redis-admin", "grafana", "postgres-pmtl"}:
            required_paths.append("infra/tools/start_mcp_server.ps1")
            if not repo_paths["infra/tools/start_mcp_server.ps1"]:
                notes.append("start_mcp_server.ps1 is missing")
        if name == "next-devtools" and not repo_paths["apps/web"]:
            notes.append("next-devtools MCP server can start, but Next.js runtime evidence will stay limited until apps/web exists")
        if name == "smartbear" and not os.environ.get("SWAGGER_API_KEY"):
            notes.append("SWAGGER_API_KEY is not set, so hosted SmartBear/SwaggerHub lane will stay unavailable")

        ok = command_ok and not missing_env
        if "apps/web" in required_paths and not repo_paths["apps/web"]:
            ok = False

        overall_ok = overall_ok and ok
        server_reports.append(
            {
                "server": name,
                "ok": ok,
                "transport": transport,
                "command": command,
                "args": args,
                "command_available": command_ok,
                "required_env": env_refs,
                "missing_env": missing_env,
                "required_paths": required_paths,
                "notes": notes,
            }
        )

    emit_json(
        {
            "ok": overall_ok,
            "workspace_mcp_present": True,
            "workspace_mcp_path": str(mcp_path),
            "repo_paths": repo_paths,
            "servers": server_reports,
            "important_note": (
                "Even when this preflight passes, Codex desktop only exposes MCP tools to a chat if the workspace .mcp.json "
                "and required env vars were already present before the chat/session started. Restart the app or open a new "
                "workspace-root chat after changes."
            ),
        }
    )
    return 0 if overall_ok else 1


def auth_flow(runtime: str) -> int:
    emit_json(
        {
            "ok": False,
            "skipped": True,
            "reason": "auth-flow requires a backend auth service; apps/cms has been removed from this repo.",
        }
    )
    return 0


def search_sync(all_pages: bool, page: int, limit: int, health_url: str | None, runtime: str) -> int:
    emit_json(
        {
            "ok": False,
            "skipped": True,
            "reason": "search-sync (reindex) requires backend ownership; apps/cms has been removed from this repo.",
        }
    )
    return 0


def bootstrap() -> int:
    results: list[dict[str, object]] = []
    if not ENV_FILE.exists():
        example = ROOT / "infra" / "docker" / ".env.dev.example"
        if example.exists():
            ENV_FILE.write_text(example.read_text(encoding="utf-8"), encoding="utf-8")
            results.append({"step": "env-file", "status": "created", "path": str(ENV_FILE)})
        else:
            results.append({"step": "env-file", "status": "missing-example", "path": str(example)})
    else:
        results.append({"step": "env-file", "status": "present", "path": str(ENV_FILE)})

    install_result = run_process(["pnpm", "install"])
    results.append({"step": "pnpm-install", **install_result})
    ok = install_result["exit_code"] == 0
    emit_json({"ok": ok, "results": results})
    return 0 if ok else 1


def multi_cli_router(task: str, provider: str | None, compare: bool, route_only: bool, speed: str) -> int:
    command = [sys.executable, str(MULTI_CLI_ROUTER_PATH), "--task", task, "--json", "--speed", speed]
    if provider:
        command.extend(["--provider", provider])
    if compare:
        command.append("--compare")
    if route_only:
        command.append("--route-only")

    completed = subprocess.run(
        command,
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    ok = completed.returncode == 0
    payload: dict[str, object]
    if ok:
        try:
            payload = json.loads(completed.stdout)
        except json.JSONDecodeError:
            payload = {"ok": False, "error": "Router returned invalid JSON", "stdout": completed.stdout}
            ok = False
    else:
        payload = {
            "ok": False,
            "command": command,
            "stdout": completed.stdout.strip(),
            "stderr": completed.stderr.strip(),
        }

    emit_json(payload)
    return 0 if ok else 1


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="action", required=True)

    bootstrap_parser = subparsers.add_parser("bootstrap")
    bootstrap_parser.set_defaults(handler=lambda args: bootstrap())

    quality_parser = subparsers.add_parser("quality-gate")
    quality_parser.add_argument("--scope", choices=["all", "web", "api", "cms"], default="all")
    quality_parser.add_argument("--skip-tests", action="store_true")
    quality_parser.add_argument("--runtime", choices=["auto", "host", "docker"], default="auto")
    quality_parser.set_defaults(handler=lambda args: quality_gate(args.scope, args.skip_tests, args.runtime))

    smoke_parser = subparsers.add_parser("smoke-suite")
    smoke_parser.add_argument("--suite", choices=["smoke", "monitoring", "telegram"], required=True)
    smoke_parser.add_argument("--runtime", choices=["auto", "host", "docker"], default="auto")
    smoke_parser.set_defaults(handler=lambda args: smoke_suite(args.suite, args.runtime))

    mcp_parser = subparsers.add_parser("mcp-smoke")
    mcp_parser.set_defaults(handler=lambda args: mcp_smoke())

    auth_parser = subparsers.add_parser("auth-flow")
    auth_parser.add_argument("--runtime", choices=["auto", "host", "docker"], default="auto")
    auth_parser.set_defaults(handler=lambda args: auth_flow(args.runtime))

    search_parser = subparsers.add_parser("search-sync")
    search_parser.add_argument("--all-pages", action="store_true")
    search_parser.add_argument("--page", type=int, default=1)
    search_parser.add_argument("--limit", type=int, default=100)
    search_parser.add_argument("--health-url")
    search_parser.add_argument("--runtime", choices=["auto", "host", "docker"], default="auto")
    search_parser.set_defaults(
        handler=lambda args: search_sync(args.all_pages, args.page, args.limit, args.health_url, args.runtime)
    )

    skill_parser = subparsers.add_parser("skill-audit")
    skill_parser.add_argument("--include-legacy", action="store_true")
    skill_parser.set_defaults(handler=lambda args: skill_audit(args.include_legacy))

    router_parser = subparsers.add_parser("multi-cli-router")
    router_parser.add_argument("--task", required=True)
    router_parser.add_argument("--provider", choices=["copilot", "gemini", "grok"])
    router_parser.add_argument("--compare", action="store_true")
    router_parser.add_argument("--route-only", action="store_true")
    router_parser.add_argument("--speed", choices=["fast", "balanced", "deep"], default="fast")
    router_parser.set_defaults(
        handler=lambda args: multi_cli_router(args.task, args.provider, args.compare, args.route_only, args.speed)
    )

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.handler(args)


if __name__ == "__main__":
    raise SystemExit(main())
