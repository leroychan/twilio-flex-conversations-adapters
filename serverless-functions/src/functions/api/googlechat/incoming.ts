// Imports global types
import "@twilio-labs/serverless-runtime-types";

// Fetches specific types
import {
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";
import * as GoogleChatTypes from "./googlechat_types.private";
import * as Helper from "./googlechat.helper.private";

const { GoogleChatMessageType } = <typeof GoogleChatTypes>(
  require(Runtime.getFunctions()["api/googlechat/googlechat_types"].path)
);
const { googleChatVerifyJwt, wrappedSendToFlex } = <typeof Helper>(
  require(Runtime.getFunctions()["api/googlechat/googlechat.helper"].path)
);

export const handler: ServerlessFunctionSignature<
  GoogleChatTypes.GoogleChatContext,
  GoogleChatTypes.GoogleChatBaseMessage
> = async (context, event, callback: ServerlessCallback) => {
  try {
    console.log("event received - /api/googlechat/incoming: ", event);

    // Step 1: Verify Google JWT
    if (
      !event.request.headers.authorization ||
      !event.request.headers.authorization.startsWith("Bearer ")
    ) {
      return callback("Invalid JWT");
    }
    const authorizationHeader = event.request.headers.authorization;
    const googleJwt = authorizationHeader.substring(
      7,
      authorizationHeader.length
    );
    const validateResult = await googleChatVerifyJwt(googleJwt);
    if (!validateResult) {
      console.log("Invalid JWT");
      return callback("Invalid JWT");
    }

    // Step 2: Process Message
    if (
      event.type !== "MESSAGE" ||
      !event.space ||
      event.space.type !== "DM" ||
      !event.user ||
      !event.user.name
    ) {
      // Supports 'MESSAGE' with Direct Messaging (DM) - Graceful Response
      return callback(null, {});
    }
    const parsedUserId = event.user.name.replace("users/", "");
    await wrappedSendToFlex(context, parsedUserId, event);
    return callback(null, {});
  } catch (err) {
    console.log(err);
    return callback("outer catch error");
  }
};
