import clusterize from "./clusterize.js";

async function getClusters(repo, gameConfig) {
  const repoStats = {
    total: {
      bytes: 0,
      files: 0,
      lines: 0,
      codebytes: 0,
      code: 0,
      comment: 0,
      blanks: 0,
      complexity: 0,
      wComplexity: 0,
    },
    weight: {
      files: 400,
      lines: 100000,
      comment: 15000,
      code: 80000,
      bytes: 4000000,
    },
  };

  repo.forEach((elem) => {
    repoStats.total.bytes += elem.Bytes;
    repoStats.total.files += elem.Count;
    repoStats.total.lines += elem.Lines;
    repoStats.total.codebytes = +elem.CodeBytes;
    repoStats.total.code += elem.Code;
    repoStats.total.comment += elem.Comment;
    repoStats.total.blanks += elem.Blank;
    repoStats.total.complexity += elem.Complexity;
    repoStats.total.wComplexity += elem.WeightedComplexity;
  });

  const number_of_blocks = Math.round(
    (100 *
      Math.log10(
        repoStats.total.files / repoStats.weight.files +
          repoStats.total.lines / repoStats.weight.lines +
          repoStats.total.comment / repoStats.weight.comment +
          repoStats.total.code / repoStats.weight.code +
          repoStats.total.bytes / repoStats.weight.bytes +
          1
      )) /
      3 +
      gameConfig.minTiles
  );

  /**
   * Deterministicly group files into clusters for each city block
   */
  const files = repo.map((elem) => elem.Files).flat();
  const clusters = await clusterize(files, number_of_blocks);

  return clusters.map((cluster) => {
    const summary = {};

    summary.totalLinesInCluster = cluster.reduce(
      (acc, [file]) => acc + file.Lines,
      0
    );

    summary.languageStats = cluster.reduce((acc, [file]) => {
      acc[file.Language] = acc[file.Language] + file.Lines || file.Lines;
      return acc;
    }, {});

    return summary;
  });
}

export default getClusters;
