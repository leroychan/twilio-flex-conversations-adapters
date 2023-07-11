// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

import * as Helper from "./line.helper.private";
import * as Util from "../common/common.helper.private";
import * as LINETypes from "./line_types.private";

// Load Libraries
const { LINEMessageType } = <typeof LINETypes>(
  require(Runtime.getFunctions()["api/line/line_types"].path)
);

// Load Libraries
const { lineSendTextMessage, lineSendMediaMessage } = <typeof Helper>(
  require(Runtime.getFunctions()["api/line/line.helper"].path)
);

// Load Libraries
const { twilioGetMediaResource } = <typeof Util>(
  require(Runtime.getFunctions()["api/common/common.helper"].path)
);

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
};

export const handler: ServerlessFunctionSignature<
  LINETypes.LINEContext,
  IncomingMessageType
> = async (context, event, callback: ServerlessCallback) => {
  console.log("event received - /api/line/outgoing: ", event);

  // Process Only Agent Messages
  if (event.Source === "SDK") {
    // Parse Type of Messages
    console.log("---Start of Raw Event---");
    console.log(event);
    console.log(`RAW event.user_id: ${event.user_id}`);
    console.log("---End of Raw Event---");
    if (!event.Media) {
      // Agent Message Type: Text
      await lineSendTextMessage(context, event.user_id, event.Body);
    } else {
      // Agent Message Type: Media
      // -- Handle Multiple Media object(s)
      for (let media of JSON.parse(event.Media)) {
        console.log("---Media Payload---");
        console.log(media);
        console.log(`Media SID: ${media.Sid}`);
        console.log(`Chat Service SID: ${event.ChatServiceSid}`);
        // -- Obtain Media Type
        let mediaType: LINETypes.LINEMessageType;

        switch (media.ContentType) {
          case "image/png":
            mediaType = LINEMessageType.IMAGE;
            break;
          case "image/jpeg":
            mediaType = LINEMessageType.IMAGE;
            break;
          case "image/jpg":
            mediaType = LINEMessageType.IMAGE;
            break;
          case "video/mp4":
            mediaType = LINEMessageType.VIDEO;
            break;
          case "video/mpeg":
            mediaType = LINEMessageType.VIDEO;
            break;
          default:
            return callback("File type is not supported");
        }

        // -- Retrieve Temporary URL (Public) of Twilio Media Resource
        const mediaResource = await twilioGetMediaResource(
          { accountSid: context.ACCOUNT_SID, authToken: context.AUTH_TOKEN },
          event.ChatServiceSid,
          media.Sid
        );
        if (
          !mediaResource ||
          !mediaResource.links ||
          !mediaResource.links.content_direct_temporary
        ) {
          return callback("Unable to get temporary URL for image");
        }
        // -- Send to LINE
        await lineSendMediaMessage(
          context,
          event.user_id,
          mediaType,
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
