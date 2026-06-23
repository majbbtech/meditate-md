# PoC Task

Validate whether a long-running agent can use `MEDITATE.md` to avoid noisy
execution.

The agent should:

1. Inspect the task.
2. Inspect the policy.
3. Run useful checks.
4. Detect repeated low-value actions.
5. Recover by changing strategy.
6. Write a short report.

The PoC must be deterministic and must not call external APIs.
