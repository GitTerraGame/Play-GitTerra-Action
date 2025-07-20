#!/bin/bash
# This script configures git remotes for GitHub, GitLab, and a combined 'all' remote.
set -e

# --- Configuration ---
# IMPORTANT: Please verify these URLs are correct for your repository.
# These are educated guesses based on your project structure.
# You can use either SSH (git@...) or HTTPS (https://...) URLs.
GITHUB_URL="git@github.com:GitTerraGame/Play-GitTerra-Action.git"
GITLAB_URL="git@gitlab.com:gitterra/GitTerra.git"
# --- End Configuration ---

# Function to check if a remote exists
remote_exists() {
    git remote | grep -q "^$1$"
}

# Function to set up or update a remote.
# Arguments:
#   $1: remote_name (e.g., "github")
#   $2: remote_url (e.g., "git@github.com:...")
#   $3: platform_name (e.g., "GitHub")
setup_remote() {
    local remote_name="$1"
    local remote_url="$2"
    local platform_name="$3"

    if remote_exists "$remote_name"; then
        local current_url
        current_url=$(git remote get-url "$remote_name")
        if [ "$current_url" != "$remote_url" ]; then
            echo "⚠️  Remote '$remote_name' points to '$current_url'. Updating to '$remote_url'..."
            git remote set-url "$remote_name" "$remote_url"
            echo "✅ Remote '$remote_name' URL updated."
        else
            echo "✅ Remote '$remote_name' is already correctly configured."
        fi
    else
        echo "➕ Adding remote '$remote_name' for $platform_name..."
        git remote add "$remote_name" "$remote_url"
        echo "✅ Remote '$remote_name' added."
    fi
}

echo "🚀 Starting remote setup..."

# 1. Set up 'github' and 'gitlab' remotes
setup_remote "github" "$GITHUB_URL" "GitHub"
setup_remote "gitlab" "$GITLAB_URL" "GitLab"

# 2. Set up 'all' for pushing to both GitHub and GitLab
# This remote is used by your release.sh script to push to both platforms.
if remote_exists "all"; then
    echo "Re-configuring 'all' remote for consistency..."
    git remote remove all
fi

# The fetch URL for 'all' will point to GitHub.
echo "➕ Adding remote 'all' to pull from our primary remote, GitHub."
git remote add all "$GITHUB_URL"

# Add push URLs for both GitHub and GitLab
echo "➕ Configuring remote 'all' to push to both GitHub and GitLab."
git remote set-url --add --push all "$GITHUB_URL"
git remote set-url --add --push all "$GITLAB_URL"
echo "✅ Remote 'all' configured for dual wield."

echo ""
echo "🎉 All remotes configured successfully! Here is the current setup:"
git remote -v