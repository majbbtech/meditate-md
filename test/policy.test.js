import test from "node:test";
import assert from "node:assert/strict";
import { parsePolicy } from "../src/policy.js";

test("parses meditate-policy block from markdown", () => {
  const policy = parsePolicy(`
# Example

\`\`\`meditate-policy
{"version":"0.1.0","thresholds":{"contextUtilization":0.7}}
\`\`\`
`);

  assert.equal(policy.version, "0.1.0");
  assert.equal(policy.thresholds.contextUtilization, 0.7);
});

test("throws when policy block is missing", () => {
  assert.throws(() => parsePolicy("# No policy"), /No meditate-policy block/);
});
