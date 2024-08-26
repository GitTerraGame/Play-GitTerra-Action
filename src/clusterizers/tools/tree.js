import GitHubLanguages from "../../GitHubLanguages.js";
import fs from "node:fs";
import path from "node:path";

const NODE_RADIUS = 3;
const LEVEL_HEIGHT = 20;
const PADDING = 50;
const XSCALE = 5;

const allColors = Object.values(GitHubLanguages)
  .map((lang) => lang.color)
  .filter((color) => color);

let fileNumber = 0;

function createNodeSVGElement(name, node, level, elements) {
  const color =
    node.clusterIndex !== undefined
      ? allColors[node.clusterIndex % allColors.length]
      : "black";

  const title = node.file ? node.file.Location : name;

  const x = PADDING + fileNumber * XSCALE;

  if (node.file) {
    fileNumber++;
  }

  const y =
    PADDING +
    (node.file ? level * LEVEL_HEIGHT - NODE_RADIUS * 2 : level * LEVEL_HEIGHT);

  const branchBottom = y;
  const branchTop = PADDING + (level - 1) * LEVEL_HEIGHT;

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
    // file circle
    elements.push(
      `<rect
          y="${y - NODE_RADIUS}"
          x="${x - NODE_RADIUS}"
          width="${NODE_RADIUS * 2}"
          height="${NODE_RADIUS * 2}"
          fill="${color}"
          data-cluster-id="${node.clusterIndex}"
          data-size="${node.size}"
          opacity="0.5"
          title="${title}"
        >
          <title>${title}</title>
        </rect>`
    );
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
  } else {
    // file circle
    elements.push(
      `<circle
      cy="${y}"
      cx="${x}"
      r="${NODE_RADIUS}"
      fill="${color}"
      data-cluster-id="${node.clusterIndex}"
      data-size="${node.size}"
      opacity="0.5"
      title="${title}"
    >
      <title>${title}</title>
    </circle>`
    );
  }

  return { x: maxX, y: maxY };
}

export function visualizeTree(tree, filename) {
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

export function saveTree(tree, filename) {
  fs.writeFileSync(filename, JSON.stringify(tree, null, 2));
}

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

function orderChildren(node) {
  if (node.children) {
    const childrenSortedByName = Object.keys(node.children)
      .sort()
      .map((key) => {
        const child = node.children[key];
        child.name = key;

        return child;
      });

    childrenSortedByName.forEach((child) => {
      orderChildren(child);
    });

    node.children = childrenSortedByName;
  }
}

// Function to build a tree from a list of filenames
export function buildTree(files) {
  const root = {};

  files.forEach((file) => {
    addPathToTree(root, file);
  });

  const tree = { children: root };

  orderChildren(tree);

  return tree;
}
