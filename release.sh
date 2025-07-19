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

# 1. Bump version, commit, and tag
npm version "$BUMP_TYPE" -m "chore(release): v%s"

# 2. Push commit and tags
git push --follow-tags

# 3. Create GitHub release
TAG_NAME=$(git describe --tags --abbrev=0)
echo "Creating GitHub release for tag $TAG_NAME..."
gh release create "$TAG_NAME" --generate-notes

echo "✅ Release complete!"