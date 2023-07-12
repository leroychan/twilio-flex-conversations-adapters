---
title: Deploy via CLI
position: 2
---

## Pre-requisites

1. Twilio Flex Account ([Guide](https://support.twilio.com/hc/en-us/articles/360020442333-Setup-a-Twilio-Flex-Account))
2. Node.js v16.x.x only ([Guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))
3. Typescript v.5.1.6 or above ([Guide](https://www.typescriptlang.org/download))
4. Twilio CLI v5.8.1 or above ([Guide](https://www.twilio.com/docs/twilio-cli/quickstart))
5. Twilio CLI Serverless Plugin v3.1.3 or above ([Guide](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started))

## Instructions

1. On your computer, open up your preferred terminal and clone this repository

   - ```bash
     // Clone Project
     git clone https://github.com/leroychan/twilio-flex-conversations-adapters.git

     // Change to working directory
     cd twilio-flex-conversations-adapters/serverless-functions

     // Install NPM Packages
     npm install

     // Copy sample enviroment file
     cp .env.example .env
     ```

1. For each custom channel that you would like to enable, it is recommended that you create 1 Studio per custom channel ([Guide](./create-studio-flow)).
   - You will need to have the Studio Flow SID (starting with `FWxxxxxxxxx`) of each custom channel that you would like to enable.
   - For channels that you **do not** want to enable, you **do not** need to create the Studio Flow.
1. For each custom channel that you would like to enable, perform the necessary setup and obtain the required values. The required variables per custom channel can be found in the [Channels Overview page](../channels/overview).
1. Configure the `.env` file using your preferred code editor with all the required values obtained previously. You can leave `ACCOUNT_SID=xxx` and `AUTH_TOKEN=xxx` empty as it will be populated by default during run time. Before you deploy, ensure that `twilio profiles:list` has an active account set.
   - **Required variables per custom channel that you want to enable**
     - **Example**: To enable only LINE, you would need the following variables:
       - `LINE_STUDIO_FLOW_SID=FWxxxx`
       - `LINE_CHANNEL_ID=xxxx`
       - `LINE_CHANNEL_SECRET=xxxx`
       - `LINE_CHANNEL_ACCESS_TOKEN=xxxx`
     - **Example**: To enable both LINE and Viber, you would need the following variables:
       - `LINE_STUDIO_FLOW_SID=FWxxxx`
       - `LINE_CHANNEL_ID=xxxx`
       - `LINE_CHANNEL_SECRET=xxxx`
       - `LINE_CHANNEL_ACCESS_TOKEN=xxxx`
       - `VIBER_STUDIO_FLOW_SID=FWxxxxxx`
       - `VIBER_AUTH_TOKEN=xxxx`
1. Once configured and you are ready to deploy it, go back to your terminal and issue the following
   command:
   - ```bash
     npm run deploy
     ```
1. Within [Twilio Console](https://console.twilio.com/), on the left hand side menu bar, navigate to `Functions and Assets > Services`. Look for `twilio-flex-conversations-adapters` and click on `Service Details`. Under `Environments > Domain`, take note of the domain URL.
   - The domain URL should be in the format of `twilio-flex-conversations-adapters-<RANDOMNUMBER>-dev.twil.io`.
1. We will need the respective custom channels `incoming` webhook URL that is in the format of `https://twilio-flex-conversations-adapters-<RANDOMNUMBER>-dev.twil.io/api/<CHANNEL>/incoming`
   - **Example**:
     - `LINE`: `https://twilio-flex-conversations-adapters-<RANDOMNUMBER>-dev.twil.io/api/line/incoming`
     - `Viber`: `https://twilio-flex-conversations-adapters-<RANDOMNUMBER>-dev.twil.io/api/viber/incoming`
1. Configure each custom channel's webhook setting in their respective consoles with the `incoming` webhook URL in the previous step. Refer to the respective documentation page under `Channels` for exact instructions.
1. You have now completed the setup. Proceed to test the integration by logging into your Flex Agent console and put yourself as `Available`. Send a test message to your custom channnel and it should appear in your Flex Agent console.
1. [_Optional_] In order to have the icons of their respective custom channel displayed in Flex agent interface, you will need to deploy the Converasations Icons Plugin, perform the following on your CLI:
   - ```bash
        cd ..
        cd plugin-conversations-icons
        npm run deploy
        npm run release
     ```
