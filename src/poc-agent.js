import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { applyMeditation, evaluateState } from "./runtime.js";

const TASK_PATH = "examples/poc-task.md";

export async function runPocAgent(policy, options = {}) {
  const outputDir = options.outputDir ?? ".meditate-poc";
  await mkdir(outputDir, { recursive: true });

  const task = await readFile(TASK_PATH, "utf8");
  let state = createInitialState(task);
  const transcript = ["MEDITATE.md PoC agent", ""];
  const checkpoints = [];

  for (let step = 0; step < 9; step += 1) {
    const evaluation = evaluateState(policy, state);

    if (evaluation.decision === "meditate") {
      const result = applyMeditation(policy, state, evaluation);
      transcript.push(`meditate before step ${step + 1}: ${evaluation.recommendedActions.join(", ")}`);

      for (const trigger of evaluation.triggers) {
        transcript.push(`  trigger: ${trigger.action} - ${trigger.reason}`);
      }

      for (const entry of result.log) {
        transcript.push(`  applied: ${entry}`);
      }

      if (evaluation.recommendedActions.includes("checkpoint")) {
        checkpoints.push(result.state.lastCheckpoint);
      }

      state = result.state;
      state.meditationEvents += 1;
    }

    const action = chooseAction(state);
    const observation = runTool(action, state);
    state = updateState(state, action, observation);

    transcript.push(`step ${step + 1}: ${action}`);
    transcript.push(`  ${observation}`);
  }

  const report = createReport(state, checkpoints);
  await writeFile(join(outputDir, "transcript.txt"), transcript.join("\n") + "\n");
  await writeFile(join(outputDir, "state.json"), JSON.stringify(state, null, 2) + "\n");
  await writeFile(join(outputDir, "report.md"), report);

  return [
    ...transcript,
    "",
    `wrote ${join(outputDir, "transcript.txt")}`,
    `wrote ${join(outputDir, "state.json")}`,
    `wrote ${join(outputDir, "report.md")}`
  ].join("\n");
}

function createInitialState(task) {
  return {
    objective: "Validate whether MEDITATE.md helps an agent recover from noisy long-running work.",
    constraints: [
      "do not call external APIs",
      "record checkpoints",
      "produce a final report"
    ],
    decisions: [],
    openQuestions: ["does the agent recover from repeated test actions?"],
    nextStep: "inspect task",
    task,
    contextUtilization: 0.28,
    iterationsSinceCheckpoint: 0,
    recentActions: [],
    driftScore: 0.08,
    conflictingInstructionCount: 0,
    findings: [],
    toolCalls: 0,
    meditationEvents: 0
  };
}

function chooseAction(state) {
  if (!state.findings.some((finding) => finding.includes("task objective"))) {
    return "inspect-task";
  }

  if (!state.findings.some((finding) => finding.includes("policy thresholds"))) {
    return "inspect-policy";
  }

  if (!state.recoveryStrategy && state.recentActions.filter((action) => action === "run-tests").length < 3) {
    return "run-tests";
  }

  if (state.recoveryStrategy && !state.findings.some((finding) => finding.includes("changed strategy"))) {
    return "change-strategy";
  }

  if (!state.findings.some((finding) => finding.includes("final report"))) {
    return "write-report";
  }

  return "review";
}

function runTool(action, state) {
  if (action === "inspect-task") {
    return `found task objective in ${TASK_PATH}`;
  }

  if (action === "inspect-policy") {
    return "read policy thresholds for compaction, checkpointing, drift, and repeated actions";
  }

  if (action === "run-tests") {
    return "tests pass, but repeating this action adds little new information";
  }

  if (action === "change-strategy") {
    return "changed strategy after recovery trigger: stop repeating tests and summarize evidence";
  }

  if (action === "write-report") {
    return "prepared final report with meditation events and checkpoint evidence";
  }

  return `reviewed ${state.findings.length} finding(s)`;
}

function updateState(state, action, observation) {
  const nextState = structuredClone(state);
  nextState.toolCalls += 1;
  nextState.iterationsSinceCheckpoint += 1;
  nextState.recentActions = [...nextState.recentActions, action].slice(-5);
  nextState.contextUtilization = Number(Math.min(0.96, nextState.contextUtilization + contextGrowthFor(action)).toFixed(2));
  nextState.findings.push(`${action}: ${observation}`);
  nextState.nextStep = nextStepAfter(action);

  if (action === "run-tests" && nextState.recentActions.filter((item) => item === "run-tests").length >= 2) {
    nextState.driftScore = Number(Math.min(0.7, nextState.driftScore + 0.22).toFixed(2));
  }

  if (action === "inspect-policy") {
    nextState.decisions.push("use MEDITATE.md runtime policy before each agent step");
  }

  return nextState;
}

function contextGrowthFor(action) {
  return {
    "inspect-task": 0.13,
    "inspect-policy": 0.17,
    "run-tests": 0.15,
    "change-strategy": 0.1,
    "write-report": 0.12,
    review: 0.05
  }[action];
}

function nextStepAfter(action) {
  return {
    "inspect-task": "inspect policy",
    "inspect-policy": "run tests",
    "run-tests": "decide whether more testing is useful",
    "change-strategy": "write report",
    "write-report": "review result",
    review: "finish"
  }[action];
}

function createReport(state, checkpoints) {
  return `# MEDITATE.md PoC Report

## Result

The PoC agent used \`MEDITATE.md\` as a runtime policy before each tool step.

## Metrics

- Tool calls: ${state.toolCalls}
- Meditation events observed: ${state.meditationEvents}
- Final context utilization: ${Math.round(state.contextUtilization * 100)}%
- Checkpoints captured: ${checkpoints.length}
- Recent actions: ${state.recentActions.join(", ") || "none"}

## Evidence

${state.findings.map((finding) => `- ${finding}`).join("\n")}

## Interpretation

This is a deterministic PoC. It does not prove benchmark-level quality gains.
It does show the adapter shape needed for real agents: maintain state, evaluate
\`MEDITATE.md\`, apply maintenance actions, then continue the loop.
`;
}
