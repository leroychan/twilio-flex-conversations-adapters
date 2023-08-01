// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

import * as Helper from "./googlechat.helper.private";
import * as Util from "../common/common.helper.private";
import * as GoogleChatTypes from "./googlechat_types.private";

// Load Libraries
const { GoogleChatMessageType } = <typeof GoogleChatTypes>(
  require(Runtime.getFunctions()["api/googlechat/googlechat_types"].path)
);
const {
  getGoogleChatClient,
  googleChatSendTextMessage,
  googleChatSendMediaMessage,
} = <typeof Helper>(
  require(Runtime.getFunctions()["api/googlechat/googlechat.helper"].path)
);

const { twilioGetMediaResource, twilioGetConversation } = <typeof Util>(
  require(Runtime.getFunctions()["api/common/common.helper"].path)
);

// Type - Flex Request
type IncomingMessageType = {
  request: {
    cookies: object;
    headers: object;
  };
  Source: string;
  user_id: string;
  Media: string;
  Body: string;
  ChatServiceSid: string;
  ConversationSid: string;
};

export const handler: ServerlessFunctionSignature<
  GoogleChatTypes.GoogleChatContext,
  IncomingMessageType
> = async (context, event, callback: ServerlessCallback) => {
  console.log("event received - /api/googlechat/outgoing: ", event);

  // Process Only Agent Messages
  if (event.Source === "SDK") {
    // -- Debug
    console.log("---Start of Raw Event---");
    console.log(event);
    console.log(`RAW event.user_id: ${event.user_id}`);
    console.log("---End of Raw Event---");
    // -- Initialise Google Chat Resoruces
    const chatClient = await getGoogleChatClient(context);
    const conversationResource = await twilioGetConversation(
      context.getTwilioClient(),
      event.ConversationSid
    );
    if (!conversationResource) {
      return callback(null, {
        success: false,
      });
    }
    let preEngagementData: any = {};
    try {
      preEngagementData = JSON.parse(
        conversationResource.attributes
      ).pre_engagement_data;
    } catch (err) {
      return callback(null, {
        success: false,
      });
    }
    const googleChatSpaceName = preEngagementData.spaceName;
    if (!googleChatSpaceName) {
      return callback(null, {
        success: false,
      });
    }
    if (!event.Media) {
      // Agent Message Type: Text
      await googleChatSendTextMessage(
        chatClient,
        googleChatSpaceName,
        event.Body
      );
    } else {
      // Agent Message Type: Media
      // -- Handle Multiple Media object(s)
      for (let media of JSON.parse(event.Media)) {
        console.log("---Media Payload---");
        console.log(media);
        console.log(`Media SID: ${media.Sid}`);
        console.log(`Chat Service SID: ${event.ChatServiceSid}`);
        // -- Obtain Media Type
        let mediaType: GoogleChatTypes.GoogleChatMessageType;

        switch (media.ContentType) {
          case "image/png":
            mediaType = GoogleChatMessageType.IMAGE;
            break;
          case "image/jpeg":
            mediaType = GoogleChatMessageType.IMAGE;
            break;
          case "image/jpg":
            mediaType = GoogleChatMessageType.IMAGE;
            break;
          case "image/gif":
            mediaType = GoogleChatMessageType.IMAGE;
            break;
          default:
            return callback("File type is not supported");
        }

        // // -- Retrieve Temporary URL (Public) of Twilio Media Resource
        const mediaResource = await twilioGetMediaResource(
          { accountSid: context.ACCOUNT_SID, authToken: context.AUTH_TOKEN },
          event.ChatServiceSid,
          media.Sid
        );
        if (!mediaResource?.links?.content_direct_temporary) {
          return callback("Unable to get temporary URL for image");
        }
        // // -- Send to Google Chat
        await googleChatSendMediaMessage(
          chatClient,
          googleChatSpaceName,
          media.Filename,
          mediaResource.links.content_direct_temporary
        );
      }
    }

    return callback(null, {
      success: true,
    });
  } else {
    // Ignoring all end user added messages
    console.log("Outgoing Hook: No Action Needed");
  }

  return callback(null, {
    success: true,
  });
};
