'use strict';

const productService = require('../services/product');

function timeout(ml){
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(ml);
    }, ml)
  });
}

module.exports = {

  create: async (req, res) => {
    const product = req.body;
    res.send(JSON.stringify({
      message: 'Created Product',
      data: product
    }));
  },

  list: async (req, res) => {
    const products = await productService.ds_ListProducts();
    res.send(JSON.stringify({
      message: 'Found Products',
      data: products
    }));
  },

  /**
   * Search product
   *
   * @api POST /product/search (not conflict with /product/:id)
   *
   * @param ctx
   * @return {Promise<void>}
   */
  search: async (ctx) => {
    console.log('invoked product search');
  }

};
