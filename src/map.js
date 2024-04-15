import fs from "fs";
import path from "path";

/**
 * This function defines the algorythm for plotting city blocks maintaining the diamond shape.
 * The input is a sequential number of the block and the output are
 * the pair of cartesian coordinates to be later converted into isometric coordinates.
 *
 * @param {int} n positive integer representing the sequence number of the city block
 */
function getMapTileCoordinates(n) {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error("We can only draw blocks with positive integer numbers");
  }

  // primary coordinate
  const primary = Math.ceil(Math.sqrt(n));

  // secondary coordinate
  const secondary = Math.ceil((n - Math.pow(Math.floor(Math.sqrt(n)), 2)) / 2);

  if (secondary === 0) {
    // center line tile
    return { x: primary, y: primary };
  } else {
    // boolean representing the side of the diamond, e.g. left (false) or right (true)
    const direction =
      Math.ceil((n - Math.pow(Math.floor(Math.sqrt(n)), 2)) / 2) -
        Math.floor((n - Math.pow(Math.floor(Math.sqrt(n)), 2)) / 2) ===
      0;

    if (direction) {
      // append to the right
      return { x: secondary, y: primary };
    } else {
      // append to the left
      return { x: primary, y: secondary };
    }
  }
}

/**
 * Returns a tile number from a tileset based on the cluster of files
 * It currently uses total number of lines of code as a seed for the tile number
 *
 * @param {*} cluster an array of file objects tile represents
 * @param {*} numberOfTileVariations the number of tile variations in the tileset
 *
 * @returns {int} a 1-based number of the tile
 */
function getTileNumber(cluster, numberOfTileVariations) {
  let tileNumber = 0;

  try {
    const totalLinesInCluster = cluster.reduce(
      (acc, [file]) => acc + file.Lines,
      0
    );

    tileNumber = (totalLinesInCluster % numberOfTileVariations) + 1;
  } catch (error) {
    tileNumber = Math.floor(Math.random() * numberOfTileVariations) + 1;
  }

  return tileNumber;
}

