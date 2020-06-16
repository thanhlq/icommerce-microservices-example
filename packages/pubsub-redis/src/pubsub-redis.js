'use strict';

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT ++                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘

const redisClient = require("redis");

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPORT --                                                                 |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE ++                                                        |
// └───────────────────────────────────────────────────────────────────────────┘

const DEFAULT_REDIS_CONNECTION = Object.freeze({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PWD || null
});

// ┌───────────────────────────────────────────────────────────────────────────┐
// | GLOBAL VARIABLE --                                                        |
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// | CLASS DECLARATION ++                                                      |
// └───────────────────────────────────────────────────────────────────────────┘

const PubSubRedis = function (opts = {}) {
  this.topicListeners = {};
  this.subscriber = this.publisher = redisClient.createClient(opts);
  this.subscriber.on('message', (channel, message) => {
    const listener = this.topicListeners[channel];
    listener(message);
  });
};

// ┌───────────────────────────────────────────────────────────────────────────┐
// │  CLASS DECLARATION --                                                     │
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// │ EXPORT ++                                                                 │
// └───────────────────────────────────────────────────────────────────────────┘

module.exports = function (opts = {}) {
  let connection = {
    host: opts.host || process.env.REDIS_HOST || DEFAULT_REDIS_CONNECTION.host,
    port: opts.port || process.env.REDIS_PORT || DEFAULT_REDIS_CONNECTION.port
  };

  if (opts.password) {
    connection.password = opts.password
  }

  return new PubSubRedis(connection);
};

// ┌───────────────────────────────────────────────────────────────────────────┐
// │ EXPORT --                                                                 │
// └───────────────────────────────────────────────────────────────────────────┘


// ┌───────────────────────────────────────────────────────────────────────────┐
// │ IMPLEMENTATION ++                                                         │
// └───────────────────────────────────────────────────────────────────────────┘

/**
 *
 * @param topic
 * @param listener
 * @return {boolean}
 */
PubSubRedis.prototype.on = function (topic, listener) {
  const self = this;

  if (self.topicListeners[topic]) {
    self.unsubscribe(topic);
  }

  self.subscriber.subscribe(topic);
  self.topicListeners[topic] = listener;
};

PubSubRedis.prototype.emit = function (topic, eventData) {
  const self = this;
  let event = {
    topic: topic,
    pid: process.pid,
    data: eventData,
  };

  self.publisher.publish(topic, JSON.stringify(event));
};

PubSubRedis.prototype.unsubscribe = function (topic) {
  const self = this;
  self.subscriber.unsubscribe(topic);
};

// ┌───────────────────────────────────────────────────────────────────────────┐
// | IMPLEMENTATION --                                                         |
// └───────────────────────────────────────────────────────────────────────────┘
