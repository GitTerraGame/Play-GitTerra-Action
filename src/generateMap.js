// node native modules
import fs from "fs";
import { spawnSync } from "node:child_process";

// custom modules
import simpleGit from "simple-git";

// our own modules
import { generateMapHTML } from "./map.js";
import { getGameConfig } from "./gameConfig.js";

import getClusters from "./getClusters.js";

// Constants
const SCC = "/usr/local/bin/scc";
const mapOutput = "index.html";
const historyRecord = "history.json";
const NUMBER_OF_COMMITS_TO_PROCESS_IN_ONE_GO = 5;

let folder = "./";
if (process.argv.length >= 3) {
  folder = process.argv[2];
}

let gameConfig = await getGameConfig(`${folder}/.gitterra.config.js`);

console.log("[Game Configuration]\n", gameConfig);

async function processRepo() {
  const SCCResult = spawnSync(SCC, [folder, "--by-file", "--format=json"]);

  // Check if the process completed successfully
  if (SCCResult.error) {
    console.error("Failed to start subprocess:", SCCResult.error);
    exit(1);
  }

  // Check the exit code to see if it was successful
  if (SCCResult.status !== 0) {
    console.log(`Child process exited with code ${SCCResult.status}`);
    console.error("Error output:");
    console.error(SCCResult.stderr.toString());
    exit(1);
  }

  const repo = JSON.parse(SCCResult.stdout.toString());

  // Generate the map for last commit in the repository
  const clusters = await getClusters(repo, gameConfig);
  return clusters;
}

async function getHistory() {
  // Initialize simple-git
  const git = simpleGit(folder);

  const history = fs.existsSync(historyRecord)
    ? new Map(JSON.parse(fs.readFileSync(historyRecord)))
    : new Map();

  // wrapping the code in a try-catch block to handle git errors
  try {
    // Get the current branch
    const branch = (await git.branch()).current;

    console.log("Current branch:", branch);

    // log in reverse order (latest commit first)
    const log = await git.log();

    console.log("Total commits", log.total);

    // Get latest commit per day
    // Note: in JavaScript Maps preserve order of insertion so we can rely on it being in the reverse chronological order
    const commitsToDisplay = log.all.reduce((acc, commit) => {
      const date = new Date(commit.date);
      const day = date.toDateString();

      acc.set(day, commit.hash);
      return acc;
    }, new Map());

    console.log("Commit days", commitsToDisplay.keys());

    const commitIterator = commitsToDisplay.entries();

    // add latest commit without checkout it out
    const [day, commitHash] = commitIterator.next().value;
    history.set(day, {
      commitHash,
      clusters: await processRepo(),
    });

    console.log("Latest commit:", day, commitHash);

    let totalCheckouts = 0;

    for (let i = 1; i < NUMBER_OF_COMMITS_TO_PROCESS_IN_ONE_GO; i++) {
      let entry = commitIterator.next();
      if (entry.done) {
        break;
      }

      // skip if already processed
      while (history.has(entry.value[0])) {
        entry = commitIterator.next();

        if (entry.done) {
          break;
        }
      }

      if (entry.done) {
        break;
      }

      const day = entry.value[0];
      const commitHash = entry.value[1];

      console.log("Checkout commit for the day:", day, commitHash);

      await git.checkout(commitHash);
      totalCheckouts++;
      const clusters = await processRepo();

      history.set(day, {
        clusters,
      });
    }

    if (totalCheckouts > 0) {
      console.log("Checkout latest commit on the branch:", branch);
      await git.checkout(branch);
    }
  } catch (error) {
    console.error("Error retrieving branch name:", error);
  }

  fs.writeFileSync(historyRecord, JSON.stringify(Array.from(history)));

  return history;
}

const history = await getHistory();
const mapHTML = generateMapHTML(gameConfig, history);
fs.writeFileSync(mapOutput, mapHTML);
