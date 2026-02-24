import { execSync } from "child_process";
import fs from "fs";

function setOutput(name, value) {
  const output = process.env.GITHUB_OUTPUT;
  fs.appendFileSync(output, `${name}=${value}\n`);
}

function exec(command) {
  console.log(`> ${command}`);
  execSync(command, { encoding: "utf-8", stdio: "inherit" });
}

// Create GitHub release
const ghToken = process.env.GH_TOKEN;
if (!ghToken) {
  throw new Error("GH_TOKEN environment variable is required");
}

// Get bump type from environment (set by previous step)
const bumpType = process.env.BUMP_TYPE;

if (!bumpType || !["major", "minor", "patch"].includes(bumpType)) {
  throw new Error(`Invalid bump type: ${bumpType}`);
}

console.log(`Bumping version: ${bumpType}`);

// Configure Git
exec('git config --global user.name "github-actions[bot]"');
exec(
  'git config --global user.email "github-actions[bot]@users.noreply.github.com"',
);

// Bump version without creating a git tag
exec(`npm version ${bumpType} --no-git-tag-version`);

// Get the new version from package.json
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
const version = packageJson.version;
const stagingTag = `v${version}-staging`;

console.log(`New version: ${version}`);
console.log(`Staging tag: ${stagingTag}`);

// Set outputs
setOutput("staging_tag", stagingTag);
setOutput("version", version);

// Commit package.json changes
exec("git add package.json");
exec(`git commit -m "chore: bump version to ${version} [skip ci]"`);

// Create and push staging tag
exec(`git tag ${stagingTag}`);
exec("git push origin main");
exec(`git push origin ${stagingTag}`);

// Create build archive
exec(`zip -r build-${stagingTag}.zip dist/`);

const repo = process.env.GITHUB_REPOSITORY;
exec(`gh release create ${stagingTag} \
  --repo ${repo} \
  --title "Staging ${stagingTag}" \
  --generate-notes \
  --prerelease \
  build-${stagingTag}.zip`);
