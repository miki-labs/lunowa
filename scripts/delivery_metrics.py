#!/usr/bin/env python3
"""Read-only accepted-delivery metrics for current Lunowa direct-agent work."""
from __future__ import annotations

from datetime import datetime
import json
import os
from pathlib import Path
import re
import subprocess
from typing import Any

REPO = os.environ.get("LW_REPO", "miki-labs/lunowa")
OWNER, NAME = REPO.split("/", 1)
STATE = Path(os.environ.get("LW_AGENT_STATE", str(Path.home() / ".cache/lw/direct-agents")))
DELIVERY_EVENTS = Path(os.environ.get("LW_DELIVERY_EVENTS", str(Path.home() / ".cache/lw/delivery-events.jsonl")))
ACCEPTANCE_MARKER = "<!-- independent-acceptance-disposition:v1 -->"


def run_json(args: list[str]) -> Any:
    result = subprocess.run(args, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError((result.stderr or result.stdout).strip())
    return json.loads(result.stdout) if result.stdout.strip() else None


def gh(*args: str) -> Any:
    return run_json(["gh", *args])


def read_json(path: Path) -> dict[str, Any] | None:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    return value if isinstance(value, dict) else None


def usage_facts(usage: dict[str, Any] | None) -> dict[str, int]:
    usage = usage or {}
    total = int(usage.get("input_tokens") or 0)
    cached = int(usage.get("cached_input_tokens") or 0)
    output = int(usage.get("output_tokens") or 0)
    fresh = max(total - cached, 0)
    return {
        "input": total,
        "cached_input": cached,
        "fresh_input": fresh,
        "output": output,
        "reasoning_output": int(usage.get("reasoning_output_tokens") or 0),
        "effective_tokens_est": round(fresh + 0.1 * cached + 4 * output),
    }


def last_completed_usage(path: Path) -> dict[str, Any] | None:
    try:
        lines = path.read_bytes()[-262144:].splitlines()
    except OSError:
        return None
    for raw in reversed(lines):
        try:
            row = json.loads(raw)
        except (json.JSONDecodeError, UnicodeDecodeError):
            continue
        if row.get("type") == "turn.completed" and isinstance(row.get("usage"), dict):
            return row["usage"]
    return None


def direct_runs() -> list[dict[str, Any]]:
    attempts: dict[tuple[int, str], dict[str, Any]] = {}
    try:
        lines = DELIVERY_EVENTS.read_text(encoding="utf-8").splitlines()
    except OSError:
        lines = []
    for line in lines:
        try:
            row = json.loads(line)
        except json.JSONDecodeError:
            continue
        if not isinstance(row, dict) or row.get("repository") != REPO:
            continue
        issue, started = row.get("issue"), row.get("started_at")
        if isinstance(issue, int) and isinstance(started, str):
            attempts.setdefault((issue, started), {}).update(row)

    if STATE.exists():
        for root in STATE.glob("issue-*"):
            meta = read_json(root / "meta.json")
            if (not meta or meta.get("launch_confirmed") is not True
                    or not isinstance(meta.get("issue"), int)
                    or not isinstance(meta.get("started_at"), str)):
                continue
            key = (meta["issue"], meta["started_at"])
            attempts.setdefault(key, {}).update({
                "event": "current_attempt",
                "repository": REPO,
                "issue": meta["issue"],
                "started_at": meta["started_at"],
                "mode": meta.get("mode"),
                "model": meta.get("model"),
                "effort": meta.get("effort"),
                "usage": last_completed_usage(root / "events.jsonl"),
            })

    rows = []
    for (issue, started), row in attempts.items():
        raw_usage = row.get("usage") if isinstance(row.get("usage"), dict) else None
        rows.append({
            "issue": issue,
            "started_at": started,
            "kind": row.get("mode"),
            "model": row.get("model"),
            "effort": row.get("effort"),
            "usage_available": raw_usage is not None,
            "usage": usage_facts(raw_usage),
        })
    return sorted(rows, key=lambda row: parse_time(row["started_at"]) or datetime.max.astimezone())


def parse_disposition(body: str) -> dict[str, str] | None:
    if ACCEPTANCE_MARKER not in body:
        return None
    decision = re.search(r"(?im)^\s*(?:##\s*)?(PASS|FAIL(?:\s*/\s*REVISE)?)\b", body)
    head = re.search(r"(?is)exact(?:[-\s]+PR)?[-\s]+head[^0-9a-f]{0,80}([0-9a-f]{40})", body)
    if not decision or not head:
        return None
    return {
        "result": "PASS" if decision.group(1).upper().startswith("PASS") else "FAIL",
        "head": head.group(1).lower(),
    }


def issue_from_pr(pr: dict[str, Any]) -> int | None:
    closing = pr.get("closingIssueNumbers") or []
    if len(closing) == 1:
        return int(closing[0])
    if len(closing) > 1:
        return None
    text = f"{pr.get('title') or ''}\n{pr.get('headRefName') or ''}"
    match = re.search(r"issue[-_/ ]#?(\d+)|issue-(\d+)", text, re.I)
    return int(next(value for value in match.groups() if value)) if match else None


def pull_requests(limit: int = 100) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    bounded = max(1, min(limit, 100))
    query = (
        "query($owner:String!,$name:String!){repository(owner:$owner,name:$name){"
        "pullRequests(first:%d,orderBy:{field:CREATED_AT,direction:DESC}){" % bounded
        + "nodes{number title headRefName headRefOid createdAt mergedAt "
        "closingIssuesReferences(first:20){nodes{number} pageInfo{hasNextPage}} "
        "reviews(first:100){nodes{body submittedAt} pageInfo{hasNextPage}} "
        "comments(first:100){nodes{body createdAt} pageInfo{hasNextPage}}}"
        "pageInfo{hasNextPage}}}}"
    )
    payload = gh("api", "graphql", "-F", f"owner={OWNER}", "-F", f"name={NAME}", "-f", f"query={query}")
    repo = ((payload or {}).get("data") or {}).get("repository")
    if (payload or {}).get("errors") or not isinstance(repo, dict):
        raise RuntimeError("GitHub pull-request evidence is incomplete")
    connection = repo.get("pullRequests") or {}
    rows, evidence_complete = [], True
    for node in connection.get("nodes") or []:
        closing = node.get("closingIssuesReferences") or {}
        reviews = node.get("reviews") or {}
        comments = node.get("comments") or {}
        if (closing.get("pageInfo") or {}).get("hasNextPage"):
            continue
        complete = not (
            (reviews.get("pageInfo") or {}).get("hasNextPage")
            or (comments.get("pageInfo") or {}).get("hasNextPage")
        )
        evidence_complete = evidence_complete and complete
        pr = {
            "number": int(node["number"]),
            "title": node.get("title"),
            "headRefName": node.get("headRefName"),
            "headRefOid": node.get("headRefOid"),
            "createdAt": node.get("createdAt"),
            "mergedAt": node.get("mergedAt"),
            "closingIssueNumbers": [int(item["number"]) for item in closing.get("nodes") or []],
            "reviews": reviews.get("nodes") or [],
            "comments": comments.get("nodes") or [],
            "acceptance_evidence_complete": complete,
        }
        issue = issue_from_pr(pr)
        if issue is not None:
            pr["issue"] = issue
            rows.append(pr)
    return rows, {
        "pr_window_complete": not bool((connection.get("pageInfo") or {}).get("hasNextPage")),
        "acceptance_pages_complete": evidence_complete,
        "pr_limit": bounded,
    }


def parse_time(value: Any) -> datetime | None:
    if not isinstance(value, str) or not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def minutes(start: Any, end: Any) -> float | None:
    left, right = parse_time(start), parse_time(end)
    if not left or not right:
        return None
    return round(max((right - left).total_seconds(), 0) / 60, 1)


def trusted_dispositions(pr: dict[str, Any]) -> list[dict[str, Any]]:
    if pr.get("acceptance_evidence_complete") is False:
        return []
    rows = []
    for review in pr.get("reviews") or []:
        parsed = parse_disposition(str(review.get("body") or ""))
        if parsed:
            rows.append({**parsed, "at": review.get("submittedAt"), "source": "review"})
    for comment in pr.get("comments") or []:
        parsed = parse_disposition(str(comment.get("body") or ""))
        if parsed:
            rows.append({**parsed, "at": comment.get("createdAt"), "source": "comment"})
    return sorted(rows, key=lambda row: parse_time(row.get("at")) or datetime.max.astimezone())


def sum_usage(runs: list[dict[str, Any]]) -> dict[str, Any]:
    known = [row for row in runs if row.get("usage_available")]
    keys = ("input", "cached_input", "fresh_input", "output", "reasoning_output", "effective_tokens_est")
    totals = {key: sum(int(row["usage"].get(key) or 0) for row in known) for key in keys}
    return {**totals, "known_runs": len(known), "total_runs": len(runs), "complete": len(known) == len(runs)}


def build_metrics(runs: list[dict[str, Any]], prs: list[dict[str, Any]], coverage: dict[str, Any]) -> dict[str, Any]:
    by_issue: dict[int, list[dict[str, Any]]] = {}
    for row in runs:
        by_issue.setdefault(int(row["issue"]), []).append(row)
    pr_by_issue: dict[int, list[dict[str, Any]]] = {}
    for pr in prs:
        pr_by_issue.setdefault(int(pr["issue"]), []).append(pr)

    issues = []
    for issue, issue_runs in sorted(by_issue.items()):
        issue_runs.sort(key=lambda row: parse_time(row["started_at"]) or datetime.max.astimezone())
        issue_prs = sorted(pr_by_issue.get(issue, []), key=lambda row: parse_time(row.get("createdAt")) or datetime.max.astimezone())
        start = issue_runs[0]["started_at"]
        first_candidate = issue_prs[0].get("createdAt") if issue_prs else None
        merged = [pr for pr in issue_prs if pr.get("mergedAt")]
        final_pr = max(merged, key=lambda pr: parse_time(pr["mergedAt"])) if merged else (issue_prs[-1] if issue_prs else None)
        dispositions = sorted(
            [row for pr in issue_prs for row in trusted_dispositions(pr)],
            key=lambda row: parse_time(row.get("at")) or datetime.max.astimezone(),
        )
        first = dispositions[0] if dispositions else None
        final = None
        if final_pr:
            final_head = str(final_pr.get("headRefOid") or "").lower()
            matching = [row for row in trusted_dispositions(final_pr) if row["head"] == final_head]
            final = matching[-1] if matching else None
        merged_at = final_pr.get("mergedAt") if final_pr else None
        accepted = bool(merged_at and final and final["result"] == "PASS")
        issues.append({
            "issue": issue,
            "prs": [pr["number"] for pr in issue_prs],
            "implementation_start": start,
            "first_candidate_at": first_candidate,
            "first_exact_head_disposition": first["result"] if first else "UNKNOWN",
            "final_head_disposition": final["result"] if final else "UNKNOWN",
            "correction_runs": sum(row.get("kind") == "correction" for row in issue_runs),
            "merged_at": merged_at,
            "accepted": accepted,
            "start_to_merge_min": minutes(start, merged_at),
            "usage": sum_usage(issue_runs),
        })

    accepted = [row for row in issues if row["accepted"]]
    first_known = [row for row in accepted if row["first_exact_head_disposition"] in {"PASS", "FAIL"}]
    usage_complete = [row for row in accepted if row["usage"]["complete"]]

    def avg(values: list[float]) -> float | None:
        return round(sum(values) / len(values), 1) if values else None

    return {
        "schema": "lw.delivery-throughput.v1",
        "aggregate": {
            "measured_issues": len(issues),
            "accepted_issues": len(accepted),
            "merged_without_observable_exact_head_pass": sum(bool(row["merged_at"]) and not row["accepted"] for row in issues),
            "first_pass_observable_accepted_issues": len(first_known),
            "first_pass_acceptance_rate": (
                round(sum(row["first_exact_head_disposition"] == "PASS" for row in first_known) / len(first_known), 4)
                if first_known else None
            ),
            "avg_correction_runs_per_accepted_issue": avg([float(row["correction_runs"]) for row in accepted]),
            "avg_start_to_merge_min": avg([float(row["start_to_merge_min"]) for row in accepted if row["start_to_merge_min"] is not None]),
            "accepted_issues_with_complete_usage": len(usage_complete),
            "avg_fresh_tokens_per_usage_complete_accepted_issue": avg([float(row["usage"]["fresh_input"]) for row in usage_complete]),
            "avg_effective_tokens_per_usage_complete_accepted_issue": avg([float(row["usage"]["effective_tokens_est"]) for row in usage_complete]),
        },
        "coverage": {
            **coverage,
            "accepted_first_disposition": len(first_known),
            "accepted_usage_complete": len(usage_complete),
        },
        "issues": issues,
        "missing_or_not_inferred": ["historical runs before direct-agent delivery logging", "human-intervention count", "post-merge defect signal"],
        "note": "Baseline starts with direct-agent delivery logging. GitHub exact-head PASS + merge is acceptance authority; CI green or merge alone is not acceptance.",
    }


def snapshot() -> dict[str, Any]:
    prs, coverage = pull_requests()
    return build_metrics(direct_runs(), prs, coverage)


if __name__ == "__main__":
    print(json.dumps(snapshot(), ensure_ascii=False, separators=(",", ":")))
