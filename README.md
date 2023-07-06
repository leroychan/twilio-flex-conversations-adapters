# Twilio Flex 2.0 - Conversation Adapters

_Twilio Flex 2.0 - Conversation Adapters_ is a custom channel framework that allows you to add custom chat-based channel into Twilio Flex.

Current Features:

1. Viber
2. LINE

## Features Matrix

|                            | Viber                         | LINE                                      |
| -------------------------- | ----------------------------- | ----------------------------------------- |
| Text                       | :white_check_mark:            | :white_check_mark:                        |
| Images (.png, .jpeg, .jpg) | :white_check_mark:            | :white_check_mark:                        |
| Videos (.mp4, .mpeg)       | :white_check_mark:            | :white_check_mark:                        |
| Files (.pdf, .txt)         | :negative_squared_cross_mark: | :orange_circle: (User to Flex Agent Only) |
| Emoji                      | :negative_squared_cross_mark: | :negative_squared_cross_mark:             |
| Stickers                   | :negative_squared_cross_mark: | :negative_squared_cross_mark:             |

_Legends:_  
:white_check_mark: Supported
:orange_circle: Partial Support
:negative_squared_cross_mark: Not Supported in this project but can be implemented

---

## Pre-requisites

1. Twilio Flex Account ([Guide](https://support.twilio.com/hc/en-us/articles/360020442333-Setup-a-Twilio-Flex-Account))
2. Node.js v16.x.x only ([Guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))
3. Typescript v.5.1.6 or above ([Guide](https://www.typescriptlang.org/download))
4. Twilio CLI v5.8.1 or above ([Guide](https://www.twilio.com/docs/twilio-cli/quickstart))
5. Twilio CLI Serverless Plugin v3.1.3 or above ([Guide](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started))

---

## Getting Started

### Step 1: Clone Repository

```
// Clone Project
git clone https://github.com/leroychan/twilio-flex-conversations-adapters.git

// Change to working directory
cd twilio-flex-conversations-adapters

// Install NPM Packages
npm install

// Copy sample enviroment file
cp .env.example .env
```

### Step 2: Create Studio Flow

Login to [Twilio Console](https://console.twilio.com/) and under `Studio`, create a new Studio Flow. It is advisable to create 1 Studio Flow per Custom Channel.

Within the Studio Flow, drag-and-drop the `Send to Flex` widget and configure the `Workflow` and `Task Channel` accordingly. For `Task Channel`, please choose either `Chat` or `Programmable Chat`.

Once created, connect the `Incoming Conversation` trigger to `Send to Flex` widget and click `Publish`.

The Studio Flow should be configured similar to the screenshot below:

![Flex 2.0 - LINE Channel Studo Flow](docs/flex2_studio_flow.png)

You will need the following before proceeding:

1. Studio Flow SID(s)

### Step 3: Obtain Messaging Channel Credentials

1. [Viber Setup](#viber-setup)
2. [LINE Setup](#line-setup)

### Step 4: Deploy Conversations Adapaters

Configure the `.env` file using your preferred code editor with all the required values obtained from Step 2 and 3. You can leave `ACCOUNT_SID=xxx` and `AUTH_TOKEN=xxx` empty as it will be populated by default during run time.

Before you deploy, ensure that `twilio profiles:list` has an active account set.

Once configured and you are ready to deploy it, go back to your terminal and issue the following command:

```
npm run deploy
```

---

## Channel: VIBER

_Twilio Flex 2.0 - VIBER Channel_ is a custom channel connector to enable Viber as a conversation channel in Flex 2.x It uses Twilio Functions as a middleware between [Viber API][(https://developers.viber.com/docs/api/rest-bot-api/#get-started](https://developers.viber.com/docs/api/rest-bot-api/#get-started)) and Twilio Flex.

![Flex 2.0 - Viber Bot](docs/flex_viber.png)

### Viber Setup

1. Create Viber developer account - https://developers.viber.com/
2. Create a bot - https://partners.viber.com/account/create-bot-account
3. Complete required fields and copy secure token
4. Put token in `.env` file `VIBER_AUTH_TOKEN`
5. Configure viber webhook

#### Viber Webhook

Once the Twilio serverless function is deployed, obtain the host name and set a POST to Viber, e.g.

Note: Remember to set the `X-Viber-Auth-Token` header to the previously obtained token in step 3

```json
{
  "url": "https://<YOUR_HOST_NAME>.twil.io/api/viber/incoming",
  "event_types": [
    "message",
    "delivered",
    "seen",
    "failed",
    "subscribed",
    "unsubscribed",
    "conversation_started"
  ],
  "send_name": true,
  "send_photo": true
}
```

![Flex 2.0 - Viber Bot](docs/flex2_viber_bot.png)

---

## Channel: LINE

_Twilio Flex 2.0 - LINE Channel_ is a custom channel connector to enable LINE as a conversation channel in Flex 2.0. It uses Twilio Functions as a middleware between [LINE Messaging API](https://developers.line.biz/en/docs/messaging-api/) and Twilio Flex.

![Flex 2.0 - LINE Channel](docs/flex2_line_channel.png)

### Supported Message Types

|                            |      User to Flex Agent       |      Flex Agent to User       |
| -------------------------- | :---------------------------: | :---------------------------: |
| Text                       |      :white_check_mark:       |      :white_check_mark:       |
| Images (.png, .jpeg, .jpg) |      :white_check_mark:       |      :white_check_mark:       |
| Videos (.mp4, .mpeg)       |      :white_check_mark:       |      :white_check_mark:       |
| Files (.pdf, .txt)         |        :no_entry_sign:        |        :no_entry_sign:        |
| Emoji                      | :negative_squared_cross_mark: | :negative_squared_cross_mark: |
| LINE Sticker               | :negative_squared_cross_mark: | :negative_squared_cross_mark: |

_Legends:_  
:white_check_mark: Supported  
:negative_squared_cross_mark: Not Supported in this project but can be implemented  
:no_entry_sign: Not Supported due to limitations on LINE Messaging API

### LINE Setup

Login to [LINE Developer Console](https://developers.line.biz/console/) and create a `LINE - Messaging API Channel`.

You will need the following before proceeding:

1. LINE Channel ID (Under `Basic Settings`)
2. LINE Channel Secret (Under `Basic Settings`)
3. LINE Channel Access Token (Under `Messaging API`)

#### LINE Webhook

After you have successfully deployed the Twilio Function, copy the the entire API path of `/api/line/incoming` and head to [LINE Developer Console](https://developers.line.biz/console/) to configure the webhook setting. You can find the webhook setting under `LINE Developer Console > Channel > Messaging API`.

![Flex 2.0 - Webhook](docs/flex2_webhook.png)

---

## License

MIT
