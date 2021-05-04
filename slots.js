const config = require('./config.json');
const { sendToSlack, getSlotsForAge, fetch, reauthorize, watch } = require('./utils');

function check() {
  return fetch(config.cowin.search)
    .then((res) => {
      try {
        if (res.status === 401) {
          console.log('Time to reauthorize');

          // Get new auth token
          reauthorize();

          return null;
        }
        return res.json();
      } catch(e) {
        console.dir(res);
        return null;;
      }
    })
    .then((response) => {
      const slotsForAge = getSlotsForAge(response);

      if (slotsForAge.length) {
        const msg = slotsForAge
          .map((s) => `[${s.pin}] ${s.name}. Vaccines: ${s.vaccines}`)
          .join('\n');

        sendToSlack(`Found slots!\n${msg}`);

        return true;
      } else {
        return false;
      }
    })
    .catch((error) => {
      console.error(error);

      sendToSlack('Script errored!', error);

      return true;
    });
}

watch(check);
