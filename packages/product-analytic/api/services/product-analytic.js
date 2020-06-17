'use strict';

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

const db = require('../db/db-manager')();
const logger = require('@icommerce/logger')('product-analytic');
const pubsub = require('@icommerce/pubsub-redis')();
const _ = require('lodash');

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

db.startDatabaseConnection();
const PRODUCT_SEARCH_EVENT = 'product:search';

class ProductAnalyticService {
  
  constructor() {
    pubsub.on(PRODUCT_SEARCH_EVENT, async (event) => {
      const productDS = db.getProductAnalyticDataService();
      const productSearch = event.data;
      if (_.isObject(productSearch) && !_.isEmpty(productSearch)) {
        try {
          delete productSearch._id;
          /* TODO: to improve, only get allowed field to store */
          await productDS.create(productSearch);
          logger.debug('Saved customer analytic search: ' + JSON.stringify(productSearch));
        } catch (e) {
          logger.error('Error when saving customer searching dta');
          logger.error(e);
        }
      }
    });
  }

  /**
   * List products.
   *
   * @param params
   * @return {Promise<*>}
   */
  async ds_GetProductSearchAnalytic(params = {}) {
    const productDS = db.getProductAnalyticDataService();
    /* i.e. how many times customers search by name, color, etc... */
    const globalAnalyticData = {};
    const name = await productDS.aggregate([
      {
        $group: {
          _id: "$name",
          count: { $sum: 1 }
        }
      },
    ]);

    globalAnalyticData['name'] = {
      count: name.length,
      searchedData: name
    }

    const branch = await productDS.aggregate([
      {
        $group: {
          _id: "$branch",
          count: { $sum: 1 }
        }
      },
    ]);
    globalAnalyticData['branch'] = {
      count: branch.length,
      searchedData: branch
    }

    const color = await productDS.aggregate([
      {
        $group: {
          _id: "$color",
          count: { $sum: 1 }
        }
      },
    ]);
    globalAnalyticData['color'] = {
      count: color.length,
      searchedData: color
    }

    const price = await productDS.aggregate([
      {
        $group: {
          _id: "$price",
          count: { $sum: 1 }
        }
      },
    ]);
    globalAnalyticData['price'] = {
      count: price.length,
      searchedData: price
    }

    const searchText = await productDS.aggregate([
      {
        $group: {
          _id: "$searchText",
          count: { $sum: 1 }
        }
      },
    ]);
    globalAnalyticData['searchText'] = {
      count: searchText.length,
      searchedData: searchText
    }

    return globalAnalyticData;
  }

  async ds_CountCustomerQueries(filter = {}) {
    const productDS = db.getProductAnalyticDataService();
    return await productDS.countDocuments(filter).exec();
  }
}

module.exports = new ProductAnalyticService();
