import { pathToFileURL } from "url";

import { generateMapHTML } from "./map.js";
import { defaultGameConfig } from "./gameConfig.js";
import clusterize from "./clusterize.js";
import profess from "./story/chatStoryTeller.js";
import messages from "./story/messages.js";

import fs from "fs";
import path from "path";

const input = "gitterra.json";
const output = "index.html";

let gameConfig = defaultGameConfig;

if (process.argv.length >= 3 && fs.existsSync(process.argv[2])) {
  const fullPath = path.resolve(".", process.argv[2]);

  console.log("Found custom configuration file: ", fullPath);

  try {
    const configuratorModule = await import(pathToFileURL(fullPath));

    gameConfig = configuratorModule.default(gameConfig);
  } catch (e) {
    console.error("Error while reading custom configuration file: ", e);
  }
}

console.log("[Game Configuration]\n", gameConfig);

const repoStats = {
  total: {
    bytes: 0,
    files: 0,
    lines: 0,
    codebytes: 0,
    code: 0,
    comment: 0,
    blanks: 0,
    complexity: 0,
    wComplexity: 0,
  },
  weight: {
    files: 400,
    lines: 100000,
    comment: 15000,
    code: 80000,
    bytes: 4000000,
  },
};

/*
 * Calculating global statistics to determine the number of city blocks
 */
const repo = JSON.parse(fs.readFileSync(input, "utf8"));
repo.forEach((elem) => {
  repoStats.total.bytes += elem.Bytes;
  repoStats.total.files += elem.Count;
  repoStats.total.lines += elem.Lines;
  repoStats.total.codebytes = +elem.CodeBytes;
  repoStats.total.code += elem.Code;
  repoStats.total.comment += elem.Comment;
  repoStats.total.blanks += elem.Blank;
  repoStats.total.complexity += elem.Complexity;
  repoStats.total.wComplexity += elem.WeightedComplexity;
});

const number_of_blocks = Math.round(
  (100 *
    Math.log10(
      repoStats.total.files / repoStats.weight.files +
        repoStats.total.lines / repoStats.weight.lines +
        repoStats.total.comment / repoStats.weight.comment +
        repoStats.total.code / repoStats.weight.code +
        repoStats.total.bytes / repoStats.weight.bytes +
        1
    )) /
    3 +
    gameConfig.minTiles
);

/**
 * Deterministicly group files into clusters for each city block
 */
const files = repo.map((elem) => elem.Files).flat();
const clusters = await clusterize(files, number_of_blocks);

const stories = gameConfig.storyTeller
  ? await Promise.all(
      messages.splice(0, 3).map(async (message) => {
        return {
          message,
          story: await profess(
            message,
            gameConfig.storyTeller.api_key,
            gameConfig.storyTeller.model_name
          ),
        };
      })
    )
  : [];

console.log(stories);

const mapHTML = generateMapHTML(gameConfig, clusters, stories);
fs.writeFileSync(output, mapHTML);

