from __future__ import annotations

import importlib.util
from pathlib import Path
import unittest

MODULE_PATH = Path(__file__).with_name("delivery_metrics.py")
spec = importlib.util.spec_from_file_location("delivery_metrics", MODULE_PATH)
assert spec and spec.loader
metrics = importlib.util.module_from_spec(spec)
spec.loader.exec_module(metrics)


class DeliveryMetricsTest(unittest.TestCase):
    def test_acceptance_requires_machine_readable_exact_head_review(self) -> None:
        head = "a" * 40
        body = f"{metrics.ACCEPTANCE_MARKER}\nPASS — full audit, exact PR head `{head}`"
        self.assertEqual(metrics.parse_disposition(body), {"result": "PASS", "head": head})
        self.assertIsNone(metrics.parse_disposition(f"PASS exact PR head `{head}`"))
        self.assertIsNone(metrics.parse_disposition(metrics.ACCEPTANCE_MARKER + "\nPASS without head"))

    def test_issue_from_pr_prefers_structured_closing_reference(self) -> None:
        pr = {"closingIssueNumbers": [74], "title": "unrelated", "headRefName": "feature/x"}
        self.assertEqual(metrics.issue_from_pr(pr), 74)
        ambiguous = {"closingIssueNumbers": [74, 75], "title": "Issue 74", "headRefName": "issue-74"}
        self.assertIsNone(metrics.issue_from_pr(ambiguous))

    def test_trusted_disposition_can_come_from_pr_comment_and_fails_closed_on_pagination(self) -> None:
        head = "b" * 40
        body = f"{metrics.ACCEPTANCE_MARKER}\nPASS — exact PR head `{head}`"
        pr = {"reviews": [], "comments": [{"body": body, "createdAt": "2026-09-07T00:00:00Z"}], "acceptance_evidence_complete": True}
        rows = metrics.trusted_dispositions(pr)
        self.assertEqual(rows[0]["result"], "PASS")
        self.assertEqual(rows[0]["source"], "comment")
        pr["acceptance_evidence_complete"] = False
        self.assertEqual(metrics.trusted_dispositions(pr), [])

    def test_build_metrics_tracks_first_pass_corrections_latency_and_usage(self) -> None:
        first_head, final_head = "1" * 40, "2" * 40
        runs = [
            {
                "issue": 7, "kind": "fresh", "started_at": "2026-09-07T00:00:00+00:00",
                "published_at": "2026-09-07T00:10:00+00:00", "usage_available": True,
                "usage": metrics.usage_facts({"input_tokens": 100, "cached_input_tokens": 80, "output_tokens": 10}),
            },
            {
                "issue": 7, "kind": "correction", "started_at": "2026-09-07T00:20:00+00:00",
                "published_at": "2026-09-07T00:30:00+00:00", "usage_available": True,
                "usage": metrics.usage_facts({"input_tokens": 50, "cached_input_tokens": 20, "output_tokens": 5}),
            },
        ]
        fail = f"{metrics.ACCEPTANCE_MARKER}\nFAIL / REVISE — exact HEAD `{first_head}`"
        passed = f"{metrics.ACCEPTANCE_MARKER}\nPASS — exact PR head `{final_head}`"
        prs = [{
            "issue": 7, "number": 70, "headRefOid": final_head,
            "createdAt": "2026-09-07T00:10:00+00:00", "mergedAt": "2026-09-07T01:00:00+00:00",
            "reviews": [
                {"body": fail, "submittedAt": "2026-09-07T00:15:00+00:00"},
                {"body": passed, "submittedAt": "2026-09-07T00:40:00+00:00"},
            ],
        }]
        result = metrics.build_metrics(runs, prs, {"fixture": True})
        issue = result["issues"][0]
        self.assertTrue(issue["accepted"])
        self.assertEqual(issue["first_exact_head_disposition"], "FAIL")
        self.assertEqual(issue["final_head_disposition"], "PASS")
        self.assertEqual(issue["correction_runs"], 1)
        self.assertEqual(issue["start_to_merge_min"], 60.0)
        self.assertEqual(issue["usage"]["fresh_input"], 50)
        self.assertTrue(issue["usage"]["complete"])
        self.assertEqual(result["aggregate"]["first_pass_acceptance_rate"], 0.0)
        self.assertEqual(result["aggregate"]["avg_correction_runs_per_accepted_issue"], 1.0)

    def test_merged_pr_without_trusted_exact_head_pass_is_not_accepted(self) -> None:
        runs = [{
            "issue": 8, "kind": "fresh", "started_at": "2026-09-07T00:00:00+00:00",
            "published_at": None, "usage_available": False, "usage": metrics.usage_facts(None),
        }]
        prs = [{
            "issue": 8, "number": 80, "headRefOid": "3" * 40,
            "createdAt": "2026-09-07T00:10:00+00:00", "mergedAt": "2026-09-07T00:20:00+00:00",
            "reviews": [{"body": "PASS", "submittedAt": "2026-09-07T00:15:00+00:00"}],
        }]
        result = metrics.build_metrics(runs, prs, {})
        self.assertFalse(result["issues"][0]["accepted"])
        self.assertEqual(result["aggregate"]["merged_without_observable_exact_head_pass"], 1)

    def test_timezone_aware_start_uses_actual_chronology(self) -> None:
        head = "4" * 40
        runs = [
            {"issue": 9, "kind": "fresh", "started_at": "2026-09-07T09:30:00+09:00", "usage_available": False, "usage": metrics.usage_facts(None)},
            {"issue": 9, "kind": "correction", "started_at": "2026-09-07T00:20:00Z", "usage_available": False, "usage": metrics.usage_facts(None)},
        ]
        body = f"{metrics.ACCEPTANCE_MARKER}\nPASS — exact PR head `{head}`"
        prs = [{
            "issue": 9, "number": 90, "headRefOid": head,
            "createdAt": "2026-09-07T00:20:00Z", "mergedAt": "2026-09-07T01:00:00Z",
            "reviews": [{"body": body, "submittedAt": "2026-09-07T00:50:00Z"}],
        }]
        issue = metrics.build_metrics(runs, prs, {})["issues"][0]
        self.assertEqual(issue["implementation_start"], "2026-09-07T00:20:00Z")
        self.assertEqual(issue["start_to_merge_min"], 40.0)

    def test_direct_state_requires_confirmed_launch(self) -> None:
        import json
        import tempfile
        from unittest import mock
        with tempfile.TemporaryDirectory() as tmp:
            state = Path(tmp) / "state"
            root = state / "issue-10"
            root.mkdir(parents=True)
            (root / "meta.json").write_text(json.dumps({
                "issue": 10, "started_at": "2026-09-07T00:00:00Z", "mode": "fresh", "model": "gpt-5.6-luna"
            }))
            events = Path(tmp) / "delivery.jsonl"
            with mock.patch.object(metrics, "STATE", state), mock.patch.object(metrics, "DELIVERY_EVENTS", events):
                self.assertEqual(metrics.direct_runs(), [])
            (root / "meta.json").write_text(json.dumps({
                "issue": 10, "started_at": "2026-09-07T00:00:00Z", "mode": "fresh",
                "model": "gpt-5.6-luna", "launch_confirmed": True
            }))
            with mock.patch.object(metrics, "STATE", state), mock.patch.object(metrics, "DELIVERY_EVENTS", events):
                self.assertEqual(len(metrics.direct_runs()), 1)



if __name__ == "__main__":
    unittest.main()
