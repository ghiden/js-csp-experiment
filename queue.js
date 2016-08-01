var csp = require('js-csp');

function* consumer(queue) {
  var value;
  while (true) {
    value = yield csp.take(queue);
    if (value === csp.CLOSED) {
      console.log("Queue has been closed");
      return;
    }
    console.log('  => process:', value);
    yield csp.timeout(1000);
  }
}

csp.go(function* () {
  var queue = csp.chan();
  var i = 1;

  csp.go(consumer, [queue]);

  for (; i <= 10; i++) {
    csp.putAsync(queue, i);
  }
  console.log('Done pushing 10 tasks');
  console.log('Wait for processing to be done');

  setTimeout(() => {
    console.log('Push 2 more tasks');
    for (; i <= 12; i++) {
      csp.putAsync(queue, i);
    }
  }, 5000);

  setTimeout(() => {
    console.log('Should be done by now, close queue');
    queue.close();
  }, 15000);
});
