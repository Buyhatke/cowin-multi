# Get me my goddamn vaccine

This only works if the phone you get OTPs on is an Android phone.

Things you'll need to have before you get this running:

1. [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en)
1. [Google Messages](https://play.google.com/store/apps/details?id=com.google.android.apps.messaging&hl=en_IN&gl=US) as the default SMS app on your phone
1. [Node.js](https://nodejs.org/en/)
1. [Google Chrome](https://chrome.google.com)

## Setup

### Code

1. Clone this repo or download ZIP. If you are downloading the ZIP, extract it.
   ![Clone this repo](https://i.imgur.com/PwaCLAn.png)

### Google Messages

1. Set Google Messages as your default SMS app
1. Log in to https://messages.google.com/web and start getting SMSes on your Google Chrome
1. On your Google Messages Web, open the conversation where you get OTPs from CoWIN. If you don't have any OTPs from CoWIN yet, try logging into CoWIN. When you do open the conversation, the URL looks something like this: https://messages.google.com/web/conversations/617 with the number `617` at the end replaced by something else.

### Tampermonkey

1. While still on the Google Messages conversation page, open Tampermonkey extension and click on "Create a new script..."
   ![Tampermonkey](https://i.imgur.com/WnJDdaN.png)
1. On the Tampermonkey page that just opened, replace the existing code with the one in `tampermonkey.js` file from this repo
1. On line 7 in the code set replace https://messages.google.com/web/conversations/617 URL with the URL of conversation with OTPs in your Google Messages Web. The number "617" would be changed by something else.
1. Refresh Google Messages Web page

### Config

1. Open `config.json` file
1. Set the name as the exact name you have set in CoWIN
1. Set your phone number
1. Set your age
1. Set whether or not you want Covaxin. (true/false)
1. On line 7, set the "search" URL. Watch this video to learn how to get this URL: https://youtu.be/a-nJBLbIdTw

### Node.js

1. Navigate from terminal/command-prompt to the directory with the code
1. Execute `npm i`

### Running the scripts

- If you already have an appointment, execute `node reschedule`
- If you don't already have an appointment, execute `node schedule`

### Next Steps

- You will keep getting OTPs every 15 minutes to log in
- Do not close the Google Messages Web tab. If you use a tab suspender on your browser, whitelist the URL.
- Keep the terminal running.
- If the script fails for some reason, you will stop getting OTPs. Re-run `node reschedule` or `node schedule`.
- You'll get an SMS as soon as your appointment has been scheduled or rescheduled.
- You'll keep seeing an error every 5 seconds. You can ignore the error.
