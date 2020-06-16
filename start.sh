#!/usr/bin/env bash

#lerna clean
#lerna bootstrap

echo "Starting product service!"

(cd packages/product/ && node app.js)

