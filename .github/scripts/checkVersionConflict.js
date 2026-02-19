import { compareVersions, setOutput } from "./utils.js";

const ancestorVersion = process.argv[2];
const mainVersion = process.argv[3];
const currentPrVersion = process.argv[4];

const ancestorParts = ancestorVersion.split(".").map(Number);
const mainParts = mainVersion.split(".").map(Number);
const currentParts = currentPrVersion.split(".").map(Number);

let conflict;
console.log(ancestorParts, mainParts, currentParts);

const ancestorCompare = compareVersions(ancestorParts, mainParts, false);
const prCompare = compareVersions(currentParts, mainParts, true);

const equalEachOther =
  ancestorVersion === mainVersion && currentPrVersion === mainVersion;

console.log("equalEach other", equalEachOther);
console.log(`ancestorCompare: ${ancestorCompare} - prCompare: ${prCompare}`);
console.log(`(ancestorCompare && prCompare): ${ancestorCompare && prCompare}`);
console.log(
  `(ancestorCompare && prCompare) || equalEachOther: ${
    (ancestorCompare && prCompare) || equalEachOther
  }`,
);

if ((ancestorCompare && prCompare) || equalEachOther) {
  setOutput("conflict", "true");
  conflict = true;
} else {
  setOutput("conflict", "false");
  conflict = false;
}

console.log(`conflict result ${conflict}`);
