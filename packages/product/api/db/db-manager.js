'use strict';

const mongoose = require('mongoose');
const DB_NAME_DEFAULT = 'productdb';
const logger = require('@icommerce/logger')('product');

/**
 * The class for managing of the database connection and loading of the product data service.
 */
class DatabaseManager {

  isDbConnected = false;
  productionDataService = null;
  /* For external listener */
  onDbConnectedCb;

  constructor() {
    this.logger = logger;
  }

  getLogger() {
    return this.logger;
  }

  onDbConnected(callback) {
    if (this.isDbConnected) {
      callback(this);
    } else {
      this.onDbConnectedCb = callback;
    }
  }

  /**
   * Get product database data service.
   */
  getProductDataService() {
    if (!this.isDbConnected) {
      throw new Error('Database is not ready!');
    }
    return this.productionDataService;
  }

  /**
   *
   * @return {DatabaseManager}
   */
  startDatabaseConnection() {
    const connUrl = {
      url: `mongodb://${process['env']['DB_HOST'] || 'localhost'}:
        ${process['env']['DB_PORT'] || 27017}/${process['env']['PRODUCT_DB_NAME'] || DB_NAME_DEFAULT}`,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: true,
        ssl: false,
      }
    };

    mongoose.connect(connUrl.url, connUrl.options);
    const db = mongoose.connection;

    db.on('error', (err) => {
      logger.info('Database connection error', err);
      this.isDbConnected = false;
    });

    db.once('open', () => {
      logger.info('Database connection opened.');
      this.isDbConnected = true;
      if (this.onDbConnectedCb) {
        this.onDbConnectedCb(this);
        delete this.onDbConnectedCb;
      }
    });

    const SchemaDef = require('../models/product');
    const Schema = new mongoose.Schema(SchemaDef, {collection: 'products'});
    this.productionDataService = mongoose.model('Product', Schema);
    logger.info('ProductDataService initialized!');
    return this;
  }

}

/**
 * @return {DatabaseManager}
 */
module.exports = function() {
  let instance = process['env']['db-manager'];
  /* singleton */
  if (!instance) {
    instance = new DatabaseManager();
    process['env']['db-manager'] = instance;
  }
  return instance;
}

//UNIT TEST
// const dm = new DatabaseManager();
// dm.startDatabaseConnection();
