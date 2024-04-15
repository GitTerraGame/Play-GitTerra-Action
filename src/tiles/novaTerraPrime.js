import url from "url";

const novaTerraPrime = {
  numberOfTileVariations: 2,
  tileOriginalWidth: 2013,
  highestTileOriginalHeight: 1774,
  tileFolder: url.fileURLToPath(
    import.meta.resolve("../images/tiles/novaterraprime")
  ),
};

export default novaTerraPrime;
