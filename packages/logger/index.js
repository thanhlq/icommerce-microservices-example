const winston = require('winston');
const path = require('path');
/* Load .env file for global configurations */
require('dotenv').config();

/* For caching created loggers by name */
const cachedLogger = {};

function createLogger(name) {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: {service: name},
    transports: [
      //
      // - Write all logs with level `error` and below to `error.log`
      // - Write all logs with level `info` and below to `combined.log`
      //
      new winston.transports.File({filename: path.join(process.env.LOG_PATH || __dirname, 'error.log'), level: 'error'}),
      new winston.transports.File({filename: path.join(process.env.LOG_PATH || __dirname, 'combined.log')}),
    ],
  });

  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
  }

  console.log('[OK] Instantiated logger: ' + name);

  return logger;
}

module.exports = (name = 'root', opts = {}) => {
  let logger = cachedLogger[name];
  if (!logger) {
    logger = cachedLogger[name] = createLogger(name);
  }
  return logger;
}
