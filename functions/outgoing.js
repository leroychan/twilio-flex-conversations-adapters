exports.handler = async (context, event, callback) => {
  // Load Libraries
  const helper = require(Runtime.getAssets()["/helper.js"].path);

  // Process Only Agent Messages
  if (event.Source === "SDK") {
    // Parse Type of Messages
    console.log("---Start of Raw Event---");
    console.log(event);
    console.log(event.user_id);
    console.log("---End of Raw Event---");
    if (!event.Media) {
      // Agent Message Type: Text
      const sendToLineResult = await helper.lineSendPushMessage(
        event.user_id,
        event.Body
      );
    } else {
      // Agent Message Type: Media
      // -- Handle Multiple Media object(s)
      for (let media of JSON.parse(event.Media)) {
        console.log("---Media Payload---");
        console.log(media);
        if (
          media.ContentType === "image/png" ||
          media.ContentType === "image/jpeg"
        ) {
          console.log(`Media SID: ${media.Sid}`);
          console.log(`Chat Service SID: ${event.ChatServiceSid}`);
          const mediaResource = await helper.twilioGetMediaResource(
            { accountSid: context.ACCOUNT_SID, authToken: context.AUTH_TOKEN },
            event.ChatServiceSid,
            media.Sid
          );
          if (
            !mediaResource ||
            !mediaResource.links ||
            !mediaResource.links.content_direct_temporary
          ) {
            return callback("Unable to get temporary URL for image");
          }
          const sendToLineResult = await helper.lineSendPushMedia(
            event.user_id,
            "image",
            mediaResource.links.content_direct_temporary
          );
          console.log("--debug--");
          console.log(sendToLineResult);
        }
      }
    }

    return callback(null, {
      success: true,
    });
  } else {
    // Ignoring all end user added messages
    console.log("Outgoing Hook: No Action Needed");
  }

  return callback(null, {
    success: true,
  });
};
