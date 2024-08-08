#!/bin/bash

# SCC binary
SCC_BINARY_FULL_NAME="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"

# Code directory
FULL_CODE_DIR="$(cd $2 && pwd)"

# Destination folder
mkdir -p $3
FULL_HISTORY_DIR="$(cd $3 && pwd)"

# Get the current script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GENERATE_RECORD_SCRIPT="$SCRIPT_DIR/generate_history_record.sh"

cd $FULL_CODE_DIR

# Current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

git log --pretty=format:"%H %ad" --date=short | awk '!seen[$2]++' | \
    xargs -n2 $GENERATE_RECORD_SCRIPT "$SCC_BINARY_FULL_NAME" "$FULL_HISTORY_DIR"

git checkout --quiet $BRANCH