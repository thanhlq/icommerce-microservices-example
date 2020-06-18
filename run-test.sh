#!/usr/bin/env bash

# Author: thanhlq at gmail.com

lerna bootstrap

echo ""
echo "Going to execute tests for the PRODUCT service!"
echo ""
(cd packages/product/ && npm test)

#echo ""
#echo "Going to execute tests for the PRODUCT ANALYTIC service!"
#echo ""
#(cd packages/product-analytic/ && npm test)
