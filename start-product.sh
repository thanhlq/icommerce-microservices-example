#!/usr/bin/env bash

#lerna clean
lerna bootstrap

echo ""
echo "Starting PRODUCT service!"
echo ""
(cd packages/product/ && node app.js)
