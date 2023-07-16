// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

import * as Helper from "./instagram.helper.private";
import * as Util from "../common/common.helper.private";
import * as InstagramTypes from "./instagram_types.private";
import { lineSendMediaMessage } from "../line/line.helper.private";

// Load Libraries
const { InstagramMessageType } = <typeof InstagramTypes>(
  require(Runtime.getFunctions()["api/instagram/instagram_types"].path)
);
const { instagramSendTextMessage, instagramSendMediaMessage } = <typeof Helper>(
  require(Runtime.getFunctions()["api/instagram/instagram.helper"].path)
);

const { twilioGetMediaResource } = <typeof Util>(
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
};

export const handler: ServerlessFunctionSignature<
  InstagramTypes.InstagramContext,
  IncomingMessageType
> = async (context, event, callback: ServerlessCallback) => {
  console.log("event received - /api/instagram/outgoing: ", event);

  // Process Only Agent Messages
  if (event.Source === "SDK") {
    // Parse Type of Messages
    console.log("---Start of Raw Event---");
    console.log(event);
    console.log(`RAW event.user_id: ${event.user_id}`);
    console.log("---End of Raw Event---");
    if (!event.Media) {
      // Agent Message Type: Text
      await instagramSendTextMessage(context, event.user_id, event.Body);
    } else {
      // Agent Message Type: Media
      // -- Handle Multiple Media object(s)
      for (let media of JSON.parse(event.Media)) {
        console.log("---Media Payload---");
        console.log(media);
        console.log(`Media SID: ${media.Sid}`);
        console.log(`Chat Service SID: ${event.ChatServiceSid}`);
        // -- Obtain Media Type
        let mediaType: InstagramTypes.InstagramMessageType;

        switch (media.ContentType) {
          case "image/png":
            mediaType = InstagramMessageType.IMAGE;
            break;
          case "image/jpeg":
            mediaType = InstagramMessageType.IMAGE;
            break;
          case "image/jpg":
            mediaType = InstagramMessageType.IMAGE;
            break;
          case "image/gif":
            mediaType = InstagramMessageType.IMAGE;
            break;
          case "video/mp4":
            mediaType = InstagramMessageType.VIDEO;
            break;
          case "video/ogg":
            mediaType = InstagramMessageType.VIDEO;
            break;
          case "video/x-msvideo":
            mediaType = InstagramMessageType.VIDEO;
            break;
          case "video/quicktime":
            mediaType = InstagramMessageType.VIDEO;
            break;
          case "video/webm":
            mediaType = InstagramMessageType.VIDEO;
            break;
          case "application/vnd.americandynamics.acc":
            mediaType = InstagramMessageType.AUDIO;
            break;
          case "audio/mp4":
            mediaType = InstagramMessageType.AUDIO;
            break;
          case "audio/wav":
            mediaType = InstagramMessageType.AUDIO;
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
        // -- Send to Instagram
        await instagramSendMediaMessage(
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
