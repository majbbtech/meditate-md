import { readFile } from "node:fs/promises";

const POLICY_BLOCK = /```meditate-policy\s*([\s\S]*?)```/m;

export async function loadPolicy(path = "MEDITATE.md") {
  const markdown = await readFile(path, "utf8");
  return parsePolicy(markdown, path);
}

export function parsePolicy(markdown, source = "MEDITATE.md") {
  const match = markdown.match(POLICY_BLOCK);

  if (!match) {
    throw new Error(`No meditate-policy block found in ${source}`);
  }

  try {
    return JSON.parse(match[1]);
  } catch (error) {
    throw new Error(`Invalid meditate-policy JSON in ${source}: ${error.message}`);
  }
}
