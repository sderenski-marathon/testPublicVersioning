import { execSync } from "child_process";
import fs from "fs";

const mainVersion = process.argv[2];
const branchName = process.argv[3];

// Pull in the origin/main HEAD version of package.json to bump from
const pkg = JSON.parse(fs.readFileSync("package.json"));
pkg.version = mainVersion;
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");

// Determine the bump type
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

// Update the package.json version
execSync("npm version " + bump + " --no-git-tag-version");

execSync('git config user.name "github-actions[bot]"');
execSync(
  'git config user.email "github-actions[bot]@users.noreply.github.com"',
);

execSync(
  "git add package.json package-lock.json 2>/dev/null || git add package.json",
);

const packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));
const newVersion = packageJson.version;

execSync(
  `git diff --staged --quiet || git commit -m "chore: resolve version to ${newVersion}"`,
);
execSync("git push origin ${{ github.head_ref }}");
