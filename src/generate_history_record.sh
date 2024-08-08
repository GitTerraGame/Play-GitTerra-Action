#!/bin/bash

FOLDER=$1
HASH=$2
DATE=$3
OUTPUT=$FOLDER/$DATE.json

if [ -e $OUTPUT ]; then
    echo "File $OUTPUT already exists. Skipping."
    exit 0
fi

echo "Generating history for $DATE with hash $HASH"
git checkout --quiet $HASH
scc --format=json > $OUTPUT