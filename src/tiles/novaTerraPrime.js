import url from "url";

const novaTerraPrime = {
  numberOfTileVariations: 10,
  tileOriginalWidth: 2013,
  highestTileOriginalHeight: 2710,
  tileFolder: url.fileURLToPath(
    import.meta.resolve("../images/tiles/novaterraprime")
  ),
};

export default novaTerraPrime;
