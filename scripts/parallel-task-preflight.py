#!/usr/bin/env python3
"""Deterministic preflight for parallel implementation tasks.

The check is intentionally small and dependency-free.  It validates the local
workspace and explicit task metadata before an agent edits the repository.
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RELATIONSHIPS = {"independent", "overlapping", "dependent"}


def git(*args: str) -> str:
    result = subprocess.run(
        ["git", *args], cwd=ROOT, text=True, encoding="utf-8", errors="replace", capture_output=True
    )
    if result.returncode:
        raise RuntimeError(result.stderr.strip() or f"git {' '.join(args)} failed")
    return result.stdout.strip()


def optional_git(*args: str) -> str | None:
    result = subprocess.run(
        ["git", *args], cwd=ROOT, text=True, encoding="utf-8", errors="replace", capture_output=True
    )
    return result.stdout.strip() if result.returncode == 0 else None


def upstream_ref(base: str) -> str | None:
    """Return the configured upstream for a local base branch, if any."""
    return optional_git("rev-parse", "--abbrev-ref", f"{base}@{{upstream}}")


def check(args: argparse.Namespace) -> list[str]:
    errors: list[str] = []

    try:
        repository = Path(git("rev-parse", "--show-toplevel")).resolve()
        worktree = Path(git("rev-parse", "--show-toplevel")).resolve()
        branch = git("branch", "--show-current")
        head = git("rev-parse", "HEAD")
        status = git("status", "--porcelain=v1", "--untracked-files=all", "--ignored")
        remotes = git("remote")
    except RuntimeError as exc:
        return [str(exc)]

    if repository != Path(args.expected_repository).resolve():
        errors.append(f"repository mismatch: expected {args.expected_repository}, got {repository}")
    if Path(args.expected_worktree).resolve() != ROOT.resolve():
        errors.append(f"preflight must run from expected worktree: {args.expected_worktree}")
    if branch == "":
        errors.append("parallel task must run on a named dedicated branch, not detached HEAD")
    elif args.expected_branch and branch != args.expected_branch:
        errors.append(f"branch mismatch: expected {args.expected_branch}, got {branch}")
    if args.expected_head and head != args.expected_head:
        errors.append(f"HEAD mismatch: expected {args.expected_head}, got {head}")
    if status:
        errors.append("workspace is not clean (tracked, untracked, or ignored changes found)")

    base_sha = optional_git("rev-parse", "--verify", f"{args.base}^{{commit}}")
    if base_sha is None:
        errors.append(f"intended base ref is unavailable: {args.base}")

    remote_base = args.remote_base or upstream_ref(args.base)
    remote_sha = None
    if remotes:
        if remote_base is None:
            errors.append(
                "freshness cannot be established: remotes exist but no fetched remote base ref was provided "
                f"for {args.base}"
            )
        else:
            remote_sha = optional_git("rev-parse", "--verify", f"{remote_base}^{{commit}}")
            if remote_sha is None:
                errors.append(f"fetched remote base ref is unavailable: {remote_base}; fetch it before starting the task")
            elif base_sha and base_sha != remote_sha:
                errors.append(
                    f"base ref is stale relative to fetched remote base: {args.base}={base_sha} "
                    f"but {remote_base}={remote_sha}"
                )

    owner = os.environ.get("PARALLEL_TASK_OWNER", "")
    if not owner or owner != args.owner:
        errors.append("workspace ownership is not established by matching PARALLEL_TASK_OWNER")

    if args.relationship not in RELATIONSHIPS:
        errors.append(f"unsupported task relationship: {args.relationship}")
    if args.relationship == "dependent" and args.blocker_status != "resolved":
        errors.append("dependent task cannot start while its declared blocker is unresolved")
    if args.relationship != "dependent" and args.blocker_status != "none":
        errors.append("only dependent tasks may declare a blocker status")
    if args.relationship == "overlapping":
        errors.append("overlapping task ownership must be serialized or explicitly redesigned before launch")

    try:
        if subprocess.run(["git", "merge-base", "--is-ancestor", args.base, "HEAD"], cwd=ROOT).returncode != 0:
            errors.append(f"HEAD is not based on intended base ref: {args.base}")
    except OSError as exc:
        errors.append(f"could not check intended base ref {args.base}: {exc}")

    print(f"parallel preflight: {'PASS' if not errors else 'FAIL'}")
    worktree_state = "dirty" if status else "clean"
    print(
        f"repository={repository} worktree={ROOT.resolve()} worktree_state={worktree_state} "
        f"branch={branch or '<detached>'} head={head}"
    )
    print(f"base={args.base} base_sha={base_sha or '<unavailable>'} relationship={args.relationship} owner={args.owner}")
    if remotes:
        if base_sha and remote_sha:
            freshness = "fresh" if base_sha == remote_sha else "stale"
        else:
            freshness = "unavailable"
        print(
            f"remote_base={remote_base or '<unavailable>'} remote_sha={remote_sha or '<unavailable>'} "
            f"freshness={freshness}"
        )
    else:
        print("remote_base=<unavailable> remote_sha=<unavailable> freshness=limited (no remote configured)")
    for error in errors:
        print(f"- {error}")
    return errors


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("--expected-repository", required=True)
    result.add_argument("--expected-worktree", required=True)
    result.add_argument("--expected-branch")
    result.add_argument("--expected-head")
    result.add_argument("--base", required=True)
    result.add_argument("--remote-base", help="fetched remote-tracking ref for the intended base, e.g. origin/main")
    result.add_argument("--owner", required=True)
    result.add_argument("--relationship", choices=sorted(RELATIONSHIPS), required=True)
    result.add_argument("--blocker-status", choices=("none", "unresolved", "resolved"), default="none")
    return result


def main() -> int:
    errors = check(parser().parse_args())
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
