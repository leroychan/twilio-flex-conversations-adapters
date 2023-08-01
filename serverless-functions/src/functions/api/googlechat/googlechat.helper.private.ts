import { Context } from "@twilio-labs/serverless-runtime-types/types";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { google, chat_v1 } from "googleapis";

import * as Util from "../common/common.helper.private";
import * as GoogleChatTypes from "./googlechat_types.private";

// Load Libraries
const { GoogleChatMessageType } = <typeof GoogleChatTypes>(
  require(Runtime.getFunctions()["api/googlechat/googlechat_types"].path)
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
 * @param {GoogleChatTypes.GoogleChatContext} context - Context
 * @param {string} userId - User ID of incoming message
 * @param {GoogleChatTypes.GoogleChatBaseMessage} event - Incoming Message Webhook
 * @return {boolean} - Status of Sending to Flex
 */
export const wrappedSendToFlex = async (
  context: Context<GoogleChatTypes.GoogleChatContext>,
  userId: string,
  event: GoogleChatTypes.GoogleChatBaseMessage
) => {
  const client = context.getTwilioClient();

  // Step 0: Validate Required Incoming Data
  if (!event.message || !event.space) {
    return false;
  }

  // Step 1: Check for any existing conversation. If doesn't exist, create a new conversation -> add participant -> add webhooks
  const identity = `googlechat:${userId}`;
  const spaceName = event.space.name;
  console.log("identity:", identity);
  console.log("spaceName:", spaceName);

  let { conversationSid, chatServiceSid } =
    await twilioFindExistingConversation(client, identity);

  console.log(`Old Convo ID: ${conversationSid}`);
  console.log(`[Via Existing] Chat Service ID: ${chatServiceSid}`);

  if (!conversationSid) {
    // -- Create Conversation
    const createConversationResult = await twilioCreateConversation(
      "GoogleChat",
      client,
      userId,
      { spaceName: event.space?.name }
    );
    conversationSid = createConversationResult.conversationSid;
    chatServiceSid = createConversationResult.chatServiceSid;
    // -- Add Participant into Conversation
    await twilioCreateParticipant(client, conversationSid, identity);
    // -- Create Webhook (Conversation Scoped) for Studio
    await twilioCreateScopedWebhookStudio(
      client,
      conversationSid,
      context.GOOGLECHAT_STUDIO_FLOW_SID
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
      "api/googlechat/outgoing"
    );
  }

  // Step 2: Add Message to Conversation
  if ("text" in event.message && !("attachment" in event.message)) {
    // -- Message Type: text
    if (!event.message.text || !event.user || !event.user.displayName) {
      return false;
    }
    await twilioCreateMessage(
      client,
      conversationSid,
      event.user.displayName,
      event.message.text
    );
    return true;
  } else if ("attachment" in event.message) {
    // -- Message Type: image, video, audio
    console.log("--- Message Type: Media (Verbose) ---");
    if (chatServiceSid == undefined || !event.message.attachment) {
      console.log("Chat Service SID and/or Attachment is undefined");
      return false;
    }
    const chatClient = await getGoogleChatClient(context);
    for (const attachment of event.message.attachment) {
      if (
        !attachment.attachmentDataRef ||
        !attachment.attachmentDataRef.resourceName ||
        !event.user ||
        !event.user.displayName
      ) {
        return false;
      }
      console.log("Content Type", attachment.contentType);
      const downloadFile = await googleChatGetAttachmentContent(
        chatClient,
        attachment.attachmentDataRef.resourceName
      );
      const data = downloadFile;
      const fileName = attachment.contentName || "file";
      const fileType = attachment.contentType;
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
        fileName
      );

      if (!uploadMCSResult.sid) {
        return false;
      }
      console.log(`Uploaded Twilio Media SID: ${uploadMCSResult.sid}`);
      // -- Check if Text sent together with Attachment
      if (event.message.text) {
        await twilioCreateMessage(
          client,
          conversationSid,
          event.user.displayName,
          event.message.text
        );
      }
      await twilioCreateMessage(
        client,
        conversationSid,
        event.user.displayName,
        fileName,
        uploadMCSResult.sid
      );
    }
    return true;
  }
};

/**
 * Validate Google Chat Webhook JWT
 * @param {string} googleJwt - Google Chat's JWT
 * @return {boolean} - Google JWT's validity
 */
