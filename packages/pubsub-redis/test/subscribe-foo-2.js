const redisCnn = require('./redis-host');
const pubsub = require('../src/pubsub-redis')(redisCnn);

const listener = (msg) => {
  console.log('[Subscribe1] Received message: ' + msg.data);
};

pubsub.on('foo', listener);
