#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { runDemo } from "./demo.js";
import { loadPolicy } from "./policy.js";
import { applyMeditation, evaluateState } from "./runtime.js";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] ?? "help";

  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  const policyPath = readOption(args, "--policy") ?? "MEDITATE.md";
  const policy = await loadPolicy(policyPath);

  if (command === "demo") {
    console.log(runDemo(policy));
    return;
  }

  if (command === "check") {
    const statePath = readOption(args, "--state");
    if (!statePath) {
      throw new Error("Missing required --state path");
    }

    const state = JSON.parse(await readFile(statePath, "utf8"));
    const evaluation = evaluateState(policy, state);
    const result = applyMeditation(policy, state, evaluation);

    console.log(JSON.stringify({ evaluation, result }, null, 2));
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

function readOption(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

function printHelp() {
  console.log(`meditate-md

Usage:
  node src/cli.js demo [--policy MEDITATE.md]
  node src/cli.js check --state examples/state-drifting.json [--policy MEDITATE.md]
`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