export const googleChatVerifyJwt = async (googleJwt: string) => {
  try {
    // Step 1: Get Public Certs from Google
    // Note: Google Certs expires frequently. Do not hard code.
    const certUrl =
      "https://www.googleapis.com/service_accounts/v1/metadata/x509/chat@system.gserviceaccount.com";
    const getCertsResponse = await fetch(certUrl);
    const getCerts = await getCertsResponse.json();

    // Step 2: Get Incoming Webhook's JWT Header
    const jwtDecoded = jwt.decode(googleJwt, { complete: true });
    if (
      jwtDecoded === null ||
      jwtDecoded.header === null ||
      jwtDecoded.header.kid === null
    ) {
      return false;
    }
    const jwtKid = jwtDecoded.header.kid || 0;

    // Step 3: Verify JWT
    if (!getCerts.hasOwnProperty(jwtKid)) {
      return false;
    }
    await jwt.verify(googleJwt, getCerts[jwtKid]);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

/**
 * Send Google Chat Text Message
 * @param {string} spaceId - Google Chat Space ID
 * @param {string} message - Message
 * @returns {boolean} - Message sending status
 */
export const googleChatSendTextMessage = async (
  chatClient: chat_v1.Chat,
  spaceId: string,
  message: string
) => {
  try {
    // Formulate Payload
    const payload: chat_v1.Params$Resource$Spaces$Messages$Create = {
      parent: spaceId,
      requestBody: {
        text: message,
      },
    };
    // Send Message
    const response = await chatClient.spaces.messages.create({
      ...payload,
    });
    console.log(googleChatSendTextMessage, response);
    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * Send Google Chat Media Message
 * @param {chat_v1.Chat} chatClient - Google Chat Authenticated Client
 * @param {string} spaceId - Google Chat Space ID
 * @param {string} fileName - File name
 * @param {string} contentUrl - Public URL of content
 * @returns {boolean} - Message sending status
 */
export const googleChatSendMediaMessage = async (
  chatClient: chat_v1.Chat,
  spaceId: string,
  fileName: string,
  contentUrl: string
) => {
  try {
    // Formulate Payload
    const payload: chat_v1.Params$Resource$Spaces$Messages$Create = {
      parent: spaceId,
      requestBody: {
        cardsV2: [
          {
            cardId: uuidv4(),
            card: {
              sections: [
                {
                  header: "Attachment",
                  collapsible: true,
                  uncollapsibleWidgetsCount: 1,
                  widgets: [
                    {
                      image: {
                        imageUrl: contentUrl,
                        altText: fileName,
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    };
    // Send Message
    const response = await chatClient.spaces.messages.create({
      ...payload,
    });
    console.log(googleChatSendTextMessage, response);
    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * Get Authenticated Google Chat Client
 * @param {GoogleChatTypes.GoogleChatContext} context - Google Context
 * @returns {chat_v1.Chat} - Message sending status
 */
export const getGoogleChatClient = async (
  context: Context<GoogleChatTypes.GoogleChatContext>
) => {
  try {
    // Step 1: Get Google Service Account Credentials
    const googleChatCredentialsFileName = "/googlechat-credentials.json";
    let credentials;
    if (
      Object.keys(Runtime.getAssets()).length !== 0 &&
      Runtime.getAssets()[googleChatCredentialsFileName]
    ) {
      // -- Priority 1: Use Private Asset File
      const rawCredentials =
        Runtime.getAssets()[googleChatCredentialsFileName].open;
      const rawCredentialsContent = rawCredentials();
      credentials = JSON.parse(rawCredentialsContent);
    } else {
      // -- Priority 2: Use Environment Variable
      // -- Mainly for local development as environment variable in Twilio Functions cannot exceed 255 characters
      const rawCredentials = context.GOOGLECHAT_SERVICE_ACCOUNT_KEY_BASE64;
      credentials = JSON.parse(
        Buffer.from(rawCredentials, "base64").toString("utf-8")
      );
    }

    // Step 2: Get Chat Client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/chat.bot"],
    });
    const chatClient = new chat_v1.Chat({
      auth,
    });
    return chatClient;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 * Get Media Attachment Content from Google Chat
 * @param {chat_v1.Chat} chatClient - Google Chat Authenticated Client
 * @param {string} resourceName - Resource Name from the attachmentDataRef attribute
 * @returns {any} - Raw Content
 */
const googleChatGetAttachmentContent = async (
  chatClient: chat_v1.Chat,
  resourceName: string
) => {
  try {
    // Get Attachment Content
    const attachmentContent = await chatClient.media.download(
      {
        alt: "media",
        resourceName,
      },
      {
        responseType: "arraybuffer",
      }
    );
    return attachmentContent.data;
  } catch (err) {
    console.log(JSON.stringify(err));
    throw err;
  }
};
