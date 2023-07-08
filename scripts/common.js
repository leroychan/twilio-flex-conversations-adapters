// Import Libraries
const shell = require("shelljs");

exports.copyFile = (
  exampleFileName = ".env.example",
  destinationFileName = ".env"
) => {
  try {
    // Check if exampleFileName exist
    if (!shell.test("-e", exampleFileName)) {
      console.log("copyFile", `exampleFileName does not exist`);
      return false;
    }
    // Check if destinationFileName exist
    if (shell.test("-e", destinationFileName)) {
      console.log(
        "copyFile",
        `destinationFileName already exist. No copy is needed`
      );
      return false;
    }
    shell.cp(exampleFileName, destinationFileName);
    return true;
  } catch (e) {
    console.log("Error in copyFile:");
    console.log(e);
    return false;
  }
};

exports.updateEnvironmentVariables = (destinationFileName) => {
  try {
    const {
      LINE_CHANNEL_ID,
      LINE_CHANNEL_SECRET,
      LINE_CHANNEL_ACCESS_TOKEN,
      LINE_STUDIO_FLOW_SID,
      VIBER_AUTH_TOKEN,
      VIBER_STUDIO_FLOW_SID,
    } = process.env;
    // -- Debug
    console.log("--- Start Debug ---");
    console.log("LINE_CHANNEL_ID", LINE_CHANNEL_ID);
    console.log("Total Env Variables", Object.keys(process.env).length);
    console.log("Loop:");
    for (const obj of Object.keys(process.env)) {
      console.log(obj);
    }
    console.log("--- End Debug ---");
    if (LINE_CHANNEL_ID) {
      shell.sed(
        "-i",
        /<YOUR_LINE_CHANNEL_ID>/g,
        `${LINE_CHANNEL_ID}`,
        destinationFileName
      );
    }
    if (LINE_CHANNEL_SECRET) {
      shell.sed(
        "-i",
        /<YOUR_LINE_CHANNEL_SECRET>/g,
        `${LINE_CHANNEL_SECRET}`,
        destinationFileName
      );
    }
    if (LINE_CHANNEL_ACCESS_TOKEN) {
      shell.sed(
        "-i",
        /<YOUR_LINE_CHANNEL_ACCESS_TOKEN>/g,
        `${LINE_CHANNEL_ACCESS_TOKEN}`,
        destinationFileName
      );
    }
    if (LINE_STUDIO_FLOW_SID) {
      shell.sed(
        "-i",
        /<YOUR_LINE_STUDIO_FLOW_SID>/g,
        `${LINE_STUDIO_FLOW_SID}`,
        destinationFileName
      );
    }
    if (VIBER_AUTH_TOKEN) {
      shell.sed(
        "-i",
        /<YOUR_VIBER_AUTH_TOKEN>/g,
        `${VIBER_AUTH_TOKEN}`,
        destinationFileName
      );
    }
    if (VIBER_STUDIO_FLOW_SID) {
      shell.sed(
        "-i",
        /<YOUR_VIBER_STUDIO_FLOW_SID>/g,
        `${VIBER_STUDIO_FLOW_SID}`,
        destinationFileName
      );
    }
    return true;
  } catch (e) {
    console.log("Error in updateEnvironmentVariables:");
    console.log(e);
    return false;
  }
};
