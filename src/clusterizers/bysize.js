import kmeans from "kmeansjs";

async function clusterize(files, number_of_blocks) {
  const vector = files.map((file) => [file, file.Bytes, file.Lines]);

  const clusters = await new Promise((resolve, reject) => {
    const k =
      vector.length > number_of_blocks ? number_of_blocks : vector.length;

    kmeans(vector, k, function (err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });

  return clusters.filter((cluster) => Array.isArray(cluster));
}

export default clusterize;
