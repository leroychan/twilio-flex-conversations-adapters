---
title: Overview
sidebar_position: 1
---

# Overview

:::info

To enable any of the pre-built channels, you will need to obtain all the respective values under the `Required Variables` column and insert them into `GitHub Environments - Secrets` or your `.env` file.

:::

|           Channel           |                                       Integration Type                                       | Required Variables                                                                                                                     |   Supports Text    |  Supports Images   |   Supports Video   |
| :-------------------------: | :------------------------------------------------------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------- | :----------------: | :----------------: | :----------------: |
| [Google Chat](./googlechat) |        [Google Chat REST API](https://developers.google.com/chat/api/reference/rest)         | `GOOGLECHAT_STUDIO_FLOW_SID` <br /> `GOOGLECHAT_SERVICE_ACCOUNT_KEY_BASE64`                                                            | :white_check_mark: | :white_check_mark: |        :x:         |
|  [Instagram](./instagram)   | [Instagram Messenger API](https://developers.facebook.com/docs/messenger-platform/instagram) | `INSTAGRAM_STUDIO_FLOW_SID` <br /> `INSTAGRAM_APP_SECRET` <br /> `INSTAGRAM_PAGE_ACCESS_TOKEN` <br /> `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` | :white_check_mark: | :white_check_mark: | :white_check_mark: |
|       [LINE](./line)        |      [LINE Messaging API](https://developers.line.biz/en/docs/messaging-api/overview/)       | `LINE_STUDIO_FLOW_SID` <br /> `LINE_CHANNEL_ID` <br /> `LINE_CHANNEL_SECRET` <br /> `LINE_CHANNEL_ACCESS_TOKEN`                        | :white_check_mark: | :white_check_mark: | :white_check_mark: |
|      [Viber](./viber)       |          [Viber REST Bot API](https://developers.viber.com/docs/api/rest-bot-api/)           | `VIBER_STUDIO_FLOW_SID` <br /> `VIBER_AUTH_TOKEN`                                                                                      | :white_check_mark: | :white_check_mark: | :white_check_mark: |
