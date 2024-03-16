export default (config) => {
  config.minTiles = 5;

  // config.tileSet = {
  //   numberOfTileVariations: 11,
  //   tileOriginalWidth: 200,
  //   highestTileOriginalHeight: 420,
  //   getTileImageURL: function (tileNumber) {
  //     return `https://gitterra.com/images/tiles/terraprime/tiles_v2-${tileNumber
  //       .toString()
  //       .padStart(2, "0")}.svg`;
  //   },
  // };

  return config;
};
