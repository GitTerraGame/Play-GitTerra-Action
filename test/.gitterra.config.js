export default (config) => {
  config.minTiles = 5;

  config.tileSet = {
    numberOfTileVariations: 2,
    tileOriginalWidth: 2013,
    highestTileOriginalHeight: 1774,
    tileFolder: "src/images/tiles/novaterraprime",
    // getTileImageURL: function (tileNumber) {
    //   return `https://gitterra.com/images/tiles/terraprime/tiles_v2-${tileNumber
    //     .toString()
    //     .padStart(2, "0")}.svg`;
    // },
  };

  return config;
};
