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
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shlex
import shutil
import subprocess
import sys
import time
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
CLI_METRICS = Path(os.environ.get("LW_CLI_METRICS", str(Path.home() / ".cache/lw/direct-cli-metrics.jsonl"))).resolve()
DELIVERY_EVENTS = Path(os.environ.get("LW_DELIVERY_EVENTS", str(Path.home() / ".cache/lw/delivery-events.jsonl"))).resolve()
_METRIC_COUNTS = {"subprocess": 0, "github": 0, "remote_git": 0}
_LAST_OUTPUT_BYTES = 0


def process_run(*args: Any, **kwargs: Any) -> subprocess.CompletedProcess[str]:
    _METRIC_COUNTS["subprocess"] += 1
    return subprocess.run(*args, **kwargs)


def run(args: list[str], *, cwd: Path | None = None, check: bool = True) -> str:
    result = process_run(args, cwd=cwd, text=True, capture_output=True)
    if check and result.returncode:
        raise RuntimeError((result.stderr or result.stdout).strip() or f"command failed: {' '.join(args)}")
    return result.stdout.strip()


def as_json(args: list[str], *, cwd: Path | None = None) -> Any:
    text = run(args, cwd=cwd)
    return json.loads(text) if text else None


def gh(*args: str) -> Any:
    _METRIC_COUNTS["github"] += 1
    return as_json(["gh", *args])


def emit(value: Any) -> None:
    global _LAST_OUTPUT_BYTES
    text = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    _LAST_OUTPUT_BYTES = len(text.encode("utf-8")) + 1
    print(text)


def now_local() -> datetime:
    return datetime.now().astimezone()


def refresh_main(expected_main: str) -> None:
    _METRIC_COUNTS["remote_git"] += 1
    run(["git", "fetch", "--quiet", "origin", "main"], cwd=MAIN)
    actual = run(["git", "rev-parse", "origin/main"], cwd=MAIN)
    if actual != expected_main:
        raise RuntimeError(f"STALE_PRECONDITION expected_main={expected_main} actual_main={actual}")


def ensure_local_main(expected_main: str) -> None:
    local = run(["git", "rev-parse", "--verify", "origin/main"], cwd=MAIN, check=False)
    if local != expected_main:
        refresh_main(expected_main)


def remote_fleet_inputs() -> tuple[str, list[dict[str, Any]], dict[int, list[dict[str, Any]]], list[dict[str, Any]]]:
    query = """query($owner:String!,$name:String!,$label:String!){repository(owner:$owner,name:$name){ref(qualifiedName:"refs/heads/main"){target{... on Commit{oid}}} issues(first:100,states:OPEN,labels:[$label],orderBy:{field:CREATED_AT,direction:ASC}){nodes{number title url blockedBy(first:30){nodes{number state title} pageInfo{hasNextPage}}} pageInfo{hasNextPage}} pullRequests(first:100,states:OPEN,orderBy:{field:CREATED_AT,direction:ASC}){nodes{number title headRefName headRefOid baseRefName url closingIssuesReferences(first:20){nodes{number} pageInfo{hasNextPage}}} pageInfo{hasNextPage}}}}"""
    payload = gh("api", "graphql", "-F", f"owner={OWNER}", "-F", f"name={NAME}", "-F", f"label={PRIORITY_LABEL}", "-f", f"query={query}")
    repo = ((payload or {}).get("data") or {}).get("repository")
    if (payload or {}).get("errors") or not isinstance(repo, dict):
        raise RuntimeError("fleet remote GraphQL state is incomplete; refusing empty/partial state")
    remote_main = (((repo.get("ref") or {}).get("target") or {}).get("oid"))
    if not isinstance(remote_main, str) or not remote_main:
        raise RuntimeError("fleet remote main is incomplete; refusing state without exact main")
    if ((repo.get("issues") or {}).get("pageInfo") or {}).get("hasNextPage") or ((repo.get("pullRequests") or {}).get("pageInfo") or {}).get("hasNextPage"):
        raise RuntimeError("fleet remote query exceeded bounded 100-item page; refusing partial state")
    issues: list[dict[str, Any]] = []
    deps: dict[int, list[dict[str, Any]]] = {}
    for node in ((repo.get("issues") or {}).get("nodes") or []):
        number = int(node["number"])
        blocked = node.get("blockedBy") or {}
        if (blocked.get("pageInfo") or {}).get("hasNextPage"):
            raise RuntimeError(f"Issue #{number} exceeds bounded blocked_by page; refusing partial dependency state")
        issues.append({"number": number, "title": node.get("title"), "url": node.get("url")})
        deps[number] = (blocked.get("nodes") or [])
    prs: list[dict[str, Any]] = []
    for node in ((repo.get("pullRequests") or {}).get("nodes") or []):
        closing_ref = node.get("closingIssuesReferences") or {}
        if (closing_ref.get("pageInfo") or {}).get("hasNextPage"):
            raise RuntimeError(f"PR #{node.get('number')} exceeds bounded closing-Issue references; refusing partial mapping")
        closing = [int(row["number"]) for row in (closing_ref.get("nodes") or [])]
        prs.append({
            "number": node.get("number"), "title": node.get("title"), "headRefName": node.get("headRefName"),
            "headRefOid": node.get("headRefOid"), "baseRefName": node.get("baseRefName"), "url": node.get("url"),
            "closingIssueNumbers": closing,
        })
    return remote_main, issues, deps, prs


