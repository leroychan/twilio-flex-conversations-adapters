# Twilio Flex 2.0 - LINE Channel

_Twilio Flex 2.0 - LINE Channel_ is a custom channel connector to enable LINE as a conversation channel in Flex 2.0. It uses Twilio Functions as a middleware between [LINE Messaging API](https://developers.line.biz/en/docs/messaging-api/) and Twilio Flex.

![Flex 2.0 - LINE Channel](docs/flex2_line_channel.png)

## Supported Message Types

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

---

## Pre-requisites

1. Twilio Flex Account ([Guide](https://support.twilio.com/hc/en-us/articles/360020442333-Setup-a-Twilio-Flex-Account))
2. Node.js v14.x.x only ([Guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))
3. Twilio CLI v5.2.2 or above ([Guide](https://www.twilio.com/docs/twilio-cli/quickstart))
4. Twilio CLI Serverless Plugin v3.0.4 or above ([Guide](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started))
5. LINE Developer - Messaging API Channel ([Guide](https://developers.line.biz/en/docs/messaging-api/getting-started/#using-console))

---

## Getting Started

### Step 1: Obtain LINE Messaging API Channel Credentials

Login to [LINE Developer Console](https://developers.line.biz/console/) and create a `LINE - Messaging API Channel`.

You will need the following before proceeding:

1. LINE Channel ID (Under `Basic Settings`)
2. LINE Channel Secret (Under `Basic Settings`)
3. LINE Channel Access Token (Under `Messaging API`)

### Step 2: Create a Twilio Studio Flow

Login to [Twilio Console](https://console.twilio.com/) and under `Studio`, create a new Studio Flow.

Within the Studio Flow, drag-and-drop the `Send to Flex` widget and configure the `Workflow` and `Task Channel` accordingly. For `Task Channel`, please choose either `Chat` or `Programmable Chat`.

Once created, connect the `Incoming Conversation` trigger to `Send to Flex` widget and click `Publish`.

The Studio Flow should be configured similar to the screenshot below:

![Flex 2.0 - LINE Channel Studo Flow](docs/flex2_studio_flow.png)

You will need the following before proceeding:

1. Studio Flow SID

### Step 3: Deploy LINE Middleware to Twilio Functions

On your terminal, perform the following:

```
// Clone Project
git clone https://github.com/leroychan/twilio-flex-conversations-line.git

// Change to working directory
cd twilio-flex-conversations-line

// Install NPM Packages
npm install

// Copy sample enviroment file
cp .env.example .env
```

Configure the `.env` file using your preferred code editor with all the required values obtained from Step 1 and 2. You can leave `ACCOUNT_SID=xxx` and `AUTH_TOKEN=xxx` empty as it will be populated by default during run time.

Once configured and you are ready to deploy it, go back to your terminal and issue the following command:

```
twilio serverless:deploy
```

### Step 4: Configure LINE Messaging API's Webhook

After you have successfully deployed the Twilio Function, copy the the entire API path of `/incoming` and head to [LINE Developer Console](https://developers.line.biz/console/) to configure the webhook setting. You can find the webhook setting under `LINE Developer Console > Channel > Messaging API`.

![Flex 2.0 - Webhook](docs/flex2_webhook.png)

### Step 5: Done !

Congratulations! You are now ready to start testing the LINE integration into Flex 2.0!

Start by logging onto your Flex’s agent interface and try sending a message to your LINE channel. You should see the task coming into Flex!

---

## License

MIT
