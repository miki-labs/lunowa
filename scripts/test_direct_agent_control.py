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


if __name__ == "__main__":
    unittest.main()