def pr_issue_number(pr: dict[str, Any]) -> int | None:
    closing = pr.get("closingIssueNumbers") or []
    if len(closing) > 1:
        raise RuntimeError(f"PR #{pr.get('number')} closes multiple Issues; one-Issue/one-writer mapping is ambiguous")
    if len(closing) == 1:
        return int(closing[0])
    text = "\n".join(str(pr.get(k) or "") for k in ("title", "headRefName", "body"))
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
    best: tuple[datetime, Path] | None = None
    for path in candidates:
        try:
            text = path.read_text(errors="replace")[-120000:]
        except OSError:
            continue
        retry = quota_retry_from_text(text, tz=current.tzinfo)
        if retry and (best is None or retry > best[0]):
            best = (retry, path)
    blocked = bool(best and best[0] > current)
    return {
        "blocked": blocked,
        "retry_after": best[0].isoformat() if best else None,
        "source": str(best[1]) if best else None,
        "reason": "usage_limit" if best else None,
        "details_withheld": bool(best),
    }


def _tool_version(command: str, args: list[str]) -> str | None:
    binary = shutil.which(command)
    if not binary:
        return None
    try:
        result = process_run([binary, *args], text=True, capture_output=True, timeout=3)
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


def betterleaks_status_code(path: Path) -> int:
    binary = shutil.which("betterleaks")
    if not binary:
        return 2
    result = process_run([binary, "git", "--pre-commit", "--no-banner", "--no-color", "--redact=100",
        "--report-format", "json", "--report-path", os.devnull, "."], cwd=path,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if result.returncode == 0:
        return 0
    if result.returncode == 1:
        return 1
    return 3



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
    result = process_run(["systemctl", "--user", "show", unit,
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




def parse_git_status_v2(text: str) -> dict[str, Any]:
    head: str | None = None; branch = "DETACHED"; dirty: list[str] = []
    for line in text.splitlines():
        if line.startswith("# branch.oid "):
            value = line.removeprefix("# branch.oid ").strip(); head = None if value == "(initial)" else value
        elif line.startswith("# branch.head "):
            value = line.removeprefix("# branch.head ").strip(); branch = "DETACHED" if value.startswith("(") else value
        elif line and not line.startswith("#") and not re.search(r"(?:^|\s)\.pnpm-store/", line):
            dirty.append(line)
    return {"head": head, "branch": branch, "dirty": dirty}


def git_status_snapshot(path: Path) -> dict[str, Any]:
    text = run(["git", "status", "--porcelain=v2", "--branch", "--untracked-files=all"], cwd=path, check=False)
    return parse_git_status_v2(text)


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
        status = git_status_snapshot(path)
        head = str(status.get("head") or ""); branch = str(status.get("branch") or "DETACHED"); dirty = list(status.get("dirty") or [])
        ahead = False
        for pr_head in pr_heads:
            if pr_head and head and head != pr_head and process_run(["git", "merge-base", "--is-ancestor", pr_head, head], cwd=path, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0:
                ahead = True; break
        counts = run(["git", "rev-list", "--left-right", "--count", "origin/main...HEAD"], cwd=path, check=False).split()
        ahead_main = len(counts) == 2 and int(counts[1]) > 0
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
            safe_prs = [{
                "number": pr.get("number"), "title": pr.get("title"), "headRefName": pr.get("headRefName"),
                "headRefOid": pr.get("headRefOid"), "baseRefName": pr.get("baseRefName"), "url": pr.get("url"),
            } for pr in issue_prs]
            result["candidates"].append({**base, "prs": safe_prs, "local_workspaces": workspaces,
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
    possible_issues = {int(row["number"]) for row in candidates + active}
    if len(possible_issues) < 2:
        return []
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


def fleet_snapshot(*, include_capabilities: bool = True) -> dict[str, Any]:
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        f_remote = pool.submit(remote_fleet_inputs)
        f_quota = pool.submit(quota_snapshot)
        main, issues, deps, prs = f_remote.result()
        quota = f_quota.result()
    ensure_local_main(main)
    agents = agent_records(); classified = classify_issues(issues, deps, prs, agents); resources = resource_snapshot()
    active = sum(1 for row in agents if row.get("active")); unknown = sum(1 for row in agents if row.get("unknown"))
    lanes = lane_calculation(ready=len(classified["ready"]), active=active, unknown=unknown,
                             candidates=len(classified["candidates"]), resource_cap=resources["implementation_cap"],
                             quota_blocked=quota["blocked"])
    result = {"main": main, "policy": {"one_issue_one_writer": True, "parallel_merge": False,
            "native_subagents": "read-heavy exploration/research/test analysis; one top-level writer owns an Issue",
            "lane_formula": "min(independent ready work, WIP/review capacity, quota, local resource cap)"},
            "lanes": lanes, "quota": quota, "resources": resources, "issues": classified,
            "agents": agents, "shared_asset_collisions": collision_snapshot(classified["candidates"], classified["active"])}
    if include_capabilities:
        result["capabilities"] = capability_snapshot()
    return result


def main_repo_state(remote_main: str) -> dict[str, Any]:
    status = git_status_snapshot(MAIN)
    local_head = status.get("head")
    return {"local_head": local_head, "branch": status.get("branch"), "dirty_paths": len(status.get("dirty") or []), "stale": local_head != remote_main}


def _compact_candidate(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "issue": int(row["number"]),
        "prs": [{"number": int(pr["number"]), "head": pr.get("headRefOid")} for pr in row.get("prs") or []],
        "dirty": bool(row.get("has_dirty_correction")), "needs_push": bool(row.get("needs_push")),
        "terminal_event": row.get("local_terminal_event"),
    }


def recommended_actions(fleet: dict[str, Any]) -> list[dict[str, Any]]:
    issues = fleet.get("issues") or {}; actions: list[dict[str, Any]] = []
    for row in fleet.get("agents") or []:
        if row.get("unknown"):
            actions.append({"priority": 0, "kind": "INSPECT_UNKNOWN_DIRECT_AGENT", "issue": int(row["issue"])})
    for candidate in issues.get("candidates") or []:
        kind = "CONTINUE_EXISTING_CORRECTION" if candidate.get("has_dirty_correction") else "PUBLISH_LOCAL_CANDIDATE" if candidate.get("needs_push") else "REVIEW_CANDIDATE"
        actions.append({"priority": 1, "kind": kind, "issue": int(candidate["number"])})
    if (fleet.get("quota") or {}).get("blocked"):
        actions.append({"priority": 2, "kind": "CODEX_QUOTA_BLOCKED", "retry_after": fleet["quota"].get("retry_after")})
    if int((fleet.get("lanes") or {}).get("recommended_new_lanes") or 0) > 0:
        for ready in issues.get("ready") or []:
            actions.append({"priority": 3, "kind": "START_DIRECT_AGENT", "issue": int(ready["number"])})
    if not actions:
        actions.append({"priority": 9, "kind": "NO_IMMEDIATE_PRODUCT_ACTION"})
    actions.sort(key=lambda row: (int(row["priority"]), int(row.get("issue") or 10**9)))
    return actions


def snapshot_state_from_fleet(fleet: dict[str, Any]) -> dict[str, Any]:
    issues = fleet.get("issues") or {}
    blocked = {str(int(row["number"])): [int(dep["number"]) for dep in row.get("blocked_by") or []] for row in issues.get("blocked") or []}
    collisions = [{"asset": row.get("asset"), "issues": sorted({int(writer["issue"]) for writer in row.get("writers") or []})} for row in fleet.get("shared_asset_collisions") or []]
    return {
        "main": fleet.get("main"), "repo": main_repo_state(str(fleet.get("main") or "")),
        "queue": {
            "ready": [int(row["number"]) for row in issues.get("ready") or []],
            "blocked": blocked,
            "running": [int(row["number"]) for row in issues.get("active") or []],
            "candidates": [_compact_candidate(row) for row in issues.get("candidates") or []],
        },
        "lanes": {key: (fleet.get("lanes") or {}).get(key) for key in ("current_wip", "free_wip_slots", "free_process_slots", "recommended_new_lanes", "available_correction_lanes")},
        "quota": {key: (fleet.get("quota") or {}).get(key) for key in ("blocked", "retry_after", "reason")},
        "risk": {"unknown_agents": [int(row["issue"]) for row in fleet.get("agents") or [] if row.get("unknown")], "collisions": collisions},
        "next": recommended_actions(fleet)[0],
    }


def snapshot_id_for_state(state: dict[str, Any]) -> str:
    canonical = json.dumps(state, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
    return hashlib.sha256(canonical).hexdigest()[:20]


def snapshot_from_fleet(fleet: dict[str, Any], *, observed_at: datetime | None = None) -> dict[str, Any]:
    state = snapshot_state_from_fleet(fleet)
    return {"schema": "lw.snapshot.v1", "observed_at": (observed_at or now_local()).isoformat(), "snapshot_id": snapshot_id_for_state(state), **state}


def snapshot_response(snapshot: dict[str, Any], since: str | None) -> dict[str, Any]:
    if since and since == snapshot.get("snapshot_id"):
        return {"schema": snapshot["schema"], "observed_at": snapshot["observed_at"], "snapshot_id": snapshot["snapshot_id"], "changed": False}
    return {**snapshot, **({"changed": True} if since else {})}


def require_snapshot(expected: str | None, actual: str) -> None:
    if expected and expected != actual:
        raise RuntimeError(f"STALE_PRECONDITION expected_snapshot={expected} actual_snapshot={actual}")


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
    if not shutil.which("systemd-run") or process_run(["systemctl", "--user", "show-environment"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=user_systemd_env()).returncode:
        raise RuntimeError("systemd --user is unavailable; direct agents are not started from the RDC process tree")


def start_agent(number: int, model: str, effort: str, mode: str, dry_run: bool, existing_worktree: str | None = None, tool_profile: str = "repo", expected_snapshot: str | None = None) -> dict[str, Any]:
    fleet = fleet_snapshot(include_capabilities=False)
    if expected_snapshot:
        require_snapshot(expected_snapshot, snapshot_from_fleet(fleet)["snapshot_id"])
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
    classified = fleet.get("issues") or {}
    buckets = {name: {int(row["number"]): row for row in classified.get(name) or []} for name in ("ready", "blocked", "active", "candidates")}
    issue = next((bucket[number] for bucket in buckets.values() if number in bucket), None)
    if issue is None:
        raise RuntimeError(f"Issue #{number} is not an open priority task in the live fleet snapshot")
    if number in buckets["blocked"]:
        raise RuntimeError(f"Issue #{number} has unresolved blocked_by dependencies: {[x['number'] for x in buckets['blocked'][number].get('blocked_by') or []]}")
    prs = (buckets["candidates"].get(number) or {}).get("prs") or []
    if mode == "fresh" and number not in buckets["ready"]:
        raise RuntimeError(f"Issue #{number} is not a fresh ready task in the live fleet snapshot")
    if mode == "correction" and number not in buckets["candidates"]:
        raise RuntimeError(f"Issue #{number} has no live candidate to correct")
    main = str(fleet.get("main") or "")
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
        refresh_main(main)
        if worktree.exists():
            raise RuntimeError(f"worktree already exists: {worktree}; inspect/reuse explicitly instead of replacing it")
        if process_run(["git", "show-ref", "--verify", "--quiet", f"refs/heads/{branch}"], cwd=MAIN).returncode == 0:
            raise RuntimeError(f"local branch already exists: {branch}")
        run(["git", "worktree", "add", "-b", branch, str(worktree), main], cwd=MAIN)
        preflight = process_run([sys.executable, str(worktree / "scripts/parallel-task-preflight.py"),
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
        if base_pr_head and process_run(["git", "merge-base", "--is-ancestor", base_pr_head, head], cwd=worktree).returncode != 0:
            raise RuntimeError(f"correction worktree HEAD {head} is not based on current PR head {base_pr_head}")
        preflight_text = f"correction ownership: explicit worktree={worktree} branch={branch} head={head} dirty={bool(status)}"
    run_dir = STATE / f"issue-{number}"; run_dir.mkdir(parents=True, exist_ok=True)
    archive_current_delivery_attempt(number)
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
    start = process_run(["systemd-run", "--user", f"--unit={unit}", "--collect",
        f"--setenv=HOME={Path.home()}", f"--setenv=PATH={os.environ.get('PATH','')}",
        f"--property=WorkingDirectory={worktree}", "/bin/bash", "-lc", shell], text=True, capture_output=True, env=user_systemd_env())
    if start.returncode:
        raise RuntimeError((start.stderr or start.stdout).strip())
    meta["launch_confirmed"] = True
    (run_dir / "meta.json").write_text(json.dumps(meta, indent=2) + "\n")
    record_delivery_event({"event": "attempt_started", "repository": REPO, "issue": number, "mode": mode, "model": model, "effort": effort, "started_at": meta["started_at"]})
    return {**meta, "started": True, "preflight": preflight_text, "systemd": start.stdout.strip()}


def agent_status(number: int | None) -> dict[str, Any]:
    rows = agent_records()
    if number is not None:
        rows = [row for row in rows if int(row["issue"]) == number]
    return {"agents": rows, "quota": quota_snapshot()}


def agent_logs(number: int, tail: int) -> dict[str, Any]:
    root = STATE / f"issue-{number}"; events = root / "events.jsonl"; stderr = root / "stderr.log"; last = root / "last.txt"
    def file_meta(path: Path) -> dict[str, Any]:
        try:
            stat = path.stat()
            return {"path": str(path), "exists": True, "bytes": stat.st_size}
        except OSError:
            return {"path": str(path), "exists": False, "bytes": 0}
    return {
        "issue": number,
        "status": agent_status(number),
        "terminal_event": terminal_event(events),
        "files": {"events": file_meta(events), "stderr": file_meta(stderr), "last": file_meta(last)},
        "content_withheld": True,
        "note": "Read bounded raw content explicitly with the controller/RDC only when needed.",
    }


def stop_agent(number: int) -> dict[str, Any]:
    unit = unit_name(number); before = systemd_show(unit)
    process_run(["systemctl", "--user", "stop", unit], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=user_systemd_env())
    return {"issue": number, "stopped": True, "before": before, "after": systemd_show(unit),
            "retry_authorized": False, "note": "stop is not retry/replay authority"}


def _tail_bytes(path: Path, limit: int = 262144) -> bytes:
    try:
        with path.open("rb") as handle:
            handle.seek(0, os.SEEK_END); size = handle.tell(); handle.seek(max(0, size - limit))
            return handle.read(limit)
    except OSError:
        return b""


def _last_completed_usage(path: Path) -> dict[str, int] | None:
    for raw in reversed(_tail_bytes(path).splitlines()):
        try:
            row = json.loads(raw)
        except (json.JSONDecodeError, UnicodeDecodeError):
            continue
        usage = row.get("usage") if row.get("type") == "turn.completed" else None
        if isinstance(usage, dict):
            return {key: int(usage.get(key) or 0) for key in ("input_tokens", "cached_input_tokens", "cache_write_input_tokens", "output_tokens", "reasoning_output_tokens")}
    return None


def record_delivery_event(row: dict[str, Any]) -> None:
    safe = {key: row.get(key) for key in ("event", "repository", "issue", "mode", "model", "effort", "started_at", "terminal_event", "usage") if key in row}
    try:
        DELIVERY_EVENTS.parent.mkdir(parents=True, exist_ok=True)
        with DELIVERY_EVENTS.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(safe, sort_keys=True, separators=(",", ":")) + "\n")
    except OSError:
        pass


def archive_current_delivery_attempt(issue: int) -> None:
    root = STATE / f"issue-{issue}"
    try:
        meta = json.loads((root / "meta.json").read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return
    started_at = meta.get("started_at")
    if meta.get("launch_confirmed") is not True or not isinstance(started_at, str) or not started_at:
        return
    usage = _last_completed_usage(root / "events.jsonl")
    record_delivery_event({
        "event": "attempt_snapshot", "repository": REPO, "issue": issue,
        "mode": meta.get("mode"), "model": meta.get("model"), "effort": meta.get("effort"),
        "started_at": started_at, "terminal_event": terminal_event(root / "events.jsonl"),
        "usage": usage,
    })


def codex_usage_snapshot(paths: list[Path] | None = None) -> dict[str, Any]:
    candidates = paths
    if candidates is None:
        candidates = sorted(STATE.glob("issue-*/events.jsonl")) if STATE.exists() else []
        candidates += sorted(Path("/tmp").glob("lunowa-*-direct.jsonl"))
    totals = {key: 0 for key in ("input_tokens", "cached_input_tokens", "cache_write_input_tokens", "output_tokens", "reasoning_output_tokens")}
    runs = 0
    for path in candidates:
        usage = _last_completed_usage(path)
        if not usage:
            continue
        runs += 1
        for key in totals:
            totals[key] += usage[key]
    fresh = max(totals["input_tokens"] - totals["cached_input_tokens"], 0)
    return {
        "runs_with_usage": runs, **totals, "fresh_input_tokens": fresh,
        "cache_ratio": round(totals["cached_input_tokens"] / totals["input_tokens"], 4) if totals["input_tokens"] else None,
        "interpretation": "model-reported usage metadata; not billing or quota truth",
    }


def _metric_command(argv: list[str]) -> str:
    if not argv:
        return "fleet"
    if argv[0] == "agent" and len(argv) > 1:
        return f"agent:{argv[1]}"
    return argv[0]


def record_cli_metric(command: str, elapsed_ms: int, ok: bool) -> None:
    row = {
        "ts": now_local().isoformat(), "command": command, "elapsed_ms": elapsed_ms, "ok": bool(ok),
        "stdout_bytes": _LAST_OUTPUT_BYTES, "subprocess_calls": int(_METRIC_COUNTS["subprocess"]),
        "github_calls": int(_METRIC_COUNTS["github"]), "remote_git_calls": int(_METRIC_COUNTS["remote_git"]),
    }
    try:
        CLI_METRICS.parent.mkdir(parents=True, exist_ok=True)
        if CLI_METRICS.exists() and CLI_METRICS.stat().st_size > 512 * 1024:
            rotated = CLI_METRICS.with_suffix(CLI_METRICS.suffix + ".1")
            try:
                rotated.unlink(missing_ok=True); CLI_METRICS.replace(rotated)
            except OSError:
                pass
        with CLI_METRICS.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(row, sort_keys=True, separators=(",", ":")) + "\n")
    except OSError:
        pass


def _percentile(values: list[int], q: float) -> int | None:
    if not values:
        return None
    ordered = sorted(values); index = max(0, min(len(ordered) - 1, math.ceil(q * len(ordered)) - 1))
    return ordered[index]


def cli_metrics_snapshot(limit: int = 500) -> dict[str, Any]:
    rows: list[dict[str, Any]] = []
    try:
        lines = CLI_METRICS.read_text(encoding="utf-8").splitlines()[-limit:]
    except OSError:
        lines = []
    for line in lines:
        try:
            row = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(row, dict) and isinstance(row.get("command"), str):
            rows.append(row)
    grouped: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        grouped.setdefault(row["command"], []).append(row)
    commands = []
    for command, items in sorted(grouped.items()):
        latency = [int(row.get("elapsed_ms") or 0) for row in items]
        output = [int(row.get("stdout_bytes") or 0) for row in items]
        commands.append({
            "command": command, "count": len(items), "success_rate": round(sum(1 for row in items if row.get("ok")) / len(items), 4),
            "p50_ms": _percentile(latency, 0.50), "p95_ms": _percentile(latency, 0.95),
            "p50_stdout_bytes": _percentile(output, 0.50), "p95_stdout_bytes": _percentile(output, 0.95),
            "avg_subprocess_calls": round(sum(int(row.get("subprocess_calls") or 0) for row in items) / len(items), 2),
            "avg_github_calls": round(sum(int(row.get("github_calls") or 0) for row in items) / len(items), 2),
            "avg_remote_git_calls": round(sum(int(row.get("remote_git_calls") or 0) for row in items) / len(items), 2),
        })
    return {"schema": "lw.metrics.v1", "samples": len(rows), "commands": commands, "codex_usage": codex_usage_snapshot(), "privacy": "metadata only; no stdout/stderr, GitHub bodies, prompts, scanner findings, or credentials stored"}


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__); sub = p.add_subparsers(dest="command", required=True)
    sub.add_parser("fleet")
    sn = sub.add_parser("snapshot"); sn.add_argument("--since")
    sub.add_parser("metrics")
    sub.add_parser("throughput")
    sub.add_parser("capabilities")
    sg = sub.add_parser("guard-secrets"); sg.add_argument("--path", default=".")
    a = sub.add_parser("agent"); aa = a.add_subparsers(dest="action", required=True)
    s = aa.add_parser("start"); s.add_argument("issue", type=int); s.add_argument("--model", default="gpt-5.6-luna"); s.add_argument("--effort", choices=("low","medium","high","xhigh"), default="high"); s.add_argument("--mode", choices=("fresh","correction"), default="fresh"); s.add_argument("--worktree"); s.add_argument("--tool-profile", choices=tuple(TOOL_PROFILES), default="repo"); s.add_argument("--expect-snapshot"); s.add_argument("--dry-run", action="store_true")
    st = aa.add_parser("status"); st.add_argument("issue", type=int, nargs="?")
    lg = aa.add_parser("logs"); lg.add_argument("issue", type=int); lg.add_argument("--tail", type=int, default=40)
    sp = aa.add_parser("stop"); sp.add_argument("issue", type=int)
    return p


def main() -> int:
    args = parser().parse_args()
    if args.command == "fleet": emit(fleet_snapshot())
    elif args.command == "snapshot": emit(snapshot_response(snapshot_from_fleet(fleet_snapshot(include_capabilities=False)), args.since))
    elif args.command == "metrics": emit(cli_metrics_snapshot())
    elif args.command == "throughput":
        payload = as_json([sys.executable, str(Path(__file__).with_name("delivery_metrics.py"))])
        emit(payload)
    elif args.command == "capabilities": emit(capability_snapshot())
    elif args.command == "guard-secrets":
        code = betterleaks_status_code(Path(args.path).expanduser().resolve())
        if code == 0:
            emit({"available": True, "ok": True, "leaks_detected": False, "network_validation": False, "details_withheld": False})
            return 0
        if code == 1:
            emit({"available": True, "ok": False, "leaks_detected": True, "network_validation": False, "details_withheld": True})
            return 1
        if code == 2:
            emit({"available": False, "ok": None, "status": "SKIPPED_OPTIONAL", "reason": "betterleaks is not installed"})
            return 0
        emit({"available": True, "ok": False, "leaks_detected": None, "network_validation": False, "details_withheld": True, "status": "SCANNER_ERROR"})
        return 3
    elif args.action == "start": emit(start_agent(args.issue, args.model, args.effort, args.mode, args.dry_run, args.worktree, args.tool_profile, args.expect_snapshot))
    elif args.action == "status": emit(agent_status(args.issue))
    elif args.action == "logs": emit(agent_logs(args.issue, args.tail))
    elif args.action == "stop": emit(stop_agent(args.issue))
    return 0


if __name__ == "__main__":
    started = time.perf_counter(); command = _metric_command(sys.argv[1:]); ok = False
    try:
        code = main(); ok = code == 0
        raise SystemExit(code)
    except (RuntimeError, subprocess.CalledProcessError) as exc:
        print(f"direct-agent-control: {exc}", file=sys.stderr)
        raise SystemExit(1)
    finally:
        record_cli_metric(command, round((time.perf_counter() - started) * 1000), ok)
