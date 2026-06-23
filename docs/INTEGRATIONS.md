# Integrating MEDITATE.md

`MEDITATE.md` is a policy file. An agent uses it only when one of these is true:

1. The agent is explicitly instructed to read it.
2. A lifecycle hook reads it and enforces the policy.
3. A wrapper/runtime reads it before or between model calls.
4. The convention is built directly into the agent framework.

The fastest adoption path is to support all four levels.

## Integration Levels

### Level 1: Prompt-Level Adoption

Add a short instruction to the agent's existing guidance file:

```md
Before long-running work, read `MEDITATE.md`. Follow its checkpoint, compact,
realign, and recover rules when the active task shows context drift, repeated
actions, or high context usage.
```

This is easy, but advisory only. The agent may ignore it.

### Level 2: Hook-Level Adoption

Use the agent tool's lifecycle hooks to call the `meditate-md` CLI at fixed
points such as session start, before compaction, after tool use, or when a turn
stops.

This is stronger than prompt guidance because the hook runs as code.

### Level 3: Runtime Adapter Adoption

Wrap the agent loop:

```js
const policy = await loadPolicy("MEDITATE.md");
const evaluation = evaluateState(policy, agentState);

if (evaluation.decision === "meditate") {
  agentState = applyMeditation(policy, agentState, evaluation).state;
}

const response = await model.generate(nextPrompt(agentState));
```

This is the best path for custom frameworks such as HERMES, OpenClaw, AutoGPT
variants, LangGraph apps, or raw OpenAI/Anthropic API loops.

### Level 4: Native Adoption

The agent tool natively discovers `MEDITATE.md`, parses the policy block, and
exposes lifecycle events for checkpointing, compaction, realignment, and loop
recovery.

This requires upstream maintainers to adopt the convention.

## Codex

Codex supports repository guidance through `AGENTS.md`, reusable workflows
through skills, plugins for distribution, and lifecycle hooks.

Recommended path:

1. Keep `MEDITATE.md` in the repository root.
2. Add a short section to `AGENTS.md`:

   ```md
   ## State Hygiene

   Read `MEDITATE.md` before long-running agentic work. Use it as the local
   policy for checkpointing, compaction, drift checks, and repeated-action
   recovery.
   ```

3. Package the workflow as a Codex skill when you want reusable behavior:

   ```text
   .agents/skills/meditate-md/SKILL.md
   ```

4. Use Codex hooks for stronger enforcement around lifecycle events such as
   `PreCompact`, `PostCompact`, `PostToolUse`, and `Stop`.

Example project hook shape:

```json
{
  "hooks": {
    "PreCompact": [
      {
        "matcher": "auto|manual",
        "hooks": [
          {
            "type": "command",
            "command": "node src/cli.js check --state .agents/state.json",
            "statusMessage": "Checking MEDITATE.md policy"
          }
        ]
      }
    ]
  }
}
```

The example assumes your agent writes `.agents/state.json`. Codex hook payloads
do not automatically match this repository's state schema, so a small adapter
script should translate hook JSON into the expected state fields.

## Claude Code

Claude Code reads `CLAUDE.md`, not `AGENTS.md`. To share instructions with other
agents, add this to `CLAUDE.md`:

```md
@AGENTS.md

## MEDITATE.md

Read `MEDITATE.md` before long-running work. Use it for checkpointing,
compaction, drift checks, and loop recovery.
```

For stronger behavior, use Claude Code hooks. Useful events include:

- `InstructionsLoaded`
- `UserPromptSubmit`
- `PostToolUse`
- `PostToolBatch`
- `PreCompact`
- `PostCompact`
- `Stop`

Example hook shape:

```json
{
  "hooks": {
    "PreCompact": [
      {
        "matcher": "auto|manual",
        "hooks": [
          {
            "type": "command",
            "command": "node src/cli.js check --state .agents/state.json"
          }
        ]
      }
    ]
  }
}
```

As with Codex, a real integration should translate Claude's hook JSON into the
small state object expected by this reference implementation.

## HERMES

If HERMES is your own agent/runtime, integrate at Level 3:

1. Load `MEDITATE.md` at startup.
2. Track state after every model call and tool call:
   - context utilization
   - iterations since checkpoint
   - recent actions
   - drift score
   - conflicting instruction count
3. Call `evaluateState(policy, state)` before the next model call.
4. Apply the returned actions:
   - `checkpoint`: write a compact durable summary.
   - `compact`: replace raw history with the summary plus required facts.
   - `realign`: re-read governing instructions.
   - `recover`: stop the repeated action and force a new plan.

## OpenClaw

For OpenClaw or similar open agent frameworks, add a middleware layer:

```text
user/task -> planner -> tool loop -> MEDITATE.md middleware -> next model call
```

The middleware should not be model-specific. It should accept a generic state
object and return either `continue` or a list of maintenance actions.

## Raw API Agents

For a direct OpenAI, Anthropic, or local-model loop:

1. Parse `MEDITATE.md` with `loadPolicy`.
2. Maintain an agent state object.
3. Evaluate the state before each model call.
4. Mutate messages/context according to the recommended actions.
5. Store checkpoints outside the active prompt.

Minimal pattern:

```js
import { loadPolicy } from "meditate-md/src/policy.js";
import { applyMeditation, evaluateState } from "meditate-md/src/runtime.js";

const policy = await loadPolicy("MEDITATE.md");

for await (const event of agentLoop) {
  const evaluation = evaluateState(policy, state);

  if (evaluation.decision === "meditate") {
    const result = applyMeditation(policy, state, evaluation);
    state = result.state;
    messages = rebuildMessagesFromState(state);
  }

  await callModel(messages);
}
```

## Adoption Strategy

1. Publish the spec and reference implementation.
2. Add copy-paste integration recipes for popular tools.
3. Create small adapters for one tool at a time.
4. Measure outcomes:
   - context tokens before and after compaction
   - repeated action loops avoided
   - checkpoints created
   - successful task completion rate
5. Submit upstream issues or PRs asking tools to support `MEDITATE.md`
   discovery or middleware hooks.

The pitch should be narrow: `MEDITATE.md` is a portable state hygiene policy for
agents. It is not a new model capability and not a replacement for hooks,
memory, RAG, or guardrails.
