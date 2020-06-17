'use strict';

const productService = require('../services/product');
const logger = require('@icommerce/logger')('product');
const _ = require('lodash');

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

  create: async (req, res) => {
    const newProduct = req.body;

    if (!newProduct || !_.isObject(newProduct)) {
      return res.status(400).send('Cannot create product, invalid product data!');
    }

    if (!newProduct.name) {
      return res.status(400).send('Cannot create product, no product name provided!');
    }

    try {
      /* Not handled case sensitive yet */
      const existedProduct = await productService.ds_GetProductDetailByMyQuery({name: newProduct.name});
      if (existedProduct) {
        return res.status(409).send('Existed product with name: ' +newProduct.name); // conflict
      }

      const createdProduct = await productService.ds_CreateProduct(newProduct);
      handleResponseData(req, res,{
        message: 'Created Product',
        data: createdProduct
      });
    } catch (e) {
      handleServerError(req, res, e);
    }
  },

  update: async (req, res) => {
    const productToUpdate = req.body;
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).send('Cannot update product, invalid product id!');
    }

    if (!productToUpdate || !_.isObject(productToUpdate)) {
      return res.status(400).send('Cannot update product, invalid product data!');
    }

    /* remove som un-allowed fields */
    delete productToUpdate._id;

    try {
      /* Not handled case sensitive yet */
      const existedProduct = await productService.ds_GetProductDetailByMyQuery({_id: productId});
      if (!existedProduct) {
        return res.status(404).send('Cannot update product, product is not found!');
      }

      /* Laking of checking conflict name */

      await productService.ds_UpdateProduct(productId, productToUpdate);
      handleResponseData(req, res,{
        message: 'Updated Product',
        data: productToUpdate
      });
    } catch (e) {
      handleServerError(req, res, e);
    }
  },

  list: async (req, res) => {
    try {
      const products = await productService.ds_ListProducts(req.query);
      handleResponseData(req, res,{
        message: 'Found Products',
        data: products
      });
    } catch (e) {
      handleServerError(req, res, e);
    }
  },

  getDetail: async (req, res) => {
    const productId = req.params.id;
    if (!productId) {
      res.status(400);
      return res.send(`Cannot get product detail, id is not provided!`);
    }
    try {
      const product = await productService.ds_GetProductDetail(productId);
      if (product) {
        handleResponseData(req, res,{
          message: 'Found Product Detail',
          data: product
        });
      } else {
        res.send(JSON.stringify({
          message: `Product [id: ${productId}] is not found`,
        }));
      }
    } catch (e) {
      handleServerError(req, res, e);
    }
  },

  delete: async (req, res) => {
    const productId = req.params.id;
    if (!productId) {
      res.status(400);
      return res.send(`Cannot delete product, id is not provided!`);
    }
    try {
      const product = await productService.ds_DeleteProduct(productId);
      if (product && product.n === 1) {
        handleResponseData(req, res,{
          message: `Deleted Product!`,
          data: productId
        });
      } else {
        res.send(JSON.stringify({
          message: `Product [id: ${productId}] is not found`,
        }));
      }
    } catch (e) {
      handleServerError(req, res, e);
    }
  },

  /**
   * Search product
   *
   * @api POST /product/search (not conflict with /product/:id)
   * @param req
   * @param res
   * @return {Promise<*>}
   */
  search: async (req, res) => {
    try {
      const products = await productService.ds_SearchProducts(req.query);
      handleResponseData(req, res,{
        message: 'Found Products',
        data: products
      });
    } catch (e) {
      handleServerError(req, res, e);
    }
  },

  count: async (req, res) => {
    try {
      const products = await productService.ds_CountProducts(req.query || {});
      handleResponseData(req, res, {
        count: products
      });
    } catch (e) {
      handleServerError(req, res, e);
    }
  },

};
