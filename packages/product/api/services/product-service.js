'use strict';

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

const db = require('../db/db-manager')();
const _ = require('lodash');
/* config connection in .env */
const pubsub = require('@icommerce/pubsub-redis')();

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

db.startDatabaseConnection();

/* Listen to create sample products */
db.onDbConnected(async () => {
  if (process.env.CREATE_SAMPLE_PRODUCTS === 'true') {
    const productDS = db.getProductDataService();
    const productCount = await productDS.countDocuments({});
    if (productCount === 0) {
      const sampleProducts = require('./sample-product.json');
      const result = await productDS.insertMany(sampleProducts);
      db.getLogger().info('Created sample product data: ' + JSON.stringify(result));
    }
  }

});

const ALLOW_PRODUCT_FILTER_FIELDS = Object.freeze({
  'name': 'string',
  'color': 'string',
  'branch': 'string',
  'code': 'string',
  'price': 'number',
});

/* user vs db comparable operators */
const SUPPORTED_USER_COMPARE_OPERATOR = Object.freeze({
  // 'eq': '$eq',
  'gt': '$gt',
  'gte': '$gte',
  // 'in': '$in',
  'lt': '$lt',
  'lte': '$lte',
  // 'ne': '$ne',
  // 'nin': '$nin',
});

const PRODUCT_SEARCH_EVENT = 'product:search';

class ProductService {

  buildProductDataFilter(params) {
    const dbFilter = {};
    const analyticData = {};

    /* copy allowed filter value from user params */
    if (!_.isEmpty(params)) {
      for (let entry of Object.entries(ALLOW_PRODUCT_FILTER_FIELDS)) {
        const fieldName = entry[0];
        const fieldType = entry[1];
        let val = params[fieldName];
        if (val !== undefined && val !== null) {
          analyticData[fieldName] = val;
          if (fieldType === 'string') {
            /* i.e. name, price,... match filter value */
            /* short query: '/${value}/i' */
            dbFilter[fieldName] = { '$regex': val, '$options': 'i' };
          } else if (fieldType === 'number') {
            val = val.split(':');
            /* ?price=gt:1000 (greater than 1000) */
            if (val.length >= 2 && SUPPORTED_USER_COMPARE_OPERATOR[val[0]]) {
              const operator = SUPPORTED_USER_COMPARE_OPERATOR[val[0]];
                try {
                  dbFilter[fieldName] = {};
                  dbFilter[fieldName][operator] = val[1];
                } catch (e) { /* bad request */
                  throw e;
                }
            }
            /* ?price=gt:1000:lt:3000 (greater than 1000 and less than 3000) */
            if (val.length >= 4 && SUPPORTED_USER_COMPARE_OPERATOR[val[2]]) {
              const operator = SUPPORTED_USER_COMPARE_OPERATOR[val[2]];
              try {
                dbFilter[fieldName] = {};
                dbFilter[fieldName][operator] = val[3];
              } catch (e) { /* bad request */
                return false;
              }
            }
          } else {
            /* to support more type */
          }
        }
      }
    }

    return {
      dbFilter,
      analyticData,
    }
  }

  /**
   * List products.
   *
   * @param params
   * @return {Promise<*>}
   */
  async ds_ListProducts(params = {}) {
    const productDS = db.getProductDataService();
    const {dbFilter, analyticData} = this.buildProductDataFilter(params);

    if (!_.isEmpty(analyticData)) {
      /* Fire event for other service to save for analytic */
      pubsub.emit(PRODUCT_SEARCH_EVENT, analyticData);
    }

    const dbQuery = productDS.find(dbFilter, '', {lean: true});
    this.internalDetectSort(dbQuery, params);
    return await dbQuery.exec();
  }

  /**
   * This function is responsible for searching of products from database (text search).
   *
   * and also  saving search query from customer for internally data analytic.
   *
   * @param params        {Object}
   * @param [params.q]    {String} optional text to search
   * @return {Promise<void>}
   */
  async ds_SearchProducts(params) {
    const productDS = db.getProductDataService();
    const searchText = params.q;

    if (searchText) {
      /* Fire event for other service to save for analytic */
      pubsub.emit(PRODUCT_SEARCH_EVENT, {searchText});
    }

    const dbQuery = productDS
      .find(params.q ? {$text: {$search: params.q}} : {},
        null,
        {lean: true}
      );
    this.internalDetectSort(dbQuery, params);
    return await dbQuery.exec();
  }

  /**
   * The utility function to detect sort, filter from parameters.
   *
   * @param dbQuery
   * @param params
   * @param params.sort {string} the fields, example of sort keys: ?sort=name:asc,price:desc?branch
   */
  internalDetectSort(dbQuery, params) {
    const sortKeys = params.sort;
    if (!sortKeys) {
      return dbQuery;
    }
    const sortOption = {};
    const keys = sortKeys.split(',');
    for (let i = 0; i < keys.length; i++) {
      const tmpFields = keys[i].split(':');
      sortOption[tmpFields[0]] = tmpFields.length > 1 ? (tmpFields[1] === 'desc' ? -1 : 1) : 1; // 1 ~ asc
    }
    dbQuery.sort(sortOption);
    return dbQuery;
  }

  async ds_CountProducts(filter = {}) {
    const productDS = db.getProductDataService();
    return await productDS.countDocuments(filter).exec();
  }

  async ds_CreateProduct(product) {
    const productDS = db.getProductDataService();
    return await productDS.create(product);
  }

  async ds_GetProductDetail(id) {
    const productDS = db.getProductDataService();
    const product = await productDS.findOne({_id: id}, '', {lean: true}).exec();
    if (product) {
      pubsub.emit(PRODUCT_SEARCH_EVENT, product);
    }
    return product;
  }

  async ds_GetProductDetailByMyQuery(filter) {
    const productDS = db.getProductDataService();
    return await productDS.findOne(filter, '', {lean: true}).exec();
  }

  async ds_DeleteProduct(id) {
    const productDS = db.getProductDataService();
    return await productDS.deleteOne({_id: id}).exec();
  }

  async ds_UpdateProduct(id, doc) {
    const productDS = db.getProductDataService();
    return await productDS.updateOne({_id: id}, doc).exec();
  }

  /**
   * Testing purpose.
   * @return {Promise<any>}
   */
  async ds_DeleteAllProducts(filter = {}) {
    return await db.getProductDataService().deleteMany(filter).exec();
  }
}

module.exports = new ProductService();
