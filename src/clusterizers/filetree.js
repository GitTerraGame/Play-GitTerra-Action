import path from "node:path";
import kmeans from "node-kmeans";
import fs from "node:fs";

// Function to add a file path to the tree
function addPathToTree(tree, file) {
  const parts = file.Location.split(path.sep);
  let currentLevel = tree;

  parts.forEach((part, index) => {
    if (!currentLevel[part]) {
      if (index === parts.length - 1) {
        // It's a file
        currentLevel[part] = { file };
      } else {
        // It's a directory
        currentLevel[part] = { children: {} };
      }
    }
    currentLevel = currentLevel[part].children || currentLevel[part];
  });
}

// Function to build a tree from a list of filenames
function buildTree(files) {
  const root = {};
  files.forEach((filepath) => addPathToTree(root, filepath));
  return { children: root, siblingIndex: 0 };
}

// Function to calculate the closest higher order of magnitude
function getNextOrderOfMagnitude(num) {
  return num <= 0 ? 0 : Math.pow(10, Math.ceil(Math.log10(num)));
}

function calculateCountsAndIndices(node) {
  if (node.children) {
    const siblings = Object.keys(node.children);

    let magnitudes = 0;
    siblings.forEach((key, index) => {
      const child = node.children[key];
      child.siblingIndex = index; // Index in the sibling list
      const childMagnitude = calculateCountsAndIndices(child);

      magnitudes += childMagnitude;
    });

    node.magnitude = getNextOrderOfMagnitude(magnitudes);

    return node.magnitude;
  } else {
    return 1;
  }
}

function calculateFileScores(node, parentScore = 0) {
  node.score =
    parentScore +
    (node.magnitude > 1 ? node.magnitude : 1) *
      (node.siblingIndex ? node.siblingIndex : 0);

  if (node.children) {
    const siblings = Object.keys(node.children);

    siblings.forEach((key) => {
      const child = node.children[key];
      calculateFileScores(child, node.score);
    });
  }
}

function getScoredFiles(node, files = []) {
  if (node.children) {
    const siblings = Object.keys(node.children);

    siblings.forEach((key) => {
      const child = node.children[key];
      getScoredFiles(child, files);
    });
  } else {
    files.push(node);
  }

  return files;
}

const NODE_RADIUS = 3;
const LEVEL_HEIGHT = 20;
const PADDING = 50;
const XSCALE = 5;

function createNodeSVGElement(name, node, level, elements) {
  const color = node.file ? "green" : "black";

  const title = node.file ? node.file.Location : name;

  const x = PADDING + node.score * XSCALE;
  const y =
    PADDING +
    (node.file ? level * LEVEL_HEIGHT - NODE_RADIUS * 2 : level * LEVEL_HEIGHT);

  const branchBottom = y;
  const branchTop = PADDING + (level - 1) * LEVEL_HEIGHT;

  // node circle
  elements.push(
    `<circle
      cy="${y}"
      cx="${x}"
      data-score="${node.score}"
      date-magnitude="${node.magnitude || 1}"
      r="${NODE_RADIUS}"
      fill="${color}"
      opacity="0.3"
      title="${title}"
    >
      <title>${title}</title>
    </circle>`
  );

  // vertical branch line
  elements.push(
    `<line
      x1="${x}"
      y1="${branchTop}"
      x2="${x}"
      y2="${branchBottom}"
      stroke="black"
      opacity="0.3" />
    `
  );

  let maxX = x;
  let maxY = y;

  if (node.children) {
    const siblings = Object.keys(node.children);

    siblings.forEach((key) => {
      const child = node.children[key];
      const { x: maxChildX, y: maxChildY } = createNodeSVGElement(
        key,
        child,
        level + 1,
        elements
      );

      if (maxChildX > maxX) {
        maxX = maxChildX;
      }

      if (maxChildY > maxY) {
        maxY = maxChildY;
      }
    });

    // horizontal branch line
    elements.push(`<line
      x1="${x}"
      y1="${y}"
      x2="${maxX}"
      y2="${y}"
      stroke="black"
      opacity="0.3" />`);
  }

  return { x: maxX, y: maxY };
}

function visualizeTree(tree, filename) {
  const elements = [];
  const { x: maxX, y: maxY } = createNodeSVGElement("root", tree, 0, elements);

  const SVG = `
  <html>
  <body>
  <svg viewBox="0 0
    ${maxX + NODE_RADIUS + PADDING}
    ${maxY + NODE_RADIUS + PADDING}
  " xmlns="http://www.w3.org/2000/svg" style="width: 100%">
  ${elements.join("\n")}
  </svg>
  </body>
  </html>
  `;

  fs.writeFileSync(filename, SVG);
}

function saveTree(tree, filename) {
  fs.writeFileSync(filename, JSON.stringify(tree, null, 2));
}

export default async function clusterize(files, number_of_blocks) {
  const tree = buildTree(files);
  calculateCountsAndIndices(tree);
  calculateFileScores(tree);

  saveTree(tree, "tree.json");
  visualizeTree(tree, "tree.html");

  // console.log(JSON.stringify(tree, null, 2));
  // process.exit(0);

  const scoredFiles = getScoredFiles(tree);

  // console.log(JSON.stringify(scoredFiles, null, 2));

  const vector = scoredFiles.map(({ score }) => [score]);

  // console.log(JSON.stringify(vector, null, 2));

  const scoreClusters = await new Promise((resolve, reject) => {
    const k =
      vector.length > number_of_blocks ? number_of_blocks : vector.length;

    kmeans.clusterize(vector, { k }, function (err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });

  // console.log(JSON.stringify(scoreClusters, null, 2));
  // process.exit(0);

  const fileClusters = scoreClusters.map((cluster) =>
    cluster.clusterInd.map((index) => [
      scoredFiles[index].file,
      scoredFiles[index].score,
    ])
  );

  // console.log(JSON.stringify(fileClusters, null, 2));
  // process.exit(0);

  const validClusters = fileClusters.filter((cluster) => cluster.length > 1);

  return validClusters;
}
