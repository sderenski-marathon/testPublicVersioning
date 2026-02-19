// used to make the inital version bump
import { execSync } from "child_process";
import fs from "fs";

const branchName = process.argv[2];

let bump;
if (branchName.startsWith("feat!/")) {
  bump = "major";
} else if (branchName.startsWith("feat/")) {
  bump = "minor";
} else if (branch.startsWith("fix/") || branch.startsWith("hotfix/")) {
  bump = "patch";
} else {
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
execSync(`git push origin ${branchName}`);
