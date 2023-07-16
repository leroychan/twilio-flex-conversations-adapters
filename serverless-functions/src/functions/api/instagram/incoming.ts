// Imports global types
import "@twilio-labs/serverless-runtime-types";

// Fetches specific types
import {
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";
import * as InstagramTypes from "./instagram_types.private";
import * as Helper from "./instagram.helper.private";

const { InstagramMessageType } = <typeof InstagramTypes>(
  require(Runtime.getFunctions()["api/instagram/instagram_types"].path)
);
const { wrappedSendToFlex, instagramValidateSignature } = <typeof Helper>(
  require(Runtime.getFunctions()["api/instagram/instagram.helper"].path)
);

export const handler: ServerlessFunctionSignature<
  InstagramTypes.InstagramContext,
  InstagramTypes.InstagramBaseMessage
> = async (context, event, callback: ServerlessCallback) => {
  try {
    console.log("event received - /api/instagram/incoming: ", event);

    // Meta Verification Request
    if (
      event["hub.mode"] &&
      event["hub.challenge"] &&
      event["hub.verify_token"] === context.INSTAGRAM_WEBHOOK_VERIFY_TOKEN
    ) {
      return callback(null, event["hub.challenge"]);
    }

    // Step 1: Verify Meta signature
    const metaSignature = event.request?.headers[
      "x-hub-signature-256"
    ]?.replace("sha256=", "");
    const metaSignatureBody = event;
    metaSignatureBody.request ? delete metaSignatureBody["request"] : null;
    const replaceForwardSlashPayload = JSON.stringify(
      metaSignatureBody
    ).replace(/\//g, "\\/");
    const validSignature = instagramValidateSignature(
      metaSignature,
      replaceForwardSlashPayload,
      context.INSTAGRAM_APP_SECRET
    );
    if (!validSignature) {
      console.log("Invalid Signature");
      return callback("Invalid Signature");
    }
    // Step 2: Process Instagram Message
    if (event.object !== "instagram") {
      console.log("Not an Instagram payload");
      return callback("Invalid Payload");
    }

    // -- Handle multiple entries
    for (const entry of event.entry) {
      if (entry.time && entry.id && entry.messaging) {
        for (const msg of entry.messaging) {
          // Send to Flex
          const userId = msg.sender.id;
          const message = msg.message;
          await wrappedSendToFlex(context, userId, msg);
        }
      }
    }
    return callback(null, {
      success: true,
    });
  } catch (err) {
    console.log(err);
    return callback("outer catch error");
  }
};
