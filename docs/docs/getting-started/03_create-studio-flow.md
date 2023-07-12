---
title: Create Studio Flow
position: 3
---

# Create Studio Flow

<p align="center">
    <img src="../img/getting-started/studio-flow-overall.png" alt="Studio Flow Overall" />
</p>

## Overview

- The main purpose of the Studio Flow is to route the incoming conversations from custom channels into Twilio Flex
- It is recommended to create 1 Studio Flow per custom channel.

## Instructions

1. Login to [Twilio Console](https://console.twilio.com/) and under `Studio`, click the button `Create new Flow` on the top right corner.
1. For `Flow Name`, input a friendly and yet descriptive name (i.e. `Flex - LINE Flow`, `Flex - Viber Flow`)
1. For `Template`, select `Start from Scratch`
1. Within the Studio Flow, drag-and-drop the `Send to Flex` widget into the canvas.
1. Configure the `Workflow` of `Send to Flex` widget to any chosen TaskRouter workflow. You can choose the default `Assign to Anyone` workflow.
1. Configure `Task Channel` of `Send to Flex` widget. Select either `Chat` or `Programmable Chat` for this option.
1. Connect the `Incoming Conversation` trigger to `Send to Flex` widget and click `Publish`. Do remember to click `Publish` otherwise the Studio Flow will not be activated.
1. The resultant Studio Flow should look similar to the image above.
1. Take note of the Flow SID which starts with `FWxxxx`
   - To obtain the Flow SID, click the back arrow button on the left-hand side menubar. The Flow SID will be displayed under your Flow name

:::info

It is recommended to create **1 Studio Flow per custom channel**. Take note of each of the Flow SID(s) that you have created as it will be required to inserted as environment variable(s).

:::

## Known Limitations

- `Send Message` Widget and `Send and wait for reply` Widget does not work with custom channels
