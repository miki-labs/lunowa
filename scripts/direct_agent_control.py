#!/usr/bin/env python3
"""Thin terminal control for Lunowa direct coding-agent work.

GitHub owns task/dependency state. Git worktrees isolate writers. systemd --user
keeps long Codex runs independent from the Remote Desktop Commander process tree.
This tool intentionally has no scheduler, workflow DB, automatic retry, or merge.
"""
from __future__ import annotations

import argparse
import grp
import concurrent.futures
from datetime import datetime
import json
import os
from pathlib import Path
import re
import shlex
import shutil
import subprocess
import sys
from typing import Any

REPO = os.environ.get("LW_REPO", "miki-labs/lunowa")
OWNER, NAME = REPO.split("/", 1)
MAIN = Path(os.environ.get("LW_LOCAL", str(Path.home() / "dev/lunowa-main"))).resolve()
STATE = Path(os.environ.get("LW_AGENT_STATE", str(Path.home() / ".cache/lw/direct-agents"))).resolve()
WORKTREES = Path(os.environ.get("LW_AGENT_WORKTREES", str(Path.home() / ".cache/lw/worktrees"))).resolve()
PRIORITY_LABEL = os.environ.get("LW_PRIORITY_LABEL", "agent:priority:p0")
TARGET_LANES = int(os.environ.get("LW_TARGET_LANES", "3"))
HARD_CAP = int(os.environ.get("LW_HARD_LANES", "4"))
WIP_CAP = int(os.environ.get("LW_WIP_CAP", "3"))
SHARED_ASSETS = {"package.json", "pnpm-lock.yaml", "tsconfig.json", "drizzle.config.ts", "next.config.ts", "next.config.js"}
MCP_SERVERS = ("context7", "chrome-devtools", "cloudflare-api", "next-devtools", "cloudflare-observability", "google-pubsub")
TOOL_PROFILES = {
    "repo": frozenset(),
    "docs": frozenset({"context7"}),
    "ui": frozenset({"context7", "next-devtools"}),
    "browser-debug": frozenset({"context7", "next-devtools", "chrome-devtools"}),
}
QUOTA_RE = re.compile(r"You've hit your usage limit.*?try again at\s+([A-Z][a-z]{2})\s+(\d{1,2})(?:st|nd|rd|th)?,\s+(\d{4})\s+(\d{1,2}:\d{2}\s+[AP]M)", re.I | re.S)


def run(args: list[str], *, cwd: Path | None = None, check: bool = True) -> str:
    result = subprocess.run(args, cwd=cwd, text=True, capture_output=True)
    if check and result.returncode:
        raise RuntimeError((result.stderr or result.stdout).strip() or f"command failed: {' '.join(args)}")
    return result.stdout.strip()


def as_json(args: list[str], *, cwd: Path | None = None) -> Any:
    text = run(args, cwd=cwd)
    return json.loads(text) if text else None


def gh(*args: str) -> Any:
    return as_json(["gh", *args])


def emit(value: Any) -> None:
    print(json.dumps(value, ensure_ascii=False, separators=(",", ":")))


def now_local() -> datetime:
    return datetime.now().astimezone()


def fetch_main() -> str:
    run(["git", "fetch", "--quiet", "origin", "main"], cwd=MAIN, check=False)
    head = run(["git", "rev-parse", "origin/main"], cwd=MAIN)
    return head


def issue_list() -> list[dict[str, Any]]:
    return gh("issue", "list", "--repo", REPO, "--state", "open", "--label", PRIORITY_LABEL,
              "--limit", "100", "--json", "number,title,body,labels,url,updatedAt") or []


def dependency_map(numbers: list[int]) -> dict[int, list[dict[str, Any]]]:
    if not numbers:
        return {}
    fields = " ".join(
        f'i{n}:issue(number:{n}){{blockedBy(first:30){{nodes{{number state title}}}}}}' for n in numbers
    )
    query = f"query($owner:String!,$name:String!){{repository(owner:$owner,name:$name){{{fields}}}}}"
    payload = gh("api", "graphql", "-F", f"owner={OWNER}", "-F", f"name={NAME}", "-f", f"query={query}")
    repo = ((payload or {}).get("data") or {}).get("repository") or {}
    return {n: (((repo.get(f"i{n}") or {}).get("blockedBy") or {}).get("nodes") or []) for n in numbers}


def open_prs() -> list[dict[str, Any]]:
    return gh("pr", "list", "--repo", REPO, "--state", "open", "--limit", "100",
              "--json", "number,title,body,headRefName,headRefOid,baseRefName,url") or []


