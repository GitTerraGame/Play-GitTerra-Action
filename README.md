[![we play GitTerra](https://github.com/GitTerraGame/Play-GitTerra-Action/actions/workflows/gitterra.yml/badge.svg)](https://gitterragame.github.io/Play-GitTerra-Action/)

# GitTerra

<img src="https://gitterra.com/images/background_and_menus/logobanner.svg" alt="Git Terra Guide Title Pic" style="height: 10em; width:100%; margin-bottom:2em">

A git-based game running in CI/CD and played by coding!

Every time you push to your repository, GitTerra will analyze your code and generate the game map.

You can see generated map of your city / code in the pipeline's artifacts - deploy it to GitHub / GitLab Pages, a web server of your choice or download to a local machine, it is up to you.

See instructions below on how to play Git Terra on your [GitHub](#in-github-repo) or [GitLab](#in-gitlab-repo) repositories.

## Example Maps

<a href="https://gitterragame.github.io/sample-repo-empty/"><img src="https://gitterra.com/images/background_and_menus/examplemap_1.jpg" alt="Tiny Repo map" height="150"/></a>
<a href="https://gitterragame.github.io/sample-repo/"><img src="https://gitterra.com/images/background_and_menus/examplemap_2.jpg" alt="Small Repo map" height="150"/></a>
<a href="https://gitterra.gitlab.io/large-and-old/"><img src="https://gitterra.com/images/background_and_menus/examplemap_3.jpg" alt="Large Repo map" height="150"/></a>

## In GitHub repo

To play Git Terra game on your GitHub repository using a [GitTerra GitHub action](https://github.com/marketplace/actions/play-gitterra), create a `.github/workflows/gitterra.yml` file (make sure to spell folder names correctly, as that's where GitHub looks for CI/CD workflows) with the following content:

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

If you don't use GitHub Pages hosting for anything else in your repo, it might be the easiest place to put your GitTerra map. You just need to add some permissions and one more job to the `.github/workflows/gitterra.yml` workflow file. Here's the full workflow you can use:

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
        uses: GitTerraGame/Play-GitTerra-Action@main
  deploy-gitterra-to-gh-pages:
    if: github.ref == 'refs/heads/main'
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

### Deploy the map to Netlify

It sometimes easier to deploy the map to Netlify, especially if you are deploying from a private repo (GitHub Pages doesn't support private repositories unless you are on Enterprise plan).

You will need to [create a new site in Netlify](https://app.netlify.com/drop) (just drop a folder with an empty `index.html` file or use a sample template to start) and get the Site ID (you can see one in site settings) and an Personal Access Token ([generate your token here](https://app.netlify.com/user/applications#personal-access-tokens)).
Then you need to add those to your repository secrets as `NETLIFY_SITE_ID` and `NETLIFY_AUTH_TOKEN` respectively.

Then use this workflow in your `.github/workflows/gitterra.yml` file:

```yaml
name: Play GitTerra
run-name: Playing 🌎 GitTerra on ${{ github.repository }} 🗺️

on:
  push:
    branches:
      - main

jobs:
  play-gitterra:
    runs-on: ubuntu-latest
    steps:
      - name: Play GitTerra 🎮
        uses: GitTerraGame/Play-GitTerra-Action@main
  deploy-gitterra-to-netlify:
    if: github.ref == 'refs/heads/main'
    needs: play-gitterra
    runs-on: ubuntu-latest
    name: "Deploy GItTerra map to Netlify"
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: gitterra
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "."
      - name: "Deploy to Netlify"
        uses: jsmrcaga/action-netlify-deploy@v2.0.0
        with:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          build_directory: "."
          NETLIFY_DEPLOY_TO_PROD: true
          NETLIFY_DEPLOY_MESSAGE: "Uploading updated GitTerra map for ${{ github.sha }}"
          install_command: "echo Skipping installing the dependencies"
          build_command: "echo Skipping building the web files"
```

### Add a badge to you README

To add a clickable badge at the top of your repo README file, use the following markdown code:

```
[![we play GitTerra](https://github.com/REPO-OWNER/REPO/actions/workflows/gitterra.yml/badge.svg)](https://github.com/REPO-OWNER/REPO/actions/workflows/gitterra.yml)
```

Replace `REPO-OWNER` with your GitHub username and `REPO` with your repository name.

The badge will display workflow status and by clicking on it you can go directly to "Play Gitterra" workflow and see all the runs. Click on individual run to see the Summary page and download gitterra artifact with a map.

## In GitLab repo

In order to play GitTerra in your GitLab repository using [GitTerra GitLab CI/CD Component](https://gitlab.com/explore/catalog/gitterra/GitTerra), add the following lines to your `.gitlab-ci.yml` file (in the root of the repository):

```yaml
include:
  - component: gitlab.com/gitterra/GitTerra/gitterra@~latest

stages:
  - play GitTerra
```

### Deploy the map to GitLab Pages

If you don't use GitLab Pages hosting for anything else in your repo, it might be the easiest place to put your GitTerra map. You just need to add `GitTerra/pages` component to `.gitlab-ci.yml` file (in the root of the repository). Here's the full pipeline you can use:

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

## Data Access and Privacy

GitTerra code runs in your CI/CD pipeline and doesn't share any of your code or data with creators of the game. It only generates the map and makes it available to you in the pipeline's artifacts.

You can download the map and store it wherever you want. Keep in mind that if you publish the map to GitHub or GitLab pages, those are public websites and anyone with the link can access the map, however we strive to make sure that no sensitive data is included in the map.

Let us know if you see any leaking of private information in the map and we'll do our best to fix it and give you control over how much you want to share.

### Analytics and Data Collection

We currently don't have any code that sends any analytics back to us. We don't collect any data about your code or your repository. We don't track your usage of the game.

Game resources, like UI graphics and game tile images for default tile sets are served from our static site on a CDN, but we don't collect any data about who accesses those resources.

#### Future Plans

We are planning to add some analytics in the future to understand how the game is used and how we can improve it, but we'll make sure to only send anonimized data and give you an option to opt-in or opt-out.

Our plan is to only collect data for public repositories by default and allow you to opt-in for private repositories or opt-out completely. By default, when we will collect the data, we will generate a unique repository identifier that will not contain any information that can be used to identify the repository or the owner. We will only collect the information on when the map was generated and basics statistics about the map, similarly to the data shared in the map itself.

The code for data collection will be open source like the rest of the project and you will be able to see what data we collect and how we use it.

## Licenses

GitTerra is an open source project by Sergey and Alexander Chernyshev of Chernyshev DEV. It is licensed under the [MIT License](LICENSE.md).

We also use [SCC](https://github.com/boyter/scc), a code analysis software by Ben Boyter to help us get data about your code to build the map. SCC is licensed under the [MIT License](LICENSE.scc.md).

We also use language color info from GitHub [linguist](https://github.com/github-linguist/linguist) project, which is licensed under the [MIT License](LICENSE.linguist.md).

## More Maps

Here are a few maps of some interesting repositories:

- [React](https://gitterragame.github.io/sample-repo-huge-and-old-react/) (fork)
- [Inkscape](https://gitterra.gitlab.io/large-and-old/) (fork)

## Maintenance

### Publishing a new version

- Update the version in `package.json`
- Create a tag with the new version, e.g. 'v1.2.3'
- Push the tag to both GitHub and GitLab repositories by running a command like `git push all v1.2.3` (if you have a remote named `all` that points to both GitHub and GitLab repositories) or `git push github v1.2.3 && git push gitlab v1.2.3` if you have separate remotes for GitHub and GitLab
- Manually [create a new release on GitHub](https://github.com/GitTerraGame/Play-GitTerra-Action/releases) with the same tag name and add release notes. No additional steps needed for GitLab as it will automatically create a release based on the tag
