import { applyMeditation, evaluateState } from "./runtime.js";

export function runDemo(policy) {
  let state = {
    objective: "Refactor a payment module without breaking tests",
    constraints: ["preserve public API", "do not edit generated files"],
    decisions: ["inspect tests before changing implementation"],
    openQuestions: [],
    nextStep: "inspect failing test output",
    contextUtilization: 0.34,
    iterationsSinceCheckpoint: 0,
    recentActions: [],
    driftScore: 0.1,
    conflictingInstructionCount: 0
  };

  const actions = [
    "inspect",
    "edit",
    "test",
    "test",
    "test",
    "inspect",
    "edit",
    "summarize"
  ];

  const lines = ["MEDITATE.md demo", ""];

  actions.forEach((action, index) => {
    state = advanceState(state, action, index);
    const evaluation = evaluateState(policy, state);

    lines.push(`iteration ${index + 1}: action=${action}, context=${Math.round(state.contextUtilization * 100)}%`);

    if (evaluation.decision === "continue") {
      lines.push("  continue");
      return;
    }

    lines.push(`  meditate: ${evaluation.recommendedActions.join(", ")}`);
    for (const trigger of evaluation.triggers) {
      lines.push(`  - ${trigger.action}: ${trigger.reason}`);
    }

    const result = applyMeditation(policy, state, evaluation);
    state = result.state;
    for (const entry of result.log) {
      lines.push(`  applied: ${entry}`);
    }
  });

  lines.push("");
  lines.push("final state:");
  lines.push(JSON.stringify(state, null, 2));

  return lines.join("\n");
}

function advanceState(state, action, index) {
  return {
    ...state,
    contextUtilization: Number(Math.min(0.96, state.contextUtilization + 0.11).toFixed(2)),
    iterationsSinceCheckpoint: state.iterationsSinceCheckpoint + 1,
    recentActions: [...state.recentActions, action].slice(-5),
    driftScore: index === 6 ? 0.62 : state.driftScore,
    conflictingInstructionCount: index === 6 ? 1 : 0
  };
}
