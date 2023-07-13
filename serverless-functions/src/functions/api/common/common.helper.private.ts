import * as twilio from "twilio";
import fetch from "node-fetch";

export type TwilioCredentials = {
  accountSid: string;
  authToken: string;
};

export type TwilioMediaResponse = {
  sid: string;
  links: {
    content_direct_temporary: string;
  };
  size?: number;
};

/*
 * Raw Function - Twilio - Get Media
 */
export const twilioGetMediaResource = async (
  credentials: TwilioCredentials,
  chatServiceSid: string,
  mediaSid: string
) => {
  // Authenticate with Twilio
  let auth =
    "Basic " +
    Buffer.from(credentials.accountSid + ":" + credentials.authToken).toString(
      "base64"
    );

  // Send message
  const response = await fetch(
    `https://mcs.us1.twilio.com/v1/Services/${chatServiceSid}/Media/${mediaSid}`,
    {
      method: "get",
      headers: { "Content-Type": "application/json", Authorization: auth },
    }
  );
  return (await response.json()) as TwilioMediaResponse;
};

/*
 * Raw Function - Twilio - Upload Media Resource
 */
export const twilioUploadMediaResource = async (
  credentials: TwilioCredentials,
  chatServiceSid: string,
  contentType: string,
  data: any,
  fileName: string
) => {
  // Authenticate with Twilio
  let auth =
    "Basic " +
    Buffer.from(credentials.accountSid + ":" + credentials.authToken).toString(
      "base64"
    );

  // Send message
  const response = await fetch(
    `https://mcs.us1.twilio.com/v1/Services/${chatServiceSid}/Media`,
    {
      method: "post",
      headers: { "Content-Type": contentType, Authorization: auth },
      body: data,
    }
  );
  return (await response.json()) as TwilioMediaResponse;
};

/*
 * Twilio - Create Message in Conversation
 */
export const twilioCreateMessage = async (
  client: twilio.Twilio,
  conversationSid: string,
  author: string,
  body: string,
  mediaSid: string | null = null
) => {
  try {
    let result;
    if (!mediaSid) {
      result = await client.conversations
        .conversations(conversationSid)
        .messages.create({
          author: author,
          body: body,
          xTwilioWebhookEnabled: "true",
        });
    } else {
      result = await client.conversations
        .conversations(conversationSid)
        .messages.create({
          author: author,
          body: body,
          mediaSid: mediaSid,
          xTwilioWebhookEnabled: "true",
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
 * Twilio - Create Participant in Conversations
 */
export const twilioCreateParticipant = async (
  client: twilio.Twilio,
  conversationSid: string,
  identity: string
) => {
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
 * Twilio - Create Conversation
 */
export const twilioCreateConversation = async (
  adapter: string,
  client: twilio.Twilio,
  userId: string,
  pre_engagement_attributes: any = {}
) => {
  const result = await client.conversations.v1.conversations.create({
    friendlyName: `${adapter} Conversation ${userId}`,
    attributes: JSON.stringify({
      pre_engagement_data: pre_engagement_attributes,
    }),
  });
  if (result.sid) {
    return {
      conversationSid: result.sid,
      chatServiceSid: result.chatServiceSid,
    };
  } else {
    throw new Error("Could not create new conversation");
  }
};
/*
 * Twilio - Find Existing Conversation
 */
export const twilioFindExistingConversation = async (
  client: twilio.Twilio,
  identity: string
) => {
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
    return {
      conversationSid: undefined,
      chatServiceSid: undefined,
    };
  }
};

/*
 * Twilio - Create Scoped Webhook for onMessageAdded to send to Studio Flow
 */
export const twilioCreateScopedWebhookStudio = async (
  client: twilio.Twilio,
  conversationSid: string,
  studioFlowSid: string
) => {
  try {
    const result = await client.conversations
      .conversations(conversationSid)
      .webhooks.create({
        configuration: { filters: "onMessageAdded", flowSid: studioFlowSid },
        target: "studio",
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
export const twilioCreateScopedWebhook = async (
  client: twilio.Twilio,
  conversationSid: string,
  userId: string,
  domainName: string,
  outgoingPath: string
) => {
  try {
    console.log(`https://${domainName}/${outgoingPath}`);
    const result = await client.conversations
      .conversations(conversationSid)
      .webhooks.create({
        target: "webhook",
        configuration: {
          filters: "onMessageAdded",
          method: "POST",
          url:
            `https://${domainName}/${outgoingPath}?user_id=` +
            encodeURIComponent(userId),
        },
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
