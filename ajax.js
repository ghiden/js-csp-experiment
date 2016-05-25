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
