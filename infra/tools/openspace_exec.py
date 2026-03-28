#!/usr/bin/env python3
from __future__ import annotations

import argparse
import asyncio
import contextlib
import json
import os
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OPENSPACE_ROOT = ROOT / "tmp" / "OpenSpace"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Execute one task through the local OpenSpace checkout and emit JSON."
    )
    parser.add_argument("--task", required=True, help="Task to execute.")
    parser.add_argument(
        "--workspace",
        default=str(ROOT),
        help="Workspace directory for OpenSpace shell actions.",
    )
    parser.add_argument(
        "--max-iterations",
        type=int,
        default=3,
        help="Maximum OpenSpace iterations for this task.",
    )
    parser.add_argument(
        "--model",
        help="Model override. Defaults to OPENSPACE_MODEL.",
    )
    parser.add_argument(
        "--mode",
        choices=("fast", "learn"),
        default="fast",
        help="fast = cheaper execution lane, learn = enable recording/evolution + host skills.",
    )
    return parser.parse_args()


def ensure_paths() -> None:
    if str(OPENSPACE_ROOT) not in sys.path:
        sys.path.insert(0, str(OPENSPACE_ROOT))


def ensure_env(args: argparse.Namespace) -> None:
    os.environ.setdefault("PYTHONUTF8", "1")
    if args.mode == "learn":
        os.environ.setdefault(
            "OPENSPACE_HOST_SKILL_DIRS",
            ",".join(
                [
                    str(Path.home() / ".codex" / "skills"),
                    str(ROOT / ".agents" / "skills"),
                ]
            ),
        )
        os.environ.pop("OPENSPACE_CONFIG_JSON", None)
        os.environ.pop("OPENSPACE_DISABLE_SKILLS", None)
    else:
        os.environ["OPENSPACE_HOST_SKILL_DIRS"] = ""
        os.environ["OPENSPACE_CONFIG_JSON"] = json.dumps({"skills": {"enabled": False}})
        os.environ["OPENSPACE_DISABLE_SKILLS"] = "1"
    os.environ.setdefault("OPENSPACE_WORKSPACE", str(OPENSPACE_ROOT))
    if args.model:
        os.environ["OPENSPACE_MODEL"] = args.model


async def run_task(args: argparse.Namespace) -> dict:
    ensure_paths()
    ensure_env(args)
    print(
        f"[openspace_exec] mode={args.mode} recording={args.mode == 'learn'} "
        f"host_skills={bool(os.environ.get('OPENSPACE_HOST_SKILL_DIRS'))}",
        file=sys.stderr,
    )

    from openspace.host_detection.resolver import build_grounding_config_path
    from openspace.tool_layer import OpenSpace, OpenSpaceConfig

    model = os.environ.get("OPENSPACE_MODEL", "gemini/gemini-3-flash-preview")
    grounding_config_path = build_grounding_config_path()

    llm_kwargs: dict[str, str] = {}
    explicit_key = os.environ.get("OPENSPACE_LLM_API_KEY")
    if model.startswith("anthropic/") and os.environ.get("ANTHROPIC_API_KEY"):
        llm_kwargs["api_key"] = os.environ["ANTHROPIC_API_KEY"]
    elif model.startswith("gemini/") and os.environ.get("GOOGLE_API_KEY"):
        llm_kwargs["api_key"] = os.environ["GOOGLE_API_KEY"]
    elif model.startswith("openai/") and os.environ.get("OPENAI_API_KEY"):
        llm_kwargs["api_key"] = os.environ["OPENAI_API_KEY"]
    elif model.startswith("openai/") and explicit_key:
        llm_kwargs["api_key"] = explicit_key
    elif model.startswith("openrouter/") and os.environ.get("OPENROUTER_API_KEY"):
        llm_kwargs["api_key"] = os.environ["OPENROUTER_API_KEY"]
    elif model.startswith("openrouter/") and explicit_key:
        llm_kwargs["api_key"] = explicit_key

    config = OpenSpaceConfig(
        llm_model=model,
        llm_kwargs=llm_kwargs,
        workspace_dir=args.workspace,
        grounding_max_iterations=args.max_iterations,
        enable_recording=(args.mode == "learn"),
        grounding_config_path=grounding_config_path,
    )

    async with OpenSpace(config=config) as agent:
        result = await agent.execute(
            task=args.task,
            workspace_dir=args.workspace,
            max_iterations=args.max_iterations,
        )
        return result


def main() -> int:
    args = parse_args()
    with contextlib.redirect_stdout(sys.stderr):
        result = asyncio.run(run_task(args))
    print(json.dumps(result, ensure_ascii=False, indent=2, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
