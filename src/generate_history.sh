#!/bin/bash

# Code directory
FULL_CODE_DIR="$(cd $1 && pwd)"

# Destination folder
mkdir -p $2
FULL_HISTORY_DIR="$(cd $2 && pwd)"

# Get the current script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GENERATE_RECORD_SCRIPT="$SCRIPT_DIR/generate_history_record.sh"

cd $FULL_CODE_DIR

# Current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

git log --pretty=format:"%H %ad" --date=short | awk '!seen[$2]++' | \
    xargs -n2 $GENERATE_RECORD_SCRIPT $FULL_HISTORY_DIR

git checkout --quiet $BRANCH