#!/bin/bash

# Run gitterra with empty configuration
echo "[]" >gitterra-stats.json
output=$(node ../../src/generateMap.js ./ echo)

# Print the output for inspection during the test run
# echo "$output"

# Delete empty output files - they are pretty much useless
rm -f index.html map.png history.json gitterra-stats.json

if echo "$output" | grep -q "7777777"; then
    echo "✅ Success: Configuration script was loaded successfully"
else
    echo "❌ Error: Failed loading configuration script" >&2
    exit 1
fi
