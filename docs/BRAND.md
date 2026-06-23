# MEDITATE.md Brand Guide

## Positioning

`MEDITATE.md` is a state hygiene convention for long-running AI agents.

It helps agent runtimes decide when to checkpoint, compact context, realign with
instructions, and recover from loops.

## One-Line Description

A state hygiene file for long-running AI agents.

## Short Description

`MEDITATE.md` makes agent maintenance explicit: when to pause, checkpoint,
compact context, realign with instructions, and recover from repetitive loops.

## What To Emphasize

- Runtime maintenance
- Context cleanup
- Checkpointing
- Loop recovery
- Drift checks
- Portable policy
- Human-readable configuration

## What To Avoid

- Claims that AI systems meditate like humans
- Claims about consciousness or inner experience
- Claims that a markdown file can change model internals
- Overstating this as a universal standard before adoption exists
- Treating hallucination reduction as guaranteed without measurement

## Relationship To SOUL.md

SOUL.md and MEDITATE.md can coexist, but they should not be framed as the same
thing.

| File | Scope | Question it answers |
| --- | --- | --- |
| `SOUL.md` | Identity, values, temperament | Who should the agent be? |
| `AGENTS.md` / `CLAUDE.md` | Task and repo instructions | What rules should the agent follow here? |
| `SKILL.md` | Reusable capability workflow | How should the agent perform a specific task? |
| `MEDITATE.md` | Runtime state hygiene | When should the agent pause and clean up state? |

The clean positioning:

> SOUL.md defines identity. MEDITATE.md defines maintenance.

## Voice

Use plain engineering language. The name can carry the metaphor; the explanation
should stay concrete.

Good:

> MEDITATE.md is a portable policy for context compaction, checkpoints, drift
> checks, and loop recovery.

Avoid:

> MEDITATE.md gives AI agents a spiritual practice.

## Taglines

- State hygiene for long-running AI agents.
- Pause. Compact. Realign. Continue.
- A maintenance policy for agent loops.
- Make agent context cleanup explicit.
- Keep long-running agents focused.

## Visual Direction

The visual identity should feel calm but technical:

- simple geometry
- low ornament
- high contrast
- readable at small sizes
- no mystical symbols as the primary mark

Suggested palette:

| Token | Hex | Use |
| --- | --- | --- |
| Ink | `#17201B` | Text and mark |
| Mint | `#4FB286` | Primary accent |
| Sky | `#5B8DEF` | Secondary accent |
| Paper | `#F7F8F5` | Background |
| Line | `#D9E2DA` | Borders |

## Logo Concept

The mark is a pause symbol inside a context window. It represents an agent loop
stopping briefly to clean up state before continuing.

Use `assets/meditate-md-logo.svg` as the initial repo mark.