export const generateMapHTML = function (gameConfig, clusters) {
  // calculated dimensions based on scale
  const numberOfTileVariations = gameConfig.tileSet.numberOfTileVariations;
  const tileWidth = gameConfig.tileSet.tileOriginalWidth;
  const isometricSkew = 1.73;
  const tileBaseHeight = tileWidth / isometricSkew;
  const highestTileHeight = gameConfig.tileSet.highestTileOriginalHeight;

  const tiles = [];

  // mimimum map size (e.g. don't scale tiles too large for smaller maps)
  let maxX = 4;
  let maxY = 2;

  // I count from last to first so first tiles get painted on top of the last tile in the final image.
  for (let i = clusters.length; i >= 1; i--) {
    const blockCoordinates = getMapTileCoordinates(i);

    if (maxX < blockCoordinates.x) {
      maxX = blockCoordinates.x;
    }

    if (maxY < blockCoordinates.y) {
      maxY = blockCoordinates.y;
    }

    const tileNumber = getTileNumber(clusters[i - 1], numberOfTileVariations);

    tiles.push({ tileNumber, blockCoordinates });
  }

  let mapWidth = maxX * tileWidth;
  let mapHeight = maxY * tileBaseHeight + highestTileHeight - tileBaseHeight;

  let lowestIsoY = mapHeight;

  const tileImages = tiles.map((tile) => {
    tile.isoX =
      mapWidth / 2 -
      tileWidth / 2 +
      ((tile.blockCoordinates.x - 1 - (tile.blockCoordinates.y - 1)) *
        tileWidth) /
        2;

    tile.isoY = Math.round(
      mapHeight -
        ((tile.blockCoordinates.x - 1 + tile.blockCoordinates.y - 1) *
          tileBaseHeight) /
          2 -
        highestTileHeight
    );

    if (tile.isoY < lowestIsoY) {
      lowestIsoY = tile.isoY;
    }

    return `
    <use href="#tile${tile.tileNumber}" 
      style="transform: translate(
        ${Math.floor(tile.isoX)}px,
        ${Math.floor(tile.isoY)}px
      )"
      class="php"
    />
    `;
  });

  let sprites = fs
    .readdirSync(gameConfig.tileSet.tileFolder)
    .filter((file) => {
      return file.endsWith(".svg");
    })
    .map((file) => {
      const svg = fs.readFileSync(
        path.resolve(gameConfig.tileSet.tileFolder, file),
        "utf8"
      );

      if (svg.match(/id="tile\d+"/)) {
        return svg;
      } else {
        return "";
      }
    })
    .join("\n");

  return `<!doctype html>
      <html>
        <head>
          <meta
            property="og:image"
            content="https://gitterra.com/images/background_and_menus/logobanner.svg"
          />
          <meta property="og:image:type" content="image/svg" />
          <link rel="icon" type="image/png" href="https://gitterra.com/images/logo.png" />
          <title>Your Repo Map | GitTerra</title>
          <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
          }
          h1,
          #feedback {
            text-align: center;
          }
          h1 * {
            vertical-align: middle;
          }
          body {
            /* webpackIgnore: true */
            background: url(https://gitterra.com/images/background_and_menus/site_background_image_bg.svg);
            background-size: cover;
          }
          #logobanner {
            aspect-ratio: auto 400 / 216.012;
            width: 30%;
            min-width: 10em;
            max-width: 15em;
          }

          .tileset {
            width: 0;
            height: 0;
          }

          .map {
            width: 90%;
          }

          .css {
            /* CSS */
            --primary-color-css: hsl(264, 34%, 36%);
            --primary-color-css-lighter: hsl(264, 34%, 66%);
            --primary-color-css-darker: hsl(264, 34%, 6%);
          }
          .python{
            /* Python */
            --primary-color-python: hsl(207, 51%, 43%);
            --primary-color-python-lighter: hsl(207, 51%, 73%);
            --primary-color-python-darker: hsl(207, 51%, 13%);
          }
          .js {
            /* JavaScript */
            --primary-color: hsl(53, 84%, 65%);
            --primary-color-lighter: hsl(53, 84%, 95%);
            --primary-color-darker: hsl(53, 84%, 35%);
          }
          .php {
            /* PHP */
            --primary-color: hsl(228, 31%, 45%);
            --primary-color-lighter: hsl(228, 31%, 75%);
            --primary-color-darker: hsl(228, 31%, 15%);
          }


          .primary-color,
          #primary-color,
          [serif\\:id="primary-color"],
          .primary-color *,
          #primary-color *,
          [serif\\:id="primary-color"] * {
            fill: var(--primary-color) !important;
          }

          .primary-color-lighter,
          #primary-color-lighter,
          [serif\\:id="primary-color-lighter"],
          .primary-color-lighter *,
          #primary-color-lighter *,
          [serif\\:id="primary-color-lighter"] * {
            fill: var(--primary-color-lighter) !important;
          }

          .primary-color-darker,
          #primary-color-darker,
          [serif\\:id="primary-color-darker"],
          .primary-color-darker *,
          #primary-color-darker *,
          [serif\\:id="primary-color-darker"] * {
            fill: var(--primary-color-darker) !important;
          }

          </style>
          
        </head>
        <body>
          <h1>
            <a href="https://gitterra.com/" target="_blank">
              <img
                id="logobanner"
                src="https://gitterra.com/images/background_and_menus/logobanner.svg"
              />
            </a>
          </h1>
          <div id="feedback">
            <a href="https://gitlab.com/gitterra/GitTerra/-/issues/new" target="_blank">
              How can we make this game better?
            </a>
          </div>
          <svg class="map" viewBox="0 ${lowestIsoY} ${Math.ceil(
    mapWidth
  )} ${Math.ceil(mapHeight)}">
            ${tileImages.join("")}
          </svg>
          <div class="tileset">
          ${sprites}
          </div>
        </body>
      </html>
      `;
};
