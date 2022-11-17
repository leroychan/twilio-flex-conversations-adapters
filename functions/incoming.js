// Load Libraries
const request = require("request-promise-native");

exports.handler = async (context, event, callback) => {
  try {
    // Load Libraries
    const helper = require(Runtime.getAssets()["/helper.js"].path);

    // Debug: Console Log Incoming Events
    console.log("---Start of Raw Event---");
    console.log(event.request);
    console.log(event.destination);
    console.log(event.events);
    console.log("---End of Raw Event---");

    // Step 1: Validate LINE Webhook (HTTP Header: "x-line-signature") Signature
    const lineSignature = event.request.headers["x-line-signature"];
    const lineSignatureBody = JSON.stringify({
      destination: event.destination,
      events: event.events,
    });
    const validSignature = helper.lineValidateSignature(
      lineSignature,
      lineSignatureBody,
      process.env.LINE_CHANNEL_SECRET
    );
    if (!validSignature) {
      console.log("Invalid Signature");
      callback("Invalid Signature");
    }

    // Step 2: Process Twilio Conversations
    console.log(context.DOMAIN_NAME);
    console.log(context.PATH);
    // -- Handle Multiple Events Recieved in Webhook
    for (const msg of event.events) {
      // -- Process Each Event
      const userId = msg.source.userId;
      const message = msg.message;
      const sendToFlexResult = await helper.wrappedSendToFlex(
        context,
        userId,
        message
      );
    }

    callback(null, {
      success: true,
    });
  } catch (err) {
    console.log(err);
    callback("outer catch error");
  }
};
