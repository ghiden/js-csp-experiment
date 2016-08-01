# js-csp experiment

[js-csp](https://github.com/ubolonton/js-csp)

```bash
npm install
```

## Ping Pong Example

```js
var csp = require('js-csp');

function* player(name, table, done) {
  while (true) {
    var ball = yield csp.take(table);
    if (ball === csp.CLOSED) {
      console.log(name + ": table's gone");
      return;
    }
    ball.hits += 1;
    //console.log(`hits: ${ball.hits}`);
    if (name === 'ping') {
      console.log(`${name} ->`);
    } else {
      console.log(`     <- ${name}`);
    }
    if (ball.hits == 10) {
      yield csp.put(done, true);
    }
    yield csp.timeout(300);
    yield csp.put(table, ball);
  }
}

csp.go(function* () {
  var table = csp.chan();
  var done = csp.chan();

  csp.go(player, ["ping", table, done]);
  csp.go(player, ["pong", table, done]);

  yield csp.put(table, {hits: 0});

  yield csp.take(done);
  console.log('game over');

  table.close();
});
```

```bash
npm start
```

## Ajax Example

```js
const axios = require('axios');
const csp = require('js-csp');
const github = 'https://api.github.com/search/repositories?q=angucomplete-alt';

function ajax(url) {
  const ch = csp.chan();
  console.log('sending http get...');
  axios.get(url)
    .then((res) => {
      console.log('  -> received response');
      csp.putAsync(ch, res.data.items.map((r) => r.name));
    })
    .catch((err) => {
      console.error('  -> received error response');
      csp.putAsync(ch, err);
    });
  return ch;
}

csp.go(function* () {
  console.log('starting...');
  const result = yield csp.go(function* () {
    return yield csp.take(ajax(github));
  });
  if (result instanceof Error) {
    console.error('Oops');
    console.error(result);
  } else {
    console.log(`response: ${result}`);
  }
});
```

```bash
npm run ajax
```

## Queue Example

```js
const csp = require('js-csp');

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
```

```bash
npm run queue
```
