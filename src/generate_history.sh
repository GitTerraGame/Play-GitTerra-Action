#!/bin/bash

# Desgination folder
HISTORY_DIR=$1

# Get the current script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GENERATE_RECORD_SCRIPT="$SCRIPT_DIR/generate_history_record.sh"

# Current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

mkdir -p $HISTORY_DIR

git log --pretty=format:"%H %ad" --date=short | awk '!seen[$2]++' | \
    xargs -n2 $GENERATE_RECORD_SCRIPT $HISTORY_DIR

git checkout --quiet $BRANCH