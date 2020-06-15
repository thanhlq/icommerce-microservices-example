'use strict';

const db = require('../db/db-manager')();
db.startDatabaseConnection();

module.exports = {

  /**
   * This function is responsible for searching of products from database and saving search query from customer
   * for internally data analytic.
   *
   * @param query     {Object}
   *
   * @return {Promise<void>}
   */
  searchProducts: async (query) => {


  }

};
