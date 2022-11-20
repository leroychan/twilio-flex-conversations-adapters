# Twilio Flex 2.0 - LINE Channel

_Twilio Flex 2.0 - LINE Channel_ is a custom channel connector to enable LINE as an conversation channel within Flex 2.0. It uses Twilio Functions as a middleware between [LINE Messaging API](https://developers.line.biz/en/docs/messaging-api/) and Twilio Flex.

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
