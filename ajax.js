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
    });
  return ch;
}

csp.go(function* () {
  console.log('starting...');
  const result = yield csp.go(function* () {
    return yield csp.take(ajax(github));
  });
  console.log(`response: ${result}`);
});
