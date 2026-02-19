import { compareVersions, setOutput } from "./utils.js";

const ancestorVersion = process.argv[2];
const mainVersion = process.argv[3];
const currentPrVersion = process.argv[4];

const ancestorParts = ancestorVersion.split(".").map(Number);
const mainParts = mainVersion.split(".").map(Number);
const currentParts = currentPrVersion.split(".").map(Number);

const ancestorCompare = compareVersions(ancestorParts, mainParts, false);
const prCompare = compareVersions(currentParts, mainParts, true);

const equalEachOther =
  ancestorVersion === mainVersion && currentPrVersion === mainVersion;

if ((ancestorCompare && prCompare) || equalEachOther) {
  setOutput("conflict", "true");
} else {
  setOutput("conflict", "false");
}
