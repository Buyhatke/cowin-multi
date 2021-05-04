const config = require('./config.json');
const {
  sendToSlack,
  getSlotsForAge,
  fetch,
  watch,
  reauthorize,
} = require('./utils');

function reschedule(slot, overrideCount = false) {
  const session = slot.sessions.find(
    (session) => session.available_capacity >= (overrideCount ? 0 : 2)
  );

  let app_list = config.appointment_list;
  for(let m=0; m<app_list.length && session; m++){
    fetch(config.cowin.reschedule, {
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          appointment_id: app_list[m],
          session_id: session.session_id,
          slot: session.slots[0],
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
    .then((res) => res.json())
    .then((response) => {
      return reschedule(response.centers[0], true).then(() => {
        const slotsForAge = getSlotsForAge(response);

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

          return reschedule(slot);
        } else {
          return false;
        }
      });
    })
    .catch((error) => {
      console.error(error);

      sendToSlack('Script errored!', error);

      return true;
    });
}

watch(check);
