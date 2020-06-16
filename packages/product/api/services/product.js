'use strict';

const db = require('../db/db-manager')();
db.startDatabaseConnection();

db.onDbConnected(async () => {
  const productDS = db.getProductDataService();
  const productCount = await productDS.countDocuments({});
  if (productCount === 0) {
    const sampleProducts = require('./sample-product.json');
    const result = await productDS.insertMany(sampleProducts);
    db.getLogger().info('Created sample product data: ' +JSON.stringify(result));
  }
});

module.exports = {

  /**
   * This function is responsible for searching of products from database and saving search query from customer
   * for internally data analytic.
   *
   * @param query     {Object}
   *
   * @return {Promise<void>}
   */
  ds_SearchProducts: async (query) => {


  },

  ds_ListProducts: async (query) => {
    const productDS = db.getProductDataService();
    return productDS.find({}, '', {lean: true});
  }

};
