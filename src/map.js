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
export const generateMapHTML = function (gameConfig, total) {
  // scale the image if total is too high
  const tileScale = 1;

  // actual image dimensions
  const tileOriginalWidth = gameConfig.tileSet.tileOriginalWidth;
  const highestTileOriginalHeight =
    gameConfig.tileSet.highestTileOriginalHeight;
  const numberOfTileVariations = gameConfig.tileSet.numberOfTileVariations;

  // calculated dimensions based on scale
  const tileWidth = tileOriginalWidth * tileScale;
  const tileHeight = tileWidth / 2;
  const isometricSkew = 1.73;
  const highestTileHeight = highestTileOriginalHeight * tileScale;

  let lowestIsoX = 0;
  let highestIsoX = 0;
  let highestIsoY = 0;

  const tiles = [];

  for (let i = total; i >= 1; i--) {
    const blockCoordinates = getMapTileCoordinates(i);

    const isoX =
      (blockCoordinates.x * tileWidth) / 2 - blockCoordinates.y * tileHeight;
    const isoY =
      ((blockCoordinates.x * tileWidth) / 2 + blockCoordinates.y * tileHeight) /
      isometricSkew;

    if (lowestIsoX > isoX) {
      lowestIsoX = isoX;
    }
    if (highestIsoX < isoX) {
      highestIsoX = isoX;
    }
    if (highestIsoY < isoY) {
      highestIsoY = isoY;
    }

    const tileNumber = Math.floor(Math.random() * numberOfTileVariations) + 1;

    tiles.push({ tileNumber, isoX, isoY });
  }

  const tileImages = tiles.map(
    (tile) =>
      `<img
      key=${tile.tileNumber}
      src=${gameConfig.tileSet.getTileImageURL(tile.tileNumber)}
      width=${tileWidth}
      style="
        position: absolute;
        left: ${tile.isoX - lowestIsoX}px;
        bottom: ${tile.isoY - tileHeight}px;
      "
    />`
  );

  return `<!doctype html>
      <html>
        <head>
          <style>
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
          </style>
          <title>Your Repo Map | GitTerra</title>
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
          <div
            style="
              position: absolute;
              width: ${highestIsoX - lowestIsoX + tileWidth}px;
              height: ${highestIsoY + highestTileHeight - tileHeight}px;
              left: 50%;
              marginRight: -50%;
              transform: translate(-50%, 0);
            "
          >
            ${tileImages.join("")}
          </div>
        </body>
      </html>
      `;
};
