---
title: Instagram
---

# Instagram

<p align="center">
    <img src="../img/channels/instagram-splash.png" alt="Instagram Splash" />
</p>

:::info

If your Meta developer app is in `Development` mode and NOT `Live` mode, you will need to add your testing instagram account (i.e. the account that you are using to send messages into Instagram Business Account) into [Meta Apps](https://developers.facebook.com/docs/development/build-and-test/app-roles/)

:::

# Required Variables

1. `INSTAGRAM_STUDIO_FLOW_SID` ([Guide](../getting-started/create-studio-flow))
1. `INSTAGRAM_APP_SECRET`
1. `INSTAGRAM_PAGE_ACCESS_TOKEN`
1. `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`

## Setup

1. Ensure you have the following before proceeding
   - An Instagram Professional account ([Guide](https://help.instagram.com/502981923235522))
   - A Facebook Page connected to that account ([Guide](https://www.facebook.com/business/help/connect-instagram-to-page))
   - A Facebook Developer account that can perform Tasks with atleast "Moderate" level access on that Page ([Guide](https://developers.facebook.com/docs/development/register/))
   - A registered Facebook App with Basic settings configured ([Guide](https://developers.facebook.com/docs/development/create-an-app/))
1. Login to [Meta Developer Console](https://developers.facebook.com/apps/)
1. Select your Meta developer app that is managing your Facebook Page
1. Under `Add products to your app`, click `Set up` for `Messenger`
1. Obtain the value for `INSTAGRAM_APP_SECRET` which is under `Settings > Basic`
   - ![Instagram App Secret](/img/channels/instagram-app-secret.png)
1. Obtain the value for `INSTAGRAM_PAGE_ACCESS_TOKEN` which is under `Messenger > Instagram Settings > Access Token`. Click the `Generate token` button.
   - ![Instagram Page Access Token](/img/channels/instagram-page-access-token.png)
1. Obtain the value for `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` which is under `Messenger > Instagram Settings > Webhooks`. The verify token is a self-inserted value and can be any freeform text.
   - ![Instagram Webhook Verify Token](/img/channels/instagram-webhook-verify-token.png)

:::info

Ensure that you have obtained **all** the necessary values for the variables stated in `Required Variables`

:::

## Configure Incoming Webhook

1. Ensure you have deployed Conversations Adapters into your Twilio Flex account
1. Ensure you are logged into [Meta Developer Console](https://developers.facebook.com/apps/)
1. Select your Meta developer app
1. Under `Messenger > Instagram Settings`, insert your deployed incoming webhook. For the `Verify token`, insert any random string that you wish. You will need the value of `Verify token` as you will need to insert them into `GitHub Environments - Secrets` or your `.env` file.
   - For Subscriptions, you only need `messages`.
   - The Conversations Adapters incoming webhook URL should be in the format of `https://twilio-flex-conversations-adapters-<RANDOMNUMBER>-dev.twil.io/api/instagram/incoming`
   - ![Instagram Webhook](/img/channels/instagram-set-webhook.png)
