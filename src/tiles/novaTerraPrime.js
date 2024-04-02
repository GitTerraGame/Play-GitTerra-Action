const novaTerraPrime = {
  numberOfTileVariations: 10,
  tileOriginalWidth: 200,
  highestTileOriginalHeight: 300,
  getTileImageURL: function (tileNumber) {
    return `https://gitterra.com/images/tiles/novaterraprime/novaterraprime_tile_${tileNumber}.svg`;
  },
};

export default novaTerraPrime;
