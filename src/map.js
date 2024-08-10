import fs from "fs";
import path from "path";

import {
  languageStringToCSSClass,
  languageStringToHexColor,
} from "./languages.js";

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
 * @param {*} sprites sprite objects array
 *
 * @returns {sprite} a sprite object chosen for the cluster
 */
function getSprite(cluster, sprites) {
  let spriteIndex = 0;

  try {
    spriteIndex = cluster.totalLinesInCluster % sprites.length;
  } catch (error) {
    spriteIndex = Math.floor(Math.random() * sprites.length);
  }

  return sprites[spriteIndex];
}

function getTileLanguage(cluster) {
  return Object.keys(cluster.languageStats).reduce((a, b) => {
    return cluster.languageStats[a] > cluster.languageStats[b] ? a : b;
  }, 0);
}

function ColorLuminance(hex, lum) {
  // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, "");
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  lum = lum || 0;

  // convert to decimal and change luminosity
  var rgb = "#",
    c,
    i;
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
    rgb += ("00" + c).substr(c.length);
  }

  return rgb;
}
// console.log("primary color", "#1c70be");
// console.log("primary color (ligher)", ColorLuminance("#1c70be", 0.2));
// console.log("primary color (darker)", ColorLuminance("#1c70be", -0.2));

export const generateSprites = function (gameConfig) {
  let tallestSprite = 0;
  let tileWidth = 0;

  const sprites = fs
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
        const tileNumber = svg.match(/id="tile(\d+)"/)[1];
        const [_, spriteWidth, spriteHeight] = svg.match(
          /viewBox="0 0 (\d+) (\d+)"/
        );

        if (tallestSprite < spriteHeight) {
          tallestSprite = spriteHeight;
        }

        tileWidth = spriteWidth;

        return { svg, tileNumber, spriteWidth, spriteHeight };
      } else {
        console.error(file, "is not a valid sprite");
        return false; // invalid sprite
      }
    })
    .filter((x) => x) // remove invalid sprites
    .sort((a, b) => a.tileNumber - b.tileNumber);

  return {
    sprites,
    tallestSprite,
    tileWidth,
    spriteEmbeds: sprites.map((sprite) => sprite.svg).join(""),
  };
};

export const getHistoricalLanguages = function (history) {
  const languages = new Map();

  history.forEach(({ clusters }) => {
    clusters.forEach((cluster) => {
      const language = getTileLanguage(cluster);
      languages.set(language, languageStringToCSSClass(language));
    });
  });

  let languageStyles = "";
  languages.forEach((languageClass, language) => {
    const primaryColor = languageStringToHexColor(language);

    if (!primaryColor) {
      return;
    }

    const primaryColorLighter = ColorLuminance(primaryColor, 0.3);
    const primaryColorDarker = ColorLuminance(primaryColor, -0.3);

    languageStyles += `
    .${languageClass} {
      /* ${language} */
      --primary-color: ${primaryColor};
      --primary-color-lighter: ${primaryColorLighter};
      --primary-color-darker: ${primaryColorDarker};
    }
    `;
  });

  return { languages, languageStyles };
};

export const generateMapSVG = function (
  languages,
  sprites,
  tileWidth,
  tileBaseHeight,
  tallestSprite,
  clusters,
  dateString,
  hidden
) {
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

    const sprite = getSprite(clusters[i - 1], sprites);
    const language = getTileLanguage(clusters[i - 1]);
    tiles.push({ sprite, blockCoordinates, language });
  }

  let mapWidth = maxX * tileWidth;
  let mapHeight = maxY * tileBaseHeight + (tallestSprite - tileBaseHeight);

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
        tile.sprite.spriteHeight
    );

    if (tile.isoY < lowestIsoY) {
      lowestIsoY = tile.isoY;
    }

    tile.languageClass = languages.get(tile.language);
    const languageClassAttribute = tile.languageClass
      ? `class="${tile.languageClass}"`
      : "";

    return `
    <use href="#tile${tile.sprite.tileNumber}"
      style="transform: translate(
        ${Math.floor(tile.isoX)}px,
        ${Math.floor(tile.isoY)}px
      )"
      ${languageClassAttribute}
    >
      <title>${tile.language}</title>
    </use>
    `;
  });

  const dateId = dateString.replace(/[^A-Za-z0-9]/g, "-");

  return `<svg class="map${
    hidden ? " hidden" : ""
  }" id="date_${dateId}" viewBox="0 ${lowestIsoY} ${Math.ceil(
    mapWidth
  )} ${Math.ceil(
    mapHeight - lowestIsoY
  )}" style="fill-rule:evenodd; clip-rule:evenodd; stroke-linecap:round; stroke-linejoin:round; stroke-miterlimit:1.5;">
      <title>${dateString}</title>
      ${tileImages.join("")}
    </svg>`;
};

export const generateMapHTML = function (gameConfig, history) {
  const clusters = history.entries().next().value[1].clusters;

  const { sprites, tileWidth, tallestSprite, spriteEmbeds } =
    generateSprites(gameConfig);

  const isometricSkew = 1.73;
  const tileBaseHeight = tileWidth / isometricSkew;

  const { languages, languageStyles } = getHistoricalLanguages(history);

  let mapSVGs = "";
  let hidden = false;
  history.forEach(({ clusters }, day) => {
    mapSVGs +=
      "\n" +
      generateMapSVG(
        languages,
        sprites,
        tileWidth,
        tileBaseHeight,
        tallestSprite,
        clusters,
        day,
        hidden
      );

    // don't hide the first map
    if (!hidden) {
      hidden = true;
    }
  });
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

    :root {
      /* Default Colors */
      --primary-color: #4E913A;
      --primary-color-lighter: #62B54A;
      --primary-color-darker: #3B6D2C;
    }

    ${languageStyles}

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

    svg.map.hidden {
      display: none;
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
    ${mapSVGs}
    <div class="tileset">
    ${spriteEmbeds}
    </div>
  </body>
</html>
`;
};
