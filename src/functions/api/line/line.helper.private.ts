// Import Libraries
import crypto from "crypto";
import fetch, { Response } from "node-fetch";
import { Context } from "@twilio-labs/serverless-runtime-types/types";
import {
  ClientConfig,
  Client,
  TextMessage,
  ImageMessage,
  VideoMessage,
  EventMessage,
} from "@line/bot-sdk";
import * as Util from "../common/common.helper.private";
import * as LINETypes from "./line_types.private";

// Load TypeScript - Types
const { LINEMessageType } = <typeof LINETypes>(
  require(Runtime.getFunctions()["api/line/line_types"].path)
);

// Load Twilio Helper
const {
  twilioUploadMediaResource,
  twilioFindExistingConversation,
  twilioCreateConversation,
  twilioCreateParticipant,
  twilioCreateScopedWebhookStudio,
  twilioCreateScopedWebhook,
  twilioCreateMessage,
} = <typeof Util>(
  require(Runtime.getFunctions()["api/common/common.helper"].path)
);

export const wrappedSendToFlex = async (
  context: Context<LINETypes.LINEContext>,
  userId: string,
  message: EventMessage
) => {
  const client = context.getTwilioClient();

  // Step 1: Check for any existing conversation. If doesn't exist, create a new conversation -> add participant -> add webhooks
  const identity = `line:${userId}`;
  console.log(identity);

  let { conversationSid, chatServiceSid } =
    await twilioFindExistingConversation(client, identity);

  console.log(`Old Convo ID: ${conversationSid}`);
  console.log(`[Via Existing] Chat Service ID: ${chatServiceSid}`);

  if (!conversationSid) {
    // -- Create Conversation
    const createConversationResult = await twilioCreateConversation(
      "LINE",
      client,
      userId,
      {}
    );
    conversationSid = createConversationResult.conversationSid;
    chatServiceSid = createConversationResult.chatServiceSid;
    // -- Add Participant into Conversation
    await twilioCreateParticipant(client, conversationSid, identity);
    // -- Create Webhook (Conversation Scoped) for Studio
    await twilioCreateScopedWebhookStudio(
      client,
      conversationSid,
      context.LINE_STUDIO_FLOW_SID
    );
    // -- Create Webhook (Conversation Scoped) for Outgoing Conversation (Flex to Viber)
    await twilioCreateScopedWebhook(
      client,
      conversationSid,
      userId,
      context.DOMAIN_NAME_OVERRIDE || context.DOMAIN_NAME,
      "api/line/outgoing"
    );
  }

  console.log("Message type is: ", message.type);

  // Step 2: Add Message to Conversation
  // -- Process Message Type
  if (message.type === LINEMessageType.TEXT) {
    // -- Message Type: text
    await twilioCreateMessage(
      client,
      conversationSid,
      identity,
      (message as TextMessage).text
    );
  } else if (
    message.type === LINEMessageType.IMAGE ||
    message.type === LINEMessageType.VIDEO
  ) {
    // -- Message Type: image, video
    console.log("--- Message Type: Media (Verbose) ---");
    console.log(`Content Provider Type: ${message.contentProvider.type}`);

    if (chatServiceSid == undefined) {
      console.log("Chat Service SID is undefined");
      return;
    }

    const downloadFile = await lineGetMessageContent(context, message.id);
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
      "file"
    );

    if (!uploadMCSResult.sid) {
      return false;
    }
    console.log(`Uploaded Twilio Media SID: ${uploadMCSResult.sid}`);
    await twilioCreateMessage(
      client,
      conversationSid,
      identity,
      "file",
      uploadMCSResult.sid
    );
  }
};

/**
 * Validate LINE Webhook Signature
 * @param {string} signature - Webhook
 * @param {string} body - API Response Payload
 * @param {string} secret - LINE Secret Key
 * @return {boolean} - Signature's validity
 */
export const lineValidateSignature = (
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

/**
 * Send LINE Text Message
 * @param {LINETypes.LINEContext} context - LINE Context
 * @param {string} userId - LINE User ID
 * @param {string} message - Message
 * @returns {boolean} - Message sending status
 */
export const lineSendTextMessage = async (
  context: Context<LINETypes.LINEContext>,
  userId: string,
  message: string
) => {
  try {
    // Initialise LINE Client
    const clientConfig: ClientConfig = {
      channelAccessToken: context.LINE_CHANNEL_ACCESS_TOKEN,
      channelSecret: context.LINE_CHANNEL_SECRET,
    };
    const client = new Client(clientConfig);

    // Send Text Message
    const sendMessagePayload: TextMessage = {
      type: "text",
      text: message,
    };
    const result = await client.pushMessage(userId, sendMessagePayload);
    console.log("lineSendTextMessage: ", result);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

/**
 * Send LINE Media Message
 * @param {LINETypes.LINEContext} context - LINE Context
 * @param {string} userId - LINE User ID
 * @param {string} type - Media Type - Image or Video
 * @param {string} contentUrl - URL of Image or Video
 * @returns {boolean} - Message sending status
 */
export const lineSendMediaMessage = async (
  context: Context<LINETypes.LINEContext>,
  userId: string,
  type: "image" | "video",
  contentUrl: string
) => {
  try {
    // Initialise LINE Client
    const clientConfig: ClientConfig = {
      channelAccessToken: context.LINE_CHANNEL_ACCESS_TOKEN,
      channelSecret: context.LINE_CHANNEL_SECRET,
    };
    const client = new Client(clientConfig);

    // Send Text Message
    const sendMessagePayload: ImageMessage | VideoMessage = {
      type: type,
      originalContentUrl: contentUrl,
      previewImageUrl: contentUrl,
    };
    const result = await client.pushMessage(userId, sendMessagePayload);
    console.log("lineSendMediaMessage: ", result);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

/**
 * Get LINE Message Content
 * @param {LINETypes.LINEContext} context - LINE Context
 * @param {string} messageId - LINE Message ID
 * @returns {Response} - HTTP call response object
 */
export const lineGetMessageContent = async (
  context: Context<LINETypes.LINEContext>,
  messageID: string
) => {
  try {
    // Initialise LINE Client
    const response = await fetch(
      `https://api-data.line.me/v2/bot/message/${messageID}/content`,
      {
        method: "get",
        headers: {
          Authorization: `Bearer ${context.LINE_CHANNEL_ACCESS_TOKEN}`,
        },
      }
    );
    return response;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
