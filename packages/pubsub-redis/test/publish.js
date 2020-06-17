const redisCnn = require('./redis-host');
const pubsub = require('../src/pubsub-redis')(redisCnn);

let count = 0;

function publishFoo() {
  const topic = 'foo';
  const message = 'foo message ' +count;
  pubsub.emit(topic, message);
  console.log(`Published message: foo ${topic}/${message}`)
  count++;
}

function publishBar() {
  const topic = 'bar';
  const message = {count: count, message: 'json message "with complex chars!" ' +count};
  pubsub.emit(topic, message);
  console.log(`Published message: ${topic}/${JSON.stringify(message)} to subscribes!`);
  count++;
}

/**
 * Each 1 second send foo message.
 */
setInterval(() => {
  if (count % 2 === 0) {
    publishBar();
  } else {
    publishFoo();
  }
}, 1000);
