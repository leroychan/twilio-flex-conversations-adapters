// Load Libraries
const crypto = require("crypto");
const line = require("@line/bot-sdk");
const request = require("request-promise-native");

/*
 * Twilio - Wrapped Send to Flex
 */

const wrappedSendToFlex = async (context, userId, message) => {
  try {
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
        client,
        userId
      );
      conversationSid = createConversationResult.conversationSid;
      chatServiceSid = createConversationResult.chatServiceSid;
      console.log(`New Convo ID: ${conversationSid}`);
      console.log(`Chat Service ID: ${chatServiceSid}`);
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
        process.env.LINE_STUDIO_FLOW_SID
      );
      // -- Create Webhook (Conversation Scoped) for Outgoing Conversation (Flex to LINE)
      const addWebhookResult = await twilioCreateScopedWebhook(
        client,
        conversationSid,
        userId,
        context.DOMAIN_NAME,
        "outgoing"
      );
    }

    // Step 2: Add Message to Conversation
    // -- Process Message Type
    let addMessageResult;
    if (message.type === "text") {
      // -- Message Type: text
      addMessageResult = await twilioCreateMessage(
        client,
        conversationSid,
        identity,
        message.text
      );
    } else if (
      message.type === "image" ||
      message.type === "video" ||
      message.type === "audio" ||
      message.type === "file"
    ) {
      // -- Message Type: image, video
      console.log("--- Message Type: Media (Verbose) ---");
      console.log(`Content Provider Type: ${message.contentProvider.type}`);
      const messageText = message.text || "";
      const downloadFile = await lineGetMessageContent(
        context.LINE_CHANNEL_ACCESS_TOKEN,
        message.id
      );
      const data = downloadFile.body;
      const fileType = downloadFile.headers["content-type"];
      console.log(`Incoming File Type (from HTTP Header): ${fileType}`);
      console.log("Uploading to Twilio MCS...");
      let uploadMCSResult = await twilioUploadMediaResource(
        { accountSid: context.ACCOUNT_SID, authToken: context.AUTH_TOKEN },
        chatServiceSid,
        fileType,
        data
      );
      uploadMCSResult = JSON.parse(uploadMCSResult);
      if (!uploadMCSResult.sid) {
        return false;
      }
      console.log(`Uploaded Twilio Media SID: ${uploadMCSResult.sid}`);
      addMessageResult = await twilioCreateMessage(
        client,
        conversationSid,
        identity,
        messageText,
        uploadMCSResult.sid
      );
    }

    if (addMessageResult) {
      return addMessageResult; // Message SID
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
};

/*
 * Twilio - Create Conversation
 */
const twilioCreateConversation = async (client, userId) => {
  try {
    const result = await client.conversations.v1.conversations.create({
      friendlyName: `LINE Conversation ${userId}`,
    });
    if (result.sid) {
      return {
        conversationSid: result.sid,
        chatServiceSid: result.chatServiceSid,
      };
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

/*
 * Twilio - Create Participant in Conversations
 */
const twilioCreateParticipant = async (client, conversationSid, identity) => {
  try {
    const result = await client.conversations
      .conversations(conversationSid)
      .participants.create({ identity: identity });
    if (result.sid) {
      return result.sid;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

/*
 * Twilio - Create Scoped Webhook for onMessageAdded to send to Studio Flow
 */
const twilioCreateScopedWebhookStudio = async (
  client,
  conversationSid,
  studioFlowSid
) => {
  try {
    const result = await client.conversations
      .conversations(conversationSid)
      .webhooks.create({
        "configuration.filters": "onMessageAdded",
        target: "studio",
        "configuration.flowSid": studioFlowSid,
      });
    if (result.sid) {
      return result.sid;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

/*
 * Twilio - Create Scoped Webhook for onMessageAdded to receive New Message
 */
const twilioCreateScopedWebhook = async (
  client,
  conversationSid,
  userId,
  domainName,
  outgoingPath
) => {
  try {
    console.log(`https://${domainName}/${outgoingPath}`);
    const result = await client.conversations
      .conversations(conversationSid)
      .webhooks.create({
        target: "webhook",
        "configuration.filters": "onMessageAdded",
        "configuration.method": "POST",
        "configuration.url": `https://${domainName}/${outgoingPath}?user_id=${userId}`,
      });
    if (result.sid) {
      return result.sid;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

/*
 * Twilio - Create Message in Conversation
 */
const twilioCreateMessage = async (
  client,
  conversationSid,
  author,
  body,
  mediaSid = null
) => {
  try {
    let result;
    if (!mediaSid) {
      result = await client.conversations
        .conversations(conversationSid)
        .messages.create({
          author: author,
          body: body,
          xTwilioWebhookEnabled: true,
        });
    } else {
      result = await client.conversations
        .conversations(conversationSid)
        .messages.create({
          author: author,
          body: body,
          mediaSid: mediaSid,
          xTwilioWebhookEnabled: true,
        });
    }
    if (result.sid) {
      return result.sid;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

/*
 * Twilio - Find Existing Conversation
 */
const twilioFindExistingConversation = async (client, identity) => {
  try {
    const result = await client.conversations.participantConversations.list({
      identity: identity,
    });
    let existingConversation = result.find(
      (conversation) => conversation.conversationState !== "closed"
    );
    if (existingConversation) {
      console.log(existingConversation);
      console.log(existingConversation.chatServiceSid);
      return {
        conversationSid: existingConversation.conversationSid,
        chatServiceSid: existingConversation.chatServiceSid,
      };
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

/*
 * LINE - Validate Incoming Webhook Signature
 */
const lineValidateSignature = (signature, body, lineChannelSecret) => {
  // Generate HMAC-256 Digest
  const digest = crypto
    .createHmac("sha256", lineChannelSecret)
    .update(body)
    .digest("base64");
  if (digest === signature) {
    return true;
  } else {
    return false;
  }
};

/*
 * LINE - Send Push Message
 */
const lineSendPushMessage = async (userId, message) => {
  try {
    const client = getLineClient();
    const sendMessagePayload = {
      type: "text",
      text: message,
    };
    const result = await client.pushMessage(userId, sendMessagePayload);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

/*
 * Raw Function - Return LINE Client
 */
const getLineClient = () => {
  const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
  };
  const client = new line.Client(config);
  return client;
};

/*
 * Raw Function - Twilio - Upload Media Resource
 */
const twilioUploadMediaResource = async (
  auth,
  chatServiceSid,
  contentType,
  data
) => {
  const options = {
    url: `https://mcs.us1.twilio.com/v1/Services/${chatServiceSid}/Media`,
    method: "POST",
    auth: {
      username: auth.accountSid,
      password: auth.authToken,
    },
    headers: {
      "Content-Type": contentType,
    },
    body: data,
    encoding: null,
  };
  const result = await request(options);
  return result;
};

/*
 * Raw Function - LINE Get Content
 */
const lineGetMessageContent = async (auth, messageId) => {
  const options = {
    url: `https://api-data.line.me/v2/bot/message/${messageId}/content`,
    method: "GET",
    auth: {
      bearer: auth,
    },
    resolveWithFullResponse: true,
    encoding: null,
  };
  const result = await request(options);
  return result;
};

module.exports = {
  wrappedSendToFlex,
  lineValidateSignature,
  lineSendPushMessage,
};
