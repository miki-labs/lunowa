# Parallel task runtime namespaces

Worktree and branch separation do not isolate host-global runtime state. Any
non-trivial parallel task that starts mutable verification resources must use a
stable task namespace derived from its issue or task id.

Use the same namespace for every resource owned by a task:

| Resource | Convention | Example for issue 13 |
| --- | --- | --- |
| task owner | `issue-<number>` | `issue-13` |
| Docker Compose project | `lunowa-<namespace>` | `lunowa-issue-13` |
| PostgreSQL database | `lunowa_<namespace>` with non-alphanumeric characters replaced by `_` | `lunowa_issue_13` |
| host ports | task-specific values documented by the task | issue 13 reserves `55413`; issue 14 reserves `55414` |
| temporary/generated files | `.tmp/lunowa/<namespace>/` | `.tmp/lunowa/issue-13/` |
| browser/session state | a task-specific Playwright project/context and storage path | `.tmp/lunowa/issue-13/browser/` |

The task issue remains the authority for which resources are actually needed.
Do not create a shared database, Compose project, browser profile, generated
directory, or fixed port when a task-specific namespace is available. Resource
availability is a separate concern from the repository preflight: the
preflight proves source/workspace ownership and freshness, while the task
harness must prove that runtime resources are uniquely named and released.

Issue #13 and Issue #14 are related but distinct verification tasks. They must
use different database/Compose/temp/browser namespaces and must not share a
running PostgreSQL instance or host port unless the task explicitly provisions
isolated databases and verifies that isolation.


