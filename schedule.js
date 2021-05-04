const config = require('./config.json');
const {
  sendToSlack,
  getSlotsForAge,
  fetch,
  watch,
  reauthorize,
} = require('./utils');

function schedule(slot, overrideCount = false) {
  const session = slot.sessions.find(
    (session) => session.available_capacity >= (overrideCount ? 0 : 2)
  );

  let ben_list = config.beneficiary_list;
  for(let m=0; m<ben_list.length && session; m++){
    fetch(config.cowin.schedule, {
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          beneficiaries: [ben_list[m]],
          center_id: slot.center_id,
          dose: 1,
          session_id: session.session_id,
          slot: session.slots[0]
        }),
        method: 'POST'
      })
        .then(res => {console.log('res in booking sec :>> ', res);})
        .catch(err => {
          console.log('err in sec beneficiary id :>> ', err)
        })
    }
}

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
      try {
        // Filter slots by age
        const slotsForAge = getSlotsForAge(response);
        // Log centers
        sendToSlack('centers', slotsForAge);
        if (slotsForAge.length) {
          let slot;

          if (config.covaxin) {
            slot = slotsForAge[0];
          } else {
            slot = slotsForAge.find(
              (slot) => !slot.vaccines.toLowerCase().includes('Covaxin')
            );
          }
          if (!slot) {
            return false;
          }
          // Make API call only if slot in center is available
          return schedule(slot, true);
        } else {
          return false;
        }
      } catch(e) {
        console.log(e)
        console.dir(response);
        return null;;
      }
    })
    .catch((error) => {

      sendToSlack('Script errored while checking slots!', error);

      return true;
    });
}

watch(check);
