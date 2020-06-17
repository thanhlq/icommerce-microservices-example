'use strict';

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

const productService = require('../services/product-analytic');
const logger = require('@icommerce/logger')('product-analytic');
const _ = require('lodash');

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

/**
 * A utility function handling of error.
 *
 * @param req Request object
 * @param res Response object
 * @param ex  Exception
 */
function handleServerError (req, res, ex) {
  logger.error('Server error when serving request');
  if (ex) {
    logger.error(ex);
  }
  res.status(500);
  res.send('We are sorry! but an unexpected server error happened!');
}

function handleResponseData (req, res, data) {
  res.setHeader('Content-Type', 'application/json');
  res.json(data);
}

module.exports = {

  /**
   * Get basic analytic data i.e. statistic of name, price, branch,...
   * @param req
   * @param res
   * @return {Promise<void>}
   */
  getBasic: async (req, res) => {
    try {
      const products = await productService.ds_GetProductSearchAnalytic(req.query);
      handleResponseData(req, res,{
        message: 'Product Analytic Data',
        data: products
      });
    } catch (e) {
      handleServerError(req, res, e);
    }
  },

  count: async (req, res) => {
    try {
      const products = await productService.ds_CountCustomerQueries(req.query || {});
      handleResponseData(req, res, {
        count: products
      });
    } catch (e) {
      handleServerError(req, res, e);
    }
  },

};
