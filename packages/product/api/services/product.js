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
  const productDS = db.getProductDataService();
  const productCount = await productDS.countDocuments({});
  if (productCount === 0) {
    const sampleProducts = require('./sample-product.json');
    const result = await productDS.insertMany(sampleProducts);
    db.getLogger().info('Created sample product data: ' + JSON.stringify(result));
  }
});

const ALLOW_PRODUCT_FILTER_FIELDS = {
  'name': 'name',
  'color': 'color',
  'branch': 'branch',
  'code': 'code',
  'price': 'price',
}

const PRODUCT_SEARCH_EVENT = 'product:search';

class ProductService {

  /**
   * List products.
   *
   * @param params
   * @return {Promise<*>}
   */
  async ds_ListProducts(params = {}) {
    const productDS = db.getProductDataService();
    const filter = {};

    /* copy allowed filter value from user params */
    if (!_.isEmpty(params)) {
      for (let [key, value] of Object.entries(ALLOW_PRODUCT_FILTER_FIELDS)) {
        const val = params[key];
        if (val) {
          /* i.e. name, price,... match filter value */
          /* short query: '/${value}/i' */
          filter[val] = { '$regex': value, '$options': 'i' };
        }
      }

      if (!_.isEmpty(filter)) {
        /* Fire event for other service to save for analytic */
        pubsub.emit(PRODUCT_SEARCH_EVENT, filter);
      }
    }
    const dbQuery = productDS.find(filter, '', {lean: true});
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
}

module.exports = new ProductService();
