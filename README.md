# GitTerra

A git-based game running in CI/CD and played by coding

## Playing the game

Every time you push to your repository, GitTerra will analyze your code and generate the game map.

You can see generated map of your city / code in the pipeline's artifacts - deploy it to a web server of your choice or download to a local machine, it is up to you.

See instructions below on how to play GitTerra on your GitHub or GitLab repositories.

### In GitHub repo

To play GitTerra game on your GitHub repository, create a `.github/workflows/gitterra.yml` file with the following content:

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
```

You can tweak it further to run it on different events or branches.

#### Add a badge to you README

To add a badge at the top of your repo README file, use the following markdown code:

```
[![we play GitTerra](https://github.com/REPO-OWNER/REPO/actions/workflows/gitterra.yml/badge.svg)](https://github.com/REPO-OWNER/REPO/actions/workflows/gitterra.yml)
```

Replace `REPO-OWNER` with your GitHub username and `REPO` with your repository name.

### In GitLab repo

In order to play GitTerra in your GitLab repository, add the following lines to your `.gitlab-ci.yml` file:

```yaml
include:
  - component: gitlab.com/gitterra/GitTerra/gitterra@~latest

stages:
  - play GitTerra
```

## Licenses

GitTerra is an open source project by Sergey and Alexander Chernyshev of Chernyshev DEV. It is licensed under the [MIT License](LICENSE.md).

We also use [SCC](https://github.com/boyter/scc), a code analysis software by Ben Boyter to help us get data about your code to build the map. SCC is licensed under the [MIT License](LICENSE.scc.md).
