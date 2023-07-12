---
title: LINE
---

# LINE

<p align="center">
    <img src="../img/channels/line-splash.png" alt="Studio Flow Overall" />
</p>

# Required Variables

1. `LINE_STUDIO_FLOW_SID` ([Guide](../getting-started/create-studio-flow))
1. `LINE_CHANNEL_ID`
1. `LINE_CHANNEL_SECRET`
1. `LINE_CHANNEL_ACCESS_TOKEN`

## Setup

1. Login to [LINE Developer Console](https://developers.line.biz/console/)
1. Create a `Provider` if you do not have any existing `Provider`
1. Within the created `Provider`, Create a `LINE - Messaging API Channel`.
1. Under `Channels > YOUR_CREATED_CHANNEL > Messaging API > LINE Official Account features`, **disable** `Auto-reply messages` and `Greeting messages`
1. Obtain the value for `LINE_CHANNEL_ID` which is under `Basic Settings`
   - ![LINE Channel ID](/img/channels/line-channel-id.png)
1. Obtain the value for `LINE_CHANNEL_SECRET` which is under `Basic Settings`
   - ![LINE Channel Secret](/img/channels/line-channel-secret.png)
1. Obtain the value for `LINE_CHANNEL_ACCESS_TOKEN` which is under `Messaging API`
   - ![LINE Channel Access Token](/img/channels/line-channel-access-token.png)

:::info

Ensure that you have obtained **all** the necessary values for the variables stated in `Required Variables`

:::

## Configure Incoming Webhook

1. Ensure you have deployed Conversations Adapters into your Twilio Flex account
1. Ensure you are logged into [LINE Developer Console](https://developers.line.biz/console/)
1. Within your created `LINE - Messaging API Channel`, click on `Messaging API`
1. Under `Webhook settings`, click `Edit` and insert your deployed incoming webhook
   - The Conversations Adapters incoming webhook URL should be in the format of `https://twilio-flex-conversations-adapters-<RANDOMNUMBER>-dev.twil.io/api/line/incoming`
   - ![LINE Webhook](/img/channels/line-webhook.png)
