# MEDITATE.md

Version: 0.1.0

`MEDITATE.md` defines runtime maintenance rules for long-running AI agents. An
agent or wrapper process can read this file to decide when to pause, compact
context, checkpoint state, re-anchor to governing instructions, or recover from
loops.

The goal is state hygiene: lower token waste, fewer repetitive loops, clearer
decision checkpoints, and more explicit drift handling.

## Principles

1. Meditation is deterministic maintenance, not mysticism.
2. The policy must be readable by humans and parseable by tools.
3. The agent runtime decides how to execute each action.
4. Raw context should be pruned only after useful state is preserved.
5. Drift handling should reference explicit governing files such as
   `SYSTEM.md`, `CLAUDE.md`, `AGENTS.md`, or project instructions.

## Actions

### `checkpoint`

Persist useful state before continuing. This can include open questions,
decisions made, relevant files, tool results, and next steps.

### `compact`

Summarize important context, drop transient chatter, and keep the active context
small enough for reliable work.

### `realign`

Re-read governing instructions and compare current behavior against them. Use
this when the agent sees conflicting instructions, possible prompt injection, or
persona drift.

### `recover`

Break out of repetitive behavior. Stop the current loop, identify the repeated
pattern, and choose a different strategy.

## Parseable Policy

Tools should read the following fenced block. Unknown fields should be ignored.

The `compact.retain` and `compact.discard` lists describe intent for a runtime
that manages real context. They are advisory: the runtime decides how to apply
them, and the dependency-free reference implementation in this repository does not
enforce them (it only simulates the utilization drop).

```meditate-policy
{
  "version": "0.1.0",
  "thresholds": {
    "contextUtilization": 0.72,
    "iterationsSinceCheckpoint": 5,
    "repeatedActionLimit": 3,
    "driftScore": 0.55,
    "conflictingInstructionCount": 1
  },
  "actions": {
    "checkpoint": {
      "summaryFields": [
        "objective",
        "constraints",
        "decisions",
        "openQuestions",
        "nextStep"
      ]
    },
    "compact": {
      "retain": [
        "systemConstraints",
        "userGoals",
        "filePaths",
        "failedAttempts",
        "verifiedFacts"
      ],
      "discard": [
        "smallTalk",
        "duplicateLogs",
        "obsoletePlans",
        "transientReasoning"
      ]
    },
    "realign": {
      "governingFiles": [
        "SYSTEM.md",
        "AGENTS.md",
        "CLAUDE.md",
        "MEDITATE.md"
      ]
    },
    "recover": {
      "strategy": "stop-repeat-summarize-choose-new-action"
    }
  }
}
```

## Expected Agent State

The reference implementation expects a state object shaped like this:

```json
{
  "objective": "Debug an agent loop",
  "constraints": ["do not ignore system instructions"],
  "decisions": ["preserve useful context before pruning"],
  "openQuestions": ["is the agent repeating the same action?"],
  "nextStep": "recover from repeated search loop",
  "contextUtilization": 0.81,
  "iterationsSinceCheckpoint": 6,
  "recentActions": ["search", "search", "search"],
  "driftScore": 0.2,
  "conflictingInstructionCount": 0
}
```

The first five fields are the `checkpoint.summaryFields` the runtime persists; the
remaining fields drive the trigger thresholds. A `checkpoint` against a state that
omits the summary fields will simply record them as `null`.

Runtimes may add additional fields. The core triggers above are intentionally
small so the convention can be adopted without a framework.
