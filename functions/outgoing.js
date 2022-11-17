exports.handler = async (context, event, callback) => {
  // Load Libraries
  const helper = require(Runtime.getAssets()["/helper.js"].path);

  // Process Only Agent Messages
  if (event.Source === "SDK") {
    console.log(event.Body);
    console.log(event);
    console.log(event.user_id);
    const sendToLineResult = await helper.lineSendPushMessage(
      event.user_id,
      event.Body
    );
    return callback(null, {
      success: true,
    });
  } else {
    console.log("Outgoing Hook: No Action Needed");
  }

  return callback(null, {
    success: true,
  });
};
