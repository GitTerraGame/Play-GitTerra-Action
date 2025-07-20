#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -e

# Default to 'patch' if no argument is provided.
BUMP_TYPE=${1:-patch}

if [[ "$BUMP_TYPE" != "patch" && "$BUMP_TYPE" != "minor" && "$BUMP_TYPE" != "major" ]]; then
  echo "Error: Invalid bump type '$BUMP_TYPE'. Please use 'patch', 'minor', or 'major'."
  exit 1
fi

echo "🚀 Starting a '$BUMP_TYPE' release..."

# Prompt for a release title
read -p "Enter a descriptive title for this release (for tag and GitHub release): " RELEASE_TITLE

if [ -z "$RELEASE_TITLE" ]; then
  echo "Error: Release title cannot be empty."
  exit 1
fi

# 1. Bump version in package.json without creating a git tag or commit.
# We do this first so we can abort if there are uncommitted changes.
npm version --no-git-tag-version "$BUMP_TYPE"

# Get the new version from package.json
NEW_VERSION=$(npm pkg get version | tr -d '"')
TAG_NAME="v${NEW_VERSION}"

# 2. Commit the version bump
git add package.json package-lock.json
git commit -m "chore(release): ${TAG_NAME}"

# 3. Create an annotated git tag with the release title
echo "Creating git tag ${TAG_NAME} with title: '${RELEASE_TITLE}'"
git tag -a "${TAG_NAME}" -m "${RELEASE_TITLE}"

# 4. Push commit and tags to all remotes
echo "Pushing new commit and tag to all remotes..."
git push all --follow-tags

# 5. Create GitHub release
echo "Creating GitHub release for tag ${TAG_NAME}..."
gh release create "${TAG_NAME}" --title "${RELEASE_TITLE}" --generate-notes
echo "✅ GitHub release created."

echo "✅ Release complete!"