// node native modules
import fs from "fs";

// our own modules
import { generateMapHTML } from "./map.js";
import { getGameConfig } from "./gameConfig.js";
import { getFullHistory, getLastCommit } from "./history.js";

// Constants
const mapOutput = "index.html";

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

console.log("[Game Configuration]\n", gameConfig);

const history = gameConfig.createTimelapse
  ? await getFullHistory(gameConfig, SCC, folder)
  : await getLastCommit(gameConfig, SCC, folder);

const mapHTML = generateMapHTML(gameConfig, history);
fs.writeFileSync(mapOutput, mapHTML);