def pr_issue_number(pr: dict[str, Any]) -> int | None:
    text = "\n".join(str(pr.get(k) or "") for k in ("title", "body", "headRefName"))
    branch = re.search(r"issue[-_/](\d+)|issue-(\d+)", text, re.I)
    if branch:
        return int(next(x for x in branch.groups() if x))
    close = re.search(r"(?i)(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)", text)
    return int(close.group(1)) if close else None


def pr_files(pr_number: int) -> list[str]:
    payload = gh("pr", "view", str(pr_number), "--repo", REPO, "--json", "files") or {}
    return [row.get("path") for row in payload.get("files") or [] if row.get("path")]


def shared_assets(paths: list[str]) -> list[str]:
    out = set()
    for path in paths:
        if path in SHARED_ASSETS or path.startswith(".github/workflows/") or path.startswith("drizzle/"):
            out.add(path)
    return sorted(out)


def quota_retry_from_text(text: str, *, tz=None) -> datetime | None:
    match = QUOTA_RE.search(text or "")
    if not match:
        return None
    month, day, year, clock = match.groups()
    naive = datetime.strptime(f"{month} {day} {year} {clock.upper()}", "%b %d %Y %I:%M %p")
    timezone = tz or now_local().tzinfo
    return naive.replace(tzinfo=timezone)


def quota_snapshot(now: datetime | None = None) -> dict[str, Any]:
    current = now or now_local()
    candidates: list[Path] = []
    if STATE.exists():
        candidates.extend(STATE.glob("issue-*/events.jsonl"))
        candidates.extend(STATE.glob("issue-*/stderr.log"))
    candidates.extend(Path("/tmp").glob("lunowa-*-direct.jsonl"))  # one-time legacy migration evidence
    best: tuple[datetime, Path, str] | None = None
    for path in candidates:
        try:
            text = path.read_text(errors="replace")[-120000:]
        except OSError:
            continue
        retry = quota_retry_from_text(text, tz=current.tzinfo)
        if retry and (best is None or retry > best[0]):
            best = (retry, path, QUOTA_RE.search(text).group(0)[-500:])
    blocked = bool(best and best[0] > current)
    return {
        "blocked": blocked,
        "retry_after": best[0].isoformat() if best else None,
        "source": str(best[1]) if best else None,
        "evidence": best[2] if best else None,
    }


def _tool_version(command: str, args: list[str]) -> str | None:
    binary = shutil.which(command)
    if not binary:
        return None
    try:
        result = subprocess.run([binary, *args], text=True, capture_output=True, timeout=3)
    except (OSError, subprocess.TimeoutExpired):
        return None
    text = (result.stdout or result.stderr).strip().splitlines()
    return text[0][:160] if result.returncode == 0 and text else None


def _group_names() -> set[str]:
    names: set[str] = set()
    for gid in os.getgroups():
        try:
            names.add(grp.getgrgid(gid).gr_name)
        except KeyError:
            continue
    return names


def sandbox_readiness(*, sbx_available: bool, kvm_module: bool, kvm_group: bool, kvm_device: bool) -> dict[str, Any]:
    missing = []
    if not sbx_available: missing.append("sbx")
    if not kvm_module: missing.append("kvm-module")
    if not kvm_group: missing.append("kvm-group")
    if not kvm_device: missing.append("/dev/kvm-access")
    return {"ready_for_pilot": not missing, "missing": missing}


def capability_snapshot() -> dict[str, Any]:
    ast_binary = shutil.which("ast-grep")
    better_binary = shutil.which("betterleaks")
    sbx_binary = shutil.which("sbx")
    kvm_module = False
    try:
        kvm_module = any(line.startswith("kvm") for line in Path("/proc/modules").read_text().splitlines())
    except OSError:
        pass
    kvm_group = "kvm" in _group_names()
    kvm_device = Path("/dev/kvm").exists() and os.access("/dev/kvm", os.R_OK | os.W_OK)
    sandbox = sandbox_readiness(sbx_available=bool(sbx_binary), kvm_module=kvm_module, kvm_group=kvm_group, kvm_device=kvm_device)
    return {
        "code_navigation": {
            "ripgrep": {"available": bool(shutil.which("rg"))},
            "ast_grep": {
                "available": bool(ast_binary),
                "version": _tool_version("ast-grep", ["--version"]),
                "outline": bool(ast_binary),
                "policy": "optional cheap structural pass before broad source reads",
            },
        },
        "secret_guard": {
            "betterleaks": {
                "available": bool(better_binary),
                "version": _tool_version("betterleaks", ["version"]),
                "local_precommit": bool(better_binary),
                "live_validation_default": False,
            }
        },
        "docker_sandboxes": {
            "available": bool(sbx_binary),
            "version": _tool_version("sbx", ["version"]) if sbx_binary else None,
            "kvm_module": kvm_module,
            "kvm_group": kvm_group,
            "kvm_device_access": kvm_device,
            "experimental": True,
            "canonical": False,
            **sandbox,
            "auth_and_project_tooling": "NOT_PROBED",
        },
        "deferred": {
            "testcontainers": "defer until package/lockfile ownership is clear or a DB task explicitly needs it",
            "serena": "A/B only for semantic cross-file work; do not enable globally",
        },
    }


