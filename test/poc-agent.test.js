import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import assert from "node:assert/strict";
import { runPocAgent } from "../src/poc-agent.js";

const policy = {
  thresholds: {
    contextUtilization: 0.72,
    iterationsSinceCheckpoint: 5,
    repeatedActionLimit: 3,
    driftScore: 0.55,
    conflictingInstructionCount: 1
  },
  actions: {
    checkpoint: {
      summaryFields: ["objective", "constraints", "decisions", "openQuestions", "nextStep"]
    },
    recover: {
      strategy: "stop-repeat-summarize-choose-new-action"
    }
  }
};

test("runs PoC agent and writes report artifacts", async () => {
  const outputDir = await mkdtemp(join(tmpdir(), "meditate-md-poc-"));

  try {
    const transcript = await runPocAgent(policy, { outputDir });
    const report = await readFile(join(outputDir, "report.md"), "utf8");
    const state = JSON.parse(await readFile(join(outputDir, "state.json"), "utf8"));

    assert.match(transcript, /meditate before step 4: compact/);
    assert.match(transcript, /meditate before step 6: recover, checkpoint/);
    assert.match(report, /Meditation events observed: 3/);
    assert.equal(state.meditationEvents, 3);
    assert.equal(state.toolCalls, 9);
  } finally {
    await rm(outputDir, { recursive: true, force: true });
  }
});
