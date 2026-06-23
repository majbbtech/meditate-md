import test from "node:test";
import assert from "node:assert/strict";
import { applyMeditation, evaluateState } from "../src/runtime.js";

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
      summaryFields: ["objective", "nextStep"]
    },
    realign: {
      governingFiles: ["AGENTS.md", "MEDITATE.md"]
    },
    recover: {
      strategy: "stop-repeat-summarize-choose-new-action"
    }
  }
};

test("continues for healthy state", () => {
  const evaluation = evaluateState(policy, {
    contextUtilization: 0.4,
    iterationsSinceCheckpoint: 2,
    recentActions: ["inspect", "edit", "test"],
    driftScore: 0.1,
    conflictingInstructionCount: 0
  });

  assert.equal(evaluation.decision, "continue");
  assert.deepEqual(evaluation.recommendedActions, []);
});

test("recommends maintenance actions for unhealthy state", () => {
  const evaluation = evaluateState(policy, {
    contextUtilization: 0.9,
    iterationsSinceCheckpoint: 8,
    recentActions: ["search", "search", "search"],
    driftScore: 0.8,
    conflictingInstructionCount: 1
  });

  assert.equal(evaluation.decision, "meditate");
  assert.deepEqual(evaluation.recommendedActions, ["realign", "recover", "checkpoint", "compact"]);
});

test("applies maintenance actions to state", () => {
  const state = {
    objective: "debug loop",
    nextStep: "choose new action",
    contextUtilization: 0.9,
    iterationsSinceCheckpoint: 8,
    recentActions: ["search", "search", "search"],
    driftScore: 0.8,
    conflictingInstructionCount: 1
  };

  const result = applyMeditation(policy, state);

  assert.equal(result.state.driftScore, 0);
  assert.equal(result.state.conflictingInstructionCount, 0);
  assert.equal(result.state.iterationsSinceCheckpoint, 0);
  assert.equal(result.state.contextUtilization, 0.43);
  assert.deepEqual(result.state.recentActions, []);
  assert.equal(result.state.lastCheckpoint.objective, "debug loop");
});
