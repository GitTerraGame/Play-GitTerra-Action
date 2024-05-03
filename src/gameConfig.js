import novaTerraPrime from "./tiles/novaTerraPrime.js";
import StoryTeller from "./story/StoryTeller.js";

export const defaultGameConfig = {
  tileSet: novaTerraPrime,
  minTiles: 10,
  storyTeller: new StoryTeller(),
  recentHistoryLength: 8,
};
