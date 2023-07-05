// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";
import { ViberContext, ViberMessageType } from "./viber_types";
import * as Helper from "../../../assets/viber.helper.private";
import * as Util from "../../../assets/common.helper.private";

type IncomingMessageType = {
  Source: string;
  user_id: string;
  Media: string;
  Body: string;
  ChatServiceSid: string;
};
export const handler: ServerlessFunctionSignature<
  ViberContext,
  IncomingMessageType
> = async (context, event, callback: ServerlessCallback) => {
  console.log("event received - /api/viber/outgoing: ", event);

  // Load Libraries
  const { viberSendTextMessage, viberSendMedia } = <typeof Helper>(
    require(Runtime.getAssets()["/viber.helper.js"].path)
  );

  // Load Libraries
  const { twilioGetMediaResource } = <typeof Util>(
    require(Runtime.getAssets()["/common.helper.js"].path)
  );

  // Process Only Agent Messages
  if (event.Source === "SDK") {
    // Parse Type of Messages
    console.log("---Start of Raw Event---");
    console.log(event);
    console.log(`RAW event.user_id: ${event.user_id}`);
    console.log("---End of Raw Event---");
    if (!event.Media) {
      // Agent Message Type: Text
      await viberSendTextMessage(
        context,
        decodeURIComponent(event.user_id),
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
        let mediaType: ViberMessageType;

        switch (media.ContentType) {
          case "image/png":
            mediaType = ViberMessageType.PICTURE;
            break;
          case "image/jpeg":
            mediaType = ViberMessageType.PICTURE;
            break;
          case "image/jpg":
            mediaType = ViberMessageType.PICTURE;
            break;
          case "video/mp4":
            mediaType = ViberMessageType.VIDEO;
            break;
          case "video/mpeg":
            mediaType = ViberMessageType.VIDEO;
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
        // -- Send to Viber
        await viberSendMedia(
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
