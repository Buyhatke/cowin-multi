const fs = require('fs');
const fetch = require('node-fetch');
const childProcess = require('child_process');

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

function getConfig() {
  const json = fs.readFileSync('./config.json');

  return JSON.parse(json);
}

function sendToSlack(message, ...otherParams) {
  const config = getConfig();

  if (config.verbose || !config.webhook) {
    console.log(message);
    console.dir(otherParams);
  }

  if (config.webhook) {
    return fetch(config.webhook, {
      body: JSON.stringify({
        text: message,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  }
  return;
}

function uniq(arr) {
  const s = new Set(arr);
  return Array.from(s);
}

function getSlotsForAge(res) {
  const config = getConfig();

  let centers = [];

  // console.log("Res here ", JSON.stringify(res));

  if(res==null){
    return [];
  }

  if (!('centers' in res)) {
    return centers;
  }

  centers = res.centers.filter((centre) => {
    return centre.sessions.some(
      (session) =>
        session.min_age_limit <= config.age && session.available_capacity > 2
    );
  });

  return centers.map((c) => {
    return {
      ...c,
      pin: c.pincode,
      vaccines:
        uniq(c.sessions.map((s) => s.vaccine).filter(Boolean)).join(' ') ||
        'Not specified',
    };
  });
}

function _fetch(url, opts = {}) {
  const config = getConfig();
  const { headers = {}, ...restOpts } = opts;

  return fetch(url, {
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9',
      authorization: config.auth,
      'cache-control': 'no-cache',
      pragma: 'no-cache',
      'sec-ch-ua':
        '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
      'sec-ch-ua-mobile': '?0',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36',
      ...headers,
    },
    referrer: 'https://selfregistration.cowin.gov.in/',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: null,
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    ...restOpts,
  });
}

async function watch(fn) {
  const config = getConfig();

  while (true) {
    const d = new Date();

    console.log('Checking at', d.toLocaleTimeString());
    const changed = await fn();

    if (changed) {
      break;
    }

    // sleep
    await sleep(config.sleep);
  }
}

function reauthorize() {
  childProcess.execFileSync('node', ['get-token']);
}

module.exports = {
  sleep,
  sendToSlack,
  getSlotsForAge,
  fetch: _fetch,
  watch,
  reauthorize,
};
