const fs = require('fs');
const puppeteer = require('puppeteer');
const fastify = require('fastify');
const cors = require('fastify-cors');

const selectors = {
  mobileInput: 'input[appmobilenumber=true]',
  getOtp: 'ion-button',
  otpInput: '#mat-input-1',
  verifyOtpButton: 'ion-button',
};

function waitForSms() {
  return new Promise((resolve) => {
    const server = fastify();

    server.register(cors, {
      origin: true,
    });

    server.post('/otp', async (request, response) => {
      const query = new URLSearchParams(request.query);

      if (query.has('otp')) {
        response.send();
        setTimeout(() => {
          server.close();
          resolve(query.get('otp'));
        });
      }
    });

    server.listen(8888);
  });
}

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

(async () => {
  const config = require('./config.json');

  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto('https://selfregistration.cowin.gov.in/');
  await page.waitForSelector(selectors.mobileInput);
  await sleep(2000);
  await page.type(selectors.mobileInput, config.phone);
  await page.click(selectors.getOtp);
  const otp = await waitForSms();

  await page.type(selectors.otpInput, otp);

  page.on('response', async (interceptedResponse) => {
    const request = interceptedResponse.request();

    if (
      request.url().endsWith('/beneficiaries') &&
      request.method() === 'GET'
    ) {
      const headers = request.headers();

      const auth = headers['authorization'];

      console.log(auth);

      const response = await interceptedResponse.json();
      console.log(response);

      config.auth = auth;

      console.log("All bene ", response.beneficiaries);

      let ben_list = [];
      let app_list = [];

      let name_list = config.name_list;
      for(let k=0; k<name_list.length; k++){
         for(let m=0; m<response.beneficiaries.length; m++){
             if(response.beneficiaries[m].name.split(name_list[k]).length > 1){
                  ben_list.push(response.beneficiaries[m].beneficiary_reference_id);
                  if(response.beneficiaries[m].appointments.length){
                    app_list.push(response.beneficiaries[m].appointments[0].appointment_id);
                  }
             }
         }
      }

      config.beneficiary_list = ben_list;
      config.appointment_list = app_list;

      fs.writeFileSync('config.json', JSON.stringify(config, null, 2));

      await browser.close();
    }
  });

  await Promise.all([
    page.waitForNavigation(),
    page.click(selectors.verifyOtpButton),
  ]);

  await sleep(5000);
})();
