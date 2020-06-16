'use strict';

/* Load .env file for global configurations */
require('dotenv').config();
// const compression = require('compression');
const express = require('express');
const app = express();
const logger = require('@icommerce/logger')('product');

(async () => {
  /* This output should contain the right defined controllers/routes */
  const mvcModel = await loadMvcRoutes();

  /* Binding api routes */
  for (const entry of Object.entries(mvcModel.mvcRoutes)) {
    const routeInfo = entry[1];
    try {
      app[routeInfo.verb](routeInfo.path, routeInfo.fn.bind(routeInfo.controller));
      logger.debug(`[OK] Bound route: ${routeInfo.verb} -> ${routeInfo.path} -> ${routeInfo.actionId}`);
    } catch (e) {
      logger.error('Error when binding route: ' +JSON.stringify(routeInfo), e);
    }
  }

  const PORT = process.env.MICROSERVICE_PORT || 5500;
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
  });
})()

async function loadMvcRoutes() {
  /* Use this utility module for loading of defined routes & controllers */
  const MVCLoader = require('@blueprod/ws-mvc-loader');
  const mvcLoader = new MVCLoader();
  return await mvcLoader.load(__dirname);
}
