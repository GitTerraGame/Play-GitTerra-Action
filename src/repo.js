import fs from "fs";
import { spawnSync } from "node:child_process";

import getClusters from "./getClusters.js";

export const tempStatsFile = "gitterra-stats.json";

export async function processRepo(gameConfig, SCC, folder) {
  const SCCResult = spawnSync(SCC, [
    folder,
    "--by-file",
    "--format=json",
    `--output=${tempStatsFile}`,
  ]);

  // Check if the process completed successfully
  if (SCCResult.error) {
    console.error("Failed to start subprocess:", SCCResult.error);
    process.exit(1);
  }

  // Check the exit code to see if it was successful
  if (SCCResult.status !== 0) {
    console.log(`Child process exited with code ${SCCResult.status}`);
    console.error("Error output:");
    console.error(SCCResult.stderr.toString());
    process.exit(1);
  }

  const repo = JSON.parse(fs.readFileSync(tempStatsFile));
  fs.unlinkSync(tempStatsFile);

  // Generate the map for last commit in the repository
  const clusters = await getClusters(repo, gameConfig);
  return clusters;
}
