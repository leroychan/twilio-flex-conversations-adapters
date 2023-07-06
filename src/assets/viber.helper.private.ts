import {
  ViberContext,
  ViberMessage,
  ViberMessageType,
  ViberMessageText,
} from "../functions/api/viber/viber_types";

import crypto from "crypto";
import { Context } from "@twilio-labs/serverless-runtime-types/types";
import fetch from "node-fetch";
import * as Util from "./common.helper.private";

export const validateSignature = (
  signature: string,
  body: string,
  secret: string
) => {
  // Generate HMAC-256 Digest
  const digest = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("base64");
  if (digest === signature) {
    return true;
  } else {
    return false;
  }
};

/*
 * Raw Function - Viber Get Content
 */
const viberGetMessageContent = async (uri: string) => {
  // Send message
  const response = await fetch(uri, {
    method: "get",
  });
  return response;
};

export const wrappedSendToFlex = async (
  context: Context<ViberContext>,
  userId: string,
  event: ViberMessage
) => {
  const client = context.getTwilioClient();

  // Load Libraries
  const {
    twilioUploadMediaResource,
    twilioFindExistingConversation,
    twilioCreateConversation,
    twilioCreateParticipant,
    twilioCreateScopedWebhookStudio,
    twilioCreateScopedWebhook,
    twilioCreateMessage,
  } = <typeof Util>require(Runtime.getAssets()["/common.helper.js"].path);

  // Step 1: Check for any existing conversation. If doesn't exist, create a new conversation -> add participant -> add webhooks
  const identity = `viber:${userId}`;
  console.log(identity);

  let { conversationSid, chatServiceSid } =
    await twilioFindExistingConversation(client, identity);

  console.log(`Old Convo ID: ${conversationSid}`);
  console.log(`[Via Existing] Chat Service ID: ${chatServiceSid}`);

  if (!conversationSid) {
    // -- Create Conversation
    const createConversationResult = await twilioCreateConversation(
      "VIBER",
      client,
      userId,
      event.sender
    );
    conversationSid = createConversationResult.conversationSid;
    chatServiceSid = createConversationResult.chatServiceSid;
    // -- Add Participant into Conversation
    const addParticipantResult = await twilioCreateParticipant(
      client,
      conversationSid,
      identity
    );
    // -- Create Webhook (Conversation Scoped) for Studio
    const addWebhookStudioResult = await twilioCreateScopedWebhookStudio(
      client,
      conversationSid,
      context.VIBER_STUDIO_FLOW_SID
    );
    // -- Create Webhook (Conversation Scoped) for Outgoing Conversation (Flex to Viber)
    const addWebhookResult = await twilioCreateScopedWebhook(
      client,
      conversationSid,
      userId,
      context.DOMAIN_NAME_OVERRIDE || context.DOMAIN_NAME,
      "api/viber/outgoing"
    );
  }

  console.log("Message type is: ", event.message.type);

  // Step 2: Add Message to Conversation
  // -- Process Message Type
  let addMessageResult;
  if (event.message.type === ViberMessageType.TEXT) {
    // -- Message Type: text
    addMessageResult = await twilioCreateMessage(
      client,
      conversationSid,
      event.sender.name,
      (event.message as ViberMessageText).text
    );
  } else if (
    event.message.type === ViberMessageType.PICTURE ||
    event.message.type === ViberMessageType.VIDEO ||
    event.message.type === ViberMessageType.FILE
  ) {
    // -- Message Type: image, video
    console.log("--- Message Type: Media (Verbose) ---");
    console.log(`Content Provider Type: ${event.message.type}`);

    if (chatServiceSid == undefined) {
      console.log("Chat Service SID is undefined");
      return;
    }

    const downloadFile = await viberGetMessageContent(event.message.media);
    const data = downloadFile.body;
    const fileType = downloadFile.headers.get("content-type");

    if (fileType == undefined) {
      console.log("File Type is undefined");
      return;
    }

    console.log(`Incoming File Type (from HTTP Header): ${fileType}`);
    console.log("Uploading to Twilio MCS...");
    let uploadMCSResult = await twilioUploadMediaResource(
      { accountSid: context.ACCOUNT_SID, authToken: context.AUTH_TOKEN },
      chatServiceSid,
      fileType,
      data,
      event.message.file_name
    );

    if (!uploadMCSResult.sid) {
      return false;
    }
    console.log(`Uploaded Twilio Media SID: ${uploadMCSResult.sid}`);
    addMessageResult = await twilioCreateMessage(
      client,
      conversationSid,
      event.sender.name,
      event.message.file_name,
      uploadMCSResult.sid
    );
  }
};

/*
 * Viber - Send Push Message
 */
export const viberSendTextMessage = async (
  context: Context<ViberContext>,
  userId: string,
  message: string
) => {
  try {
    // Get viber client
    const payload = {
      receiver: userId,
      type: "text",
      text: message,
      sender: { name: "Twilio" },
    };

    // Send message
    const response = await fetch("https://chatapi.viber.com/pa/send_message", {
      method: "post",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        "X-Viber-Auth-Token": context.VIBER_AUTH_TOKEN,
      },
    });
    const data = await response.json();

    console.log(data);

    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/*
 * Viber - Send Push Message
 */
export const viberSendMedia = async (
  context: Context<ViberContext>,
  userId: string,
  type: ViberMessageType,
  contentUrl: string
) => {
  try {
    // Get viber client
    const payload = {
      receiver: userId,
      type: type,
      text: "Attachment",
      media: contentUrl,
      sender: { name: "Twilio" },
    };

    // Send message
    const response = await fetch("https://chatapi.viber.com/pa/send_message", {
      method: "post",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        "X-Viber-Auth-Token": context.VIBER_AUTH_TOKEN,
      },
    });
    const data = await response.json();

    console.log(data);

    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
