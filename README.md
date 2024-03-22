[![we play GitTerra](https://github.com/GitTerraGame/Play-GitTerra-Action/actions/workflows/gitterra.yml/badge.svg)](https://gitterragame.github.io/Play-GitTerra-Action/)

# GitTerra

A git-based game running in CI/CD and played by coding!

Every time you push to your repository, GitTerra will analyze your code and generate the game map.

You can see generated map of your city / code in the pipeline's artifacts - deploy it to a web server of your choice or download to a local machine, it is up to you.

See instructions below on how to play GitTerra on your GitHub or GitLab repositories.

## In GitHub repo

To play GitTerra game on your GitHub repository using a [GitTerra GitHub action](https://github.com/marketplace/actions/play-gitterra), create a `.github/workflows/gitterra.yml` file with the following content:

```yaml
name: Play GitTerra
run-name: Playing 🌎 GitTerra on ${{ github.repository }} 🗺️

on:
  push:
    branches:
      - main
  pull_request:
jobs:
  play-gitterra:
    runs-on: ubuntu-latest
    steps:
      - name: Play GitTerra 🎮
        uses: GitTerraGame/Play-GitTerra-Action@main
```

You can tweak it further to run it on different events or branches.

Most commonly, if your repository uses the legacy `master` branch instead of the `main` branch, you should change the `branches` value to `master`.

### Deploy the map to GitHub Pages

If you don't use GitHub Pages hosting for anything else in your repo, it might be the easiest place to put your GitTerra map. You just need to add some permissions and one more job to the workflow file. Here's the full workflow you can use:

```yaml
name: Play GitTerra
run-name: Playing 🌎 GitTerra on ${{ github.repository }} 🗺️

on:
  push:
    branches:
      - main

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  play-gitterra:
    runs-on: ubuntu-latest
    steps:
      - name: Play GitTerra 🎮
        uses: GitTerraGame/Play-GitTerra@main
  deploy-gitterra-to-gh-pages:
    needs: play-gitterra
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: gitterra
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "."
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Keep in mind that you have to go to the repository settings and pick `GitHub Actions` as a source in "Build and Deployment" section of GitHub Pages settings for your repo. We didn't want to automate that configuration for you, to make sure you don't replace your production website with this.

### Add a badge to you README

To add a clickable badge at the top of your repo README file, use the following markdown code:

```
[![we play GitTerra](https://github.com/REPO-OWNER/REPO/actions/workflows/gitterra.yml/badge.svg)](https://github.com/REPO-OWNER/REPO/actions/workflows/gitterra.yml)
```

Replace `REPO-OWNER` with your GitHub username and `REPO` with your repository name.

The badge will display workflow status and by clicking on it you can go directly to "Play Gitterra" workflow and see all the runs. Click on individual run to see the Summary page and download gitterra artifact with a map.

## In GitLab repo

In order to play GitTerra in your GitLab repository using [GitTerra GitLab CI/CD Component](https://gitlab.com/explore/catalog/gitterra/GitTerra), add the following lines to your `.gitlab-ci.yml` file:

```yaml
include:
  - component: gitlab.com/gitterra/GitTerra/gitterra@~latest

stages:
  - play GitTerra
```

### Deploy the map to GitLab Pages

If you don't use GitLab Pages hosting for anything else in your repo, it might be the easiest place to put your GitTerra map. You just need to add `GitTerra/pages` component to `.gitlab-ci.yml` file. Here's the full pipeline you can use:

```yaml
include:
  - component: gitlab.com/gitterra/GitTerra/gitterra@~latest
  - component: gitlab.com/gitterra/GitTerra/pages@~latest

stages:
  - play GitTerra
```

Please don't use this if you already use GitLab Pages in your project - this will override your main GitLab Pages website with GitTerra map.

## Configuring the game

If you'd like to configure the game, you can do so by adding a `.gitterra.config.js` file to the root of your repository. Here's an example of a `.gitterra.config.js` file:

```js
module.exports = function (config) {
  config.minTiles = 5;

  return config;
};
```

or if your project uses ES6 modules (e.g. your `package.json` contains `"type": "module"` property):

```js
export default (config) => {
  config.minTiles = 5;

  return config;
};
```

It exports a function that takes a default configuration object and can adjust it to your needs. The example above sets the minimum number of tiles to 5.

We'll be adding more configuration options as we build the project.

## Licenses

GitTerra is an open source project by Sergey and Alexander Chernyshev of Chernyshev DEV. It is licensed under the [MIT License](LICENSE.md).

We also use [SCC](https://github.com/boyter/scc), a code analysis software by Ben Boyter to help us get data about your code to build the map. SCC is licensed under the [MIT License](LICENSE.scc.md).
