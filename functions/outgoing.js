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
        console.log(`Media SID: ${media.Sid}`);
        console.log(`Chat Service SID: ${event.ChatServiceSid}`);
        // -- Obtain Media Type
        let mediaType;
        switch (media.ContentType) {
          case "image/png":
            mediaType = "image";
            break;
          case "image/jpeg":
            mediaType = "image";
            break;
          case "image/jpg":
            mediaType = "image";
            break;
          case "video/mp4":
            mediaType = "video";
            break;
          case "video/mpeg":
            mediaType = "video";
            break;
          default:
            mediaType = false;
        }
        if (!mediaType) {
          return callback("File type is not supported");
        }
        // -- Retrieve Temporary URL (Public) of Twilio Media Resource
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
        // -- Send to LINE
        const sendToLineResult = await helper.lineSendPushMedia(
          event.user_id,
          mediaType,
          mediaResource.links.content_direct_temporary
        );
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
