<p align="center">
  <img src="assets/meditate-md-logo.svg" alt="MEDITATE.md logo" width="128">
</p>

# MEDITATE.md

A small, open-source convention for agent state hygiene.

`MEDITATE.md` is a workspace-readable policy file for long-running AI agents. It
defines when an agent should pause, compact context, checkpoint decisions, detect
drift, and recover from repetitive loops.

This repository includes:

- A proposed `MEDITATE.md` specification.
- A dependency-free Node.js reference implementation.
- A runnable demo that compares normal loop execution with meditation checkpoints.
- Tests for policy parsing and trigger evaluation.
- Integration guidance for Codex, Claude Code, HERMES, OpenClaw, and generic
  agent loops.

## Why This Exists

AI agents already use context summarization, retrieval, guardrails, loop
detection, and checkpointing. Those controls are often hidden in application
code. `MEDITATE.md` makes the policy explicit, portable, reviewable, and local to
the workspace an agent is operating in.

This is not a claim that AI systems meditate like humans. The metaphor is only a
handle for deterministic runtime maintenance.

## Quick Start

```bash
npm test
npm run demo
```

Run the CLI against a state fixture:

```bash
node src/cli.js check --state examples/state-drifting.json
```

Use a custom policy file:

```bash
node src/cli.js check --policy ./MEDITATE.md --state examples/state-healthy.json
```

## How It Works

The reference implementation reads a `meditate-policy` JSON block from
`MEDITATE.md`, evaluates the current agent state, and returns one of:

- `continue`: no maintenance is required.
- `checkpoint`: persist useful state before continuing.
- `compact`: summarize and prune context.
- `realign`: re-read governing instructions and clear drift.
- `recover`: stop repetitive behavior and choose a new strategy.

The demo uses simulated agent state so the mechanism is easy to verify without
calling an LLM API.

## Proposed Uses

- Coding agents that run for many tool iterations.
- Research agents that accumulate large source context.
- Customer-support agents with long conversations.
- Agent frameworks that need configurable context compaction.
- Evaluation harnesses that compare loop behavior with and without maintenance.

## Integrations

See [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) for adoption paths across
Codex, Claude Code, HERMES, OpenClaw, and raw API-based agents.

## Writing About It

See [docs/BLOG_POST_DRAFT.md](docs/BLOG_POST_DRAFT.md) and
the public repository docs for launch-ready article material.

## Branding

See [docs/BRAND.md](docs/BRAND.md) for positioning, taglines, visual direction,
and the relationship between `MEDITATE.md` and `SOUL.md`.

## What This Is Not

- It is not a spiritual claim.
- It does not modify model internals.
- It does not force hidden chain-of-thought behavior.
- It does nothing unless an agent runtime implements the policy.

## Repository Layout

```text
MEDITATE.md              The proposed spec and default policy
src/cli.js               Command-line interface
src/demo.js              Simulated long-running agent loop
src/policy.js            Markdown policy parser
src/runtime.js           Trigger evaluator and maintenance actions
examples/                Sample agent states
test/                    Node test runner tests
```

## License

MIT
