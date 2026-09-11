import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


class ProductDesignHarnessRoutingTest(unittest.TestCase):
    def test_root_agents_explicitly_routes_user_facing_ui(self) -> None:
        text = read("AGENTS.md")
        self.assertIn(".agents/skills/product-design/SKILL.md", text)
        self.assertIn("user-facing", text.lower())

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
        self.assertIn(".agents/skills/design-qa/SKILL.md", product)
        self.assertIn("P0/P1/P2", qa)
        self.assertIn("NOT_VERIFIED", qa)
        self.assertIn("final result: passed | blocked", qa)

    def test_task_contract_exposes_ui_oracle(self) -> None:
        text = read("templates/task-contract.md")
        self.assertIn("Product / UI oracle", text)
        self.assertIn("reference", text.lower())


if __name__ == "__main__":
    unittest.main()
