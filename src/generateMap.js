// node native modules
import fs from "fs";

// our own modules
import { generateMapHTML } from "./map.js";
import { getGameConfig } from "./gameConfig.js";
import { getFullHistory, getLastCommit } from "./history.js";
import screenshot from "./screenshot.js";

// Constants
const mapOutput = "index.html";
const screenshotOutput = "map.png";
const screenshotWidth = 1200;
const screenshotHeight = 630;

let folder;
if (process.argv.length >= 3) {
  folder = process.argv[2];
} else {
  console.error("Please provide the path to the repository");
  process.exit(1);
}

let SCC;
if (process.argv.length >= 4) {
  SCC = process.argv[3];
} else {
  console.error("Please provide the path to the scc binary");
  process.exit(1);
}

let gameConfig = await getGameConfig(
  `${folder}/.gitterra.config.mjs`,
  `${folder}/.gitterra.config.js`
);

let destinationURL;
if (process.argv.length >= 5) {
  destinationURL = process.argv[4];
}

// if destinationURL is set by workflow and config does not have it set, use it
if (!gameConfig.destinationURL && destinationURL) {
  gameConfig.destinationURL = destinationURL;
}

console.log("[Game Configuration]\n", gameConfig);

const history = gameConfig.createTimelapse
  ? await getFullHistory(gameConfig, SCC, folder)
  : await getLastCommit(gameConfig, SCC, folder);

const mapHTML = generateMapHTML(gameConfig, history);
fs.writeFileSync(mapOutput, mapHTML);

screenshot(
  mapOutput,
  screenshotWidth,
  screenshotHeight,
  screenshotOutput,
  8080
);
