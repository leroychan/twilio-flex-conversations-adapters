import crypto from "crypto";
import { Context } from "@twilio-labs/serverless-runtime-types/types";
import fetch from "node-fetch";
import * as Util from "../common/common.helper.private";
import * as InstagramTypes from "./instagram_types.private";

// Load Libraries
const { InstagramMessageType } = <typeof InstagramTypes>(
  require(Runtime.getFunctions()["api/instagram/instagram_types"].path)
);

// Load Libraries
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

/**
 * Wrapped Method to Push Incoming Webhook to Flex
 * @param {InstagramTypes.InstagramContext} context - Context
 * @param {string} userId - User ID of incoming message
 * @param {InstagramTypes.InstagramMessaging} messaging - Incoming Message Webhook
 * @return {boolean} - Status of Sending to Flex
 */
export const wrappedSendToFlex = async (
  context: Context<InstagramTypes.InstagramContext>,
  userId: string,
  messaging: InstagramTypes.InstagramMessaging
) => {
  // Ignore Instagram Echo Events
  if (messaging.message.is_echo) {
    return true;
  }
  const client = context.getTwilioClient();

  // Step 1: Check for any existing conversation. If doesn't exist, create a new conversation -> add participant -> add webhooks
  const identity = `instagram:${userId}`;
  console.log(identity);

  let { conversationSid, chatServiceSid } =
    await twilioFindExistingConversation(client, identity);

  console.log(`Old Convo ID: ${conversationSid}`);
  console.log(`[Via Existing] Chat Service ID: ${chatServiceSid}`);

  if (!conversationSid) {
    // -- Create Conversation
    const createConversationResult = await twilioCreateConversation(
      "Instagram",
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
      context.INSTAGRAM_STUDIO_FLOW_SID
    );
    // -- Create Webhook (Conversation Scoped) for Outgoing Conversation (Flex to LINE)
    let domainName = context.DOMAIN_NAME;
    if (
      context.DOMAIN_NAME_OVERRIDE &&
      context.DOMAIN_NAME_OVERRIDE !== "<YOUR_DOMAIN_NAME_OVERRIDE>"
    ) {
      domainName = context.DOMAIN_NAME_OVERRIDE;
    }
    await twilioCreateScopedWebhook(
      client,
      conversationSid,
      userId,
      domainName,
      "api/instagram/outgoing"
    );
  }

  // Step 2: Add Message to Conversation
  if ("text" in messaging.message) {
    // -- Message Type: text
    await twilioCreateMessage(
      client,
      conversationSid,
      identity,
      (messaging.message as InstagramTypes.InstagramMessageText).text
    );
    return true;
  } else if ("attachments" in messaging.message) {
    // -- Message Type: image, video, audio
    console.log("--- Message Type: Media (Verbose) ---");
    if (chatServiceSid == undefined) {
      console.log("Chat Service SID is undefined");
      return;
    }
    for (const attachment of messaging.message.attachments) {
      console.log("Content Type", attachment.type);
      const downloadFile = await instagramGetMediaContent(
        attachment.payload.url
      );
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
    return true;
  }
};

/**
 * Validate Instagram Webhook Signature
 * @param {string} signature - Webhook
 * @param {string} body - API Response Payload
 * @param {string} secret - Meta App Secret
 * @return {boolean} - Signature's validity
 */
export const instagramValidateSignature = (
  signature: string,
  body: string,
  secret: string
) => {
  // Generate HMAC-256 Digest
  const digest = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (digest === signature) {
    return true;
  } else {
    return false;
  }
};

/**
 * Send Instagram Text Message
 * @param {InstagramTypes.InstagramContext} context - Instagram Context
 * @param {string} userId - Instagram Recipient ID
 * @param {string} message - Message
 * @returns {boolean} - Message sending status
 */
export const instagramSendTextMessage = async (
  context: Context<InstagramTypes.InstagramContext>,
  userId: string,
  message: string
) => {
  try {
    // Formulate Payload
    const payload: InstagramTypes.InstagramSendMessagePayload = {
      recipient: {
        id: userId,
      },
      message: {
        text: message,
      },
    };

    // Send Text Message
    const response = await fetch(
      `https://graph.facebook.com/v17.0/me/messages?access_token=${context.INSTAGRAM_PAGE_ACCESS_TOKEN}`,
      {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json();
    console.log("instagramSendTextMessage: Message ID", data.message_id);
    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * Send Instagram Send Media
 * @param {InstagramTypes.InstagramContext} context - Instagram Context
 * @param {string} userId - Instagram Recipient ID
 * @param {contentType} contentType - Content Type of media: image, video or audio
 * @param {contentType} contentUrl - Public URL of content
 * @returns {boolean} - Message sending status
 */
export const instagramSendMediaMessage = async (
  context: Context<InstagramTypes.InstagramContext>,
  userId: string,
  contentType: string,
  contentUrl: string
) => {
  try {
    // Formulate Payload
    const payload: InstagramTypes.InstagramSendMediaPayload = {
      recipient: {
        id: userId,
      },
      message: {
        attachment: {
          type: contentType,
          payload: {
            url: contentUrl,
          },
        },
      },
    };

    // Send Text Message
    const response = await fetch(
      `https://graph.facebook.com/v17.0/me/messages?access_token=${context.INSTAGRAM_PAGE_ACCESS_TOKEN}`,
      {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json();
    console.log("instagramSendTextMessage: Message ID", data.message_id);
    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * Get Media content
 * @param {string} context - Instagram Context
 * @returns {any} - Raw Content
 */
const instagramGetMediaContent = async (url: string) => {
  // Send message
  const response = await fetch(url, {
    method: "get",
  });
  return response;
};
