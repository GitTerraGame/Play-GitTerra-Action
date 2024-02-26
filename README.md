# GitTerra

A git-based game running in CI/CD and played by coding

## Playing the game

In order to play GitTerra, add the following lines to your `.gitlab-ci.yml` file:

```yaml
include:
  - component: gitlab.com/gitterra/GitTerra/gitterra@~latest

stages:
  - play GitTerra
```

Now, every time you push to your repository, GitTerra will analyze your code and generate the game map.

You can see generated map of your city / code in the pipeline's artifacts - deploy it to a web server of your choice or download to a local machine direction from GitLab UI, it is up to you.

## Licenses

GitTerra is an open source project by Sergey and Alexander Chernyshev of Chernyshev DEV. It is licensed under the [MIT License](LICENSE.md).

We also use [SCC](https://github.com/boyter/scc), a code analysis software by Ben Boyter to help us get data about your code to build the map. SCC is licensed under the [MIT License](LICENSE.scc.md).
