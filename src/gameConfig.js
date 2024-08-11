import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";

import novaTerraPrime from "./tiles/novaTerraPrime.js";

export const defaultGameConfig = {
  tileSet: novaTerraPrime,
  minTiles: 10,
  timelapseLookBackPerfRun: 20,
};

export const getGameConfig = async (filename) => {
  if (!fs.existsSync(filename)) {
    return defaultGameConfig;
  }

  let gameConfig = defaultGameConfig;

  const fullPath = path.resolve(".", filename);

  console.log("Found custom configuration file: ", fullPath);

  try {
    const configuratorModule = await import(pathToFileURL(fullPath));

    gameConfig = configuratorModule.default(gameConfig);
  } catch (e) {
    console.error("Error while reading custom configuration file: ", e);
  }

  return gameConfig;
};
