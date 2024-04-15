import url from "url";

export default (config) => {
  config.minTiles = 5;

  // config.tileSet = {
  //   numberOfTileVariations: 10,
  //   tileOriginalWidth: 2013,
  //   highestTileOriginalHeight: 1774,
  //   tileFolder: url.fileURLToPath(import.meta.resolve("./mytiles")),
  // };

  return config;
};
