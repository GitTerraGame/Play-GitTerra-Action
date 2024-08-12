// node native modules
import fs from "fs";

// third-party modules
import simpleGit from "simple-git";

// our own modules
import { processRepo } from "./repo.js";

export const historyRecord = "history.json";

/**
 * Generates full history of the repository
 * building it incrementally by checking out each commit and keeping the cache
 *
 * @param {*} gameConfig
 * @returns
 */
export async function getFullHistory(gameConfig, SCC, folder) {
  // Initialize simple-git
  const git = simpleGit(folder);

  const history = fs.existsSync(historyRecord)
    ? new Map(JSON.parse(fs.readFileSync(historyRecord)))
    : new Map();

  // wrapping the code in a try-catch block to handle git errors
  let branch;
  try {
    // Get the current branch
    branch = (await git.branch()).current;
  } catch (error) {
    console.error("Error retrieving branch name:", error);
    process.exit(1);
  }

  console.log("Current branch:", branch);

  // log in reverse order (latest commit first)
  const log = await git.log();

  console.log("Total commits:", log.total);

  // Get latest commit per day
  const commitsToDisplay = log.all.reduce((acc, commit) => {
    const date = new Date(commit.date);
    const day = date.toDateString();

    if (!acc.has(day)) {
      acc.set(day, commit.hash);
    }

    return acc;
  }, new Map());

  console.log("Total commit days:", commitsToDisplay.size);
  console.log("History records already exist for days:", history.size);

  const commitIterator = commitsToDisplay.entries();

  // always override the history for the latest commit and we don't need to check it out
  const [day, commitHash] = commitIterator.next().value;
  history.set(day, {
    clusters: await processRepo(gameConfig, SCC, folder),
  });

  console.log("Latest commit:", day, commitHash);

  let totalCheckouts = 0;

  for (let i = 1; i < gameConfig.timelapseLookBackPerfRun; i++) {
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

    const [day, commitHash] = entry.value;

    console.log("Checkout commit for the day:", day, commitHash);

    try {
      await git.checkout(commitHash);
    } catch (error) {
      console.error("Error retrieving branch name:", error);
      process.exit(1);
    }

    totalCheckouts++;
    const clusters = await processRepo(gameConfig, SCC, folder);

    history.set(day, {
      clusters,
    });
  }

  try {
    if (totalCheckouts > 0) {
      console.log("Checkout latest commit on the branch:", branch);
      await git.checkout(branch);
    }
  } catch (error) {
    console.error("Error checkoing out the original branch:", error);
    process.exit(1);
  }

  fs.writeFileSync(historyRecord, JSON.stringify(Array.from(history)));

  return history;
}

/**
 * Generates the history object for the last commit only
 *
 * @param {*} gameConfig
 * @returns
 */
export async function getLastCommitistory(gameConfig, SCC, folder) {
  const history = new Map();

  history.set(new Date().toDateString(), {
    clusters: await processRepo(gameConfig, SCC, folder),
  });

  return history;
}
