---
title: Using with Twilio Studio's Widgets
position: 1
---

<p align="center">
    <img src="../img/guides/studio-workaround-viber-flow.png" alt="Studio Viber Flow" />
</p>

## Overview

By default, the functionalities of the `Send Message` and `Send And Wait For Reply` widgets in Twilio Studio are not supported with custom channels. This limitation arises from the absence of invocation for conversation-scoped webhooks when a message is sent from Twilio Studio, a measure taken to prevent excessive invocation of webhooks.

To continue utilizing the `Send Message` and `Send And Wait For Reply` widgets while working with custom channels, we need to leverage the underlying concept that each message sent via these widgets will invoke a Programmable Chat webhook. This remains true even when we are implementing Twilio Conversations / Flex Conversations.

## Solution Instructions

1. Ensure you have Conversations Adapters deployed successfully in your Twilio Flex instance
1. Login to [Twilio Console](https://console.twilio.com/) and select `Explore Products`
1. Select `Chat`
1. Under `Chat Services`, click on `Flex Chat Service`
   - ![Flex Chat Service](/img/guides/studio-workaround-prog-chat.png)
1. Select `Webhooks` from the left-hand side menu bar and scroll down till you see the `Post-Event Webhooks` section
1. Under `Post-Event Webhooks` section
   - CALLBACK URL: `https://twilio-flex-conversations-adapters-<<RANDOM NUMBER>>-dev.twil.io/api/common/studio-workaround`
   - CALLBACK EVENTS: `onMessageSent: Sent a Message` (You will only need this particular event)
   - ![Webhook](/img/guides/studio-workaround-webhook.png)
1. Click on `Save`
1. You are now ready to leverage `Send Message` and `Send And Wait For Reply` widgets in Twilio Studio without any additional modifications!

## Known Limitations

1. There will be a notable latency (~10s) between messages sent by Twilio Studio and receiving at the custom channel's end