def secret_guard(path: Path) -> dict[str, Any]:
    binary = shutil.which("betterleaks")
    if not binary:
        return {"available": False, "ok": None, "status": "SKIPPED_OPTIONAL", "reason": "betterleaks is not installed"}
    result = subprocess.run([binary, "git", "--pre-commit", "--no-banner", "--no-color", "--redact=100",
        "--report-format", "json", "--report-path", "-", "."], cwd=path, text=True, capture_output=True)
    raw = (result.stdout or "").strip()
    report: Any = None
    if raw:
        try:
            report = json.loads(raw)
        except json.JSONDecodeError:
            report = raw[-8000:]
    findings = len(report) if isinstance(report, list) else (0 if report in (None, "", {}) else None)
    # Never return raw scanner findings or stderr through the terminal controller.
    # Even with Betterleaks redaction enabled, secret-bearing scanner output is a
    # sensitive source and must not flow into generic JSON logging.
    return {
        "available": True, "ok": result.returncode == 0, "exit_code": result.returncode,
        "findings": findings, "network_validation": False,
        "details_withheld": bool(findings),
    }


def resource_snapshot() -> dict[str, Any]:
    cpu = os.cpu_count() or 1
    available_kib = 0
    try:
        for line in Path("/proc/meminfo").read_text().splitlines():
            if line.startswith("MemAvailable:"):
                available_kib = int(line.split()[1]); break
    except OSError:
        pass
    available_gib = round(available_kib / 1024 / 1024, 1)
    cap = 4 if cpu >= 8 and available_gib >= 8 else 3 if cpu >= 6 and available_gib >= 6 else 2 if cpu >= 4 and available_gib >= 4 else 1
    return {"cpu": cpu, "available_memory_gib": available_gib, "implementation_cap": min(cap, HARD_CAP)}


def unit_name(issue: int) -> str:
    return f"lw-agent-issue-{issue}.service"


def user_systemd_env() -> dict[str, str]:
    env = os.environ.copy()
    runtime = Path(f"/run/user/{os.getuid()}")
    bus = runtime / "bus"
    if runtime.is_dir():
        env.setdefault("XDG_RUNTIME_DIR", str(runtime))
    if bus.exists():
        env.setdefault("DBUS_SESSION_BUS_ADDRESS", f"unix:path={bus}")
    return env


def systemd_show(unit: str) -> dict[str, str]:
    result = subprocess.run(["systemctl", "--user", "show", unit,
        "--property=LoadState,ActiveState,SubState,Result,MainPID,ExecMainStatus"], text=True, capture_output=True, env=user_systemd_env())
    if result.returncode:
        return {"LoadState": "not-found", "ActiveState": "inactive", "SubState": "dead"}
    out: dict[str, str] = {}
    for line in result.stdout.splitlines():
        if "=" in line:
            key, value = line.split("=", 1); out[key] = value
    return out


def terminal_event(path: Path) -> str | None:
    if not path.exists():
        return None
    try:
        lines = path.read_text(errors="replace").splitlines()
    except OSError:
        return None
    for line in reversed(lines[-100:]):
        try:
            kind = json.loads(line).get("type")
        except json.JSONDecodeError:
            continue
        if kind in {"turn.completed", "turn.failed", "error"}:
            return kind
    return None


