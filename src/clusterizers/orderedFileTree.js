import fs from "fs";
import { buildTree, saveTree, visualizeTree } from "./tools/tree.js";

function calculateSizes(node) {
  if (node.children) {
    let folderSize = 0;

    node.children.forEach((child) => {
      folderSize += calculateSizes(child);
    });

    node.size = folderSize;
  } else {
    node.size = node.file.Bytes;
  }

  return node.size;
}

function getFiles(node, files = []) {
  if (node.children) {
    node.children.forEach((child) => {
      getFiles(child, files);
    });
  } else {
    files.push(node);
  }

  return files;
}

function labelClusters(node, totalClusters, clusterIndex = 0) {
  if (node.children) {
    node.children.forEach((child) => {
      if (child.file) {
        child.clusterIndex = clusterIndex;
        if (clusterIndex < totalClusters) {
          clusterIndex++;
        }
      }
    });

    node.children.forEach((child) => {
      labelClusters(child, totalClusters, clusterIndex);
    });
  }
}

export default async function clusterize(files, numberOfClusters) {
  if (files.length < numberOfClusters) {
    numberOfClusters = files.length;
  }

  const tree = buildTree(files);

  calculateSizes(tree);
  labelClusters(tree, numberOfClusters);

  const clusterizedFiles = getFiles(tree);

  const fileClusters = clusterizedFiles.reduce((clusters, fileEntry) => {
    let cluster = clusters[fileEntry.clusterIndex];
    if (!cluster) {
      cluster = [];
      clusters[fileEntry.clusterIndex] = cluster;
    }

    cluster.push([fileEntry.file]);

    return clusters;
  }, []);

  const validClusters = fileClusters.filter((cluster) => cluster.length >= 1);

  return validClusters;
}
