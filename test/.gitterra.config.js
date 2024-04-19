import url from "url";

export default (config) => {
  config.minTiles = 5;

  // config.tileSet = {
  //   tileFolder: url.fileURLToPath(import.meta.resolve("./mytiles")),
  // };

  return config;
};
