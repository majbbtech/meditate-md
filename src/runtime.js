const DEFAULT_THRESHOLDS = {
  contextUtilization: 0.72,
  iterationsSinceCheckpoint: 5,
  repeatedActionLimit: 3,
  driftScore: 0.55,
  conflictingInstructionCount: 1
};

export function evaluateState(policy, state) {
  const thresholds = { ...DEFAULT_THRESHOLDS, ...policy.thresholds };
  const triggers = [];

  if (state.contextUtilization >= thresholds.contextUtilization) {
    triggers.push({
      action: "compact",
      reason: `context utilization ${formatPercent(state.contextUtilization)} reached ${formatPercent(thresholds.contextUtilization)}`
    });
  }

  if (state.iterationsSinceCheckpoint >= thresholds.iterationsSinceCheckpoint) {
    triggers.push({
      action: "checkpoint",
      reason: `${state.iterationsSinceCheckpoint} iterations since last checkpoint`
    });
  }

  if (hasRepeatedAction(state.recentActions, thresholds.repeatedActionLimit)) {
    triggers.push({
      action: "recover",
      reason: `same action repeated ${thresholds.repeatedActionLimit} times`
    });
  }

  if (state.driftScore >= thresholds.driftScore) {
    triggers.push({
      action: "realign",
      reason: `drift score ${state.driftScore} reached ${thresholds.driftScore}`
    });
  }

  if (state.conflictingInstructionCount >= thresholds.conflictingInstructionCount) {
    triggers.push({
      action: "realign",
      reason: `${state.conflictingInstructionCount} conflicting instruction(s) detected`
    });
  }

  return {
    decision: triggers.length === 0 ? "continue" : "meditate",
    triggers,
    recommendedActions: prioritizeActions(triggers.map((trigger) => trigger.action))
  };
}

export function applyMeditation(policy, state, evaluation = evaluateState(policy, state)) {
  const nextState = structuredClone(state);
  const log = [];

  for (const action of evaluation.recommendedActions) {
    if (action === "checkpoint") {
      nextState.iterationsSinceCheckpoint = 0;
      nextState.lastCheckpoint = summarizeState(policy, state);
      log.push("checkpointed objective, constraints, decisions, and next step");
    }

    if (action === "compact") {
      nextState.contextUtilization = Math.max(0.22, Number((state.contextUtilization * 0.48).toFixed(2)));
      nextState.compacted = true;
      log.push(`compacted context to ${formatPercent(nextState.contextUtilization)}`);
    }

    if (action === "realign") {
      nextState.driftScore = 0;
      nextState.conflictingInstructionCount = 0;
      nextState.realignedWith = policy.actions?.realign?.governingFiles ?? [];
      log.push("realigned with governing files");
    }

    if (action === "recover") {
      nextState.recentActions = [];
      nextState.recoveryStrategy = policy.actions?.recover?.strategy ?? "choose-new-action";
      log.push("cleared repeated action loop and selected recovery strategy");
    }
  }

  return { state: nextState, log };
}

function prioritizeActions(actions) {
  const priority = ["realign", "recover", "checkpoint", "compact"];
  return priority.filter((action) => actions.includes(action));
}

function hasRepeatedAction(actions = [], limit) {
  if (actions.length < limit) {
    return false;
  }

  const tail = actions.slice(-limit);
  return tail.every((action) => action === tail[0]);
}

function summarizeState(policy, state) {
  const fields = policy.actions?.checkpoint?.summaryFields ?? [];
  return Object.fromEntries(fields.map((field) => [field, state[field] ?? null]));
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}
