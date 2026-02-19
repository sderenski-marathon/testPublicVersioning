import { fs } from "fs";

const ancestorVersion = process.argv[2];
const mainVersion = process.argv[3];
const currentPrVersion = process.argv[4];

const ancestorParts = ancestorVersion.split(".");
const mainParts = mainVersion.split(".");
const currentParts = currentPrVersion.split(".");

let conflict;

const ancestorCompare = compareVersions(ancestorParts, mainParts, false);
const prCompare = compareVersions(currentParts, mainParts, true);

if (ancestorCompare && prCompare) {
  setOutput(conflict, true);
  //conflict = true;
} else {
  setOutput(conflict, false);
  //conflict = false;
}

console.log(`conflict result ${conflict}`);

//=================================================================================
// Helper Functions

/**
 * Compares versions version to limit to see if version is less than the limit.
 * Has a checkEqualsTo variable to allow for a less than or equals to check.
 * @param {string[]} version
 * @param {string[]} limit
 * @param {boolean} checkEqualsTo
 *
 * @returns {boolean}
 */
function compareVersions(version, limit, checkEqualsTo) {
  // Check each of the parts from version to limit
  if (checkEqualsTo) {
    if (
      version[0] <= limit[0] ||
      version[1] <= limit[1] ||
      version[2] <= limit[2]
    ) {
      return true;
    }
  } else {
    if (
      version[0] < limit[0] ||
      version[1] < limit[1] ||
      version[2] < limit[2]
    ) {
      return true;
    }
  }

  return false;
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
