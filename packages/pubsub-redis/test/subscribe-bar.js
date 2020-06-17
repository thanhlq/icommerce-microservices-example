const redisCnn = require('./redis-host');
const pubsub = require('../src/pubsub-redis')(redisCnn);

const listener = (event) => {
  console.log('[SubscribeBar] Received json message:');
  console.log(event);
};

pubsub.on('bar', listener);
