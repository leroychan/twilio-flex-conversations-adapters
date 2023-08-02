// Imports global types
import "@twilio-labs/serverless-runtime-types";

// Fetches specific types
import {
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

// Load Libraries
// -- Helper Lib
import * as Util from "./common.helper.private";
const { twilioGetConversation } = <typeof Util>(
  require(Runtime.getFunctions()["api/common/common.helper"].path)
);
// -- Google Chat
import * as GoogleChatHelper from "../googlechat/googlechat.helper.private";
const { googleChatSendTextMessage, getGoogleChatClient } = <
  typeof GoogleChatHelper
>require(Runtime.getFunctions()["api/googlechat/googlechat.helper"].path);
// -- Instagram
import * as InstagramHelper from "../instagram/instagram.helper.private";
const { instagramSendTextMessage } = <typeof InstagramHelper>(
  require(Runtime.getFunctions()["api/instagram/instagram.helper"].path)
);
// -- LINE
import * as LINEHelper from "../line/line.helper.private";
const { lineSendTextMessage } = <typeof LINEHelper>(
  require(Runtime.getFunctions()["api/line/line.helper"].path)
);
// -- Viber
import * as ViberHelper from "../viber/viber.helper.private";
const { viberSendTextMessage } = <typeof ViberHelper>(
  require(Runtime.getFunctions()["api/viber/viber.helper"].path)
);

// Types
export type TwilioChatEnvironmentVariables = {
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  DOMAIN_NAME_OVERRIDE: string;
  GOOGLECHAT_STUDIO_FLOW_SID: string;
  GOOGLECHAT_SERVICE_ACCOUNT_KEY_BASE64: string;
  INSTAGRAM_STUDIO_FLOW_SID: string;
  INSTAGRAM_APP_SECRET: string;
  INSTAGRAM_PAGE_ACCESS_TOKEN: string;
  INSTAGRAM_WEBHOOK_VERIFY_TOKEN: string;
  LINE_STUDIO_FLOW_SID: string;
  LINE_CHANNEL_ID: string;
  LINE_CHANNEL_SECRET: string;
  LINE_CHANNEL_ACCESS_TOKEN: string;
  VIBER_STUDIO_FLOW_SID: string;
  VIBER_AUTH_TOKEN: string;
};

export type TwilioChatWebhookRequest = {
  request: {
    headers: any;
    cookies: any;
  };
  ChannelSid: string;
  RetryCount: string;
  EventType: string;
  InstanceSid: string;
  Attributes: string;
  DateCreated: string;
  Index: string;
  From: string;
  MessageSid: string;
  Body: string;
  AccountSid: string;
  Source: string;
};

export const handler: ServerlessFunctionSignature<
  TwilioChatEnvironmentVariables,
  TwilioChatWebhookRequest
> = async (context, event, callback: ServerlessCallback) => {
  console.log("event received - /api/common/studio-workaround: ", event);
  // Step 0: Get Client
  const client = context.getTwilioClient();
  // Step 1: Check Request
  if (!event.From || !event.MessageSid || !event.Body) {
    callback("Invalid Payload");
  }
  // -- Check if event is a Conversation from Studio
  const conversationsSidRegex = /^CH[A-Za-z0-9]{32}$/;
  const isConversations = conversationsSidRegex.test(event.From);
  if (!isConversations) {
    console.log("Event is not a conversation from Studio. Ignoring..");
    callback(null, {
      success: true,
      message: "event is not a conversation from Studio",
    });
  }
  try {
    const conversationResult = await twilioGetConversation(client, event.From);
    if (!conversationResult) {
      return callback(null, {
        success: true,
        message: "Unable to get Conversation",
      });
    }
    // Obtain Custom Channel Name
    // NOTE: Needs to follow the naming convent: <Custom Channel Name> <Conversation> <User ID>
    const splitFriendlyName = conversationResult.friendlyName.split(" ");
    const adapterName = splitFriendlyName[0].toLowerCase();
    const userId = splitFriendlyName[2];
    switch (adapterName) {
      case "googlechat":
        const googlechatClient = await getGoogleChatClient(context);
        const conversationAttributes = JSON.parse(
          conversationResult.attributes
        );
        const spaceId =
          conversationAttributes["pre_engagement_data"]["spaceName"];
        await googleChatSendTextMessage(googlechatClient, spaceId, event.Body);
        break;
      case "instagram":
        await instagramSendTextMessage(context, userId, event.Body);
        break;
      case "line":
        await lineSendTextMessage(context, userId, event.Body);
        break;
      case "viber":
        const decodedUserId = decodeURIComponent(userId);
        await viberSendTextMessage(context, decodedUserId, event.Body);
        break;
      default:
        return callback(null, {
          success: true,
          message: "Custom Channel Not Supported",
        });
    }
    console.log("Studio Message successfully sent to Custom Channel");
    return callback(null, {
      success: true,
    });
  } catch (err) {
    console.log(err);
    callback("Unable to process request");
  }
};
