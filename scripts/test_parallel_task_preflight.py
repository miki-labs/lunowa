import importlib.util
import os
import subprocess
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("parallel-task-preflight.py")
spec = importlib.util.spec_from_file_location("parallel_task_preflight", MODULE_PATH)
assert spec and spec.loader
preflight = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = preflight
spec.loader.exec_module(preflight)


class ParallelTaskPreflightTests(unittest.TestCase):
    def setUp(self):
        self.directory = Path(tempfile.mkdtemp())
        self.run_git("init", "-b", "main")
        self.run_git("config", "user.email", "test@example.invalid")
        self.run_git("config", "user.name", "Preflight Test")
        (self.directory / "tracked.txt").write_text("base\n", encoding="utf-8")
        self.run_git("add", ".")
        self.run_git("commit", "-m", "base")
        self.run_git("switch", "-c", "task")
        self.original_root = preflight.ROOT
        preflight.ROOT = self.directory
        self.original_environment = os.environ.copy()
        os.environ["PARALLEL_TASK_OWNER"] = "task-19"

    def tearDown(self):
        preflight.ROOT = self.original_root
        os.environ.clear()
        os.environ.update(self.original_environment)

    def run_git(self, *args):
        return subprocess.run(["git", *args], cwd=self.directory, check=True, capture_output=True, text=True)

    def arguments(self, relationship="independent", blocker_status="none", remote_base=None):
        values = [
            "--expected-repository", str(self.directory),
            "--expected-worktree", str(self.directory),
            "--expected-branch", "task",
            "--base", "main",
            "--owner", "task-19",
            "--relationship", relationship,
            "--blocker-status", blocker_status,
        ]
        if remote_base:
            values.extend(["--remote-base", remote_base])
        return preflight.parser().parse_args(values)

    def test_clean_named_branch_based_on_main_passes(self):
        self.assertEqual(preflight.check(self.arguments()), [])

    def test_tracked_untracked_and_ignored_contamination_fails(self):
        original_head = self.run_git("rev-parse", "HEAD").stdout.strip()
        (self.directory / "tracked.txt").write_text("changed\n", encoding="utf-8")
        (self.directory / "untracked.txt").write_text("new\n", encoding="utf-8")
        (self.directory / ".gitignore").write_text("ignored.txt\n", encoding="utf-8")
        (self.directory / "ignored.txt").write_text("ignored\n", encoding="utf-8")
        errors = preflight.check(self.arguments())
        self.assertTrue(any("not clean" in error for error in errors))
        self.assertEqual(self.run_git("rev-parse", "HEAD").stdout.strip(), original_head)
        self.assertEqual((self.directory / "tracked.txt").read_text(encoding="utf-8"), "changed\n")

    def test_no_remote_reports_freshness_limitation(self):
        output = StringIO()
        with redirect_stdout(output):
            self.assertEqual(preflight.check(self.arguments()), [])
        self.assertIn("freshness=limited (no remote configured)", output.getvalue())

    def test_stale_fetched_remote_base_fails(self):
        remote = self.directory.parent / f"{self.directory.name}-remote.git"
        self.run_git("clone", "--bare", str(self.directory), str(remote))
        self.run_git("--git-dir", str(remote), "update-ref", "refs/heads/main", self.run_git("rev-parse", "main").stdout.strip())
        self.run_git("remote", "add", "origin", str(remote))
        self.run_git("--git-dir", str(remote), "symbolic-ref", "HEAD", "refs/heads/main")

        publisher = self.directory.parent / f"{self.directory.name}-publisher"
        subprocess.run(["git", "clone", str(remote), str(publisher)], check=True, capture_output=True, text=True)
        subprocess.run(["git", "-C", str(publisher), "config", "user.email", "publisher@example.invalid"], check=True)
        subprocess.run(["git", "-C", str(publisher), "config", "user.name", "Publisher"], check=True)
        (publisher / "remote.txt").write_text("remote change\n", encoding="utf-8")
        subprocess.run(["git", "-C", str(publisher), "add", "."], check=True)
        subprocess.run(["git", "-C", str(publisher), "commit", "-m", "advance remote base"], check=True, capture_output=True, text=True)
        subprocess.run(["git", "-C", str(publisher), "push"], check=True, capture_output=True, text=True)
        self.run_git("fetch", "origin")
        self.assertNotEqual(
            self.run_git("rev-parse", "main").stdout.strip(),
            self.run_git("rev-parse", "origin/main").stdout.strip(),
        )

        errors = preflight.check(self.arguments(remote_base="origin/main"))
        self.assertTrue(any("base ref is stale" in error for error in errors))

    def test_unresolved_dependent_blocker_fails_before_editing(self):
        errors = preflight.check(self.arguments("dependent", "unresolved"))
        self.assertTrue(any("declared blocker is unresolved" in error for error in errors))

    def test_overlapping_task_ownership_is_rejected(self):
        errors = preflight.check(self.arguments("overlapping"))
        self.assertTrue(any("overlapping task ownership" in error for error in errors))

    def test_detached_head_is_rejected(self):
        self.run_git("switch", "--detach", "HEAD")
        errors = preflight.check(self.arguments())
        self.assertTrue(any("named dedicated branch" in error for error in errors))

    def test_unrelated_history_is_rejected(self):
        self.run_git("switch", "--orphan", "unrelated")
        if (self.directory / "tracked.txt").exists():
            (self.directory / "tracked.txt").unlink()
        (self.directory / "unrelated.txt").write_text("unrelated\n", encoding="utf-8")
        self.run_git("add", ".")
        self.run_git("commit", "-m", "unrelated root")
        args = self.arguments()
        args.expected_branch = "unrelated"
        errors = preflight.check(args)
        self.assertTrue(any("not based on intended base ref" in error for error in errors))

    def test_wrong_worktree_and_owner_fail(self):
        args = self.arguments()
        args.expected_worktree = str(self.directory / "other")
        os.environ.pop("PARALLEL_TASK_OWNER")
        try:
            errors = preflight.check(args)
        finally:
            os.environ.clear()
            os.environ.update(self.original_environment)
        self.assertTrue(any("expected worktree" in error for error in errors))
        self.assertTrue(any("ownership" in error for error in errors))


if __name__ == "__main__":
    unittest.main()


