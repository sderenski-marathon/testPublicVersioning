/**
 * Compares versions version to limit to see if version is less than the limit.
 * Has a checkEqualsTo variable to allow for a less than or equals to check.
 * @param {number[]} version
 * @param {number[]} limit
 * @param {boolean} checkEqualsTo
 *
 * @returns {boolean}
 */
export function compareVersions(version, limit, checkEqualsTo) {
  // Check each of the parts from version to limit
  if (checkEqualsTo) {
    for (let i = 0; i < 3; i++) {
      if (version[i] <= limit[i]) {
        return true;
      }
    }
  } else {
    for (let i = 0; i < 3; i++) {
      if (version[i] < limit[i]) {
        return true;
      }
    }
  }

  return false;
}

export function setOutput(name, value) {
  const output = process.env.GITHUB_OUTPUT;
  if (!output) {
    throw new Error(
      "GITHUB_OUTPUT environment variable is not set. This script is intended to run in a GitHub Actions environment where GITHUB_OUTPUT is provided.",
    );
  }
  fs.appendFileSync(output, `${name}=${value}\n`);
}

export function determineBumpType(branchName) {
  if (branchName.startsWith("feat!/")) {
    return "major";
  } else if (branchName.startsWith("feat/")) {
    return "minor";
  } else if (
    branchName.startsWith("fix/") ||
    branchName.startsWith("hotfix/")
  ) {
    return "patch";
  } else {
    return null;
  }
}
