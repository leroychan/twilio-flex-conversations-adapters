---
title: Google Chat
---

# Google Chat

<p align="center">
    <img src="../img/channels/googlechat-splash.png" alt="Google Chat Splash" />
</p>

# Required Variables

1. `GOOGLECHAT_STUDIO_FLOW_SID` ([Guide](../getting-started/create-studio-flow))
1. `GOOGLECHAT_SERVICE_ACCOUNT_KEY_BASE64`

## Setup

1. Ensure you have the following before proceeding
   - A Google Workspace account with access to Google Chat.
   - A Google Cloud Project ([Guide](https://developers.google.com/workspace/guides/create-project))
1. Login to your [Google Cloud Console](https://console.cloud.google.com/apis/api/chat.googleapis.com/) and Enable Google Chat API
1. Within your `Google Cloud Console > Google Chat API`, click on `Credentials` followed by `+ Create Credentials`
1. Select `Service Account`
1. Follow the on-screen instructions to create the `Service Account` and click `CREATE AND CONTINUE`
   - Service Account Name: `flex-conversations-adapaters`
   - Service Account ID: `<<AUTO FILLED>>`
   - Service Account Description: `Conversations Adapters - Google Chat`
1. Click `DONE`. You can skip the optional steps.
   - ![Service Account](/img/channels/googlechat-service-account.png)
1. After your `Service Account` has been successfully created, click into it and go to `KEYS > ADD KEYS > Create new key`. Select `JSON` for the Key Type and click `CREATE`.
   - The `.json` credentials file will be automatically downloaded to your local computer
1. Open up your terminal / bash client and `cd` to the folder where your `.json` credential files reside and issue the following command
   - ```bash
        cat <<JSON CREDENTIALS FILE NAME>> | base64
     ```
1. Copy the entire output from your terminal / bash client as it will be the value for `GOOGLECHAT_SERVICE_ACCOUNT_KEY_BASE64`
   - ![Base64 Credentials](/img/channels/googlechat-base64-credentials.png)

## Configure Incoming Webhook

1. Ensure you have deployed Conversations Adapters into your Twilio Flex account
1. Ensure you are logged into [Google Cloud Console - Chat API](https://console.cloud.google.com/apis/api/chat.googleapis.com/)
1. Select `Google Chat API > Configuration`
1. Under `App Url`, insert your deployed incoming webhook
   - The Conversations Adapters incoming webhook URL should be in the format of `https://twilio-flex-conversations-adapters-<RANDOMNUMBER>-dev.twil.io/api/googlechat/incoming`
   - ![Google Chat Webhook](/img/channels/googlechat-set-webhook.png)
1. To make the Google Chat App visible, add the email addresses of people/group under the `Visibility` section
   - ![Google Chat Visibility](/img/channels/googlechat-visibility.png)

## Known Limitations

- Google's Service Account Authentication for Google Chat API does not support Media Upload (i.e. Video). Read [here](https://developers.google.com/chat/api/guides/auth#asynchronous-chat-calls) for more information
