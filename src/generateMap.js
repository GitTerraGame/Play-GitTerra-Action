import { generateMapHTML } from "./map.js";
import fs from "fs";

const MIN_TILES = 10;

const input = "gitterra.json";
const output = "gitterra.html";

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
    MIN_TILES
);

const mapHTML = generateMapHTML(number_of_blocks);
fs.writeFileSync(output, mapHTML);
