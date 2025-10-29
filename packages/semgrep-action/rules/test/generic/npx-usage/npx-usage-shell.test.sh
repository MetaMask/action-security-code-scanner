#!/bin/bash

# Test direct npx usage - should be flagged
# ruleid: npx-usage-shell
npx eslint src/

# ruleid: npx-usage-shell
echo "hello world" && npx eslint src/

# ruleid: npx-usage-shell
npx create-react-app my-app

# ruleid: npx-usage-shell
npx @typescript-eslint/parser

# ruleid: npx-usage-shell
npx prettier@2.8.0 --write .

# ruleid: npx-usage-shell
npx --yes create-next-app

# Test good alternatives - should not be flagged
# ok: npx-usage-shell
yarn eslint src/

# ok: npx-usage-shell
yarn dlx create-react-app my-app

# ok: npx-usage-shell
npm run build

# ok: npx-usage-shell
yarn create next-app

# ok: npx-usage-shell
yarn prettier --write .
