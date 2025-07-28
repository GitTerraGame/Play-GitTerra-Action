#!/bin/bash

# config.cjs
echo -n "🛠️ Running config.cjs test... "
(cd config.cjs && ../run-config-test.sh)

# config.js-commonjs
echo -n "🛠️ Running config.js-commonjs test... "
(cd config.js-commonjs && ../run-config-test.sh)

# config.js-esmodule
echo -n "🛠️ Running config.js-esmodule test... "
(cd config.js-esmodule && ../run-config-test.sh)

# config.js-no-package.json
echo -n "🛠️ Running config.js-no-package.json test... "
(cd config.js-no-package.json && ../run-config-test.sh)

# config.mjs-no-package.json
echo -n "🛠️ Running config.mjs-no-package.json test... "
(cd config.mjs-no-package.json && ../run-config-test.sh)

# config.mjs
echo -n "🛠️ Running config.mjs test... "
(cd config.mjs && ../run-config-test.sh)

# main test
echo "🛠️ Running main test..."
rm -f index.html && node ../src/generateMap.js ./ /usr/local/bin/scc && open-cli index.html
