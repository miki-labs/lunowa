import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


class ProductDesignHarnessRoutingTest(unittest.TestCase):
    def test_root_agents_explicitly_routes_user_facing_ui(self) -> None:
        text = read("AGENTS.md")
        trigger = (
            "- When shaping, editing, or reviewing user-facing UI, load "
            "`.agents/skills/product-design/SKILL.md`."
        )
        self.assertIn(trigger, text)

    def test_execute_and_review_both_route_product_design(self) -> None:
        for path in (
            ".agents/skills/execute-task/SKILL.md",
            ".agents/skills/evaluate-change/SKILL.md",
        ):
            text = read(path)
            self.assertIn(".agents/skills/product-design/SKILL.md", text)

    def test_reference_work_routes_blocking_design_qa(self) -> None:
        product = read(".agents/skills/product-design/SKILL.md")
        qa = read(".agents/skills/design-qa/SKILL.md")
        self.assertIn(
            "`.agents/skills/design-qa/SKILL.md` as the blocking visual handoff gate",
            product,
        )
        self.assertIn("any actionable `P0/P1/P2`", qa)
        self.assertIn("evaluator conformance `FAIL`", qa)
        self.assertIn("**wrong-state**", qa)
        self.assertIn("evaluator status `NOT_VERIFIED`", qa)
        self.assertIn("evaluator status: PASS | FAIL | NOT_VERIFIED", qa)
        self.assertIn("final result: passed | blocked", qa)

    def test_reference_implementation_requires_early_real_browser_inspection(self) -> None:
        product = read(".agents/skills/product-design/SKILL.md")
        self.assertIn(
            "Open and inspect the real production code path in a real browser early",
            product,
        )
        self.assertIn("do not postpone browser inspection to final handoff", product)

    def test_task_contract_exposes_ui_oracle(self) -> None:
        text = read("templates/task-contract.md")
        self.assertIn("Product / UI oracle", text)
        self.assertIn("reference", text.lower())


if __name__ == "__main__":
    unittest.main()
