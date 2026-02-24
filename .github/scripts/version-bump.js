import { execSync } from "child_process";
import fs from "fs";

function getCommitMessage() {
  return execSync("git log -1 --pretty=%B", { encoding: "utf-8" }).trim();
}

function determineBumpType(commitMessage) {
  if (/^feat(\(.+\))?!:|BREAKING CHANGE/.test(commitMessage)) {
    return "major";
  }
  if (/^feat(\(.+\))?:/.test(commitMessage)) {
    return "minor";
  }
  return "patch";
}

function setOutput(name, value) {
  const output = process.env.GITHUB_OUTPUT;
  if (!output) {
    throw new Error(
      "GITHUB_OUTPUT environment variable is not set. This script is intended to run in a GitHub Actions environment where GITHUB_OUTPUT is provided.",
    );
  }
  fs.appendFileSync(output, `${name}=${value}\n`);
}

const commitMsg = getCommitMessage();
const bumpType = determineBumpType(commitMsg);
setOutput("bump", bumpType);
