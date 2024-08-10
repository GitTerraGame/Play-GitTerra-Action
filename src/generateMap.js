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
const NUMBER_OF_COMMITS_TO_PROCESS_IN_ONE_GO = 100;

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

  // @TODO - cache the commits and only fetch the new ones
  const history = new Map();

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
      acc.set(day, commit);
      return acc;
    }, new Map());

    console.log("Commit days", commitsToDisplay.keys());

    const commitIterator = commitsToDisplay.entries();

    // add latest commit without checkout it out
    const [day, commit] = commitIterator.next().value;
    history.set(day, {
      commit,
      clusters: await processRepo(),
    });

    console.log("Latest commit:", day, commit.hash);

    for (let i = 1; i < NUMBER_OF_COMMITS_TO_PROCESS_IN_ONE_GO; i++) {
      const entry = commitIterator.next();
      if (entry.done) {
        break;
      }

      const day = entry.value[0];
      const commit = entry.value[1];

      console.log("Checkout commit for the day:", day, commit.hash);

      await git.checkout(commit.hash);
      const clusters = await processRepo();

      history.set(day, {
        commit,
        clusters,
      });
    }

    console.log("Checkout latest commit on the branch:", branch);
    await git.checkout(branch);
  } catch (error) {
    console.error("Error retrieving branch name:", error);
  }

  // @TODO - save the cache back to the file system so it can be saved and re-used

  return history;
}

const mapHTML = generateMapHTML(gameConfig, await getHistory());
fs.writeFileSync(mapOutput, mapHTML);
