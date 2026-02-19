// used to make the inital version bump
import { determineBumpType } from "./utils";
import { execSync } from "child_process";
import fs from "fs";

const branchName = process.argv[2];
const ancestorVersion = process.argv[3];

// Check the current version before bumping.
if (checkCurrentVersion(ancestorVersion)) {
  process.exit(0);
}

// Determine the bump type
const bump = determineBumpType(branchName);

if (bump === null) {
  console.log("Branch name does not match any known pattern, skipping bump");
  process.exit(0);
}

execSync("npm version " + bump + " --no-git-tag-version");

execSync('git config user.name "github-actions[bot]"');
execSync(
  'git config user.email "github-actions[bot]@users.noreply.github.com"',
);

execSync(
  "git add package.json package-lock.json 2>/dev/null || git add package.json",
);

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
const newVersion = packageJson.version;

execSync(`git commit -m "chore: resolve version to ${newVersion}"`);
execSync(`git push origin HEAD:${branchName}`);

function checkCurrentVersion(ancestorVersion) {
  const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
  const packageVersion = packageJson.version;

  return !ancestorVersion === packageVersion;
}
