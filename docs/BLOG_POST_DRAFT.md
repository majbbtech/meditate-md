# MEDITATE.md: A State Hygiene File for Long-Running AI Agents

AI agents are getting better at doing long-running work: editing code, using
tools, reading documents, browsing repositories, and iterating through tasks.
But long-running agent sessions have a familiar failure mode. After enough
turns, the agent can start carrying too much conversational baggage.

It repeats actions. It forgets why it made a decision. It drags obsolete logs
into the next prompt. It loses track of the original constraints. Sometimes it
keeps working, but the work becomes noisier, slower, and more expensive.

`MEDITATE.md` is a small proposal for handling that problem.

It is a markdown convention for agent state hygiene.

Not meditation in the human sense. No spirituality. No claim that models are
conscious. Just a readable policy file that tells an agent runtime when to pause
and clean up its state.

## The Problem

Most agent frameworks already have some version of state cleanup:

- summarizing conversation history
- compacting context
- storing memories
- detecting loops
- reloading system instructions
- checkpointing progress
- pruning irrelevant logs

But these behaviors are usually hidden inside application code, framework
defaults, or vendor-specific lifecycle hooks.

That makes them hard to inspect, hard to tune, and hard to move between agents.

`MEDITATE.md` asks a simple question:

What if state hygiene was explicit, local, and reviewable?

## The Proposal

A repository can include a `MEDITATE.md` file beside files like `AGENTS.md`,
`CLAUDE.md`, or other agent instructions.

The file describes when the agent should:

- checkpoint useful state
- compact noisy context
- realign with governing instructions
- recover from repetitive loops

The reference implementation includes a parseable policy block:

```meditate-policy
{
  "version": "0.1.0",
  "thresholds": {
    "contextUtilization": 0.72,
    "iterationsSinceCheckpoint": 5,
    "repeatedActionLimit": 3,
    "driftScore": 0.55,
    "conflictingInstructionCount": 1
  }
}
```

An agent runtime can read this policy before the next model call and decide
whether to continue normally or run a maintenance action.

## What It Does

`MEDITATE.md` defines four basic actions.

### Checkpoint

Persist the useful parts of the current session: objective, constraints,
decisions, open questions, relevant files, failed attempts, and next step.

### Compact

Summarize important context and drop transient noise. The goal is to keep the
active prompt lean without losing the facts needed to continue.

### Realign

Re-read governing files such as `AGENTS.md`, `CLAUDE.md`, `SYSTEM.md`, or the
project's own instructions. This is useful when the session contains conflicting
instructions or the agent appears to be drifting.

### Recover

Break repetitive behavior. If an agent searches the same thing three times,
runs the same failing command repeatedly, or loops through the same plan, the
runtime should stop and choose a different strategy.

## What It Does Not Do

`MEDITATE.md` does not modify model internals.

It does not reset attention heads.

It does not force hidden chain-of-thought.

It does not magically reduce hallucinations by existing as a file.

It only works when an agent, hook, wrapper, or framework reads the file and
implements the policy.

That limitation is the point. This is not a new model capability. It is a small
runtime convention.

## Why This Could Help

The benefit is not that every agent needs a file with this exact name.

The benefit is that state hygiene becomes explicit.

Teams can review the policy. Agent builders can tune thresholds. Frameworks can
share adapters. Users can understand why an agent paused, summarized, or changed
strategy.

For long-running agents, this can help with:

- lower token usage
- fewer repeated tool calls
- clearer checkpoints
- better recovery from loops
- more predictable context compaction
- easier debugging of agent behavior

## A Small Demo

The reference repo includes a dependency-free Node.js demo.

```bash
npm test
npm run demo
```

The demo simulates an agent loop. As context grows and actions repeat, the
runtime evaluates `MEDITATE.md` and applies the recommended maintenance actions.

Example output:

```text
iteration 4: action=test, context=78%
  meditate: compact
  - compact: context utilization 78% reached 72%
  applied: compacted context to 37%

iteration 5: action=test, context=48%
  meditate: recover, checkpoint
  - checkpoint: 5 iterations since last checkpoint
  - recover: same action repeated 3 times
```

The demo is intentionally small. It is meant to show the mechanism, not claim a
benchmark.

## How Existing Agents Could Use It

For Codex, `MEDITATE.md` can be introduced through `AGENTS.md`, skills, plugins,
or lifecycle hooks.

For Claude Code, it can be introduced through `CLAUDE.md` and hooks such as
`PreCompact`, `PostCompact`, `PostToolUse`, and `Stop`.

For custom agent frameworks, the cleanest path is middleware:

```text
agent state -> evaluate MEDITATE.md -> checkpoint/compact/realign/recover -> next model call
```

That keeps the convention model-agnostic. The same policy file can be used with
OpenAI, Anthropic, local models, or any custom agent loop.

## Why Open Source It?

Agent behavior is still hard to inspect. A lot of important state-management
logic is buried in frameworks or hidden behind product defaults.

Open-sourcing this as a small convention gives people something concrete to
argue with, improve, fork, or reject.

The best outcome is not that `MEDITATE.md` becomes a universal standard
overnight. The best outcome is that more agent builders treat state hygiene as a
first-class design surface.

## Try It

The repo includes:

- the proposed `MEDITATE.md` spec
- a reference parser
- a runtime evaluator
- fixtures
- tests
- integration notes for Codex, Claude Code, HERMES, OpenClaw, and raw API loops

If you build long-running agents, try adding a state hygiene policy and measure
what changes:

- How often does the agent compact context?
- How often does it repeat actions?
- How much active context is saved?
- Does checkpointing make recovery easier?
- Do users understand the agent's pauses better?

That is the real test.

`MEDITATE.md` is not about making agents more human.

It is about making long-running agent systems easier to keep focused.
