from __future__ import annotations

from datetime import datetime, timezone
import importlib.util
from pathlib import Path
import unittest
from unittest import mock

MODULE_PATH = Path(__file__).with_name("direct_agent_control.py")
spec = importlib.util.spec_from_file_location("direct_agent_control", MODULE_PATH)
assert spec and spec.loader
control = importlib.util.module_from_spec(spec)
spec.loader.exec_module(control)


class DirectAgentControlTest(unittest.TestCase):
    def test_tool_profiles_fail_closed_and_keep_privileged_integrations_off(self) -> None:
        repo = control.codex_tool_args("repo")
        self.assertIn("remote_plugin", repo)
        self.assertIn("mcp_servers.cloudflare-api.enabled=false", repo)
        self.assertIn("mcp_servers.google-pubsub.enabled=false", repo)
        docs = control.codex_tool_args("docs")
        self.assertIn("mcp_servers.context7.enabled=true", docs)
        self.assertIn("mcp_servers.cloudflare-api.enabled=false", docs)
        ui = control.codex_tool_args("ui")
        self.assertIn("mcp_servers.next-devtools.enabled=true", ui)
        self.assertIn("mcp_servers.chrome-devtools.enabled=false", ui)
        browser = control.codex_tool_args("browser-debug")
        self.assertIn("mcp_servers.chrome-devtools.enabled=true", browser)
        with self.assertRaisesRegex(RuntimeError, "unknown tool profile"):
            control.codex_tool_args("privileged")

    def test_sandbox_readiness_fails_closed_on_missing_prerequisites(self) -> None:
        blocked = control.sandbox_readiness(sbx_available=False, kvm_module=True, kvm_group=False, kvm_device=False)
        self.assertFalse(blocked["ready_for_pilot"])
        self.assertEqual(blocked["missing"], ["sbx", "kvm-group", "/dev/kvm-access"])
        ready = control.sandbox_readiness(sbx_available=True, kvm_module=True, kvm_group=True, kvm_device=True)
        self.assertTrue(ready["ready_for_pilot"])
        self.assertEqual(ready["missing"], [])

    def test_missing_optional_secret_tool_does_not_block_direct_execution(self) -> None:
        with mock.patch.object(control.shutil, "which", return_value=None):
            result = control.betterleaks_status_code(Path("."))
        self.assertEqual(result, 2)

    def test_secret_guard_never_captures_scanner_output(self) -> None:
        completed = mock.Mock(returncode=1)
        with mock.patch.object(control.shutil, "which", return_value="/usr/bin/betterleaks"), \
             mock.patch.object(control.subprocess, "run", return_value=completed) as runner:
            result = control.betterleaks_status_code(Path("."))
        self.assertEqual(result, 1)
        kwargs = runner.call_args.kwargs
        self.assertIs(kwargs["stdout"], control.subprocess.DEVNULL)
        self.assertIs(kwargs["stderr"], control.subprocess.DEVNULL)
        self.assertIn(control.os.devnull, runner.call_args.args[0])

    def test_agent_prompt_routes_optional_agent_native_tools_without_broadening_authority(self) -> None:
        prompt = control.agent_prompt(126, "fresh", "repo")
        self.assertIn("ast-grep outline", prompt)
        self.assertIn("Betterleaks", prompt)
        self.assertIn("without `--validation`", prompt)
        self.assertIn("do not create competing writers", prompt)

    def test_quota_snapshot_withholds_raw_evidence(self) -> None:
        now = datetime(2026, 9, 7, 1, 0, tzinfo=timezone.utc)
        with mock.patch.object(control, "STATE", Path("/does-not-exist")), \
             mock.patch.object(Path, "glob", return_value=[]):
            result = control.quota_snapshot(now)
        self.assertNotIn("evidence", result)

    def test_agent_logs_returns_metadata_not_raw_content(self) -> None:
        with mock.patch.object(control, "agent_status", return_value={"agents": [], "quota": {}}), \
             mock.patch.object(control, "terminal_event", return_value="turn.failed"):
            result = control.agent_logs(42, 40)
        self.assertTrue(result["content_withheld"])
        self.assertNotIn("events_tail", result)
        self.assertNotIn("stderr_tail", result)
        self.assertNotIn("last_message", result)

    def test_quota_parser_extracts_retry_time(self) -> None:
        text = "You've hit your usage limit. try again at Sep 7th, 2026 12:49 PM."
        parsed = control.quota_retry_from_text(text, tz=timezone.utc)
        self.assertIsNotNone(parsed)
        self.assertEqual(parsed.isoformat(), "2026-09-07T12:49:00+00:00")

    def test_lane_calculation_respects_wip_and_quota(self) -> None:
        open_lane = control.lane_calculation(
            ready=4, active=1, unknown=0, candidates=1, resource_cap=4, quota_blocked=False
        )
        self.assertEqual(open_lane["recommended_new_lanes"], 1)
        self.assertEqual(open_lane["available_correction_lanes"], 1)
        full_wip = control.lane_calculation(
            ready=3, active=0, unknown=0, candidates=3, resource_cap=4, quota_blocked=False
        )
        self.assertEqual(full_wip["recommended_new_lanes"], 0)
        self.assertEqual(full_wip["available_correction_lanes"], 3)
        blocked = control.lane_calculation(
            ready=4, active=0, unknown=0, candidates=0, resource_cap=4, quota_blocked=True
        )
        self.assertEqual(blocked["recommended_new_lanes"], 0)
        self.assertEqual(blocked["available_correction_lanes"], 0)

    def test_issue_classification_uses_blocked_by_and_pr_state(self) -> None:
        issues = [
            {"number": 1, "title": "ready"},
            {"number": 2, "title": "blocked"},
            {"number": 3, "title": "candidate"},
            {"number": 4, "title": "active"},
        ]
        deps = {1: [], 2: [{"number": 9, "state": "OPEN", "title": "gate"}], 3: [], 4: []}
        prs = [{"number": 30, "title": "Issue #3 candidate", "body": "Closes #3", "headRefName": "agent/issue-3"}]
        agents = [{"issue": 4, "active": True, "unknown": False}]
        with mock.patch.object(control, "local_issue_workspaces", return_value=[]):
            result = control.classify_issues(issues, deps, prs, agents)
        self.assertEqual([x["number"] for x in result["ready"]], [1])
        self.assertEqual([x["number"] for x in result["blocked"]], [2])
        self.assertEqual([x["number"] for x in result["candidates"]], [3])
        self.assertEqual([x["number"] for x in result["active"]], [4])

    def test_shared_assets_surface_serial_merge_zones(self) -> None:
        paths = ["src/a.ts", "package.json", ".github/workflows/test.yml", "drizzle/001.sql"]
        self.assertEqual(
            control.shared_assets(paths),
            [".github/workflows/test.yml", "drizzle/001.sql", "package.json"],
        )

    def test_collision_includes_active_and_unpushed_worktree_writers(self) -> None:
        candidates = [{
            "number": 1, "prs": [],
            "local_workspaces": [{"path": "/tmp/candidate", "ahead_of_pr": True, "dirty_paths": 0}],
        }]
        active = [{"number": 2, "agent": {"worktree": "/tmp/active"}}]
        def fake_is_dir(self: Path) -> bool:
            return str(self) in {"/tmp/candidate", "/tmp/active"}
        def fake_paths(path: Path) -> list[str]:
            return ["package.json", "src/x.ts"]
        with mock.patch.object(Path, "is_dir", fake_is_dir), \
             mock.patch.object(control, "worktree_changed_paths", side_effect=fake_paths):
            result = control.collision_snapshot(candidates, active)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["asset"], "package.json")
        self.assertTrue(result[0]["serial_merge_required"])
        self.assertEqual({w["issue"] for w in result[0]["writers"]}, {1, 2})

    def test_completed_local_run_remains_candidate_until_published(self) -> None:
        issues = [{"number": 5, "title": "completed"}]
        agents = [{"issue": 5, "active": False, "unknown": False, "terminal_event": "turn.completed"}]
        workspace = [{"path": "/tmp/w", "ahead_of_main": True, "ahead_of_pr": False, "dirty_paths": 0}]
        with mock.patch.object(control, "local_issue_workspaces", return_value=workspace):
            result = control.classify_issues(issues, {5: []}, [], agents)
        self.assertEqual(result["ready"], [])
        self.assertEqual(result["candidates"][0]["number"], 5)
        self.assertTrue(result["candidates"][0]["needs_push"])
        self.assertEqual(result["candidates"][0]["local_terminal_event"], "turn.completed")

    def test_duplicate_same_issue_fails_before_launch(self) -> None:
        fleet = {
            "quota": {"blocked": False, "retry_after": None},
            "lanes": {"recommended_new_lanes": 1},
            "agents": [{"issue": 74, "active": True, "unknown": False}],
        }
        with mock.patch.object(control, "fleet_snapshot", return_value=fleet):
            with self.assertRaisesRegex(RuntimeError, "already has an active/unknown"):
                control.start_agent(74, "gpt-5.6-luna", "high", "fresh", False)

    def test_dry_run_reports_quota_without_launching(self) -> None:
        fleet = {
            "quota": {"blocked": True, "retry_after": "2026-09-07T12:49:00+09:00"},
            "lanes": {"recommended_new_lanes": 0},
            "agents": [],
        }
        issue = {"number": 74, "state": "OPEN", "title": "AI", "body": "", "url": "x"}
        with mock.patch.object(control, "fleet_snapshot", return_value=fleet), \
             mock.patch.object(control, "issue_gate", return_value=(issue, [], [])), \
             mock.patch.object(control, "fetch_main", return_value="abc"):
            result = control.start_agent(74, "gpt-5.6-luna", "high", "fresh", True)
        self.assertTrue(result["dry_run"])
        self.assertTrue(result["quota_blocked"])
        self.assertFalse(result["launchable_now"])
        self.assertEqual(result["tool_profile"], "repo")
        self.assertIn("mcp_servers.cloudflare-api.enabled=false", result["codex_tool_args"])


if __name__ == "__main__":
    unittest.main()
