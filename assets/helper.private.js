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
    let conversationSid = await twilioFindExistingConversation(
      client,
      identity
    );
    console.log(`Old Convo ID: ${conversationSid}`);
    if (!conversationSid) {
      // -- Create Conversation
      conversationSid = await twilioCreateConversation(client, userId);
      console.log(`New Convo ID: ${conversationSid}`);
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
    } else if (message.type === "image") {
      // Debug
      console.log("--- Inside Image ---");
      console.log("Content Provider:");
      console.log(message.contentProvider);
      const client = getLineClient();
      const messageText = message.text || "";
      const downloadFile = await client.getMessageContent(message.id);
      console.log("--Chunk--");
      let data;
      for await (const chunk of downloadFile) {
        if (chunk) {
          data += chunk;
        }
      }
      const fileType = downloadFile.headers["content-type"];
      console.log("Headers:");
      console.log(fileType);
      console.log('--Upload to MCS--');
      const twilioClient = context.getTwilioClient();
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
const twilioCreateMessage = async (client, conversationSid, author, body) => {
  try {
    const result = await client.conversations
      .conversations(conversationSid)
      .messages.create({
        author: author,
        body: body,
        xTwilioWebhookEnabled: true,
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
      return existingConversation.conversationSid;
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
 * Raw Function - Upload Media Resource
 */
const twilioUploadMediaResoruce = (chatServiceId, contentType, data) => {
  const options = {
    url: `https://mcs.us1.twilio.com/v1/Services/${chatServiceId}/Media`,
    method: "POST",
    headers: {
      'Content-Type': contentType
    },
    body: data
  };
  const result = await request(options);
  return result;
};

module.exports = {
  wrappedSendToFlex,
  lineValidateSignature,
  lineSendPushMessage,
};
