---
title: Viber
---

# Viber

<p align="center">
    <img src="../img/channels/viber-splash.png" alt="Studio Flow Overall" />
</p>

# Required Variables

1. `VIBER_STUDIO_FLOW_SID` ([Guide](../getting-started/create-studio-flow))
1. `VIBER_AUTH_TOKEN`

## Setup

1. Ensure you have installed and created a Viber account on your mobile phone
1. Login to [Viber Admin Panel](https://partners.viber.com/account/create-bot-account)
1. Follow on-screen instructions to create a bot account
1. Obtain the value for `VIBER_AUTH_TOKEN` which is under `Token`
   - ![Viber Token](/img/channels/viber-token.png)

:::info

Ensure that you have obtained **all** the necessary values for the variables stated in `Required Variables`

:::

## Configure Incoming Webhook

1. Ensure you have deployed Conversations Adapters into your Twilio Flex account
1. The Conversations Adapters incoming webhook URL should be in the format of `https://twilio-flex-conversations-adapters-<RANDOMNUMBER>-dev.twil.io/api/viber/incoming`
1. Using [Postman App](https://www.postman.com/downloads/) or cURL, send a request with the following to configure the webhook:
   - URL: `https://chatapi.viber.com/pa/set_webhook`
   - Method: `POST`
   - Headers: `X-Viber-Auth-Token` with the value of `VIBER_AUTH_TOKEN`
   - Body (JSON):
     ```json
     {
       "url": "https://twilio-flex-conversations-adapters-<RANDOMNUMBER>-dev.twil.io/api/viber/incoming",
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

## Known Limitation

- Unable to verify Viber's webhook signature as Twilio Serverless Functions do not support BigInt (`message_token` attribute of the webhook payload)
