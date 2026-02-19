import { compareVersions, setOutput } from "./utils";

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
