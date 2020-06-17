#!/usr/bin/env bash

#lerna clean
#lerna bootstrap

echo ""
echo "Starting PRODUCT ANALYTIC service!"
echo ""
(cd packages/product-analytic/ && node app.js)
