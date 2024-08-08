#!/bin/bash

SCC=$1
HISTORY_FOLDER=$2
HASH=$3
DATE=$4
OUTPUT=$HISTORY_FOLDER/$DATE.json

if [ -e $OUTPUT ]; then
    echo "File $OUTPUT already exists. Skipping."
    exit 0
fi

echo "Generating history for $DATE with hash $HASH"
git checkout --quiet $HASH
$SCC --format=json > $OUTPUT