def agent_records() -> list[dict[str, Any]]:
    if not STATE.exists():
        return []
    records = []
    for meta_path in sorted(STATE.glob("issue-*/meta.json")):
        try:
            meta = json.loads(meta_path.read_text())
        except (OSError, json.JSONDecodeError):
            continue
        issue = int(meta["issue"]); service = systemd_show(meta.get("unit") or unit_name(issue))
        event = terminal_event(meta_path.parent / "events.jsonl")
        active = service.get("ActiveState") in {"active", "activating"}
        unknown = not active and event not in {"turn.completed", "turn.failed", "error"}
        records.append({**meta, "active": active, "unknown": unknown, "terminal_event": event, "service": service})
    return records




def _meaningful_status(path: Path) -> list[str]:
    lines = run(["git", "status", "--porcelain", "--untracked-files=all"], cwd=path, check=False).splitlines()
    return [line for line in lines if line and not re.search(r"(?:^|\s)\.pnpm-store/", line)]


def local_issue_workspaces(number: int, prs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    candidates: list[tuple[Path, str]] = []
    standard = WORKTREES / f"issue-{number}"
    if standard.is_dir():
        candidates.append((standard, "direct"))
    # Include ordinary linked worktrees, regardless of where the controller created them.
    raw = run(["git", "worktree", "list", "--porcelain"], cwd=MAIN, check=False)
    for block in [b for b in raw.split("\n\n") if b.strip()]:
        path = None; branch = ""
        for line in block.splitlines():
            if line.startswith("worktree "): path = Path(line[9:])
            elif line.startswith("branch "): branch = line[7:].removeprefix("refs/heads/")
        if path and (f"issue-{number}" in branch or f"issue-{number}" in path.name) and path.is_dir():
            candidates.append((path.resolve(), "linked"))
    # One-time migration visibility for surviving ACP-era correction clones. This is
    # read-only compatibility, not an ACP runtime dependency.
    legacy_root = Path.home() / ".cache/agent-control-plane/workspaces" / f"{OWNER}__{NAME}"
    if legacy_root.is_dir():
        for path in legacy_root.glob(f"issue-{number}-*"):
            if path.is_dir(): candidates.append((path.resolve(), "legacy-correction"))
    seen: set[Path] = set(); out = []
    pr_heads = [str(pr.get("headRefOid") or "") for pr in prs if pr.get("headRefOid")]
    for path, kind in candidates:
        if path in seen: continue
        seen.add(path)
        head = run(["git", "rev-parse", "HEAD"], cwd=path, check=False)
        branch = run(["git", "branch", "--show-current"], cwd=path, check=False) or "DETACHED"
        dirty = _meaningful_status(path)
        ahead = False
        for pr_head in pr_heads:
            if pr_head and head and head != pr_head and subprocess.run(["git", "merge-base", "--is-ancestor", pr_head, head], cwd=path, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0:
                ahead = True; break
        base_ref = "origin/main" if run(["git", "rev-parse", "--verify", "origin/main"], cwd=path, check=False) else "current/main"
        base_head = run(["git", "rev-parse", "--verify", base_ref], cwd=path, check=False) if base_ref else ""
        ahead_main = bool(base_head and head and head != base_head and subprocess.run(["git", "merge-base", "--is-ancestor", base_head, head], cwd=path, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0)
        out.append({"path": str(path), "kind": kind, "branch": branch, "head": head,
                    "dirty_paths": len(dirty), "dirty_preview": dirty[:12], "ahead_of_pr": ahead, "ahead_of_main": ahead_main})
    return out

def classify_issues(issues: list[dict[str, Any]], deps: dict[int, list[dict[str, Any]]], prs: list[dict[str, Any]], agents: list[dict[str, Any]]) -> dict[str, Any]:
    pr_by_issue: dict[int, list[dict[str, Any]]] = {}
    for pr in prs:
        n = pr_issue_number(pr)
        if n is not None:
            pr_by_issue.setdefault(n, []).append(pr)
    active_by_issue = {int(row["issue"]): row for row in agents if row.get("active") or row.get("unknown")}
    finished_by_issue = {int(row["issue"]): row for row in agents if not row.get("active") and not row.get("unknown") and row.get("terminal_event")}
    result = {"ready": [], "blocked": [], "active": [], "candidates": []}
    for issue in sorted(issues, key=lambda row: int(row["number"])):
        n = int(issue["number"]); unresolved = [b for b in deps.get(n, []) if str(b.get("state", "")).lower() != "closed"]
        base = {"number": n, "title": issue.get("title"), "url": issue.get("url"), "blocked_by": unresolved}
        if unresolved:
            result["blocked"].append(base); continue
        if n in active_by_issue:
            result["active"].append({**base, "agent": active_by_issue[n]}); continue
        if pr_by_issue.get(n) or n in finished_by_issue:
            issue_prs = pr_by_issue.get(n) or []
            workspaces = local_issue_workspaces(n, issue_prs)
            finished = finished_by_issue.get(n)
            result["candidates"].append({**base, "prs": issue_prs, "local_workspaces": workspaces,
                "needs_push": any(row.get("ahead_of_pr") for row in workspaces) or (not issue_prs and any(row.get("ahead_of_main") for row in workspaces)),
                "has_dirty_correction": any(int(row.get("dirty_paths") or 0) > 0 for row in workspaces),
                "local_terminal_event": finished.get("terminal_event") if finished else None}); continue
        result["ready"].append(base)
    return result


def worktree_changed_paths(path: Path) -> list[str]:
    if not path.is_dir():
        return []
    base = "origin/main" if run(["git", "rev-parse", "--verify", "origin/main"], cwd=path, check=False) else "current/main"
    committed = run(["git", "diff", "--name-only", f"{base}...HEAD"], cwd=path, check=False).splitlines() if base else []
    dirty = []
    for line in _meaningful_status(path):
        payload = line[3:] if len(line) > 3 else ""
        if " -> " in payload:
            payload = payload.split(" -> ", 1)[1]
        if payload:
            dirty.append(payload)
    return sorted(set(committed + dirty))


def collision_snapshot(candidates: list[dict[str, Any]], active: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_asset: dict[str, list[dict[str, Any]]] = {}
    seen_writers: set[tuple[int, str, str]] = set()

    def add_writer(issue: int, source: str, identifier: str, paths: list[str]) -> None:
        key = (issue, source, identifier)
        if key in seen_writers:
            return
        seen_writers.add(key)
        for asset in shared_assets(paths):
            by_asset.setdefault(asset, []).append({"issue": issue, "source": source, "id": identifier})

    requests: list[tuple[int, int]] = []
    for item in candidates:
        issue = int(item["number"])
        for pr in item.get("prs") or []:
            requests.append((issue, int(pr["number"])))
        for workspace in item.get("local_workspaces") or []:
            path = Path(str(workspace.get("path") or ""))
            if path.is_dir() and (workspace.get("ahead_of_pr") or workspace.get("dirty_paths")):
                add_writer(issue, "worktree", str(path), worktree_changed_paths(path))
    if requests:
        with concurrent.futures.ThreadPoolExecutor(max_workers=min(6, len(requests))) as pool:
            futures = {(issue, pr): pool.submit(pr_files, pr) for issue, pr in requests}
            for (issue, pr), future in futures.items():
                add_writer(issue, "pr", str(pr), future.result())

    for item in active:
        issue = int(item["number"]); agent = item.get("agent") or {}
        path = Path(str(agent.get("worktree") or ""))
        if path.is_dir():
            add_writer(issue, "active-worktree", str(path), worktree_changed_paths(path))

    collisions = []
    for asset, writers in sorted(by_asset.items()):
        distinct_issues = {int(row["issue"]) for row in writers}
        if len(distinct_issues) > 1:
            collisions.append({"asset": asset, "writers": writers, "serial_merge_required": True})
    return collisions


def lane_calculation(*, ready: int, active: int, unknown: int, candidates: int, resource_cap: int, quota_blocked: bool) -> dict[str, int]:
    current_wip = active + unknown + candidates
    free_wip = max(0, WIP_CAP - current_wip)
    free_process = max(0, min(HARD_CAP, resource_cap) - active - unknown)
    fresh = 0 if quota_blocked else min(TARGET_LANES, ready, free_wip, free_process)
    correction = 0 if quota_blocked else min(candidates, free_process)
    return {
        "target": TARGET_LANES, "hard_cap": HARD_CAP, "wip_cap": WIP_CAP, "current_wip": current_wip,
        "free_wip_slots": free_wip, "free_process_slots": free_process,
        "recommended_new_lanes": fresh, "available_correction_lanes": correction,
    }


def fleet_snapshot() -> dict[str, Any]:
    main = fetch_main(); issues = issue_list(); numbers = [int(x["number"]) for x in issues]
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        f_deps = pool.submit(dependency_map, numbers); f_prs = pool.submit(open_prs); f_quota = pool.submit(quota_snapshot)
        deps, prs, quota = f_deps.result(), f_prs.result(), f_quota.result()
    agents = agent_records(); classified = classify_issues(issues, deps, prs, agents); resources = resource_snapshot()
    active = sum(1 for row in agents if row.get("active")); unknown = sum(1 for row in agents if row.get("unknown"))
    lanes = lane_calculation(ready=len(classified["ready"]), active=active, unknown=unknown,
                             candidates=len(classified["candidates"]), resource_cap=resources["implementation_cap"],
                             quota_blocked=quota["blocked"])
    return {"main": main, "policy": {"one_issue_one_writer": True, "parallel_merge": False,
            "native_subagents": "read-heavy exploration/research/test analysis; one top-level writer owns an Issue",
            "lane_formula": "min(independent ready work, WIP/review capacity, quota, local resource cap)"},
            "lanes": lanes, "quota": quota, "resources": resources, "capabilities": capability_snapshot(), "issues": classified,
            "agents": agents, "shared_asset_collisions": collision_snapshot(classified["candidates"], classified["active"])}


def issue_gate(number: int) -> tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]]]:
    issue = gh("issue", "view", str(number), "--repo", REPO, "--json", "number,title,state,body,url")
    deps = dependency_map([number]).get(number, []); prs = [p for p in open_prs() if pr_issue_number(p) == number]
    return issue, deps, prs


def codex_tool_args(profile: str) -> list[str]:
    allowed = TOOL_PROFILES.get(profile)
    if allowed is None:
        raise RuntimeError(f"unknown tool profile: {profile}")
    # Remote plugins are intentionally controller-only. Each MCP server is then
    # explicitly enabled/disabled for this execution so normal Codex auth and
    # local configuration remain usable without ambient privileged integrations.
    args = ["--disable", "remote_plugin", "--strict-config"]
    for name in MCP_SERVERS:
        enabled = "true" if name in allowed else "false"
        args.extend(["-c", f"mcp_servers.{name}.enabled={enabled}"])
    return args


def agent_prompt(number: int, mode: str, tool_profile: str) -> str:
    return f"""You are the single write-owner coding agent for Lunowa Issue #{number} ({mode} mode).
This run uses the `{tool_profile}` tool profile. Remote plugins and privileged external MCPs are not available to you; request external/provider evidence from the ChatGPT/controller instead of broadening tool authority yourself.
Work only inside this dedicated worktree. Start by reading AGENTS.md, docs/continuity/README.md, docs/continuity/CURRENT.md, .agents/skills/execute-task/SKILL.md, then live-read GitHub Issue #{number}, its blocked_by dependencies, related PR/CI, and the task-relevant canonical sources.
Execute the bounded Issue end-to-end. Use repository/local deterministic tools first; use installed MCP/plugins only when materially useful. For unfamiliar code, prefer `rg` to narrow candidates and use `ast-grep outline` when available as a cheap structural pass before broad full-file reads. You may use native subagents for independent read-heavy exploration, research, hypothesis testing, or test/log analysis when it saves time, but keep one top-level write owner for this Issue and do not create competing writers against the same files/task.
Run targeted verification and the canonical verification appropriate to the final change. When Betterleaks is available, run a local pre-commit/diff secret scan without `--validation` before reporting a commit-ready candidate. Inspect the cumulative diff. Commit the coherent candidate locally if the task contract grants it. Do not merge, deploy, perform privileged external writes, auto-retry/replay, or modify other Issues. Report exact commit/head, checks actually run, and anything NOT_VERIFIED.
"""


def ensure_systemd() -> None:
    if not shutil.which("systemd-run") or subprocess.run(["systemctl", "--user", "show-environment"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=user_systemd_env()).returncode:
        raise RuntimeError("systemd --user is unavailable; direct agents are not started from the RDC process tree")


def start_agent(number: int, model: str, effort: str, mode: str, dry_run: bool, existing_worktree: str | None = None, tool_profile: str = "repo") -> dict[str, Any]:
    fleet = fleet_snapshot()
    quota_blocked = bool(fleet["quota"]["blocked"])
    if any(int(row["issue"]) == number and (row.get("active") or row.get("unknown")) for row in fleet["agents"]):
        raise RuntimeError(f"Issue #{number} already has an active/unknown direct-agent execution")
    if not dry_run and quota_blocked:
        raise RuntimeError(f"Codex usage is blocked until {fleet['quota']['retry_after']}; refusing launch")
    lane_key = "recommended_new_lanes" if mode == "fresh" else "available_correction_lanes"
    if not dry_run and int(fleet["lanes"].get(lane_key) or 0) <= 0:
        if mode == "fresh":
            raise RuntimeError("no fresh implementation lane is currently available; drain candidate/review WIP or wait for quota/resources")
        raise RuntimeError("no correction process lane is currently available; wait for quota/resources or another active correction to finish")
    issue, deps, prs = issue_gate(number)
    if str(issue.get("state", "")).upper() != "OPEN":
        raise RuntimeError(f"Issue #{number} is not open")
    unresolved = [row for row in deps if str(row.get("state", "")).lower() != "closed"]
    if unresolved:
        raise RuntimeError(f"Issue #{number} has unresolved blocked_by dependencies: {[x['number'] for x in unresolved]}")
    if mode == "fresh" and prs:
        raise RuntimeError(f"Issue #{number} already has an open PR; use correction mode on its existing worktree")
    if mode == "correction" and not prs:
        raise RuntimeError(f"Issue #{number} has no open PR to correct")
    main = fetch_main()
    if mode == "correction":
        if not existing_worktree:
            raise RuntimeError("correction mode requires --worktree PATH; explicit ownership avoids guessing stale/legacy workspaces")
        worktree = Path(existing_worktree).expanduser().resolve()
        if not worktree.is_dir():
            raise RuntimeError(f"correction worktree does not exist: {worktree}")
        branch = run(["git", "branch", "--show-current"], cwd=worktree)
        if not branch or str(number) not in branch:
            raise RuntimeError(f"correction worktree branch does not identify Issue #{number}: {branch or '<detached>'}")
    else:
        worktree = WORKTREES / f"issue-{number}"; branch = f"agent/issue-{number}"
    tool_args = codex_tool_args(tool_profile)
    plan = {"issue": number, "mode": mode, "model": model, "effort": effort, "tool_profile": tool_profile, "base": main,
            "worktree": str(worktree), "branch": branch, "unit": unit_name(number),
            "quota_blocked": quota_blocked, "launchable_now": (not quota_blocked and int(fleet["lanes"].get(lane_key) or 0) > 0)}
    if dry_run:
        return {"dry_run": True, **plan, "codex_tool_args": tool_args, "prompt": agent_prompt(number, mode, tool_profile)}
    ensure_systemd(); WORKTREES.mkdir(parents=True, exist_ok=True); STATE.mkdir(parents=True, exist_ok=True)
    owner = f"issue-{number}-direct-agent"; env = os.environ.copy(); env["PARALLEL_TASK_OWNER"] = owner
    if mode == "fresh":
        if worktree.exists():
            raise RuntimeError(f"worktree already exists: {worktree}; inspect/reuse explicitly instead of replacing it")
        if subprocess.run(["git", "show-ref", "--verify", "--quiet", f"refs/heads/{branch}"], cwd=MAIN).returncode == 0:
            raise RuntimeError(f"local branch already exists: {branch}")
        run(["git", "worktree", "add", "-b", branch, str(worktree), "origin/main"], cwd=MAIN)
        preflight = subprocess.run([sys.executable, str(worktree / "scripts/parallel-task-preflight.py"),
            "--expected-repository", str(worktree), "--expected-worktree", str(worktree), "--expected-branch", branch,
            "--expected-head", main, "--base", "origin/main", "--remote-base", "origin/main", "--owner", owner,
            "--relationship", "independent", "--blocker-status", "none"], cwd=worktree, env=env, text=True, capture_output=True)
        if preflight.returncode:
            raise RuntimeError("parallel preflight failed after worktree creation:\n" + (preflight.stdout + preflight.stderr).strip())
        preflight_text = preflight.stdout.strip()
    else:
        status = run(["git", "status", "--porcelain"], cwd=worktree, check=False)
        head = run(["git", "rev-parse", "HEAD"], cwd=worktree)
        pr_heads = {str(pr.get("headRefOid") or "") for pr in prs}
        # Correction work may be dirty by definition. It is accepted only when the
        # user/controller names the worktree explicitly and its HEAD is the PR head
        # (or a descendant local correction commit on the same Issue branch).
        base_pr_head = next(iter(pr_heads), "")
        if base_pr_head and subprocess.run(["git", "merge-base", "--is-ancestor", base_pr_head, head], cwd=worktree).returncode != 0:
            raise RuntimeError(f"correction worktree HEAD {head} is not based on current PR head {base_pr_head}")
        preflight_text = f"correction ownership: explicit worktree={worktree} branch={branch} head={head} dirty={bool(status)}"
    run_dir = STATE / f"issue-{number}"; run_dir.mkdir(parents=True, exist_ok=True)
    events, stderr, last = run_dir / "events.jsonl", run_dir / "stderr.log", run_dir / "last.txt"
    meta = {**plan, "started_at": now_local().isoformat(), "events": str(events), "stderr": str(stderr), "last": str(last)}
    (run_dir / "meta.json").write_text(json.dumps(meta, indent=2) + "\n")
    codex = shutil.which("codex")
    if not codex:
        raise RuntimeError("codex executable is unavailable")
    prompt = agent_prompt(number, mode, tool_profile)
    command = [codex, "exec", "--json", "--approve-for-me", *tool_args, "-m", model, "-c", f'model_reasoning_effort="{effort}"',
               "-o", str(last), prompt]
    shell = f"exec {shlex.join(command)} >{shlex.quote(str(events))} 2>{shlex.quote(str(stderr))}"
    unit = unit_name(number)
    start = subprocess.run(["systemd-run", "--user", f"--unit={unit}", "--collect",
        f"--setenv=HOME={Path.home()}", f"--setenv=PATH={os.environ.get('PATH','')}",
        f"--property=WorkingDirectory={worktree}", "/bin/bash", "-lc", shell], text=True, capture_output=True, env=user_systemd_env())
    if start.returncode:
        raise RuntimeError((start.stderr or start.stdout).strip())
    return {**meta, "started": True, "preflight": preflight_text, "systemd": start.stdout.strip()}


def agent_status(number: int | None) -> dict[str, Any]:
    rows = agent_records()
    if number is not None:
        rows = [row for row in rows if int(row["issue"]) == number]
    return {"agents": rows, "quota": quota_snapshot()}


def agent_logs(number: int, tail: int) -> dict[str, Any]:
    root = STATE / f"issue-{number}"; events = root / "events.jsonl"; stderr = root / "stderr.log"; last = root / "last.txt"
    def tail_text(path: Path) -> str:
        if not path.exists(): return ""
        return "\n".join(path.read_text(errors="replace").splitlines()[-tail:])[-24000:]
    return {"issue": number, "status": agent_status(number), "last_message": tail_text(last),
            "events_tail": tail_text(events), "stderr_tail": tail_text(stderr)}


def stop_agent(number: int) -> dict[str, Any]:
    unit = unit_name(number); before = systemd_show(unit)
    subprocess.run(["systemctl", "--user", "stop", unit], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=user_systemd_env())
    return {"issue": number, "stopped": True, "before": before, "after": systemd_show(unit),
            "retry_authorized": False, "note": "stop is not retry/replay authority"}


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__); sub = p.add_subparsers(dest="command", required=True)
    sub.add_parser("fleet")
    sub.add_parser("capabilities")
    sg = sub.add_parser("guard-secrets"); sg.add_argument("--path", default=".")
    a = sub.add_parser("agent"); aa = a.add_subparsers(dest="action", required=True)
    s = aa.add_parser("start"); s.add_argument("issue", type=int); s.add_argument("--model", default="gpt-5.6-luna"); s.add_argument("--effort", choices=("low","medium","high","xhigh"), default="high"); s.add_argument("--mode", choices=("fresh","correction"), default="fresh"); s.add_argument("--worktree"); s.add_argument("--tool-profile", choices=tuple(TOOL_PROFILES), default="repo"); s.add_argument("--dry-run", action="store_true")
    st = aa.add_parser("status"); st.add_argument("issue", type=int, nargs="?")
    lg = aa.add_parser("logs"); lg.add_argument("issue", type=int); lg.add_argument("--tail", type=int, default=40)
    sp = aa.add_parser("stop"); sp.add_argument("issue", type=int)
    return p


def main() -> int:
    args = parser().parse_args()
    if args.command == "fleet": emit(fleet_snapshot())
    elif args.command == "capabilities": emit(capability_snapshot())
    elif args.command == "guard-secrets":
        result = secret_guard(Path(args.path).expanduser().resolve()); emit(result)
        if result.get("ok") is False: return 1
    elif args.action == "start": emit(start_agent(args.issue, args.model, args.effort, args.mode, args.dry_run, args.worktree, args.tool_profile))
    elif args.action == "status": emit(agent_status(args.issue))
    elif args.action == "logs": emit(agent_logs(args.issue, args.tail))
    elif args.action == "stop": emit(stop_agent(args.issue))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, subprocess.CalledProcessError) as exc:
        print(f"direct-agent-control: {exc}", file=sys.stderr)
        raise SystemExit(1)
