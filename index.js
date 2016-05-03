var csp = require('js-csp');

function* player(name, table, done) {
  while (true) {
    var ball = yield csp.take(table);
    if (ball === csp.CLOSED) {
      console.log(name + ": table's gone");
      return;
    }
    ball.hits += 1;
    console.log(name + " " + ball.hits);
    if (ball.hits == 10) {
      yield csp.put(done, true);
    }
    yield csp.timeout(100);
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
  console.log('done');

  table.close();
});
